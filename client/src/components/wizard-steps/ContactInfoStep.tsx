import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { contactInfoSchema, ContactInfo } from "@shared/schema";
import { ChevronLeft } from "lucide-react";

interface ContactInfoStepProps {
  data: Partial<ContactInfo>;
  onComplete: (data: ContactInfo) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export function ContactInfoStep({ data, onComplete, onBack }: ContactInfoStepProps) {
  const form = useForm<ContactInfo>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      primaryEmail: data.primaryEmail || "",
      secondaryEmail: data.secondaryEmail || "",
      primaryPhone: data.primaryPhone || "",
      secondaryPhone: data.secondaryPhone || "",
      workAddress: data.workAddress || "",
      emergencyContactName: data.emergencyContactName || "",
      emergencyContactPhone: data.emergencyContactPhone || "",
    },
  });

  const onSubmit = (formData: ContactInfo) => {
    onComplete(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Email */}
          <FormField
            control={form.control}
            name="primaryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Enter Email Address" 
                    {...field}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Secondary Email */}
          <FormField
            control={form.control}
            name="secondaryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">Secondary Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Enter Secondary Email" 
                    {...field}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Primary Phone */}
          <FormField
            control={form.control}
            name="primaryPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </FormLabel>
                <div className="flex">
                  <Select defaultValue="ZM +260">
                    <SelectTrigger className="w-32 border-gray-300 focus:border-blue-500 rounded-r-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZM +260">ZM +260</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormControl>
                    <Input 
                      placeholder="977882299"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(`+260${value}`);
                      }}
                      value={field.value.replace('+260', '')}
                      className="border-gray-300 focus:border-blue-500 rounded-l-none flex-1"
                    />
                  </FormControl>
                </div>
                <p className="text-sm text-gray-500">Example format: 977882299 (without leading zero)</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Secondary Phone */}
          <FormField
            control={form.control}
            name="secondaryPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">Secondary Phone</FormLabel>
                <div className="flex">
                  <Select defaultValue="ZM +260">
                    <SelectTrigger className="w-32 border-gray-300 focus:border-blue-500 rounded-r-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZM +260">ZM +260</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormControl>
                    <Input 
                      placeholder="977882299"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value ? `+260${value}` : "");
                      }}
                      value={field.value?.replace('+260', '') || ''}
                      className="border-gray-300 focus:border-blue-500 rounded-l-none flex-1"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Work Address - Full Width */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="workAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Physical Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter Address" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Emergency Contact Name */}
          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">Emergency Contact Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter Emergency Contact Name" 
                    {...field}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emergency Contact Phone */}
          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">Emergency Contact Phone</FormLabel>
                <div className="flex">
                  <Select defaultValue="ZM +260">
                    <SelectTrigger className="w-32 border-gray-300 focus:border-blue-500 rounded-r-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZM +260">ZM +260</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormControl>
                    <Input 
                      placeholder="977882299"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value ? `+260${value}` : "");
                      }}
                      value={field.value?.replace('+260', '') || ''}
                      className="border-gray-300 focus:border-blue-500 rounded-l-none flex-1"
                    />
                  </FormControl>
                </div>
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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContactInfo {
  primaryEmail?: string;
  secondaryEmail?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  workAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface ContactInfoStepProps {
  data: Partial<ContactInfo>;
  onComplete: (data: ContactInfo) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export function ContactInfoStep({ data, onComplete, onBack, isLastStep }: ContactInfoStepProps) {
  const [formData, setFormData] = useState<ContactInfo>({
    primaryEmail: "",
    secondaryEmail: "",
    primaryPhone: "",
    secondaryPhone: "",
    workAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    ...data,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryEmail)) {
      newErrors.primaryEmail = "Please enter a valid email address";
    }

    if (formData.secondaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.secondaryEmail)) {
      newErrors.secondaryEmail = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (formData.primaryPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.primaryPhone)) {
      newErrors.primaryPhone = "Please enter a valid phone number";
    }

    if (formData.secondaryPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.secondaryPhone)) {
      newErrors.secondaryPhone = "Please enter a valid phone number";
    }

    if (formData.emergencyContactPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Email */}
        <div className="space-y-2">
          <Label htmlFor="primaryEmail">Primary Email *</Label>
          <Input
            id="primaryEmail"
            type="email"
            value={formData.primaryEmail || ""}
            onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
            placeholder="john.doe@example.com"
            className={errors.primaryEmail ? "border-red-500" : ""}
          />
          {errors.primaryEmail && (
            <p className="text-sm text-red-500">{errors.primaryEmail}</p>
          )}
        </div>

        {/* Secondary Email */}
        <div className="space-y-2">
          <Label htmlFor="secondaryEmail">Secondary Email</Label>
          <Input
            id="secondaryEmail"
            type="email"
            value={formData.secondaryEmail || ""}
            onChange={(e) => handleInputChange("secondaryEmail", e.target.value)}
            placeholder="alternate@example.com"
            className={errors.secondaryEmail ? "border-red-500" : ""}
          />
          {errors.secondaryEmail && (
            <p className="text-sm text-red-500">{errors.secondaryEmail}</p>
          )}
        </div>

        {/* Primary Phone */}
        <div className="space-y-2">
          <Label htmlFor="primaryPhone">Primary Phone *</Label>
          <Input
            id="primaryPhone"
            type="tel"
            value={formData.primaryPhone || ""}
            onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
            placeholder="+260 XXX XXXXXX"
            className={errors.primaryPhone ? "border-red-500" : ""}
          />
          {errors.primaryPhone && (
            <p className="text-sm text-red-500">{errors.primaryPhone}</p>
          )}
        </div>

        {/* Secondary Phone */}
        <div className="space-y-2">
          <Label htmlFor="secondaryPhone">Secondary Phone</Label>
          <Input
            id="secondaryPhone"
            type="tel"
            value={formData.secondaryPhone || ""}
            onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
            placeholder="+260 XXX XXXXXX"
            className={errors.secondaryPhone ? "border-red-500" : ""}
          />
          {errors.secondaryPhone && (
            <p className="text-sm text-red-500">{errors.secondaryPhone}</p>
          )}
        </div>
      </div>

      {/* Work Address */}
      <div className="space-y-2">
        <Label htmlFor="workAddress">Work Address</Label>
        <Input
          id="workAddress"
          value={formData.workAddress || ""}
          onChange={(e) => handleInputChange("workAddress", e.target.value)}
          placeholder="Complete work address"
        />
      </div>

      {/* Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName || ""}
            onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
            placeholder="Emergency contact full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone || ""}
            onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
            placeholder="+260 XXX XXXXXX"
            className={errors.emergencyContactPhone ? "border-red-500" : ""}
          />
          {errors.emergencyContactPhone && (
            <p className="text-sm text-red-500">{errors.emergencyContactPhone}</p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={!onBack}
          className="flex items-center space-x-2"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <span>{isLastStep ? "Complete" : "Next"}</span>
          {!isLastStep && <ChevronRight size={16} />}
        </Button>
      </div>
    </div>
  );
}
