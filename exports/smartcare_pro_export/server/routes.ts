import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { transferToSmartCare } from './transfer-to-smartcare';
import { insertPatientSchema } from "@shared/schema";

// Mock ensureAuthenticated middleware (replace with your actual implementation)
function ensureAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Facility Routes
  app.get("/api/facilities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const facilities = await storage.getFacilities();
    res.json(facilities);
  });

  // Patient Routes
  app.get("/api/patients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.facility) return res.status(400).json({ message: "No facility selected" });
    const patients = await storage.getPatients(req.user.facility);
    res.json(patients);
  });

  app.post("/api/patients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.facility) return res.status(400).json({ message: "No facility selected" });

    try {
      // Parse and validate the request body
      const validatedData = insertPatientSchema.parse({
        ...req.body,
        facility: req.user.facility
      });

      // Create the patient
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({ 
        message: "Invalid patient data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const patient = await storage.getPatient(parseInt(req.params.id));
    if (!patient) return res.sendStatus(404);
    res.json(patient);
  });

  // ART Follow-up Routes
  app.post("/api/patients/:id/art-followup", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const followup = await storage.createArtFollowUp({
      ...req.body,
      patientId: parseInt(req.params.id)
    });
    res.status(201).json(followup);
  });

  // Prescription Routes
  app.post("/api/patients/:id/prescriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.facility) return res.status(400).json({ message: "No facility selected" });
    const prescription = await storage.createPrescription({
      ...req.body,
      patientId: parseInt(req.params.id),
      facility: req.user.facility
    });
    res.status(201).json(prescription);
  });

  // Transfer Route
  app.post('/api/transfer', ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user?.facility) {
        return res.status(400).json({ message: 'No facility selected' });
      }
      const data = await transferToSmartCare(req.user.facility);
      res.json({ message: 'Transfer completed', data });
    } catch (error) {
      res.status(500).json({ message: 'Transfer failed', error });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}

// Mock transferToSmartCare function (replace with your actual implementation)
async function transferToSmartCare(facility: any) {
  //Simulate data transfer
  console.log(`Transferring data for facility: ${facility}`);
  return {facility, dataTransferred: true};
}