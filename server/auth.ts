import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage-direct";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "smartcare-dev-secret",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours by default
      httpOnly: true,
      path: '/'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    // Only serialize the user ID to avoid circular reference issues
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: any, done) => {
    try {
      let userId: number;
      
      // Handle different possible formats of the ID
      if (typeof id === 'number') {
        userId = id;
      } else if (typeof id === 'string') {
        userId = parseInt(id, 10);
      } else if (typeof id === 'object' && id !== null) {
        // Handle case where the entire user object was serialized
        if (typeof id.id === 'number') {
          userId = id.id;
        } else if (typeof id.id === 'string') {
          userId = parseInt(id.id, 10);
        } else {
          console.error(`Invalid user object during deserialization, no numeric ID found:`, id);
          return done(new Error('Invalid user object, no ID found'), null);
        }
      } else {
        console.error(`Invalid user ID format during deserialization:`, id);
        return done(new Error('Invalid user ID format'), null);
      }
      
      if (isNaN(userId)) {
        console.error(`Invalid user ID (NaN) during deserialization:`, id);
        return done(new Error('Invalid user ID (NaN)'), null);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found during deserialization`);
        return done(new Error('User not found'), null);
      }
      
      done(null, user);
    } catch (err) {
      console.error('Error deserializing user:', err);
      done(err, null);
    }
  });

  // Add facility selection endpoint (legacy)
  app.post("/api/select-facility", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { facility } = req.body;
    if (!facility) {
      return res.status(400).json({ message: "Facility is required" });
    }

    try {
      // Update user's facility in the database
      const updatedUser = await storage.updateUserFacility(req.user.id, facility);

      // Only save the user ID in the session instead of the whole user object
      req.login(updatedUser, (err) => {
        if (err) {
          console.error('Error updating session:', err);
        }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating facility:", error);
      res.status(500).json({ message: "Failed to update facility" });
    }
  });
  
  // Facility selection endpoint - supports both POST and PATCH
  app.use("/api/user/facility", async (req, res) => {
    // Allow facility selection without authentication for initial setup
    // if (!req.isAuthenticated()) return res.sendStatus(401);

    const { facility, facilityCode } = req.body;
    if (!facility) {
      return res.status(400).json({ message: "Facility is required" });
    }

    try {
      // If user is not authenticated, store facility selection in session
      if (!req.isAuthenticated()) {
        // Store facility selection in session for later use
        req.session.selectedFacility = facility;
        req.session.selectedFacilityCode = facilityCode;
        
        // Return success response
        return res.json({ 
          message: "Facility selected successfully",
          facility: facility,
          facilityCode: facilityCode
        });
      }

      let updatedUser;
      
      // Check if facilityCode is provided (new PATCH flow)
      if (facilityCode) {
        // Update user directly with provided code
        [updatedUser] = await db
          .update(users)
          .set({ 
            facility,
            facilityCode 
          })
          .where(eq(users.id, req.user.id))
          .returning();
      } else {
        // Legacy flow - verify facility exists in database first
        const facilityExists = await storage.getFacilityByName(facility);
        
        if (!facilityExists) {
          return res.status(404).json({ message: "Facility not found" });
        }
        
        // Update user's facility in the database
        updatedUser = await storage.updateUserFacility(req.user.id, facility);
      }

      // Only save the user ID in the session instead of the whole user object
      // This avoids circular reference issues during JSON serialization
      req.login(updatedUser, (err) => {
        if (err) {
          console.error('Error updating session:', err);
          return res.status(500).json({ message: "Failed to update session" });
        }

        // Make sure the session is saved immediately
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
          }
        });
      });

      // Remove sensitive data before returning
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({
        message: "Facility updated successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error updating facility:", error);
      res.status(500).json({ message: "Failed to update facility" });
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Save the session immediately after registration
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session after registration:', err);
            return next(err);
          }
          
          // Remove sensitive data before returning
          const { password, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (err) {
      console.error("Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);

      // Set session duration based on Remember Me option
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours (default)
      }

      req.login(user, async (err) => {
        if (err) return next(err);
        
        // Update last login time
        try {
          if (user && typeof user.id === 'number') {
            await storage.updateLastLogin(user.id);
          }
        } catch (error) {
          console.error("Failed to update last login time:", error);
        }
        
        // Save the session to ensure persistence
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session after login:', err);
            return next(err);
          }
          res.json(user);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      
      // Clear the session after logout
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ success: false, message: 'Error during logout' });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Successfully logged out' });
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Forgot Password - redirects users to admin for password reset
  app.post("/api/forgot-password", async (req, res) => {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    
    try {
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Return 200 even if user doesn't exist for security reasons
        return res.status(200).json({ 
          message: "If your username exists in our system, a system administrator will be notified to reset your password." 
        });
      }
      
      // In a real system, you would send an email or notification to the admin here
      // For our prototype, we just return a success message
      
      return res.status(200).json({ 
        message: "A system administrator has been notified to reset your password." 
      });
    } catch (error) {
      console.error("Error in forgot password:", error);
      return res.status(500).json({ message: "An error occurred processing your request." });
    }
  });
}