import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { personalInfoSchema, PersonalInfo } from "@shared/schema";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface PersonalInfoStepProps {
  data: Partial<PersonalInfo>;
  onComplete: (data: PersonalInfo) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

const zambianProvinces = [
  "Central",
  "Copperbelt", 
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western"
];

const maritalStatusOptions = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
  "Other"
];

const ethnicityOptions = [
  "Bemba",
  "Nyanja",
  "Tonga",
  "Lozi",
  "Luvale",
  "Kaonde",
  "Lunda",
  "Other"
];

export function PersonalInfoStep({ data, onComplete, onBack }: PersonalInfoStepProps) {
  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: data.firstName || "",
      middleName: data.middleName || "",
      lastName: data.lastName || "",
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      maritalStatus: data.maritalStatus || "",
      nationality: data.nationality || "Zambian",
      ethnicity: data.ethnicity || "",
      nationalId: data.nationalId || "",
      passportNumber: data.passportNumber || "",
      driverLicenseNumber: data.driverLicenseNumber || "",
      emergencyContactName: data.emergencyContactName || "",
      emergencyContactPhone: data.emergencyContactPhone || "",
      emergencyContactRelationship: data.emergencyContactRelationship || "",
      placeOfBirth: data.placeOfBirth || "",
      provinceOfOrigin: data.provinceOfOrigin || "",
      languagesSpoken: data.languagesSpoken || [],
      disabilityStatus: data.disabilityStatus || false,
      disabilityDescription: data.disabilityDescription || "",
      // Contact Information
      primaryEmail: data.primaryEmail || "",
      secondaryEmail: data.secondaryEmail || "",
      primaryPhone: data.primaryPhone || "",
      secondaryPhone: data.secondaryPhone || "",
      workAddress: data.workAddress || "",
    },
  });

  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(
    data.languagesSpoken || []
  );

  const languages = [
    "English",
    "Bemba",
    "Nyanja",
    "Tonga",
    "Lozi",
    "Luvale",
    "Kaonde",
    "Lunda",
    "Other"
  ];

  const handleLanguageToggle = (language: string, checked: boolean) => {
    let newLanguages: string[];
    if (checked) {
      newLanguages = [...selectedLanguages, language];
    } else {
      newLanguages = selectedLanguages.filter(l => l !== language);
    }
    setSelectedLanguages(newLanguages);
    form.setValue("languagesSpoken", newLanguages);
  };

  const onSubmit = (formData: PersonalInfo) => {
    onComplete(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter first name" 
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
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Middle Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter middle name" 
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter last name" 
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
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Date of Birth <span className="text-red-500">*</span>
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Gender <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select Gender--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select Status--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maritalStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Identity Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Identity Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Nationality</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter nationality" 
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
              name="ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Ethnicity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ethnicityOptions.map((ethnicity) => (
                        <SelectItem key={ethnicity} value={ethnicity}>
                          {ethnicity}
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
              name="nationalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    National ID <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter National ID" 
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
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Passport Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter Passport Number" 
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
              name="driverLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Driver License Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter Driver License Number" 
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
              name="placeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Place of Birth</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter place of birth" 
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
              name="provinceOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Province of Origin</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select Province--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zambianProvinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Contact Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter emergency contact name" 
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
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Contact Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter emergency contact phone" 
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
              name="emergencyContactRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Relationship</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Spouse, Parent, Sibling" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Languages and Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Languages and Accessibility
          </h3>
          
          <div className="space-y-4">
            <div>
              <FormLabel className="text-blue-800 font-medium mb-3 block">Languages Spoken</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {languages.map((language) => (
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="disabilityStatus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-blue-800 font-medium">
                        Disability Status
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        Check if you have any disabilities that require accommodation
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disabilityDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 font-medium">Disability Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Describe any accommodations needed" 
                        {...field}
                        className="border-gray-300 focus:border-blue-500"
                        disabled={!form.watch("disabilityStatus")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Contact Information
          </h3>
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
                        placeholder="Phone Number" 
                        {...field}
                        className="border-gray-300 focus:border-blue-500 rounded-l-none border-l-0"
                      />
                    </FormControl>
                  </div>
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
                        placeholder="Secondary Phone" 
                        {...field}
                        className="border-gray-300 focus:border-blue-500 rounded-l-none border-l-0"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Address */}
            <FormField
              control={form.control}
              name="workAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-blue-800 font-medium">Work Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter Work Address" 
                      {...field}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-end pt-6">
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </form>
    </Form>
  );
}