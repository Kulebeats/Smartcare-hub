import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { professionalInfoSchema, ProfessionalInfo } from "@shared/schema";
import { ChevronLeft } from "lucide-react";

interface ProfessionalInfoStepProps {
  data: Partial<ProfessionalInfo>;
  onComplete: (data: ProfessionalInfo) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

const zambianLanguages = [
  "English",
  "Bemba", 
  "Nyanja",
  "Tonga",
  "Lozi",
  "Kaonde",
  "Lunda",
  "Luvale",
  "Chewa",
  "Tumbuka"
];

const specialties = [
  "General Medicine",
  "Pediatrics", 
  "OB/GYN",
  "Surgery",
  "Public Health",
  "HIV/AIDS",
  "TB",
  "Malaria",
  "Community Health",
  "Mental Health",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Orthopedics",
  "Cardiology",
  "Other"
];

export function ProfessionalInfoStep({ data, onComplete, onBack }: ProfessionalInfoStepProps) {
  const form = useForm<ProfessionalInfo>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      hpczRegistrationNumber: data.hpczRegistrationNumber || "",
      hpczCategory: data.hpczCategory || undefined,
      gnczRegistrationNumber: data.gnczRegistrationNumber || "",
      nursingCategory: data.nursingCategory || undefined,
      mohCertificateNumber: data.mohCertificateNumber || "",
      professionalTitle: data.professionalTitle || undefined,
      licenseNumber: data.licenseNumber || "",
      licenseExpirationDate: data.licenseExpirationDate || "",
      specialty: data.specialty || "",
      employmentStatus: data.employmentStatus || "Active",
      accountType: data.accountType || "Permanent",
      accountExpiryDate: data.accountExpiryDate || "",
      additionalCertifications: data.additionalCertifications || "",
      primaryLanguages: data.primaryLanguages || ["English"],
      languageCertificationLevels: data.languageCertificationLevels || {},
    },
  });

  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(
    data.primaryLanguages || ["English"]
  );

  const handleLanguageToggle = (language: string, checked: boolean) => {
    let newLanguages: string[];
    if (checked) {
      newLanguages = [...selectedLanguages, language];
    } else {
      newLanguages = selectedLanguages.filter(l => l !== language);
    }
    setSelectedLanguages(newLanguages);
    form.setValue("primaryLanguages", newLanguages);
  };

  const onSubmit = (formData: ProfessionalInfo) => {
    onComplete(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* HPCZ Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            HPCZ Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="hpczRegistrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">HPCZ Registration Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="CO/2024/001234" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hpczCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">HPCZ Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CO">Clinical Officer (CO)</SelectItem>
                      <SelectItem value="ML">Medical Laboratory (ML)</SelectItem>
                      <SelectItem value="PT">Physiotherapy (PT)</SelectItem>
                      <SelectItem value="OT">Occupational Therapy (OT)</SelectItem>
                      <SelectItem value="RAD">Radiography (RAD)</SelectItem>
                      <SelectItem value="MLT">Medical Laboratory Technology (MLT)</SelectItem>
                      <SelectItem value="BME">Biomedical Engineering (BME)</SelectItem>
                      <SelectItem value="DT">Dental Technology (DT)</SelectItem>
                      <SelectItem value="DH">Dental Hygiene (DH)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* GNCZ Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            GNCZ Information (Nurses Only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gnczRegistrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">GNCZ Registration Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter GNCZ Number" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nursingCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Nursing Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RN">Registered Nurse (RN)</SelectItem>
                      <SelectItem value="EN">Enrolled Nurse (EN)</SelectItem>
                      <SelectItem value="RM">Registered Midwife (RM)</SelectItem>
                      <SelectItem value="Public Health">Public Health Nurse</SelectItem>
                      <SelectItem value="Mental Health">Mental Health Nurse</SelectItem>
                      <SelectItem value="Oncology">Oncology Nurse</SelectItem>
                      <SelectItem value="Nurse Practitioner">Nurse Practitioner</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Professional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="mohCertificateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">MOH Certificate Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter MOH Certificate" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professionalTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Professional Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MD">Medical Doctor (MD)</SelectItem>
                      <SelectItem value="RN">Registered Nurse (RN)</SelectItem>
                      <SelectItem value="NP">Nurse Practitioner (NP)</SelectItem>
                      <SelectItem value="PA">Physician Assistant (PA)</SelectItem>
                      <SelectItem value="LPN">Licensed Practical Nurse (LPN)</SelectItem>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    License Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter License Number" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseExpirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    License Expiration Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Specialty/Department <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Employment Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Account Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Account Expiry Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="additionalCertifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-800 font-medium">Additional Certifications</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., BLS, ACLS, SmartCare Pro Training" 
                    {...field}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Language Proficiency */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Language Proficiency <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {zambianLanguages.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${language}`}
                  checked={selectedLanguages.includes(language)}
                  onCheckedChange={(checked) => handleLanguageToggle(language, checked as boolean)}
                />
                <label 
                  htmlFor={`lang-${language}`} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {language}
                </label>
              </div>
            ))}
          </div>
          <FormMessage />
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