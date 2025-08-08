import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import zambiaCoatOfArms from "@/assets/zambia-official-coa.svg";
import ecgBackground from "@/assets/ecg-background-modern.svg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import ReleaseNotesDialog from "@/components/release-notes-dialog";

// Zambian coat of arms will be referenced via URL

const LandingPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: true,
    status: 'Checking...',
    responseTime: null as number | null,
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  
  // Real-time connection monitoring
  useEffect(() => {
    const checkConnection = async () => {
      const startTime = Date.now();
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          setConnectionStatus({
            isConnected: true,
            status: 'Connected',
            responseTime,
          });
        } else {
          setConnectionStatus({
            isConnected: false,
            status: 'Connection Issues',
            responseTime,
          });
        }
      } catch (error) {
        setConnectionStatus({
          isConnected: false,
          status: 'Disconnected',
          responseTime: null,
        });
      }
    };

    // Initial check
    checkConnection();

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  // If user is already logged in, redirect to appropriate page
  useEffect(() => {
    if (user) {
      // Check if user is admin - support both formats and username check
      const isAdmin = 
        user.isAdmin === true || 
        (user as any).is_admin === true || 
        user.username === 'admin';
        
      if (isAdmin) {
        console.log("Admin user detected, redirecting to admin panel");
        setLocation("/admin");
      } else {
        // TEMPORARY DEV MODE: Skip facility selection and go directly to patients page
        console.log("DEVELOPMENT MODE: Bypassing facility selection screen");
        setLocation("/patients");
        
        /* PRODUCTION CODE (Uncomment when deploying)
        setLocation("/facility-selection");
        */
      }
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide both username and password to proceed with authentication",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await loginMutation.mutateAsync({ 
        username, 
        password, 
        rememberMe // Pass rememberMe state to the server
      });
      // Redirect handled in useEffect after user is set
    } catch (error: any) {
      // Error handling is in loginMutation
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleForgotPassword = async () => {
    if (!forgotPasswordUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your username to proceed with the password reset request",
        variant: "destructive",
      });
      return;
    }
    
    setForgotPasswordSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/forgot-password", { 
        username: forgotPasswordUsername 
      });
      
      const data = await response.json();
      setForgotPasswordSuccess(true);
      
      toast({
        title: "Request Submitted",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Request Processing Error",
        description: "Your password reset request could not be processed. Please try again or contact system administration.",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative"
         style={{
           background: `linear-gradient(to bottom right, rgba(240, 249, 255, 0.95), rgba(202, 232, 255, 0.9))`,
           backgroundImage: `url(${ecgBackground})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundBlendMode: 'overlay'
         }}>
      <div className="absolute top-2 right-2">
        <button className="p-2 rounded-full bg-gray-800 text-white">
          <Clock className="h-5 w-5" />
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative p-8 pt-14 pb-4">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-white p-2 shadow-md flex items-center justify-center">
            <div className="h-16 w-16 flex items-center justify-center">
              <svg className="h-16 w-16" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Zambian Coat of Arms - Simplified for small display */}
                
                {/* Fish Eagle at top */}
                <g>
                  <path d="M50 5 Q45 8 40 12 Q35 15 40 18 Q45 15 50 12 Q55 15 60 18 Q65 15 60 12 Q55 8 50 5 Z" fill="#FF8C00" stroke="#D2691E" strokeWidth="0.5"/>
                  <path d="M35 10 Q30 12 32 16 Q37 14 40 12" fill="#FF8C00"/>
                  <path d="M65 10 Q70 12 68 16 Q63 14 60 12" fill="#FF8C00"/>
                  <circle cx="46" cy="10" r="1" fill="#000"/>
                  <circle cx="54" cy="10" r="1" fill="#000"/>
                  <path d="M50 11 L49 12 L51 12 Z" fill="#000"/>
                </g>
                
                {/* Central Shield */}
                <path d="M25 20 Q25 18 27 18 L73 18 Q75 18 75 20 L75 55 Q75 65 50 75 Q25 65 25 55 Z" fill="#FFF" stroke="#8B4513" strokeWidth="1"/>
                
                {/* Victoria Falls wavy lines */}
                <g stroke="#000" strokeWidth="1" fill="none">
                  <path d="M30 28 Q35 30 40 28 Q45 26 50 28 Q55 30 60 28 Q65 26 70 28"/>
                  <path d="M30 33 Q35 35 40 33 Q45 31 50 33 Q55 35 60 33 Q65 31 70 33"/>
                  <path d="M30 38 Q35 40 40 38 Q45 36 50 38 Q55 40 60 38 Q65 36 70 38"/>
                  <path d="M30 43 Q35 45 40 43 Q45 41 50 43 Q55 45 60 43 Q65 41 70 43"/>
                  <path d="M30 48 Q35 50 40 48 Q45 46 50 48 Q55 50 60 48 Q65 46 70 48"/>
                </g>
                
                {/* Crossed mining tools */}
                <g stroke="#8B4513" strokeWidth="1.5" fill="#A0522D">
                  <path d="M18 15 L30 27 L29 28 L17 16 Z"/>
                  <path d="M82 15 L70 27 L71 28 L83 16 Z"/>
                  <rect x="17" y="14" width="3" height="1.5" fill="#C0C0C0"/>
                  <rect x="80" y="14" width="3" height="1.5" fill="#C0C0C0"/>
                </g>
                
                {/* Supporting figures */}
                <g>
                  {/* Left figure in green */}
                  <circle cx="15" cy="35" r="3" fill="#D2B48C"/>
                  <rect x="12" y="38" width="6" height="8" fill="#228B22"/>
                  
                  {/* Right figure in red */}
                  <circle cx="85" cy="35" r="3" fill="#D2B48C"/>
                  <rect x="82" y="38" width="6" height="8" fill="#DC143C"/>
                </g>
                
                {/* Base elements */}
                <ellipse cx="50" cy="85" rx="20" ry="4" fill="#228B22"/>
                <path d="M50 80 Q48 82 50 85 Q52 82 50 80" fill="#FFD700"/>
                <rect x="49" y="82" width="2" height="4" fill="#228B22"/>
                
                {/* National motto banner */}
                <path d="M15 95 Q30 92 50 95 Q70 92 85 95 L85 105 Q70 108 50 105 Q30 108 15 105 Z" fill="#FFF" stroke="#8B4513" strokeWidth="0.5"/>
                <text x="25" y="101" fontSize="4" fill="#000" fontFamily="serif" fontWeight="bold">ONE ZAMBIA</text>
                <text x="55" y="101" fontSize="4" fill="#000" fontFamily="serif" fontWeight="bold">ONE NATION</text>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-green-600">Smart</span>
            <span className="text-blue-500">Care</span>
            <span className="text-blue-600 font-bold">PRO</span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">A Ministry of Health SmartCare System</p>
          <p className="text-gray-500 text-xs mt-1">Prototype Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</Label>
            <Input
              id="username"
              placeholder="Enter Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-5"
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-5"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
              onClick={() => setForgotPasswordDialogOpen(true)}
            >
              Forgot Password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-md py-6 px-4 font-semibold text-white text-base shadow-md"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => setSignupDialogOpen(true)}>Sign up</span>
          </p>
        </div>

        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Are you an administrator? <Link href="/admin-login" className="text-blue-600 cursor-pointer">Administrator login</Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Click here to access <span className="text-blue-600 cursor-pointer">Help Desk</span> or Call: 8080</p>
        </div>

        <div className="mt-3 pt-2 text-center text-xs text-gray-500 border-t">
          <p>Powered by the Institute for Health Measurement (IHM) Southern Africa</p>
          <p className="mt-1">Version 1.5.0 | <span className="text-blue-600 cursor-pointer" onClick={() => setReleaseNotesOpen(true)}>Release Notes</span></p>
        </div>

        <div className="absolute right-2 bottom-2 opacity-75">
          <div className="flex items-center space-x-1">
            {connectionStatus.isConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs ${connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus.status}
            </span>
            {connectionStatus.responseTime && (
              <span className="text-xs text-gray-500">
                ({connectionStatus.responseTime}ms)
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-600">
              Reset Your Password
            </DialogTitle>
            <DialogDescription>
              Enter your username below and a system administrator will be notified to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {forgotPasswordSuccess ? (
            <Alert className="my-2 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-800">Request Submitted</AlertTitle>
              <AlertDescription className="text-green-700">
                A system administrator has been notified to reset your password.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="forgot-password-username" className="font-medium">
                  Username
                </Label>
                <Input
                  id="forgot-password-username"
                  placeholder="Enter your username"
                  value={forgotPasswordUsername}
                  onChange={(e) => setForgotPasswordUsername(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setForgotPasswordDialogOpen(false);
                // Reset the form state when closing
                setForgotPasswordUsername("");
                setForgotPasswordSuccess(false);
              }}
              disabled={forgotPasswordSubmitting}
            >
              Cancel
            </Button>
            {!forgotPasswordSuccess && (
              <Button 
                onClick={handleForgotPassword} 
                disabled={forgotPasswordSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {forgotPasswordSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Sign Up Dialog */}
      <Dialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-600">
              SmartCare PRO Account Sign Up
            </DialogTitle>
            <DialogDescription>
              New user accounts can only be created by system administrators.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-2">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-800">How to get an account</AlertTitle>
              <AlertDescription className="text-blue-700">
                Please contact your facility's system administrator or the Ministry of Health IT department to request access to the SmartCare PRO system.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setSignupDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Release Notes Dialog */}
      <ReleaseNotesDialog 
        open={releaseNotesOpen} 
        onOpenChange={setReleaseNotesOpen} 
      />
    </div>
  );
};

export default LandingPage;