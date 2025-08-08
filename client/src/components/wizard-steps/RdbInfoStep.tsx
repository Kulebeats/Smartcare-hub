import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { rdbInfoSchema, RdbInfo } from "@shared/schema";
import { ChevronLeft, UserCheck } from "lucide-react";

interface RdbInfoStepProps {
  data: Partial<RdbInfo>;
  onComplete: (data: RdbInfo) => void;
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

const facilityTypes = [
  "Teaching Hospital",
  "General Hospital",
  "District Hospital",
  "Health Centre",
  "Health Post",
  "Clinic",
  "Maternal Health Centre",
  "Community Health Centre",
  "Rural Health Centre",
  "Urban Health Centre",
  "Specialized Hospital",
  "Private Hospital",
  "Private Clinic",
  "NGO Facility",
  "Mission Hospital",
  "Other"
];

const departments = [
  "General Medicine",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Surgery",
  "Emergency Department",
  "Outpatient Department",
  "Laboratory",
  "Radiology",
  "Pharmacy",
  "Nursing",
  "Administration",
  "Public Health",
  "HIV/AIDS",
  "TB",
  "Malaria",
  "Mental Health",
  "Nutrition",
  "Dental",
  "Eye Care",
  "Other"
];

export function RdbInfoStep({ data, onComplete, onBack, isLastStep }: RdbInfoStepProps) {
  const form = useForm<RdbInfo>({
    resolver: zodResolver(rdbInfoSchema),
    defaultValues: {
      provinceAssignment: data.provinceAssignment || "",
      districtAssignment: data.districtAssignment || "",
      districtHealthOffice: data.districtHealthOffice || "",
      facilityTypeAccess: data.facilityTypeAccess || [],
      departmentAccess: data.departmentAccess || [],
      patientPopulationAccess: data.patientPopulationAccess || "All",
      defaultLandingPage: data.defaultLandingPage || undefined,
      notificationPreferences: data.notificationPreferences || {
        email: true,
        sms: false,
        inApp: true,
        realTime: true,
        daily: false,
        weekly: false,
      },
      timeZone: data.timeZone || "CAT",
      accessibilityNeeds: data.accessibilityNeeds || "",
      dhis2UserId: data.dhis2UserId || "",
      elmisUserId: data.elmisUserId || "",
      dataProcessingConsent: data.dataProcessingConsent || false,
    },
  });

  const [selectedFacilityTypes, setSelectedFacilityTypes] = React.useState<string[]>(
    data.facilityTypeAccess || []
  );
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>(
    data.departmentAccess || []
  );

  const handleFacilityTypeToggle = (facilityType: string, checked: boolean) => {
    let newTypes: string[];
    if (checked) {
      newTypes = [...selectedFacilityTypes, facilityType];
    } else {
      newTypes = selectedFacilityTypes.filter(t => t !== facilityType);
    }
    setSelectedFacilityTypes(newTypes);
    form.setValue("facilityTypeAccess", newTypes);
  };

  const handleDepartmentToggle = (department: string, checked: boolean) => {
    let newDepartments: string[];
    if (checked) {
      newDepartments = [...selectedDepartments, department];
    } else {
      newDepartments = selectedDepartments.filter(d => d !== department);
    }
    setSelectedDepartments(newDepartments);
    form.setValue("departmentAccess", newDepartments);
  };

  const onSubmit = (formData: RdbInfo) => {
    onComplete(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Geographic Access Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Geographic Access Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="provinceAssignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    Province Assignment <span className="text-red-500">*</span>
                  </FormLabel>
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

            <FormField
              control={form.control}
              name="districtAssignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">
                    District Assignment <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter District" 
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
              name="districtHealthOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">District Health Office</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter District Health Office" 
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
              name="patientPopulationAccess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Patient Population Access</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All">All Patients</SelectItem>
                      <SelectItem value="Department Only">Department Only</SelectItem>
                      <SelectItem value="Provider Panel">Provider Panel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Facility Type Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Facility Type Access <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {facilityTypes.map((facilityType) => (
              <div key={facilityType} className="flex items-center space-x-2">
                <Checkbox
                  id={`facility-${facilityType}`}
                  checked={selectedFacilityTypes.includes(facilityType)}
                  onCheckedChange={(checked) => handleFacilityTypeToggle(facilityType, checked as boolean)}
                />
                <label 
                  htmlFor={`facility-${facilityType}`} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {facilityType}
                </label>
              </div>
            ))}
          </div>
          <FormMessage />
        </div>

        {/* Department Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Department Access <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {departments.map((department) => (
              <div key={department} className="flex items-center space-x-2">
                <Checkbox
                  id={`dept-${department}`}
                  checked={selectedDepartments.includes(department)}
                  onCheckedChange={(checked) => handleDepartmentToggle(department, checked as boolean)}
                />
                <label 
                  htmlFor={`dept-${department}`} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {department}
                </label>
              </div>
            ))}
          </div>
          <FormMessage />
        </div>

        {/* System Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            System Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="defaultLandingPage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Default Landing Page</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Dashboard">Dashboard</SelectItem>
                      <SelectItem value="Patient List">Patient List</SelectItem>
                      <SelectItem value="Schedule">Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">Time Zone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CAT">Central Africa Time (CAT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dhis2UserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">DHIS2 User ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter DHIS2 User ID" 
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
              name="elmisUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-800 font-medium">eLMIS User ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter eLMIS User ID" 
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
              name="accessibilityNeeds"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-blue-800 font-medium">Accessibility Needs</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Screen Reader, Large Font" 
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

        {/* Data Processing Consent */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
            Data Processing Consent
          </h3>
          <FormField
            control={form.control}
            name="dataProcessingConsent"
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
                    I consent to data processing <span className="text-red-500">*</span>
                  </FormLabel>
                  <p className="text-sm text-gray-600">
                    I agree to the processing of my personal data for the purpose of user account 
                    management and healthcare service delivery in accordance with Zambian data 
                    protection regulations.
                  </p>
                </div>
              </FormItem>
            )}
          />
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
            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-8 flex items-center space-x-2"
          >
            <UserCheck size={16} />
            <span>{isLastStep ? "Register User" : "Next"}</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}