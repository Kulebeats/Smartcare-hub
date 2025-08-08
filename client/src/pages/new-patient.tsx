import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { InsertPatient, insertPatientSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";

// Function to generate a checksum (Luhn algorithm implementation)
const generateChecksum = (input: string): number => {
  // Remove any non-numeric characters
  const numericInput = input.replace(/\D/g, '');

  let sum = 0;
  let alternate = false;

  for (let i = numericInput.length - 1; i >= 0; i--) {
    let n = parseInt(numericInput.substring(i, i + 1), 10);

    // Handle NaN case
    if (isNaN(n)) {
      n = 0;
    }

    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  // Ensure we return a valid single digit (0-9)
  return sum > 0 ? (10 - (sum % 10)) % 10 : 0;
};

// Function to generate NUPIN
const generateNUPIN = (facilityCode: string, serialNumber: number): string => {
  // Format should be: 5004-0014P-06626-0
  // where 5004 is the DHIS province code, 0014P is the facility code, 
  // 06626 is the sequential number, and 0 is the checksum

  // Default values if parsing fails
  let provinceCode = '5004';
  let facilityIdentifier = '0014P';

  if (facilityCode && facilityCode.includes('-')) {
    const facilityCodeParts = facilityCode.split('-');
    // Use default if part is empty or undefined
    if (facilityCodeParts[0] && facilityCodeParts[0].trim() !== '') {
      provinceCode = facilityCodeParts[0].trim();
    }
    if (facilityCodeParts[1] && facilityCodeParts[1].trim() !== '') {
      facilityIdentifier = facilityCodeParts[1].trim();
    }
  }

  // Ensure serial number is valid
  const validSerialNumber = isNaN(serialNumber) ? 1 : Math.abs(serialNumber);

  // Format the serial number with leading zeros to make it 5 digits
  const formattedSerialNumber = validSerialNumber.toString().padStart(5, '0');

  // Generate checksum on the combined string
  const baseString = `${provinceCode}${facilityIdentifier}${formattedSerialNumber}`;
  const checksum = generateChecksum(baseString);

  // Return the formatted NUPIN
  return `${provinceCode}-${facilityIdentifier}-${formattedSerialNumber}-${checksum}`;
};

export default function NewPatientPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState("personal");
  const [showNRC, setShowNRC] = useState(false);
  const [showUnderFive, setShowUnderFive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  // State variable to track the last validated DOB to prevent duplicate toast warnings
  const [lastValidatedDob, setLastValidatedDob] = useState("");
  
  // Check if we're in edit mode and get tab from URL
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get('edit') === 'true';
  const tabFromUrl = urlParams.get('tab');
  
  // Set initial tab from URL if provided
  useEffect(() => {
    if (tabFromUrl && isEditMode) {
      setCurrentTab(tabFromUrl);
    }
  }, [tabFromUrl, isEditMode]);

  // Function to check if client is 18 or older
  const isClientAdult = () => {
    const dob = form.getValues("dateOfBirth");
    if (!dob) return false;

    const birthDate = new Date(dob);
    const today = new Date();
    const age = differenceInYears(today, birthDate);
    return age >= 18;
  };

  // Districts by province mapping for Zambia
  const districtsByProvince = {
    "Central": ["Chibombo", "Chisamba", "Chitambo", "Itezhi-Tezhi", "Kabwe", "Kapiri Mposhi", "Luano", "Mkushi", "Mumbwa", "Ngabwe", "Serenje"],
    "Copperbelt": ["Chililabombwe", "Chingola", "Kalulushi", "Kitwe", "Luanshya", "Lufwanyama", "Masaiti", "Mpongwe", "Mufulira", "Ndola"],
    "Eastern": ["Chadiza", "Chama", "Chipangali", "Chipata", "Kasenengwa", "Katete", "Lumezi", "Lundazi", "Lusangazi", "Mambwe", "Nyimba", "Petauke", "Sinda", "Vubwi"],
    "Luapula": ["Chembe", "Chiengi", "Chipili", "Chifunabuli", "Kawambwa", "Lunga", "Mansa", "Milenge", "Mwansabombwe", "Mwense", "Nchelenge", "Samfya"],
    "Lusaka": ["Chilanga", "Chongwe", "Kafue", "Luangwa", "Lusaka", "Rufunsa"],
    "Muchinga": ["Chama", "Chinsali", "Isoka", "Kanchibiya", "Lavushimanda", "Mafinga", "Mpika", "Nakonde", "Shiwang'andu"],
    "Northern": ["Chilubi", "Kasama", "Lunte", "Lupososhi", "Luwingu", "Mbala", "Mporokoso", "Mpulungu", "Mungwi", "Nsama", "Senga"],
    "North-Western": ["Chavuma", "Ikelenge", "Kabompo", "Kasempa", "Kalumbila", "Manyinga", "Mufumbwe", "Mushindano", "Mwinilunga", "Solwezi", "Zambezi"],
    "Southern": ["Chikankata", "Chirundu", "Choma", "Gwembe", "Kalomo", "Kazungula", "Livingstone", "Mazabuka", "Monze", "Namwala", "Pemba", "Siavonga", "Sinazongwe", "Zimba"],
    "Western": ["Kalabo", "Kaoma", "Limulunga", "Luampa", "Lukulu", "Mitete", "Mongu", "Mulobezi", "Mwandi", "Nalolo", "Nkeyema", "Senanga", "Sesheke", "Shangombo", "Sikongo"]
  };
  const [savedPatient, setSavedPatient] = useState<InsertPatient | null>(null);
  const [nupin, setNupin] = useState<string>("");
  const [isEstimatedDob, setIsEstimatedDob] = useState(false);
  const [hasCellphone, setHasCellphone] = useState(true);
  const [showGuardian, setShowGuardian] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  // Section completion states
  const [isPersonalSectionComplete, setIsPersonalSectionComplete] = useState(false);
  const [isParentsSectionComplete, setIsParentsSectionComplete] = useState(false);
  const [isMaritalSectionComplete, setIsMaritalSectionComplete] = useState(true); // Set to true by default to allow form submission
  const [isBiometricSectionComplete, setIsBiometricSectionComplete] = useState(true); // Set to true by default to allow form submission

  // Get facility information - this would be connected to your API in production
  const { data: facilityData } = useQuery({
    queryKey: ["facility", user?.facility, user?.facilityCode],
    queryFn: async () => {
      // In production, fetch facility details from API
      if (user?.facilityCode) {
        // Use the facility code from the logged-in user
        return {
          code: user.facilityCode, // This should be in the format "5004-0014P"
          name: user?.facility || "Unknown Facility"
        };
      }

      // Fallback to a default if no facility code is available
      return {
        code: "5004-0014P",
        name: user?.facility || "Unknown Facility"
      };
    },
    enabled: !!user?.facility
  });

  // Generate NUPIN when facility data is available
  useEffect(() => {
    if (facilityData?.code) {
      // In a production environment, you'd query the database for the 
      // last sequential number used for this facility and increment it

      // For now, simulate the sequential number with a starting point
      const sequentialNumber = 1; // In production this would be fetched from DB

      const generatedNupin = generateNUPIN(facilityData.code, sequentialNumber);
      setNupin(generatedNupin);
    }
  }, [facilityData]);

  // We will move this useEffect after form is defined

  // No need for custom search event listener as the Command component has built-in filtering

  // Define a simplified version of InsertPatient with string for dateOfBirth
  // This matches our form structure better and prevents type errors
  type PatientFormValues = Omit<InsertPatient, 'dateOfBirth'> & {
    dateOfBirth: string;
    otherHomeLanguage?: string;

    // Mother details
    mothersSurname?: string;
    mothersNrc?: string;
    mothersNapsaPspf?: string;
    mothersNationality?: string;

    // Father details
    fathersSurname?: string;
    fatherDeceased?: boolean;
    fathersNrc?: string;
    fathersNapsaPspf?: string;
    fathersNationality?: string;

    // Guardian details
    guardianSurname?: string;
    guardianNrc?: string;
    guardianNapsaPspf?: string;
    guardianNationality?: string;

    // Marital Status & Spouse Details
    spouseFirstName?: string;
    spouseSurname?: string;

    // Birth and Religious Denomination
    homeLanguage?: string;
    isBornInZambia?: boolean;
    provinceOfBirth?: string;
    districtOfBirth?: string;
    religiousDenomination?: string;
  };

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      dateOfBirth: "",
      sex: "",
      nrc: "",
      underFiveCardNumber: "",
      country: "zambia", // Default to Zambia
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
      mothersSurname: "",
      mothersNrc: "",
      mothersNapsaPspf: "",
      mothersNationality: "Zambia",

      fathersName: "",
      fathersSurname: "",
      fatherDeceased: false,
      fathersNrc: "",
      fathersNapsaPspf: "",
      fathersNationality: "Zambia",

      guardianName: "",
      guardianSurname: "",
      guardianRelationship: "",
      guardianNrc: "",
      guardianNapsaPspf: "",
      guardianNationality: "Zambia",
      maritalStatus: "",

      // Spouse Details
      spouseFirstName: "",
      spouseSurname: "",

      // Birth and Religious Denomination
      homeLanguage: "",
      otherHomeLanguage: "",
      isBornInZambia: true,
      provinceOfBirth: "",
      districtOfBirth: "",
      birthPlace: "",
      religiousDenomination: "",

      // Education and Employment
      educationLevel: "",
      occupation: "",

      facility: user?.facility || "", // Ensure facility is set from user context
      nupin: "", // Will be set later
    }
  });

  // Load registration data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const savedData = localStorage.getItem('registrationData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Reset form with existing data
          form.reset(parsedData);
        } catch (error) {
          console.error('Error loading registration data:', error);
          toast({
            title: "Error Loading Data",
            description: "Could not load registration data. Starting fresh.",
            variant: "destructive"
          });
        }
      }
    }
  }, [isEditMode, form, toast]);

  // Watch the date of birth field to update conditional fields
  const dateOfBirth = form.watch("dateOfBirth");
  const nrcValue = form.watch("nrc");
  const noNrcValue = form.watch("noNrc");

  // Initialize and update selectedProvince when form provinceOfBirth value changes
  useEffect(() => {
    const province = form.watch("provinceOfBirth");
    if (province) {
      setSelectedProvince(province);
    }
  }, [form]);

  useEffect(() => {
    if (dateOfBirth) {
      const age = differenceInYears(new Date(), new Date(dateOfBirth));
      setShowNRC(age >= 16);
      setShowUnderFive(age < 5);

      // Clear fields that are no longer relevant based on age
      if (age < 16 && form.getValues("nrc")) {
        form.setValue("nrc", "");
        form.setValue("noNrc", false);
      }

      if (age >= 5 && form.getValues("underFiveCardNumber")) {
        form.setValue("underFiveCardNumber", "");
      }
    }
  }, [dateOfBirth, form]);

  // State to track NRC validation
  const [nrcValidating, setNrcValidating] = useState(false);
  const [nrcError, setNrcError] = useState<string | null>(null);

  // Phone validation states
  const [phoneValidating, setPhoneValidating] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Missing fields modal state
  const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<Array<{name: string, label: string, tab: string}>>([]);

  // Field mapping to tabs for the missing fields modal
  const fieldTabMapping: Record<string, {label: string, tab: string}> = {
    // Personal Information tab
    firstName: { label: 'First Name', tab: 'personal' },
    surname: { label: 'Surname', tab: 'personal' },
    dateOfBirth: { label: 'Date of Birth', tab: 'personal' },
    sex: { label: 'Sex', tab: 'personal' },
    country: { label: 'Country', tab: 'personal' },
    nrc: { label: 'NRC', tab: 'personal' },
    underFiveCardNumber: { label: 'Under Five Card Number', tab: 'personal' },
    cellphoneNumber: { label: 'Cellphone Number', tab: 'personal' },

    // Parent Information tab
    mothersName: { label: 'Mother\'s First Name', tab: 'parent' },
    mothersSurname: { label: 'Mother\'s Surname', tab: 'parent' },
    mothersNrc: { label: 'Mother\'s NRC', tab: 'parent' },
    fathersName: { label: 'Father\'s First Name', tab: 'parent' },
    fathersSurname: { label: 'Father\'s Surname', tab: 'parent' },
    fathersNrc: { label: 'Father\'s NRC', tab: 'parent' },

    // Guardian Information tab
    guardianName: { label: 'Guardian First Name', tab: 'guardian' },
    guardianSurname: { label: 'Guardian Surname', tab: 'guardian' },
    guardianRelationship: { label: 'Guardian Relationship', tab: 'guardian' },

    // Marital, Birth & Education Details tab
    maritalStatus: { label: 'Marital Status', tab: 'details' },
    homeLanguage: { label: 'Home Language', tab: 'details' },
    isBornInZambia: { label: 'Is Client Born in Zambia', tab: 'details' },
    provinceOfBirth: { label: 'Province of Birth', tab: 'details' },
    districtOfBirth: { label: 'District of Birth', tab: 'details' },
    religiousCategory: { label: 'Religious Category', tab: 'details' },
    religiousDenomination: { label: 'Religious Denomination', tab: 'details' },
    educationLevel: { label: 'Education Level', tab: 'details' },
    occupation: { label: 'Occupation', tab: 'details' }
  };

  // Check if personal section is complete whenever relevant fields change
  const personalFormValues = form.watch(["firstName", "surname", "dateOfBirth", "sex", "country", "nrc", "noNrc", "underFiveCardNumber", "cellphoneNumber"]);

  useEffect(() => {
    const isPersonalValid = () => {
      // Basic required fields
      const hasBasicInfo = !!form.getValues("firstName") && 
                           !!form.getValues("surname") && 
                           !!form.getValues("dateOfBirth") && 
                           !!form.getValues("sex") && 
                           !!form.getValues("country");

      // NRC validation (if age requires it)
      const hasValidNRC = !showNRC || form.getValues("noNrc") || !!form.getValues("nrc");

      // Under five card validation (if age requires it)
      const hasValidUnderFiveCard = !showUnderFive || !!form.getValues("underFiveCardNumber");

      // Phone validation
      const hasValidPhone = !hasCellphone || !!form.getValues("cellphoneNumber");

      return hasBasicInfo && hasValidNRC && hasValidUnderFiveCard && hasValidPhone && !nrcError && !phoneError;
    };

    setIsPersonalSectionComplete(isPersonalValid());
  }, [personalFormValues, showNRC, showUnderFive, hasCellphone, nrcError, phoneError, form]);

  // Validate parents section - Mother's details are mandatory
  // Also watch guardian fields for validation
  const parentFormValues = form.watch([
    "mothersName", 
    "mothersSurname", 
    "guardianName", 
    "guardianSurname", 
    "guardianRelationship"
  ]);

  // Function to validate guardian information
  const isGuardianValid = () => {
    // Guardian information is always optional, but if any field is filled, 
    // ensure the basic fields are completed
    const hasGuardianName = !!form.getValues("guardianName");
    const hasGuardianSurname = !!form.getValues("guardianSurname");
    const hasGuardianRelationship = !!form.getValues("guardianRelationship");

    // If any guardian info is provided, check if the basic fields are filled
    if (hasGuardianName || hasGuardianSurname || hasGuardianRelationship) {
      return hasGuardianName && hasGuardianSurname && hasGuardianRelationship;
    }

    // Otherwise, guardian info is optional
    return true;
  };

  useEffect(() => {
    const isParentsValid = () => {
      // Mother's mandatory fields
      const hasMotherInfo = !!form.getValues("mothersName");

      // Check if guardian information is valid
      const hasValidGuardian = isGuardianValid();

      return hasMotherInfo && hasValidGuardian;
    };

    if (currentTab === "parents") {
      if (isPersonalSectionComplete && isParentsValid()) {
        setIsParentsSectionComplete(true);
      } else {
        setIsParentsSectionComplete(false);
      }
    }
  }, [currentTab, isPersonalSectionComplete, parentFormValues, form, showGuardian]);

  // Marital section doesn't have mandatory fields, so we can mark it complete when visited
  useEffect(() => {
    if (currentTab === "marital" && isParentsSectionComplete) {
      setIsMaritalSectionComplete(true);
    }
  }, [currentTab, isParentsSectionComplete]);

  // Biometric section is complete when we've reached it
  useEffect(() => {
    if (currentTab === "biometric" && isMaritalSectionComplete) {
      setIsBiometricSectionComplete(true);
    }
  }, [currentTab, isMaritalSectionComplete]);

  // Handle NRC checkbox changes
  useEffect(() => {
    if (noNrcValue && nrcValue) {
      form.setValue("nrc", "");
    }
  }, [noNrcValue, nrcValue, form]);

  // Format NRC as the user types (to be deleted - duplicate function)


  // Calculate age in years, months, and days for display
  const calculateAge = (birthDate: Date): string => {
    const today = new Date();
    const years = differenceInYears(today, birthDate);

    // Calculate months after subtracting years
    const dateAfterYears = new Date(birthDate);
    dateAfterYears.setFullYear(dateAfterYears.getFullYear() + years);
    const months = differenceInMonths(today, dateAfterYears);

    // Calculate days after subtracting years and months
    const dateAfterMonths = new Date(dateAfterYears);
    dateAfterMonths.setMonth(dateAfterMonths.getMonth() + months);
    const days = differenceInDays(today, dateAfterMonths);

    return `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'} ${days} ${days === 1 ? 'day' : 'days'}`;
  };

  // Function to format NRC properly following Zambian NRC standards (XXXXXX/YY/Z format)
  const formatNRC = (value: string): string => {
    // Remove any non-alphanumeric characters except slashes
    let input = value.replace(/[^0-9A-Za-z\/]/gi, '').toUpperCase();

    // Remove all slashes and process the raw input
    const rawInput = input.replace(/\//g, '');

    // Build formatted NRC with proper placement of slashes
    let formatted = '';

    // First part: Sequential number (6 characters)
    if (rawInput.length > 0) {
      formatted = rawInput.substring(0, Math.min(6, rawInput.length));
    }

    // Second part: Province and district code (2 characters) - add with slash
    if (rawInput.length > 6) {
      formatted += '/' + rawInput.substring(6, Math.min(8, rawInput.length));
    }

    // Third part: Check digit (1 character) - add with slash
    if (rawInput.length > 8) {
      formatted += '/' + rawInput.substring(8, 9);
    }

    return formatted;
  };

  // Enhanced NRC validation with Zambian business rules
  const validateNRCFormat = (nrc: string): { isValid: boolean; message?: string } => {
    if (!nrc) return { isValid: true }; // Empty is valid if not required

    // Check basic format: XXXXXX/YY/Z
    const nrcRegex = /^[0-9]{6}\/[0-9]{2}\/[0-9]$/;
    if (!nrcRegex.test(nrc)) {
      return { 
        isValid: false, 
        message: "NRC format must be 123456/55/1 (6 digits, 2 digits, 1 digit)" 
      };
    }

    // Basic format validation passed - NRC is valid

    return { isValid: true };
  };

  // Helper function to handle null/undefined values in input fields
  const safeString = (value: string | null | undefined): string => {
    return value || "";
  };

  // Helper function for checkbox values
  const safeBool = (value: boolean | null | undefined): boolean => {
    return value === true;
  };

  // Function to wrap all field values to handle null/undefined safely
  const wrapFieldValue = (field: any) => {
    if (field.value === null || field.value === undefined) {
      return { ...field, value: "" };
    }
    return field;
  };

  // Function to allow only letters, spaces, and hyphens in name fields (no numbers)
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only letters, spaces, apostrophes, and hyphens
    const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
    e.target.value = value;
  };

  // Handle NRC input with formatting and validation
  const handleNRCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNRC(e.target.value);
    form.setValue("nrc", formatted);

    // Clear previous error
    setNrcError(null);

    // Validate NRC format using enhanced validation
    const formatValidation = validateNRCFormat(formatted);
    
    if (!formatValidation.isValid && formatted.length > 0) {
      setNrcError(formatValidation.message || "Invalid NRC format");
      form.setError("nrc", { 
        type: "manual", 
        message: formatValidation.message || "Invalid format"
      });
      return;
    }

    // If format is valid and complete, check for duplicates
    if (formatValidation.isValid && formatted.length === 10) {
      validateNRC(formatted);
    }
  };

  // Function to check if NRC already exists
  const validateNRC = async (nrc: string) => {
    if (!nrc) return;

    setNrcValidating(true);

    try {
      const response = await fetch(`/api/patients/check-nrc/${encodeURIComponent(nrc)}`);
      const data = await response.json();

      if (response.status === 409 || data.exists) {
        // NRC already exists
        setNrcError("This NRC is already registered. Please enter a different NRC or search for the existing patient.");
        form.setError("nrc", { 
          type: "manual", 
          message: "NRC already exists"
        });
      } else {
        // NRC is available
        form.clearErrors("nrc");
      }
    } catch (error) {
      console.error("Error validating NRC:", error);
      // Don't set an error here - we'll still allow form submission if the validation fails
    } finally {
      setNrcValidating(false);
    }
  };

  // Function to check if phone number already exists
  const validatePhone = async (phoneNumber: string, fieldName: "cellphoneNumber" | "otherCellphoneNumber") => {
    if (!phoneNumber || phoneNumber.length !== 9) return;

    setPhoneValidating(true);
    setPhoneError(null);

    try {
      const response = await fetch(`/api/patients/check-phone/${encodeURIComponent(phoneNumber)}`);
      
      // Check if we got an HTML response instead of JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Phone validation returned HTML instead of JSON - likely authentication issue");
        setPhoneValidating(false);
        return;
      }

      const data = await response.json();

      if (response.status === 409 || data.exists) {
        // Phone number already exists
        setPhoneError("This phone number is already registered with another patient.");
        form.setError(fieldName, { 
          type: "manual", 
          message: "Phone number already exists"
        });
      } else {
        // Phone number is available
        setPhoneError(null);
        form.clearErrors(fieldName);
      }
    } catch (error) {
      console.error("Error validating phone number:", error);
      // Clear any existing errors and allow form submission
      setPhoneError(null);
      form.clearErrors(fieldName);
    } finally {
      setPhoneValidating(false);
    }
  };

  // Handle cellphone number validation
  const validateCellphone = (value: string) => {
    // Remove any non-numeric characters
    const numericOnly = value.replace(/\D/g, '');

    // Ensure exactly 9 digits (without country code)
    if (numericOnly.length > 9) {
      return numericOnly.substring(0, 9);
    }
    return numericOnly;
  };

  const createPatientMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      // Add NUPIN to the data
      const patientData = {
        ...data,
        nupin: nupin,
        isEstimatedDob: isEstimatedDob
      };

      // Send the data to the API
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create patient');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setSavedPatient(data);

      // Show success toast notification
      toast({
        title: "Registration Successful",
        description: "Client profile has been registered successfully",
        variant: "success"
      });

      // Always open the success dialog with service selection option
      setShowSummary(true);

      // The user will be able to navigate to service selection from the dialog
      // We don't automatically redirect to let the user choose from the dialog options
      console.log("Patient registered successfully - showing success dialog with service selection options");
      
      // Force the summary dialog to open after a short delay
      setTimeout(() => {
        setShowSummary(true);
      }, 300);
    },
    onError: (error) => {
      console.error("Error registering patient:", error);
      toast({
        title: "Registration Failed",
        description: "An error occurred while registering the client",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (formData: PatientFormValues) => {
    // Transform camelCase form data to snake_case database format
    // Send form data directly in camelCase format (no conversion needed)
    const data = {
      ...formData,
      nupin: nupin || null,
      country: formData.country || "Zambia",
      facility: "Default Facility", // TODO: Get from user context
    };

    // Prevent submission if there's an NRC error
    if (nrcError) {
      toast({
        title: "NRC Already Exists",
        description: "This NRC is already registered in the system. Please use a different NRC or search for the existing patient.",
        variant: "destructive"
      });
      return;
    }

    // Prevent submission if there's a phone number error
    if (phoneError) {
      toast({
        title: "Phone Number Already Exists",
        description: "This phone number is already registered in the system. Please use a different phone number or search for the existing patient.",
        variant: "destructive"
      });
      return;
    }

    // Check for mandatory fields
    const mandatoryFields = [
      { name: 'firstName', label: 'First Name' },
      { name: 'surname', label: 'Surname' },
      { name: 'dateOfBirth', label: 'Date of Birth' },
      { name: 'sex', label: 'Sex' },
      { name: 'country', label: 'Country' }
    ];

    // Add guardian information to mandatory fields if patient is under 18
    if (showGuardian) {
      mandatoryFields.push(
        { name: 'guardianName', label: 'Guardian First Name' },
        { name: 'guardianSurname', label: 'Guardian Surname' },
        { name: 'guardianRelationship', label: 'Guardian Relationship' }
      );
    }

    // Add NRC to mandatory fields if age >= 16 and noNrc is false
    if (showNRC && !data.noNrc) {
      mandatoryFields.push({ name: 'nrc', label: 'NRC' });
    }

    // Add under five card number if age < 5
    if (showUnderFive) {
      mandatoryFields.push({ name: 'underFiveCardNumber', label: 'Under Five Card Number' });
    }

    // Add cellphone number if hasCellphone is true
    if (hasCellphone) {
      mandatoryFields.push({ name: 'cellphoneNumber', label: 'Cellphone Number' });
    }

    // Check all mandatory fields
    console.log('Form data being validated:', data);
    console.log('Mandatory fields to check:', mandatoryFields);
    
    const missingRequiredFields = mandatoryFields.filter(field => {
      const fieldValue = data[field.name as keyof InsertPatient];
      const isEmpty = !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');
      console.log(`Field ${field.name}: value="${fieldValue}", isEmpty=${isEmpty}`);
      return isEmpty;
    });

    if (missingRequiredFields.length > 0) {
      // Map the missing fields to include tab information
      const mappedMissingFields = missingRequiredFields.map(field => ({
        name: field.name,
        label: field.label,
        tab: fieldTabMapping[field.name]?.tab || 'personal'
      }));

      // Set the missing fields state for the modal
      setMissingFields(mappedMissingFields);
      setMissingFieldsModalOpen(true);
      return;
    }

    // Validate under five card number format if provided
    if (data.underFiveCardNumber && !data.underFiveCardNumber.match(/^\d{4}-\d{2}-\d{4}-\d{4,5}$/)) {
      toast({
        title: "Invalid Under Five Card Format",
        description: "Please enter the Under Five Card Number in the format PPDD-FF-YYYY-NNNN",
        variant: "destructive"
      });
      return;
    }

    // Validate email format if provided
    if (data.email && !data.email.includes('@')) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address with an @ symbol",
        variant: "destructive"
      });
      return;
    }

    // Validate Date of Birth
    if (new Date(data.dateOfBirth) > new Date()) {
       toast({
        title: "Invalid Date of Birth",
        description: "Date of Birth cannot be in the future",
        variant: "destructive"
      });
      return;
    }

    if (isEditMode) {
      // In edit mode, save changes and return to summary
      console.log("Saving edited registration data:", data);
      
      try {
        localStorage.setItem('registrationData', JSON.stringify(data));
        
        toast({
          title: "Changes Saved",
          description: "Your changes have been saved successfully.",
          variant: "default"
        });
        
        // Return to registration summary page
        setLocation("/registration-summary");
      } catch (error) {
        console.error("Error saving edited data:", error);
        toast({
          title: "Save Failed",
          description: "An error occurred while saving your changes. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Normal flow - save for review
      console.log("Saving registration data for summary review:", data);
      
      try {
        localStorage.setItem('registrationData', JSON.stringify(data));
        
        toast({
          title: "Registration Data Saved",
          description: "Please review your information on the summary page.",
          variant: "default"
        });
        
        // Navigate to registration summary page
        setLocation("/registration-summary");
      } catch (error) {
        console.error("Error saving registration data:", error);
        toast({
          title: "Save Failed",
          description: "An error occurred while saving registration data. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <MainLayout>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-center text-2xl font-semibold text-[#1E293B] mb-4">Client Profile Registration</h2>
        <p className="text-center text-sm text-gray-600 mb-8">Fields marked by <span className="text-red-500">*</span> are mandatory</p>

        <Tabs value={currentTab} onValueChange={(value) => {
          // Enforce sequential completion of sections
          if (value === "personal") {
            // Always allow going back to Personal Information
            setCurrentTab(value);
          } else if (value === "parents") {
            // Only allow if Personal Information is complete
            if (isPersonalSectionComplete) {
              setCurrentTab(value);
            } else {
              toast({
                title: "Cannot Proceed",
                description: "Please complete all mandatory fields in Personal Information section first",
                variant: "destructive"
              });
            }
          } else if (value === "marital") {
            // Only allow if Personal and Parents sections are complete
            if (isPersonalSectionComplete && isParentsSectionComplete) {
              setCurrentTab(value);
            } else if (!isPersonalSectionComplete) {
              toast({
                title: "Cannot Proceed",
                description: "Please complete all mandatory fields in Personal Information section first",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Cannot Proceed",
                description: "Please complete all mandatory fields in Parents/Guardian section first",
                variant: "destructive"
              });
            }
          } else if (value === "biometric") {
            // Only allow if all previous sections are complete
            if (isPersonalSectionComplete && isParentsSectionComplete && isMaritalSectionComplete) {
              setCurrentTab(value);
            } else {
              toast({
                title: "Cannot Proceed",
                description: "Please complete all previous sections first",
                variant: "destructive"
              });
            }
          }
        }} className="mb-8">
          <div className="relative w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isPersonalSectionComplete ? "bg-green-500 border-green-600 text-white" : "border-gray-300"}`}>
                  {isPersonalSectionComplete ? "✓" : "1"}
                </div>
                <span>Personal Information</span>
              </TabsTrigger>
              <TabsTrigger value="parents" className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isParentsSectionComplete ? "bg-green-500 border-green-600 text-white" : "border-gray-300"}`}>
                  {isParentsSectionComplete ? "✓" : "2"}
                </div>
                <span>Parents Or Guardian Details</span>
              </TabsTrigger>
              <TabsTrigger value="marital" className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isMaritalSectionComplete ? "bg-green-500 border-green-600 text-white" : "border-gray-300"}`}>
                  {isMaritalSectionComplete ? "✓" : "3"}
                </div>
                <span>Marital, Birth & Education</span>
              </TabsTrigger>
              <TabsTrigger value="biometric" className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isBiometricSectionComplete ? "bg-green-500 border-green-600 text-white" : "border-gray-300"}`}>
                  {isBiometricSectionComplete ? "✓" : "4"}
                </div>
                <span>Biometric</span>
              </TabsTrigger>
            </TabsList>

            {/* Progress connector lines */}
            <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-gray-200 -z-10"></div>
            <div 
              className="absolute top-[18px] left-0 h-[2px] bg-green-500 transition-all duration-500 -z-10"
              style={{ 
                width: `${
                  currentTab === "personal" ? 12.5 : 
                  currentTab === "parents" ? (isPersonalSectionComplete ? 37.5 : 12.5) : 
                  currentTab === "marital" ? (isParentsSectionComplete ? 62.5 : 37.5) : 
                  (isMaritalSectionComplete ? 87.5 : 62.5)
                }%` 
              }}
            ></div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="bg-white p-6 rounded-md shadow-sm border">
              <TabsContent value="personal" className="space-y-6">
                <div className="form-section">
                  <h3 className="section-header">Personal Information</h3>

                  <div className="section-content">
                    <div className="form-grid mb-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">First Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...wrapFieldValue(field)} 
                                placeholder="Enter First Name" 
                                className="form-input" 
                                onInput={handleNameInput} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="surname"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">Surname</FormLabel>
                            <FormControl>
                              <Input 
                                {...wrapFieldValue(field)} 
                                placeholder="Enter Surname" 
                                className="form-input"
                                onInput={handleNameInput} 
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
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                // We removed max and min constraints to allow any date selection
                                // Validation will show warnings instead of preventing selection
                                onChange={(e) => {
                                  // Always set the field value to what the user typed
                                  const inputDate = e.target.value;
                                  field.onChange(inputDate);

                                  // Only validate if a date is actually entered
                                      if (inputDate) {
                                        // Check date validity
                                        const selectedDate = new Date(inputDate);

                                        // Only show warnings if the date is valid and has a complete year
                                        if (!isNaN(selectedDate.getTime())) {
                                          const today = new Date();
                                          today.setHours(0, 0, 0, 0);

                                          // Calculate minimum date (110 years ago)
                                          const minDate = new Date();
                                          minDate.setFullYear(today.getFullYear() - 110);
                                          minDate.setHours(0, 0, 0, 0);

                                          // Check if patient is 18 years or younger
                                          const eighteenYearsAgo = new Date();
                                          eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
                                          // If birthdate is >= date 18 years ago, patient is 18 years or younger
                                          const isPatient18orYounger = selectedDate >= eighteenYearsAgo;
                                          setShowGuardian(isPatient18orYounger);

                                          // Show warnings ONLY if a complete 4-digit YEAR is entered and is outside valid range
                                          const selectedYear = selectedDate.getFullYear();
                                          const currentYear = today.getFullYear();
                                          const minYear = minDate.getFullYear();

                                          // Only show toast if:
                                          // 1. This is a different date than the last one we validated (prevents duplicate toasts)
                                          // 2. The year is fully entered (4 digits)
                                          // 3. The year is outside the valid range
                                          const yearStr = inputDate.split('-')[0];
                                          const isFullYearEntered = yearStr && yearStr.length === 4;

                                          if (isFullYearEntered && inputDate !== lastValidatedDob) {
                                            setLastValidatedDob(inputDate);

                                            if (selectedYear > currentYear) {
                                              toast({
                                                title: "Warning",
                                                description: "Future years are not allowed for date of birth.",
                                                variant: "destructive"
                                              });
                                            } else if (selectedYear < minYear) {
                                              toast({
                                                title: "Warning",
                                                description: "Birth year cannot be more than 110 years ago.",
                                                variant: "destructive"
                                              });
                                            }
                                          }
                                          // No toast for valid dates within range
                                        }
                                      }
                                }}
                                disabled={isEstimatedDob}
                                className={`form-input ${isEstimatedDob ? "bg-gray-100" : ""}`}
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
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">Sex</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-input">
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

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="dob-estimated" 
                      checked={isEstimatedDob}
                      onCheckedChange={(checked) => setIsEstimatedDob(!!checked)}
                    />
                    <label htmlFor="dob-estimated" className="text-sm font-normal text-gray-700">
                      Date of Birth is estimated
                    </label>
                    {isEstimatedDob && dateOfBirth && (
                      <div className="ml-4 text-sm text-blue-600 font-medium">
                        Age: {calculateAge(new Date(dateOfBirth))}
                      </div>
                    )}
                  </div>

                  {showNRC && (
                    <div className="mb-4">
                      <FormField
                              control={form.control}
                              name="nrc"
                              render={({ field }) => (
                                <FormItem className="md:max-w-[50%]">
                                  <FormLabel>NRC <span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        {...field} 
                                        placeholder="______/__/_" 
                                        style={{ letterSpacing: '0.1em' }}
                                        disabled={noNrcValue}
                                        onChange={handleNRCChange}
                                        className={`font-mono ${nrcError ? "border-red-500 pr-10" : ""}`}
                                        maxLength={10}
                                      />
                                      {nrcValidating && (
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                                        </div>
                                      )}
                                    </div>
                                  </FormControl>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Format: 123456/55/1
                                  </div>
                                  {nrcError && (
                                    <p className="text-sm font-medium text-red-500 mt-1">
                                      {nrcError}
                                    </p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                      <div className="flex items-center space-x-2 mt-2">
                        <FormField
                          control={form.control}
                          name="noNrc"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    // Clear NRC errors when "no NRC" is checked
                                    if (checked) {
                                      setNrcError(null);
                                      form.clearErrors("nrc");
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Client does not have NRC
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {showUnderFive && (
                    <FormField
                      control={form.control}
                      name="underFiveCardNumber"
                      render={({ field }) => (
                        <FormItem className="mb-4 md:max-w-[50%]">
                          <FormLabel>Under Five Card Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="PPDD-FF-YYYY-NNNN" 
                              className="font-mono"
                              maxLength={19} // Maximum length including hyphens
                              onChange={(e) => {
                                // Remove all hyphens first, then get only digits
                                let digits = e.target.value.replace(/-/g, '').replace(/\D/g, '');

                                // Limit to 15 digits total
                                if (digits.length > 15) {
                                  digits = digits.substring(0, 15);
                                }

                                // Build formatted string
                                let formatted = '';

                                // Format: PPDD-FF-YYYY-NNNN
                                if (digits.length > 0) {
                                  // First part: PPDD (Province-District)
                                  formatted = digits.substring(0, Math.min(4, digits.length));

                                  // Second part: FF (Facility)
                                  if (digits.length > 4) {
                                    formatted += '-' + digits.substring(4, Math.min(6, digits.length));

                                    // Third part: YYYY (Year)
                                    if (digits.length > 6) {
                                      formatted += '-' + digits.substring(6, Math.min(10, digits.length));

                                      // Fourth part: NNNN (Serial Number)
                                      if (digits.length > 10) {
                                        formatted += '-' + digits.substring(10);
                                      }
                                    }
                                  }
                                }

                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500 mt-1">
                            Format: PPDD-FF-YYYY-NNNN (Province-District-Facility-Year-SerialNumber)
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Origin <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="--Select--" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {/* Using a simpler approach without the Command component which is causing conflicts */}
                              <input 
                                type="text" 
                                placeholder="Search country..." 
                                className="h-9 mb-1 w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring" 
                                id="country-search"
                                onChange={(e) => {
                                  // Filter countries on input change
                                  const searchTerm = e.target.value.toLowerCase();
                                  const countryItems = document.querySelectorAll('.country-item');
                                  let found = false;

                                  countryItems.forEach(item => {
                                    const countryName = item.textContent?.toLowerCase() || '';
                                    if (countryName.includes(searchTerm)) {
                                      (item as HTMLElement).style.display = 'block';
                                      found = true;
                                    } else {
                                      (item as HTMLElement).style.display = 'none';
                                    }
                                  });

                                  // Show or hide the "no country found" message
                                  const noResultsElement = document.getElementById('no-country-found');
                                  if (noResultsElement) {
                                    noResultsElement.style.display = found ? 'none' : 'block';
                                  }
                                }}
                              />
                              <div id="no-country-found" style={{display: 'none', padding: '0.5rem'}}>
                                No country found.
                              </div>
                              <div className="max-h-[200px] overflow-auto">
                                {["zambia", "afghanistan", "albania", "algeria", "andorra", "angola", "antigua-and-barbuda", 
                                "argentina", "armenia", "australia", "austria", "azerbaijan", "bahamas", "bahrain", 
                                "bangladesh", "barbados", "belarus", "belgium", "belize", "benin", "bhutan", "bolivia", 
                                "bosnia-and-herzegovina", "botswana", "brazil", "brunei", "bulgaria", "burkina-faso", 
                                "burundi", "cabo-verde", "cambodia", "cameroon", "canada", "central-african-republic", 
                                "chad", "chile", "china", "colombia", "comoros", "congo", "costa-rica", "cote-divoire", 
                                "croatia", "cuba", "cyprus", "czech-republic", "denmark", "djibouti", "dominica", 
                                "dominican-republic", "drc", "ecuador", "egypt", "el-salvador", "equatorial-guinea", 
                                "eritrea", "estonia", "eswatini", "ethiopia", "fiji", "finland", "france", "gabon", 
                                "gambia", "georgia", "germany", "ghana", "greece", "grenada", "guatemala", "guinea", 
                                "guinea-bissau", "guyana", "haiti", "honduras", "hungary", "iceland", "india", 
                                "indonesia", "iran", "iraq", "ireland", "israel", "italy", "jamaica", "japan", 
                                "jordan", "kazakhstan", "kenya", "kiribati", "korea-north", "korea-south", "kosovo", 
                                "kuwait", "kyrgyzstan", "laos", "latvia", "lebanon", "lesotho", "liberia", "libya", 
                                "liechtenstein", "lithuania", "luxembourg", "madagascar", "malawi", "malaysia", 
                                "maldives", "mali", "malta", "marshall-islands", "mauritania", "mauritius", "mexico", 
                                "micronesia", "moldova", "monaco", "mongolia", "montenegro", "morocco", "mozambique", 
                                "myanmar", "namibia", "nauru", "nepal", "netherlands", "new-zealand", "nicaragua", 
                                "niger", "nigeria", "north-macedonia", "norway", "oman", "pakistan", "palau", 
                                "palestine", "panama", "papua-new-guinea", "paraguay", "peru", "philippines", 
                                "poland", "portugal", "qatar", "romania", "russia", "rwanda", "saint-kitts-and-nevis", 
                                "saint-lucia", "saint-vincent-and-the-grenadines", "samoa", "san-marino", 
                                "sao-tome-and-principe", "saudi-arabia", "senegal", "serbia", "seychelles", 
                                "sierra-leone", "singapore", "slovakia", "slovenia", "solomon-islands", "somalia", 
                                "south-africa", "south-sudan", "spain", "sri-lanka", "sudan", "suriname", "sweden", 
                                "switzerland", "syria", "taiwan", "tajikistan", "tanzania", "thailand", "timor-leste", 
                                "togo", "tonga", "trinidad-and-tobago", "tunisia", "turkey", "turkmenistan", "tuvalu", 
                                "uganda", "ukraine", "united-arab-emirates", "united-kingdom", "united-states", 
                                "uruguay", "uzbekistan", "vanuatu", "vatican-city", "venezuela", "vietnam", "yemen", 
                                "zimbabwe"]
                                .map(country => (
                                  <SelectItem key={country} value={country} className="country-item">
                                    {country.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>NUPIN</FormLabel>
                      <Input value={nupin} disabled placeholder="Auto-generated on save" className="bg-gray-100" />
                    </FormItem>
                  </div>
                </div>

                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium text-lg text-[#0072BC] mb-4">Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                      <FormLabel htmlFor="cellphoneNumber">Cellphone Number <span className="text-red-500">*</span></FormLabel>
                      <div className="flex">
                        <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          +260
                        </div>
                        <FormField
                          control={form.control}
                          name="cellphoneNumber"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative w-full">
                                  <Input 
                                    {...field}
                                    id="cellphoneNumber" 
                                    placeholder="Cellphone Number" 
                                    className={`rounded-l-none ${phoneError ? "border-red-500 pr-10" : ""}`}
                                    disabled={!hasCellphone}
                                    onChange={(e) => {
                                      const validated = validateCellphone(e.target.value);
                                      field.onChange(validated);

                                      // Clear previous error
                                      setPhoneError(null);

                                      // Validate when the phone number is 9 digits
                                      if (validated.length === 9) {
                                        validatePhone(validated, "cellphoneNumber");
                                      }
                                    }}
                                  />
                                  {phoneValidating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              {phoneError && (
                                <p className="text-sm font-medium text-red-500 mt-1">
                                  {phoneError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <FormLabel htmlFor="otherCellphoneNumber">Other Cellphone Number</FormLabel>
                      <div className="flex">
                        <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          +260
                        </div>
                        <FormField
                          control={form.control}
                          name="otherCellphoneNumber"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative w-full">
                                  <Input 
                                    {...field}
                                    id="otherCellphoneNumber" 
                                    placeholder="Other Cellphone Number" 
                                    className={`rounded-l-none ${phoneError ? "border-red-500 pr-10" : ""}`}
                                    disabled={!hasCellphone}
                                    onChange={(e) => {
                                      const validated = validateCellphone(e.target.value);
                                      field.onChange(validated);

                                      // Clear previous error
                                      setPhoneError(null);

                                      // Validate when the phone number is 9 digits
                                      if (validated.length === 9) {
                                        validatePhone(validated, "otherCellphoneNumber");
                                      }
                                    }}
                                  />
                                  {phoneValidating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              {phoneError && (
                                <p className="text-sm font-medium text-red-500 mt-1">
                                  {phoneError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="no-cellphone" 
                      checked={!hasCellphone}
                      onCheckedChange={(checked) => {
                        setHasCellphone(!checked);
                        if (checked) {
                          form.setValue("cellphoneNumber", "");
                          form.setValue("otherCellphoneNumber", "");
                        }
                      }}
                    />
                    <label htmlFor="no-cellphone" className="text-sm font-normal text-gray-700">
                      Client does not have cellphone number
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="landlineNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landline Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Landline Number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              placeholder="Enter Email" 
                              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value && !field.value.includes('@') && (
                            <p className="text-xs text-red-500 mt-1">Email must contain '@' symbol</p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="houseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>House Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter House Number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roadStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road/Street</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter Road/Street" />
                          </FormControl>
                          <FormMessage />

                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter Area" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cityTownVillage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City/Town/Village</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter City/Town/Village" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="landmarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmarks & Directions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter Landmarks & Directions" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="nav-buttons">
                  <Button type="button" variant="outline" onClick={() => setLocation("/patients")} className="prev-button">
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (!isPersonalSectionComplete) {
                        // Show toast warning when trying to proceed without completing required fields
                        toast({
                          title: "Incomplete Section",
                          description: "Please ensure all mandatory fields in Personal Information section are filled in",
                          variant: "destructive"
                        });
                      } else {
                        setCurrentTab("parents");
                      }
                    }}
                    className="next-button"
                  >
                    Next
                    {isPersonalSectionComplete && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>}
                  </Button>
                </div>
              </div>
              </TabsContent>

              <TabsContent value="parents" className="space-y-6">
                <div className="form-section">
                  <h3 className="section-header">Parents/Guardian Details</h3>

                  <div className="section-content">
                    <div className="sub-section-title">Mother:</div>

                    <div className="form-grid">
                      <FormField
                        control={form.control}
                        name="mothersName"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter First Name" className="form-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mothersSurname"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">Surname</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter Surname" className="form-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="mothersNrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NRC</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="123456/55/1" 
                            style={{ letterSpacing: '0.1em' }}
                            className="font-mono"
                            maxLength={10}
                            onChange={(e) => {
                              const formattedValue = formatNRC(e.target.value);
                              field.onChange(formattedValue);
                            }}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500 mt-1">
                          Format: 123456/55/1
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mothersNapsaPspf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NAPSA/PSPF Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter NAPSA/PSPF Number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="mothersNationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "Zambia"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Zambia">Zambia</SelectItem>
                            <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                            <SelectItem value="Malawi">Malawi</SelectItem>
                            <SelectItem value="Tanzania">Tanzania</SelectItem>
                            <SelectItem value="Mozambique">Mozambique</SelectItem>
                            <SelectItem value="South Africa">South Africa</SelectItem>
                            <SelectItem value="Congo">Congo</SelectItem>
                            <SelectItem value="Angola">Angola</SelectItem>
                            <SelectItem value="Namibia">Namibia</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherDeceased"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md mt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mother Deceased</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <h4 className="font-medium text-base">Father:</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fathersName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter First Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fathersSurname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Surname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="fathersNrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NRC</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="123456/55/1" 
                            style={{ letterSpacing: '0.1em' }}
                            className="font-mono"
                            maxLength={10}
                            onChange={(e) => {
                              const formattedValue = formatNRC(e.target.value);
                              field.onChange(formattedValue);
                            }}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500 mt-1">
                          Format: 123456/55/1
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fathersNapsaPspf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NAPSA/PSPF Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter NAPSA/PSPF Number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="fathersNationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Zambia">Zambia</SelectItem>
                            <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                            <SelectItem value="Malawi">Malawi</SelectItem>
                            <SelectItem value="Tanzania">Tanzania</SelectItem>
                            <SelectItem value="Mozambique">Mozambique</SelectItem>
                            <SelectItem value="South Africa">South Africa</SelectItem>
                            <SelectItem value="Congo">Congo</SelectItem>
                            <SelectItem value="Angola">Angola</SelectItem>
                            <SelectItem value="Namibia">Namibia</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fatherDeceased"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md mt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Father Deceased</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Guardian Information Section */}
                {form.getValues("dateOfBirth") && showGuardian && (
                  <div className="guardian-section mt-8 border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-2">
                      <h4 className="font-medium text-base">Guardian Information</h4>
                      <div className="text-gray-500 text-sm mb-2">
                        Optional for patients 18 years and younger
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name="guardianName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...wrapFieldValue(field)}
                                placeholder="Enter First Name" 
                                className={showGuardian ? "border-red-200" : ""}
                                onInput={handleNameInput}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianSurname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Surname</FormLabel>
                            <FormControl>
                              <Input 
                                {...wrapFieldValue(field)} 
                                placeholder="Enter Surname" 
                                className={showGuardian ? "border-red-200" : ""}
                                onInput={handleNameInput}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name="guardianRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={safeString(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger className={showGuardian ? "border-red-200" : ""}>
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="grandmother">Grandmother</SelectItem>
                                <SelectItem value="grandfather">Grandfather</SelectItem>
                                <SelectItem value="aunt">Aunt</SelectItem>
                                <SelectItem value="uncle">Uncle</SelectItem>
                                <SelectItem value="sibling">Brother/sister</SelectItem>
                                <SelectItem value="cousin">Cousin</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="guardianNrc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NRC Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...wrapFieldValue(field)} 
                                placeholder="123456/55/1" 
                                style={{ letterSpacing: '0.1em' }}
                                className="font-mono"
                                maxLength={10}
                                onChange={(e) => {
                                  const formattedValue = formatNRC(e.target.value);
                                  field.onChange(formattedValue);
                                }}
                              />
                            </FormControl>
                            <div className="text-xs text-gray-500 mt-1">
                              Format: 123456/55/1
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianNapsaPspf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NAPSA/PSPF Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter NAPSA/PSPF Number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="guardianNationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Zambia">Zambia</SelectItem>
                                <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                                <SelectItem value="Malawi">Malawi</SelectItem>
                                <SelectItem value="Tanzania">Tanzania</SelectItem>
                                <SelectItem value="Mozambique">Mozambique</SelectItem>
                                <SelectItem value="South Africa">South Africa</SelectItem>
                                <SelectItem value="Congo">Congo</SelectItem>
                                <SelectItem value="Angola">Angola</SelectItem>
                                <SelectItem value="Namibia">Namibia</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="nav-buttons">
                  <Button type="button" variant="outline" className="prev-button" onClick={() => setCurrentTab("personal")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (!isParentsSectionComplete) {
                        // Check if mother's fields are filled
                        const hasMotherInfo = !!form.getValues("mothersName") &&
                                              !!form.getValues("mothersSurname");
                        
                        // Check if guardian information is needed and filled
                        let guardianMessage = "";
                        if (showGuardian) {
                          const hasGuardianName = !!form.getValues("guardianName");
                          const hasGuardianSurname = !!form.getValues("guardianSurname");
                          const hasGuardianRelationship = !!form.getValues("guardianRelationship");
                          
                          if (!hasGuardianName || !hasGuardianSurname || !hasGuardianRelationship) {
                            guardianMessage = "Guardian information is required for patients under 18.";
                          }
                        }
                        
                        // Show appropriate toast message
                        let message = "Please ensure all mandatory fields in Parents/Guardian section are filled in";
                        if (!hasMotherInfo) {
                          message = "Mother's information is required.";
                        } else if (guardianMessage) {
                          message = guardianMessage;
                        }
                        
                        toast({
                          title: "Incomplete Section",
                          description: message,
                          variant: "destructive"
                        });
                      } else {
                        setCurrentTab("marital");
                      }
                    }}
                    className="next-button"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </Button>
                </div>
              </div>
              </div>
              </TabsContent>

              <TabsContent value="marital" className="space-y-6">
                {/* Marital, Birth & Education Details Section */}
                <div className="form-section">
                  <h3 className="section-header">Marital, Birth & Education Details</h3>

                  <div className="section-content">
                    <div className="form-grid">
                      {/* Marital Status Subsection - Only shown for adults */}
                      {isClientAdult() && (
                        <>
                          <FormField
                            control={form.control}
                            name="maritalStatus"
                            render={({ field }) => (
                              <FormItem className="form-item">
                                <FormLabel className="form-label required-field">Marital Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Married">Married</SelectItem>
                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Spouse Details - Only shown when married */}
                          {form.watch("maritalStatus") === "Married" && (
                            <>
                              <FormField
                                control={form.control}
                                name="spouseFirstName"
                                render={({ field }) => (
                                  <FormItem className="form-item">
                                    <FormLabel className="form-label required-field">Spouse First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="form-input" placeholder="Enter Spouse First Name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="spouseSurname"
                                render={({ field }) => (
                                  <FormItem className="form-item">
                                    <FormLabel className="form-label required-field">Spouse Surname</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="form-input" placeholder="Enter Spouse Surname" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Place of Birth & Religious Denomination */}
                  <div className="form-subsection">
                    <div className="form-grid">
                      <FormField
                        control={form.control}
                        name="isBornInZambia"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label required-field">Is Client Born In Zambia</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(value === "Yes")} 
                              value={field.value ? "Yes" : "No"}
                            >
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="homeLanguage"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label">Home Language</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // When "Other" is selected, reset the otherHomeLanguage field
                                if (value === "Other") {
                                  form.setValue("otherHomeLanguage", "");
                                } else {
                                  form.setValue("otherHomeLanguage", undefined);
                                }
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {form.watch("isBornInZambia") ? (
                                  // Zambian languages
                                  <>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Bemba">Bemba</SelectItem>
                                    <SelectItem value="Nyanja">Nyanja</SelectItem>
                                    <SelectItem value="Tonga">Tonga</SelectItem>
                                    <SelectItem value="Lozi">Lozi</SelectItem>
                                    <SelectItem value="Lunda">Lunda</SelectItem>
                                    <SelectItem value="Kaonde">Kaonde</SelectItem>
                                    <SelectItem value="Luvale">Luvale</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </>
                                ) : (
                                  // International languages
                                  <>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                    <SelectItem value="Chinese">Chinese</SelectItem>
                                    <SelectItem value="Swahili">Swahili</SelectItem>
                                    <SelectItem value="Chewa">Chewa</SelectItem>
                                    <SelectItem value="Shona">Shona</SelectItem>
                                    <SelectItem value="Lingala">Lingala</SelectItem>
                                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                                    <SelectItem value="Zulu">Zulu</SelectItem>
                                    <SelectItem value="Mandarin Chinese">Mandarin Chinese</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="Arabic">Arabic</SelectItem>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("homeLanguage") === "Other" && (
                        <FormField
                          control={form.control}
                          name="otherHomeLanguage"
                          render={({ field }) => (
                            <FormItem className="form-item">
                              <FormLabel className="form-label">Specify Other Home Language</FormLabel>
                              <Input 
                                {...field} 
                                className="form-input" 
                                placeholder="Please specify the home language" 
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {form.watch("isBornInZambia") && (
                        <>
                          <FormField
                            control={form.control}
                            name="provinceOfBirth"
                            render={({ field }) => (
                              <FormItem className="form-item">
                                <FormLabel className="form-label required-field">Province of Birth</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedProvince(value);
                                    // Reset district value when province changes
                                    form.setValue("districtOfBirth", "");
                                  }} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Central">Central</SelectItem>
                                    <SelectItem value="Copperbelt">Copperbelt</SelectItem>
                                    <SelectItem value="Eastern">Eastern</SelectItem>
                                    <SelectItem value="Luapula">Luapula</SelectItem>
                                    <SelectItem value="Lusaka">Lusaka</SelectItem>
                                    <SelectItem value="Muchinga">Muchinga</SelectItem>
                                    <SelectItem value="Northern">Northern</SelectItem>
                                    <SelectItem value="North-Western">North-Western</SelectItem>
                                    <SelectItem value="Southern">Southern</SelectItem>
                                    <SelectItem value="Western">Western</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="districtOfBirth"
                            render={({ field }) => (
                              <FormItem className="form-item">
                                <FormLabel className="form-label required-field">District of Birth</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                  disabled={!selectedProvince}
                                >
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue placeholder={selectedProvince ? "--Select District--" : "Select Province First"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedProvince ? (
                                      districtsByProvince[selectedProvince as keyof typeof districtsByProvince]?.map((district) => (
                                        <SelectItem key={district} value={district}>
                                          {district}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="" disabled>
                                        Select a province first
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                    </>
                  )}

                      <FormField
                        control={form.control}
                        name="birthPlace"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label">Birth Place</FormLabel>
                            <FormControl>
                              <Input {...field} className="form-input" placeholder="Enter Birth Place" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Primary Religious Category */}
                      <FormField
                        control={form.control}
                        name="religiousCategory"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label">Religious Denomination</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Reset denomination when category changes
                                form.setValue("religiousDenomination", "");
                                if (value !== "Christian") {
                                  form.setValue("religiousDenomination", value);
                                }
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Christian">Christian</SelectItem>
                                <SelectItem value="Muslim">Muslim</SelectItem>
                                <SelectItem value="Hindu">Hindu</SelectItem>
                                <SelectItem value="Buddhist">Buddhist</SelectItem>
                                <SelectItem value="Jewish">Jewish</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Christian Denominations - Only show if Christian is selected */}
                      {form.watch("religiousCategory") === "Christian" && (
                        <FormField
                          control={form.control}
                          name="religiousDenomination"
                          render={({ field }) => (
                            <FormItem className="form-item">
                              <FormLabel className="form-label">Christian Denomination</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="form-input">
                                    <SelectValue placeholder="--Select Denomination--" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="African Methodist Episcopal Church">African Methodist Episcopal Church</SelectItem>
                                  <SelectItem value="Anglican Church">Anglican Church</SelectItem>
                                  <SelectItem value="Brethren in Christ Church">Brethren in Christ Church</SelectItem>
                                  <SelectItem value="Catholic Church">Catholic Church</SelectItem>
                                  <SelectItem value="Church of God">Church of God</SelectItem>
                                  <SelectItem value="Dutch Reformed Church">Dutch Reformed Church</SelectItem>
                                  <SelectItem value="Evangelical">Evangelical</SelectItem>
                                  <SelectItem value="Jehovah's Witnesses">Jehovah's Witnesses</SelectItem>
                                  <SelectItem value="Latter-Day Saints (Mormons)">Latter-Day Saints (Mormons)</SelectItem>
                                  <SelectItem value="Lutheran Church">Lutheran Church</SelectItem>
                                  <SelectItem value="New Apostolic Church">New Apostolic Church</SelectItem>
                                  <SelectItem value="Orthodox Church">Orthodox Church</SelectItem>
                                  <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                                  <SelectItem value="Reformed Church in Zambia (RCZ)">Reformed Church in Zambia (RCZ)</SelectItem>
                                  <SelectItem value="Salvation Army">Salvation Army</SelectItem>
                                  <SelectItem value="Seventh-day Adventist Church (SDA)">Seventh-day Adventist Church (SDA)</SelectItem>
                                  <SelectItem value="United Church of Zambia (UCZ)">United Church of Zambia (UCZ)</SelectItem>
                                  <SelectItem value="Zion Christian Church (ZCC)">Zion Christian Church (ZCC)</SelectItem>
                                  <SelectItem value="Zambian Brethren">Zambian Brethren</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Text field for "Other" denomination */}
                      {((form.watch("religiousCategory") === "Other") || 
                       (form.watch("religiousCategory") === "Christian" && form.watch("religiousDenomination") === "Other")) && (
                        <FormField
                          control={form.control}
                          name="otherReligiousDenomination"
                          render={({ field }) => (
                            <FormItem className="form-item">
                              <FormLabel className="form-label">Specify Religious Denomination</FormLabel>
                              <Input 
                                {...field} 
                                className="form-input" 
                                placeholder="Please specify religious denomination" 
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div> {/* Close form-grid div */}
                  </div> {/* Close the parent section-content div */}

                  {/* Education and Occupation Subsection */}
                  <div className="form-subsection border-t border-gray-200 pt-4 mt-6">
                    <div className="form-grid">
                      <FormField
                        control={form.control}
                        name="educationLevel"
                        render={({ field }) => (
                          <FormItem className="form-item">
                            <FormLabel className="form-label">Education Level</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // When "Other" is selected, reset the otherEducationLevel field
                                if (value === "Other") {
                                  form.setValue("otherEducationLevel", "");
                                } else {
                                  form.setValue("otherEducationLevel", undefined);
                                }
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="No formal education">No formal education</SelectItem>
                                <SelectItem value="Primary education">Primary education</SelectItem>
                                <SelectItem value="Junior secondary education">Junior secondary education</SelectItem>
                                <SelectItem value="Senior secondary education">Senior secondary education</SelectItem>
                                <SelectItem value="Certificate">Certificate</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                                <SelectItem value="Bachelor's degree">Bachelor's degree</SelectItem>
                                <SelectItem value="Master's degree">Master's degree</SelectItem>
                                <SelectItem value="Doctorate/PhD">Doctorate/PhD</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("educationLevel") === "Other" && (
                        <FormField
                          control={form.control}
                          name="otherEducationLevel"
                          render={({ field }) => (
                            <FormItem className="form-item">
                              <FormLabel className="form-label">Specify Other Education Level</FormLabel>
                              <Input 
                                {...field} 
                                className="form-input" 
                                placeholder="Please specify the education level" 
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => {
                          // Get current education level to apply business rules
                          const currentEducationLevel = form.watch("educationLevel");

                          // Apply business rules for occupation based on education level
                          const validateOccupation = (value: string) => {
                            // Skip validation for "Other" option
                            if (value === "Other") {
                              return true;
                            }

                            const highEducationOccupations = [
                              "Doctor", "Engineer", "Lawyer", "Accountant", 
                              "Business Executive", "Professor/Lecturer", "Researcher"
                            ];

                            const midEducationOccupations = [
                              "Nurse", "Teacher", "Technician", "Manager", 
                              "IT Professional", "Government Official"
                            ];

                            // Check if the person has at least secondary education for mid-level occupations
                            if ((currentEducationLevel === "No formal education" || 
                                 currentEducationLevel === "Primary education") && 
                                midEducationOccupations.includes(value)) {
                              form.setError("occupation", { 
                                type: "manual", 
                                message: "This occupation requires at least secondary education" 
                              });
                              return false;
                            }

                            // Check if the person has at least degree level education for high-level occupations
                            if (highEducationOccupations.includes(value) && 
                                !["Bachelor's degree", "Master's degree", "Doctorate/PhD"].includes(currentEducationLevel)) {
                              form.setError("occupation", { 
                                type: "manual", 
                                message: "This occupation requires at least a bachelor's degree" 
                              });
                              return false;
                            }

                            // Clear errors if validation passes
                            form.clearErrors("occupation");
                            return true;
                          };

                          return (
                            <FormItem className="form-item">
                              <FormLabel className="form-label">Occupation</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  // Validate occupation against education level
                                  if (validateOccupation(value)) {
                                    field.onChange(value);
                                    // When "Other" is selected, reset the otherOccupation field
                                    if (value === "Other") {
                                      form.setValue("otherOccupation", "");
                                    } else {
                                      form.setValue("otherOccupation", undefined);
                                    }
                                  }
                                }} 
                                value={field.value}
                              >
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="--Select--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* General Occupations */}
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Unemployed">Unemployed</SelectItem>
                                <SelectItem value="Retired">Retired</SelectItem>
                                <SelectItem value="Homemaker">Homemaker</SelectItem>

                                {/* Vocational/Primary Education */}
                                <SelectItem value="Laborer">Laborer</SelectItem>
                                <SelectItem value="Farmer">Farmer</SelectItem>
                                <SelectItem value="Domestic Worker">Domestic Worker</SelectItem>
                                <SelectItem value="Driver">Driver</SelectItem>
                                <SelectItem value="Security Guard">Security Guard</SelectItem>
                                <SelectItem value="Artisan/Craftsperson">Artisan/Craftsperson</SelectItem>

                                {/* Secondary/Certificate/Diploma */}
                                <SelectItem value="Small Business Owner">Small Business Owner</SelectItem>
                                <SelectItem value="Salesperson">Salesperson</SelectItem>
                                <SelectItem value="Clerk">Clerk</SelectItem>
                                <SelectItem value="Technician">Technician</SelectItem>
                                <SelectItem value="Nurse">Nurse</SelectItem>
                                <SelectItem value="Teacher">Teacher</SelectItem>

                                {/* Higher Education */}
                                <SelectItem value="Doctor">Doctor</SelectItem>
                                <SelectItem value="Engineer">Engineer</SelectItem>
                                <SelectItem value="Lawyer">Lawyer</SelectItem>
                                <SelectItem value="Accountant">Accountant</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Business Executive">Business Executive</SelectItem>
                                <SelectItem value="Government Official">Government Official</SelectItem>
                                <SelectItem value="IT Professional">IT Professional</SelectItem>
                                <SelectItem value="Professor/Lecturer">Professor/Lecturer</SelectItem>
                                <SelectItem value="Researcher">Researcher</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                          );
                        }}
                      />

                  {form.watch("occupation") === "Other" && (
                    <FormField
                      control={form.control}
                      name="otherOccupation"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Specify Other Occupation</FormLabel>
                          <Input 
                            {...field} 
                            className="form-input" 
                            placeholder="Please specify the occupation" 
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                </div> {/* Close education-subsection div */}

                {/* Navigation buttons */}
                <div className="nav-buttons">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="prev-button" 
                    onClick={() => setCurrentTab("parents")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentTab("personal")}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#0072BC] hover:bg-[#005a99]">
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
              </TabsContent>

              <TabsContent value="biometric" className="space-y-6">
                <h3 className="font-medium text-lg text-[#0072BC] mb-4">Biometric Capturing</h3>
                <div className="border border-blue-200 rounded-md p-6 bg-blue-50/50">
                  <div className="text-center">
                    <p className="text-gray-700 mb-4">
                      Take a photo of the client for identification purposes
                    </p>
                    <div className="border-2 border-dashed border-gray-300 bg-white rounded-md p-8 mb-6 max-w-sm mx-auto">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-16 w-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="mt-4 text-sm text-gray-500">Click "Capture" to take photo</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        // Placeholder for camera capture functionality
                        toast({
                          title: "Photo Captured",
                          description: "Biometric data has been captured successfully",
                        });
                      }}
                    >
                      Capture
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" className="flex items-center gap-2" onClick={() => setCurrentTab("marital")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={(e) => {
                      // Always allow submission, but log to console for debugging
                      console.log("Submit button clicked", {
                        isMaritalSectionComplete,
                        formValues: form.getValues(),
                        formErrors: form.formState.errors,
                        formErrorsDetailed: JSON.stringify(form.formState.errors, null, 2)
                      });
                      
                      // Show warning if section isn't complete, but don't prevent submission
                      if (!isMaritalSectionComplete) {
                        toast({
                          title: "Warning",
                          description: "Some recommended fields in the Marital, Birth & Education section are not filled in",
                          variant: "warning"
                        });
                      }
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18 15 12 9 6"/></svg>
                    {isEditMode ? "Save Changes" : "Continue to Review"}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>

        <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogContent className="sm:max-w-md border-2 border-green-500">
            <DialogHeader className="bg-green-50 -mx-6 -mt-6 p-6 mb-4 rounded-t-lg border-b border-green-200">
              <DialogTitle className="text-center text-2xl font-bold text-green-700 mb-4">
                Registration Complete
              </DialogTitle>
              <div className="text-green-600 mx-auto text-5xl my-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">Client Details</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">
                      {savedPatient?.firstName} {savedPatient?.surname}
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-600">Sex:</span>{" "}
                    <span className="font-medium">{savedPatient?.sex}</span>
                  </li>
                  <li>
                    <span className="text-gray-600">Date of Birth:</span>{" "}
                    <span className="font-medium">{savedPatient?.dateOfBirth instanceof Date 
                      ? savedPatient.dateOfBirth.toLocaleDateString() 
                      : savedPatient?.dateOfBirth}</span>
                  </li>
                  {savedPatient?.nrc && (
                    <li>
                      <span className="text-gray-600">NRC:</span>{" "}
                      <span className="font-medium">{savedPatient?.nrc}</span>
                    </li>
                  )}
                  <li>
                    <span className="text-gray-600">NUPIN:</span>{" "}
                    <span className="font-medium">{nupin}</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">
                  What would you like to do next?
                </h3>
                <div className="flex flex-col space-y-4">
                  <Button 
                    onClick={() => {
                      if (savedPatient && savedPatient.id) {
                        console.log("Navigating to service selection with patient ID:", savedPatient.id);
                        setLocation(`/service-selection?patientId=${savedPatient.id}`);
                      } else {
                        console.log("Navigating to service selection without patient ID");
                        setLocation("/service-selection");
                      }
                    }} 
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-6 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    Proceed to Service Selection
                  </Button>
                  
                  <Button variant="outline" onClick={() => setLocation("/client-search")} className="border-gray-300">
                    Return to Client Search
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Missing Fields Modal */}
        <Dialog open={missingFieldsModalOpen} onOpenChange={setMissingFieldsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">Missing Required Fields</DialogTitle>
              <DialogDescription>
                Please complete the following mandatory fields to register the client:
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(
                missingFields.reduce((acc, field) => {
                  if (!acc[field.tab]) {
                    acc[field.tab] = [];
                  }
                  acc[field.tab].push(field);
                  return acc;
                }, {} as Record<string, typeof missingFields>)
              ).map(([tabId, fields]) => (
                <div key={tabId} className="mb-4">
                  <h3 className="font-medium text-lg text-gray-800 mb-2">
                    {tabId === 'personal' ? 'Personal Information' :
                     tabId === 'parent' ? 'Parent Information' :
                     tabId === 'guardian' ? 'Guardian Information' :
                     tabId === 'details' ? 'Marital, Birth & Education Details' : tabId}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {fields.map(field => (
                      <li key={field.name} className="text-gray-700">
                        {field.label}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="mt-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      setCurrentTab(tabId);
                      setMissingFieldsModalOpen(false);
                    }}
                  >
                    Go to this section
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => setMissingFieldsModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </MainLayout>
  );
}