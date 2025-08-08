import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const loginResponse = await loginMutation.mutateAsync(data);
      
      // Check if logged in user is admin
      const isAdmin = 
        loginResponse.isAdmin === true || 
        (loginResponse as any).is_admin === true || 
        loginResponse.username === 'admin';
        
      if (isAdmin) {
        toast({
          title: "Admin Login Successful",
          description: "You are now logged in as an administrator.",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Login successful",
          description: "You have been logged in as a regular user.",
        });
        navigate("/facility-selection");
      }
    } catch (error) {
      setLoginError("Authentication failed. Please verify your credentials and try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If user is already logged in, redirect to appropriate page
  if (user) {
    // Check if user is admin - support both formats and username check
    const isAdmin = 
      user.isAdmin === true || 
      (user as any).is_admin === true || 
      user.username === 'admin';
      
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/facility-selection");
    }
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <img 
                src="/logo.png" 
                alt="SmartCare PRO Logo" 
                className="h-12"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/120x48?text=SmartCare+PRO";
                }} 
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-blue-600">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                          disabled={isLoggingIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password" 
                            {...field} 
                            disabled={isLoggingIn}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Log in to Admin Panel"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-500">
              <Link href="/" className="text-blue-600 hover:underline">
                Return to SmartCare PRO
              </Link>
            </div>
            <div className="text-xs text-center text-gray-400">
              <p>For administrative access only. Unauthorized access is prohibited.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;