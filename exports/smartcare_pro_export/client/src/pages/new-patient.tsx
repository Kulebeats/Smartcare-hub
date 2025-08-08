import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInYears } from "date-fns";
import { insertPatientSchema, type InsertPatient } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NewPatientPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState("personal");
  const [showNRC, setShowNRC] = useState(false);
  const [showUnderFive, setShowUnderFive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [savedPatient, setSavedPatient] = useState<InsertPatient | null>(null);

  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
      sex: "",
      nrc: "",
      underFiveCardNumber: "",
      country: "",
      noNrc: false,
      cellphoneNumber: "",
      otherCellphoneNumber: "",
      landlineNumber: "",
      email: "",
      houseNumber: "",
      roadStreet: "",
      area: "",
      cityTownVillage: "",
      landmarks: "",
      mothersName: "",
      fathersName: "",
      guardianName: "",
      guardianRelationship: "",
      maritalStatus: "",
      birthPlace: "",
      educationLevel: "",
      occupation: "",
      facility: user?.facility || "", // Ensure facility is set from user context
    }
  });

  // Watch the date of birth field to update conditional fields
  const dateOfBirth = form.watch("dateOfBirth");

  useEffect(() => {
    if (dateOfBirth) {
      const age = differenceInYears(new Date(), new Date(dateOfBirth));
      setShowNRC(age >= 16);
      setShowUnderFive(age < 5);
    }
  }, [dateOfBirth]);

  const createPatientMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      // Skip actual API call for now since we're focusing on frontend
      return data;
    },
    onSuccess: (data) => {
      setSavedPatient(data);
      setShowSummary(true);
      toast({
        title: "Success",
        description: "Patient registration completed",
      });
    },
  });

  const onSubmit = async (data: InsertPatient) => {
    await createPatientMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="/zambia-coat-of-arms.jpg" alt="Logo" className="h-10" />
              <h1>
                <span className="text-[#00A651]">Smart</span>
                <span className="text-[#0072BC]">Care</span>
                <span className="text-[#0072BC] font-bold">PRO</span>
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.facility}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-center text-xl font-semibold text-[#4A4A4A] mb-8">Client Profile Registration</h2>
        <p className="text-center text-sm text-gray-600 mb-8">Fields marked by * are mandatory</p>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="w-full">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="parents">Parents Or Guardian Details</TabsTrigger>
            <TabsTrigger value="marital">Marital, Birth & Education Details</TabsTrigger>
            <TabsTrigger value="biometric">Biometric</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter First Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Surname" />
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
                        <FormLabel>Date of birth *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {showNRC && (
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="nrc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NRC *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="------/--/--" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noNrc"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Client does not have NRC
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {showUnderFive && (
                  <FormField
                    control={form.control}
                    name="underFiveCardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UnderFive Card Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter UnderFive Card Number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="--Select--" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zambia">Zambia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setLocation("/patients")}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setCurrentTab("parents")}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="parents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mothersName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Mother's Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fathersName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Father's Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian's Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Guardian's Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Guardian</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Relationship" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab("personal")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setCurrentTab("marital")}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="marital" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Place</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Birth Place" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="tertiary">Tertiary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Occupation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab("parents")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setCurrentTab("biometric")}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="biometric" className="space-y-4">
                <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Biometric Data Capture</h3>
                    <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                      <div className="space-y-3">
                        <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600">Fingerprint Scan</p>
                          </div>
                        </div>
                        <Button disabled className="w-full" variant="outline">
                          Scan Fingerprint
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600">Photo Capture</p>
                          </div>
                        </div>
                        <Button disabled className="w-full" variant="outline">
                          Take Photo
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-6">
                      Biometric capture functionality will be enabled in a future update. This will include fingerprint scanning and photo capture capabilities.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab("marital")}>
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      // Skip actual form submission, just show summary
                      setSavedPatient(form.getValues());
                      setShowSummary(true);
                    }}
                    className="bg-[#00B559] hover:bg-[#00A651]"
                  >
                    Save
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>

        {/* Summary Dialog */}
        <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-center">Patient Registration Summary</DialogTitle>
            </DialogHeader>
            {savedPatient && (
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Name:</span> {savedPatient.firstName} {savedPatient.surname}</p>
                    <p><span className="font-medium">Date of Birth:</span> {new Date(savedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p><span className="font-medium">Sex:</span> {savedPatient.sex}</p>
                    {savedPatient.nrc && <p><span className="font-medium">NRC:</span> {savedPatient.nrc}</p>}
                    {savedPatient.underFiveCardNumber && <p><span className="font-medium">Under Five Card:</span> {savedPatient.underFiveCardNumber}</p>}
                    <p><span className="font-medium">Country:</span> {savedPatient.country}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Contact Information</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Phone:</span> {savedPatient.cellphoneNumber}</p>
                    {savedPatient.otherCellphoneNumber && (
                      <p><span className="font-medium">Other Phone:</span> {savedPatient.otherCellphoneNumber}</p>
                    )}
                    {savedPatient.email && <p><span className="font-medium">Email:</span> {savedPatient.email}</p>}
                    <p><span className="font-medium">Address:</span> {[
                      savedPatient.houseNumber,
                      savedPatient.roadStreet,
                      savedPatient.area,
                      savedPatient.cityTownVillage
                    ].filter(Boolean).join(', ')}</p>
                    {savedPatient.landmarks && (
                      <p><span className="font-medium">Landmarks:</span> {savedPatient.landmarks}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Guardian Information</h3>
                  <div className="space-y-1">
                    {savedPatient.mothersName && <p><span className="font-medium">Mother:</span> {savedPatient.mothersName}</p>}
                    {savedPatient.fathersName && <p><span className="font-medium">Father:</span> {savedPatient.fathersName}</p>}
                    {savedPatient.guardianName && (
                      <>
                        <p><span className="font-medium">Guardian:</span> {savedPatient.guardianName}</p>
                        <p><span className="font-medium">Relationship:</span> {savedPatient.guardianRelationship}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Additional Information</h3>
                  <div className="space-y-1">
                    {savedPatient.maritalStatus && <p><span className="font-medium">Marital Status:</span> {savedPatient.maritalStatus}</p>}
                    {savedPatient.birthPlace && <p><span className="font-medium">Birth Place:</span> {savedPatient.birthPlace}</p>}
                    {savedPatient.educationLevel && <p><span className="font-medium">Education:</span> {savedPatient.educationLevel}</p>}
                    {savedPatient.occupation && <p><span className="font-medium">Occupation:</span> {savedPatient.occupation}</p>}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Review the information above</p>
              <div className="mt-4 space-x-4">
                <Button onClick={() => {
                  setShowSummary(false);
                  setLocation("/service-selection");
                }}>
                  Continue to Service Selection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}