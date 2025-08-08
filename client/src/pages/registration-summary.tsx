import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MainLayout } from "@/components/layout/main-layout";
import { Edit, Check, FileText, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface RegistrationData {
  // Personal Information
  firstName: string;
  middleName?: string;
  surname: string;
  dateOfBirth: string;
  sex: string;
  country: string;
  nrc?: string;
  nupin?: string;
  underFiveCardNumber?: string;
  
  // Contact Information
  cellphoneNumber: string;
  otherCellphoneNumber?: string;
  landlineNumber?: string;
  email?: string;
  houseNumber?: string;
  road?: string;
  area?: string;
  cityTownVillage?: string;
  isZambianBorn: boolean;
  landmarksAndDirections?: string;
  
  // Parents/Guardian Information
  motherFirstName?: string;
  motherSurname?: string;
  motherNrc?: string;
  motherNationality?: string;
  fatherFirstName?: string;
  fatherSurname?: string;
  fatherNrc?: string;
  fatherNationality?: string;
  guardianFirstName?: string;
  guardianSurname?: string;
  guardianNrc?: string;
  guardianNationality?: string;
  guardianRelationship?: string;
  
  // Marital, Birth & Education
  maritalStatus?: string;
  spouseFirstName?: string;
  spouseSurname?: string;
  spouseNrc?: string;
  spouseNationality?: string;
  homeLanguage?: string;
  districtOfBirth?: string;
  placeOfBirth?: string;
  religion?: string;
  religiousDenomination?: string;
  educationLevel?: string;
  occupation?: string;
  
  // Biometric
  fingerprintCaptured?: boolean;
  photographCaptured?: boolean;
}

interface DataBucket {
  id: string;
  title: string;
  fields: Array<{
    label: string;
    value: string | boolean | undefined;
    key: string;
  }>;
  editRoute: string;
  tabName: string;
}

export default function RegistrationSummaryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load registration data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('registrationData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setRegistrationData(parsedData);
      } else {
        // No data found, redirect to registration
        toast({
          title: "No Registration Data",
          description: "Please complete the registration form first.",
          variant: "destructive"
        });
        setLocation("/new-patient");
        return;
      }
    } catch (error) {
      console.error("Error loading registration data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load registration data. Please start registration again.",
        variant: "destructive"
      });
      setLocation("/new-patient");
      return;
    }
    setIsLoading(false);
  }, [setLocation, toast]);

  // Mutation for final patient registration
  const createPatientMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      return await apiRequest("POST", "/api/patients", data);
    },
    onSuccess: (result) => {
      // Clear temporary registration data
      localStorage.removeItem('registrationData');
      
      toast({
        title: "Registration Successful",
        description: "Patient has been successfully registered in the system.",
        variant: "default"
      });

      // Show success dialog and navigate to service selection
      setTimeout(() => {
        setLocation("/service-selection");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
    }
  });

  const formatFieldValue = (value: string | boolean | undefined): string => {
    if (value === undefined || value === null || value === '') {
      return "Not provided";
    }
    if (typeof value === 'boolean') {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  const getAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return "Not provided";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return `${age} years old`;
  };

  const createDataBuckets = (data: RegistrationData): DataBucket[] => {
    return [
      {
        id: "personal",
        title: "Personal Information",
        editRoute: "/new-patient?tab=personal&edit=true",
        tabName: "personal",
        fields: [
          { label: "First Name", value: data.firstName, key: "firstName" },
          { label: "Middle Name", value: data.middleName, key: "middleName" },
          { label: "Surname", value: data.surname, key: "surname" },
          { label: "Date of Birth", value: data.dateOfBirth, key: "dateOfBirth" },
          { label: "Age", value: getAge(data.dateOfBirth), key: "age" },
          { label: "Sex", value: data.sex, key: "sex" },
          { label: "Country", value: data.country, key: "country" },
          { label: "NRC", value: data.nrc, key: "nrc" },
          { label: "NUPIN", value: data.nupin, key: "nupin" },
          { label: "Under Five Card Number", value: data.underFiveCardNumber, key: "underFiveCardNumber" }
        ]
      },
      {
        id: "contact",
        title: "Contact Information",
        editRoute: "/new-patient?tab=personal&edit=true&section=contact",
        tabName: "personal",
        fields: [
          { label: "Cellphone Number", value: data.cellphoneNumber, key: "cellphoneNumber" },
          { label: "Other Cellphone Number", value: data.otherCellphoneNumber, key: "otherCellphoneNumber" },
          { label: "Landline Number", value: data.landlineNumber, key: "landlineNumber" },
          { label: "Email", value: data.email, key: "email" },
          { label: "House Number", value: data.houseNumber, key: "houseNumber" },
          { label: "Road/Street", value: data.road, key: "road" },
          { label: "Area", value: data.area, key: "area" },
          { label: "City/Town/Village", value: data.cityTownVillage, key: "cityTownVillage" },
          { label: "Is Zambian Born", value: data.isZambianBorn, key: "isZambianBorn" },
          { label: "Landmarks & Directions", value: data.landmarksAndDirections, key: "landmarksAndDirections" }
        ]
      },
      {
        id: "parents",
        title: "Parents/Guardian Details",
        editRoute: "/new-patient?tab=parents&edit=true",
        tabName: "parents",
        fields: [
          { label: "Mother's First Name", value: data.motherFirstName, key: "motherFirstName" },
          { label: "Mother's Surname", value: data.motherSurname, key: "motherSurname" },
          { label: "Mother's NRC", value: data.motherNrc, key: "motherNrc" },
          { label: "Mother's Nationality", value: data.motherNationality, key: "motherNationality" },
          { label: "Father's First Name", value: data.fatherFirstName, key: "fatherFirstName" },
          { label: "Father's Surname", value: data.fatherSurname, key: "fatherSurname" },
          { label: "Father's NRC", value: data.fatherNrc, key: "fatherNrc" },
          { label: "Father's Nationality", value: data.fatherNationality, key: "fatherNationality" },
          { label: "Guardian's First Name", value: data.guardianFirstName, key: "guardianFirstName" },
          { label: "Guardian's Surname", value: data.guardianSurname, key: "guardianSurname" },
          { label: "Guardian's NRC", value: data.guardianNrc, key: "guardianNrc" },
          { label: "Guardian's Nationality", value: data.guardianNationality, key: "guardianNationality" },
          { label: "Guardian Relationship", value: data.guardianRelationship, key: "guardianRelationship" }
        ]
      },
      {
        id: "marital",
        title: "Marital, Birth & Education",
        editRoute: "/new-patient?tab=marital&edit=true",
        tabName: "marital",
        fields: [
          { label: "Marital Status", value: data.maritalStatus, key: "maritalStatus" },
          { label: "Spouse's First Name", value: data.spouseFirstName, key: "spouseFirstName" },
          { label: "Spouse's Surname", value: data.spouseSurname, key: "spouseSurname" },
          { label: "Spouse's NRC", value: data.spouseNrc, key: "spouseNrc" },
          { label: "Spouse's Nationality", value: data.spouseNationality, key: "spouseNationality" },
          { label: "Home Language", value: data.homeLanguage, key: "homeLanguage" },
          { label: "District of Birth", value: data.districtOfBirth, key: "districtOfBirth" },
          { label: "Place of Birth", value: data.placeOfBirth, key: "placeOfBirth" },
          { label: "Religion", value: data.religion, key: "religion" },
          { label: "Religious Denomination", value: data.religiousDenomination, key: "religiousDenomination" },
          { label: "Education Level", value: data.educationLevel, key: "educationLevel" },
          { label: "Occupation", value: data.occupation, key: "occupation" }
        ]
      },
      {
        id: "biometric",
        title: "Biometric Information",
        editRoute: "/new-patient?tab=biometric&edit=true",
        tabName: "biometric",
        fields: [
          { label: "Fingerprint Captured", value: data.fingerprintCaptured, key: "fingerprintCaptured" },
          { label: "Photograph Captured", value: data.photographCaptured, key: "photographCaptured" }
        ]
      }
    ];
  };

  const handleEditBucket = (bucket: DataBucket) => {
    // Save current position for return navigation
    localStorage.setItem('summaryReturnRoute', '/registration-summary');
    localStorage.setItem('editingBucket', bucket.id);
    
    // Navigate to the edit form
    setLocation(bucket.editRoute);
  };

  const handleFinishRegistration = () => {
    setShowConfirmDialog(true);
  };

  const confirmRegistration = () => {
    if (registrationData) {
      createPatientMutation.mutate(registrationData);
    }
    setShowConfirmDialog(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading registration summary...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!registrationData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No registration data found.</p>
            <Button onClick={() => setLocation("/new-patient")}>
              Start Registration
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const dataBuckets = createDataBuckets(registrationData);

  return (
    <MainLayout>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/new-patient")}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration Form
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Registration Summary</h1>
          </div>
          <p className="text-gray-600">
            Review your registration information below. You can edit any section by clicking the Edit button.
            When you're satisfied with all information, click "Finish Registration" to complete the process.
          </p>
        </div>

        <div className="space-y-6">
          {dataBuckets.map((bucket) => (
            <Card key={bucket.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    {bucket.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBucket(bucket)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bucket.fields.map((field) => {
                    const displayValue = formatFieldValue(field.value);
                    const isEmpty = displayValue === "Not provided";
                    
                    return (
                      <div key={field.key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </span>
                        <span className={`text-sm ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Review all sections carefully before completing registration.</p>
              <p className="mt-1">You can edit any section using the Edit buttons above.</p>
            </div>
            <Button
              onClick={handleFinishRegistration}
              disabled={createPatientMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-base font-medium"
            >
              {createPatientMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Finish Registration"
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete the registration for {registrationData.firstName} {registrationData.surname}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRegistration} className="bg-green-600 hover:bg-green-700">
              Confirm Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}