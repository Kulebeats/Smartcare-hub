import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginInfoSchema, LoginInfo } from "@shared/schema";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

interface LoginInfoStepProps {
  data: Partial<LoginInfo>;
  onComplete: (data: LoginInfo) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export function LoginInfoStep({ data, onComplete, onBack }: LoginInfoStepProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<LoginInfo>({
    resolver: zodResolver(loginInfoSchema),
    defaultValues: {
      username: data.username || "",
      password: data.password || "",
      confirmPassword: data.confirmPassword || "",
      twoFactorAuth: data.twoFactorAuth || undefined,
      digitalSignatureId: data.digitalSignatureId || "",
      securityLevel: data.securityLevel || "Standard",
    },
  });

  const onSubmit = (formData: LoginInfo) => {
    onComplete(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Username <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Create a username" 
                    {...field}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </FormControl>
                <p className="text-sm text-gray-500">Username must be at least 5 characters</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500 pr-10"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Password must contain at least 8 characters, including one uppercase letter, 
                  one lowercase letter, one number, and one special character
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500 pr-10"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Two-Factor Authentication */}
          <FormField
            control={form.control}
            name="twoFactorAuth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Two-Factor Authentication <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="App">Authenticator App</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Digital Signature ID */}
          <FormField
            control={form.control}
            name="digitalSignatureId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Digital Signature ID <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter Digital Signature ID" 
                    {...field}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Security Level */}
          <FormField
            control={form.control}
            name="securityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">Security Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Elevated">Elevated</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {onBack && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </Button>
          )}
          
          <Button 
            type="submit"
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}