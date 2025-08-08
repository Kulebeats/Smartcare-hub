import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, differenceInMonths } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ClinicalSummaryDialog } from "./clinical-summary-dialog";


const ANTIEPILEPTICS_OPTIONS = [
  "Carbamazepine",
  "Phenytoin",
  "Valproic acid",
  "Lamotrigine",
  "Levetiracetam"
] as const;

const ANTACIDS_OPTIONS = [
  "Aluminum hydroxide",
  "Magnesium hydroxide",
  "Calcium carbonate",
  "Famotidine",
  "Ranitidine"
] as const;

const PREVIOUS_ART_OPTIONS = [
  "TDF + XTC + EFV",
  "TDF + XTC + NVP",
  "TDF + XTC + LPV-r",
  "TDF + XTC + ATV-r",
  "TDF + XTC + DTG",
  "TAF + XTC + DTG",
  "ABC + 3TC + EFV",
  "ABC + 3TC + NVP",
  "ABC + 3TC + LPV-r",
  "ABC + 3TC + ATV-r",
  "AZT + 3TC + DTG",
  "ABC + 3TC + DTG"
] as const;

const REASON_FOR_CHANGE_OPTIONS = [
  "Programmatic Transition",
  "Restarting ART",
  "Toxicity/Intolerance",
  "Treatment Failure",
  "ART Naïve"
] as const;

const SMOKING_INTENSITY_OPTIONS = [
  "Less than 15 cigarettes a day",
  "More than 15 cigarettes a day",
  "Consumes non-tobacco products"
] as const;

const ALCOHOL_FREQUENCY_OPTIONS = [
  "Often",
  "Occasionally",
  "Rarely"
] as const;

type EntryOption = {
  value: string;
  description: string;
  hasSubOptions?: boolean;
  isSubOption?: boolean;
  parentValue?: string;
  requiresMedicalHistory?: boolean;
};

const ENTRY_OPTIONS: EntryOption[] = [
  {
    value: "Routine Follow Up Visit",
    description: "A link to initiate pharmacovigilance check if six months have passed since last active check"
  },
  {
    value: "Adverse Reaction Onset",
    description: "An observed adverse reaction",
    hasSubOptions: true
  },
  {
    value: "Adverse Reaction Onset - Initial Visit",
    parentValue: "Adverse Reaction Onset",
    isSubOption: true,
    description: "First documentation of an adverse drug reaction"
  },
  {
    value: "Adverse Reaction Onset - Follow Up Visit",
    parentValue: "Adverse Reaction Onset",
    isSubOption: true,
    description: "Follow up visit from an initial adverse drug reaction onset"
  },
  {
    value: "Change of ART Regimen",
    description: "If there is a change of ART, there should be active monitoring for minimum 3 post-change visits"
  },
  {
    value: "ART Naive",
    description: "Someone who's newly initiated should have three minimum visits monitored",
    requiresMedicalHistory: true
  }
];

const GI_SYMPTOMS = [
  "None",
  "Nausea",
  "Vomiting",
  "Diarrhoea",
  "Normal appetite",
  "Reduced appetite",
  "Increased appetite",
  "Polydipsia",
  "Other"
] as const;

const CNS_SYMPTOMS = [
  "None",
  "Insomnia",
  "Somnolence",
  "Headache",
  "Dizziness",
  "Other"
] as const;

const CVS_SYMPTOMS = [
  "None",
  "Palpitations",
  "Chest pain",
  "Other"
] as const;

const SKIN_MUSCULO_SYMPTOMS = [
  "None",
  "Rash",
  "Joint pain",
  "Muscle pain",
  "Other"
] as const;

const GENITAL_URINARY_SYMPTOMS = [
  "None",
  "Change in urine colour",
  "Painful urination",
  "Other"
] as const;

const SYSTEMIC_SYMPTOMS = [
  "None",
  "Weight gain",
  "Weight loss",
  "Other"
] as const;

const PREGNANCY_OUTCOME_OPTIONS = [
  "Still pregnant",
  "Miscarriage",
  "Still birth",
  "Prematurity (<37 weeks)",
  "Low birthweight (<2.5 kg)",
  "Viable birth via SVD",
  "Viable birth via C/S",
  "Other"
] as const;

const FETAL_OUTCOME_OPTIONS = [
  "Viable infant",
  "Still birth",
  "Birth defect (Describe below)",
  "Other (Describe below)"
] as const;

const MEDICATION_DETAILS = [
  {
    genericName: "Tenofovir/Lamivudine/Dolutegravir",
    brandName: "TLD",
    batchNo: "TLD20240115",
    manufacturer: "Mylan",
    indication: "HIV Treatment",
    doseRoute: "300/300/50mg Oral Once daily",
    dateStarted: "2024-01-20",
    expectedCompletion: "Ongoing"
  },
  // ... other medications
] as const;

const ACTION_TAKEN_OPTIONS = [
  "Treatment continued",
  "Drug switched",
  "3HP (Isoniazid + Rifapentine) initiated"
] as const;

const PATIENT_STATUS_OPTIONS = [
  "Not admitted",
  "Admitted/hospitalized",
  "Died"
] as const;

const ART_OUTCOMES = [
  "Death",
  "Interruption in Treatment (IIT)",
  "Defaulter",
  "WHO Clinical Stage 3 or 4, along with (OIs) and Tuberculosis",
  "Trans-out"
] as const;

const PHARMACOVIGILANCE_OUTCOMES = [
  "Client recovered",
  "Continuing to experience ADR",
  "Life threatening",
  "Hospital admission",
  "Hospital visitations other than scheduled visits",
  "Permanent disability",
  "Other"
] as const;

const CLINICAL_OUTCOMES = [...ART_OUTCOMES, ...PHARMACOVIGILANCE_OUTCOMES];


const pharmacovigilanceSchema = z.object({
  registration: z.object({
    dateOfReporting: z.string(),
    healthFacility: z.string(),
    district: z.string(),
    province: z.string()
  }),
  artNaiveMedicalHistory: z.string().optional(),
  patientDetails: z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    sex: z.string(),
    phoneNumber: z.string(),
    artNumber: z.string(),
    artTokenNumber: z.string(),
    houseNumber: z.string(),
    road: z.string(),
    area: z.string(),
    cityTownVillage: z.string()
  }),
  hivHistory: z.object({
    diagnosisDate: z.string(),
    initialArtDate: z.string()
  }),
  vitals: z.object({
    weight: z.number().min(0).max(300),
    height: z.number().min(0).max(300),
    bmi: z.number(),
    bloodPressure: z.string(),
    temperature: z.number().min(30).max(45)
  }),
  medicalTests: z.object({
    cd4Count: z.number(),
    cd4CountDate: z.string(),
    viralLoad: z.number(),
    viralLoadDate: z.string(),
    alt: z.number(),
    ast: z.number(),
    creatinine: z.number()
  }),
  coMorbidities: z.object({
    tuberculosis: z.boolean(),
    diabetesMellitus: z.boolean(),
    hypertension: z.boolean(),
    mentalIllness: z.boolean(),
    renalDisease: z.boolean(),
    liverDisease: z.boolean(),
    stroke: z.boolean(),
    cardiovascularDisease: z.boolean(),
    seizures: z.boolean(),
    allergies: z.boolean()
  }),
  riskFactors: z.object({
    smoking: z.boolean(),
    smokingIntensity: z.enum(SMOKING_INTENSITY_OPTIONS).optional(),
    alcohol: z.boolean(),
    alcoholFrequency: z.enum(ALCOHOL_FREQUENCY_OPTIONS).optional(),
    other: z.string().optional()
  }),
  reasonForPharmacovigilance: z.enum([
    "Routine Follow Up Visit",
    "Adverse Reaction Onset",
    "Adverse Reaction Onset - Initial Visit",
    "Adverse Reaction Onset - Follow Up Visit",
    "Change of ART Regimen",
    "ART Naive"
  ]),
  artChange: z.object({
    previousArt: z.enum(PREVIOUS_ART_OPTIONS).optional(),
    reasonForChange: z.enum(REASON_FOR_CHANGE_OPTIONS).optional()
  }).optional(),
  adverseDrugReactions: z.object({
    hasReactions: z.boolean(),
    reactionOnsetDate: z.string().optional()
      .refine(
        (value) => {
          if (!value) return true; // Allow empty values (optional)
          const currentDate = new Date();
          const inputDate = new Date(value);
          return !isNaN(inputDate.getTime()) && inputDate <= currentDate;
        },
        { message: "Must be a valid date, ≤ current date" }
      ),
    description: z.string().optional(),
    gastrointestinal: z.array(z.object({
      symptom: z.enum(GI_SYMPTOMS),
      grade: z.number().min(1).max(4).optional(),
      otherSpecify: z.string().optional()
    })),
    cnsNeuralPsychiatric: z.array(z.object({
      symptom: z.enum(CNS_SYMPTOMS),
      grade: z.number().min(1).max(4).optional(),
      otherSpecify: z.string().optional()
    })),
    cardiovascular: z.array(z.object({
      symptom: z.enum(CVS_SYMPTOMS),
      grade: z.number().min(1).max(4).optional(),
      otherSpecify: z.string().optional()
    })),
    skinMusculoskeletal: z.array(z.object({
      symptom: z.enum(SKIN_MUSCULO_SYMPTOMS),
      grade: z.number().min(1).max(4).optional(),
      otherSpecify: z.string().optional()
    })),
    genitalUrinary: z.array(z.object({
      symptom: z.enum(GENITAL_URINARY_SYMPTOMS),
      grade: z.number().min(1).max(4).optional(),
      otherSpecify: z.string().optional()
    })),
    systemic: z.array(z.object({
      symptom: z.enum(SYSTEMIC_SYMPTOMS),
      grade: z.number().min(1).max(4).optional(),
      otherSpecify: z.string().optional()
    }))
  }),
  artPregnancy: z.object({
    dateOfLastMenstrualPeriod: z.string().refine(
      (value) => {
        if (!value) return true; // Allow empty values (optional)
        const currentDate = new Date();
        const inputDate = new Date(value);
        return !isNaN(inputDate.getTime()) && inputDate <= currentDate;
      },
      { message: "Must be a valid date, ≤ current date" }
    ).optional(),
    currentlyPregnant: z.boolean().refine(
      (value) => true, // Initially allow any value
      {
        message: "Required if patient is female",
        // This will be checked conditionally during form submission
      }
    ).optional(),
    gestationAgeWeeks: z.number().min(0).max(42).refine(
      (value) => {
        if (value === undefined || value === null) return true;
        return value >= 0 && value <= 42;
      },
      { message: "Must be 0-42 if pregnant" }
    ).optional(),
    gestationAgeMonths: z.number().min(0).max(10).refine(
      (value) => {
        if (value === undefined || value === null) return true;
        return value >= 0 && value <= 10;
      },
      { message: "Must be 0-10 if pregnant" }
    ).optional(),
    isBreastfeeding: z.boolean().refine(
      (value) => true, // Initially allow any value
      {
        message: "Required if patient is not pregnant",
        // This will be checked conditionally during form submission
      }
    ).optional(),
    ageOfChildMonths: z.number().min(0).max(24).refine(
      (value) => {
        if (value === undefined || value === null) return true;
        return value >= 0 && value <= 24;
      },
      { message: "Must be 0-24 if breastfeeding" }
    ).optional(),
    pregnancyOutcome: z.enum(PREGNANCY_OUTCOME_OPTIONS).optional()
      .refine(
        (value) => true, // Initially allow any value
        {
          message: "Required if patient was previously pregnant",
          // This will be checked conditionally during form submission
        }
      ),
    fetalOutcome: z.enum(FETAL_OUTCOME_OPTIONS).optional()
      .refine(
        (value) => true, // Initially allow any value
        {
          message: "Required if pregnancy outcome is selected",
          // This will be checked conditionally during form submission
        }
      ),
    birthDefectDescription: z.string().optional()
      .refine(
        (value) => true, // Initially allow any value
        {
          message: 'Required if "Birth defect" is selected',
          // This will be checked conditionally during form submission
        }
      ),
    otherPregnancyOutcome: z.string().optional()
      .refine(
        (value) => true, // Initially allow any value
        {
          message: 'Required if "Other" is selected for outcome',
          // This will be checked conditionally during form submission
        }
      ),
    otherFetalOutcome: z.string().optional()
      .refine(
        (value) => true, // Initially allow any value
        {
          message: 'Required if "Other" is selected for fetal outcome',
          // This will be checked conditionally during form submission
        }
      ),
  }).optional(),
  followUp: z.object({
    actionTaken: z.enum(ACTION_TAKEN_OPTIONS),
    patientStatus: z.enum(PATIENT_STATUS_OPTIONS)
  }).optional(),
  outcomes: z.object({
    viralLoadStatus: z.enum(["Suppressed", "Unsuppressed"]),
    artOutcomes: z.array(z.enum(ART_OUTCOMES)),
    pharmacovigilanceOutcomes: z.array(z.enum(PHARMACOVIGILANCE_OUTCOMES)),
    otherOutcome: z.string().optional()
  }),
});

export type PharmacovigilanceForm = z.infer<typeof pharmacovigilanceSchema>;

const NonEditableField = ({
  label,
  value,
  source = "another module",
  unit = ""
}: {
  label: string;
  value: string | number;
  source?: string;
  unit?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-2">
          <label className="text-sm font-medium">{label}</label>
          <Input value={`${value}${unit ? ` ${unit}` : ''}`} disabled className="bg-gray-50" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>This field is non-editable as the information is derived from {source}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const ADRSection = ({
  title,
  symptoms,
  control,
  name
}: {
  title: string;
  symptoms: readonly string[];
  control: any;
  name: string;
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-[#0072BC]">{title}</h4>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="space-y-4">
              {field.value.map((symptom: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Select
                      value={symptom.symptom}
                      onValueChange={(value) => {
                        const newSymptoms = [...field.value];
                        newSymptoms[index] = {
                          ...symptom,
                          symptom: value,
                          grade: value === "None" ? undefined : symptom.grade
                        };
                        field.onChange(newSymptoms);
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select symptom" />
                      </SelectTrigger>
                      <SelectContent>
                        {symptoms.filter(s =>
                          s === "None" ||
                          s === "Other" ||
                          !field.value.some((existing: any) =>
                            existing.symptom === s &&
                            existing !== symptom
                          )
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {symptom.symptom !== "None" && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Grade:</span>
                        <RadioGroup
                          value={symptom.grade?.toString()}
                          onValueChange={(value) => {
                            const newSymptoms = [...field.value];
                            newSymptoms[index] = {
                              ...symptom,
                              grade: parseInt(value)
                            };
                            field.onChange(newSymptoms);
                          }}
                          className="flex gap-2"
                        >
                          {[1, 2, 3, 4].map((grade) => (
                            <div key={grade} className="flex items-center space-x-1">
                              <RadioGroupItem
                                value={grade.toString()}
                                id={`${name}-${index}-grade-${grade}`}
                                className={`h-3 w-3 ${
                                  grade >= 3 ? "text-amber-500" : ""
                                } ${grade === 4 ? "text-red-500" : ""}`}
                              />
                              <label
                                htmlFor={`${name}-${index}-grade-${grade}`}
                                className={`text-xs cursor-pointer ${
                                  grade >= 3 ? "text-amber-500 font-medium" : ""
                                } ${grade === 4 ? "text-red-500 font-bold" : ""}`}
                              >
                                {grade}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {symptom.symptom === "Other" && (
                      <div className="flex-1">
                        <Input
                          value={symptom.otherSpecify || ""}
                          onChange={(e) => {
                            const newSymptoms = [...field.value];
                            newSymptoms[index] = {
                              ...symptom,
                              otherSpecify: e.target.value
                            };
                            field.onChange(newSymptoms);
                          }}
                          placeholder="Please specify"
                          className="max-w-[300px]"
                        />
                      </div>
                    )}

                    {/* Remove button */}
                    {field.value.length > 1 && symptom.symptom !== "None" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => {
                          const newSymptoms = [...field.value];
                          newSymptoms.splice(index, 1);
                          field.onChange(newSymptoms);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add button */}
              {!field.value.some((s: any) => s.symptom === "None") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    field.onChange([
                      ...field.value,
                      { symptom: "None" }
                    ]);
                  }}
                >
                  Add {title} symptom
                </Button>
              )}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

// Check for severe adverse reactions to show warnings
function hasHighGradeAdverseReactions(adrData: any): boolean {
  return checkForGradeAdverseReactions(adrData, 4);
}

function hasMediumGradeAdverseReactions(adrData: any): boolean {
  return checkForGradeAdverseReactions(adrData, 3);
}

function checkForGradeAdverseReactions(adrData: any, grade: number): boolean {
  if (!adrData) return false;

  const categories = [
    "gastrointestinal",
    "cnsNeuralPsychiatric",
    "cardiovascular",
    "skinMusculoskeletal",
    "genitalUrinary",
    "systemic"
  ];

  for (const category of categories) {
    if (
      adrData[category] &&
      Array.isArray(adrData[category]) &&
      adrData[category].some((symptom: any) => 
        symptom.grade === grade && 
        symptom.symptom !== "None"
      )
    ) {
      return true;
    }
  }

  return false;
}

function isLifeThreateningSymptom(category: string, symptom: string): boolean {
  // List symptoms known to be potentially life-threatening when severe
  const lifeThreateningSymptoms: Record<string, string[]> = {
    cardiovascular: ["Chest pain", "Palpitations"],
    gastrointestinal: ["Vomiting"],
    cnsNeuralPsychiatric: ["Headache"],
    skinMusculoskeletal: ["Rash"], // Severe rash can indicate Stevens-Johnson syndrome
    genitalUrinary: ["Change in urine colour"] // Can indicate liver or kidney failure
  };

  return lifeThreateningSymptoms[category]?.includes(symptom) || false;
}

function getHighGradeSymptoms(adrData: any, grade: number): {category: string, symptom: string, grade: number, isLifeThreatening?: boolean}[] {
  if (!adrData || !adrData.hasReactions) return [];

  const result = [];
  const categories: Record<string, string> = {
    gastrointestinal: "Gastrointestinal",
    cnsNeuralPsychiatric: "CNS/Neural/Psychiatric",
    cardiovascular: "Cardiovascular",
    skinMusculoskeletal: "Skin/Musculoskeletal",
    genitalUrinary: "Genital/Urinary",
    systemic: "Systemic"
  };

  for (const [key, label] of Object.entries(categories)) {
    if (adrData[key]) {
      for (const item of adrData[key]) {
        if (item.grade === grade && item.symptom !== "None") {
          const isLt = isLifeThreateningSymptom(key, item.symptom);
          result.push({
            category: label,
            symptom: item.symptom === "Other" ? `Other: ${item.otherSpecify || ""}` : item.symptom,
            grade,
            isLifeThreatening: isLt
          });
        }
      }
    }
  }

  return result;
}

export function PharmacovigilanceDialog({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: PharmacovigilanceForm) => void;
  initialData?: Partial<PharmacovigilanceForm>;
}) {
  const [selectedTab, setSelectedTab] = useState("details");
  const [showPregnancyWarning, setShowPregnancyWarning] = useState(false);
  const [showTestingModalWarning, setShowTestingModalWarning] = useState(false);
  const [showGrade3Warning, setShowGrade3Warning] = useState(false);
  const [showGrade4Warning, setShowGrade4Warning] = useState(false);
  const [showClinicalSummary, setShowClinicalSummary] = useState(false);

  const { toast } = useToast();

  const form = useForm<PharmacovigilanceForm>({
    resolver: zodResolver(pharmacovigilanceSchema),
    defaultValues: initialData || {
      registration: {
        dateOfReporting: new Date().toISOString().slice(0, 10),
        healthFacility: "Chilenje Mini Hospital",
        district: "Chilenje",
        province: "Lusaka"
      },
      patientDetails: {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1985-05-15",
        sex: "Male",
        phoneNumber: "0977123456",
        artNumber: "CH-ART-12345",
        artTokenNumber: "T-78901",
        houseNumber: "Plot 123",
        road: "Chimwemwe Road",
        area: "Chilenje South",
        cityTownVillage: "Lusaka"
      },
      hivHistory: {
        diagnosisDate: "2022-04-10",
        initialArtDate: "2022-04-15"
      },
      vitals: {
        weight: 72,
        height: 175,
        bmi: 23.5,
        bloodPressure: "120/80",
        temperature: 36.5
      },
      medicalTests: {
        cd4Count: 450,
        cd4CountDate: "2023-11-10",
        viralLoad: 50,
        viralLoadDate: "2023-11-10",
        alt: 25,
        ast: 30,
        creatinine: 0.9
      },
      coMorbidities: {
        tuberculosis: false,
        diabetesMellitus: false,
        hypertension: false,
        mentalIllness: false,
        renalDisease: false,
        liverDisease: false,
        stroke: false,
        cardiovascularDisease: false,
        seizures: false,
        allergies: false
      },
      riskFactors: {
        smoking: false,
        alcohol: false
      },
      reasonForPharmacovigilance: "Routine Follow Up Visit",
      adverseDrugReactions: {
        hasReactions: false,
        gastrointestinal: [{ symptom: "None" }],
        cnsNeuralPsychiatric: [{ symptom: "None" }],
        cardiovascular: [{ symptom: "None" }],
        skinMusculoskeletal: [{ symptom: "None" }],
        genitalUrinary: [{ symptom: "None" }],
        systemic: [{ symptom: "None" }]
      },
      outcomes: {
        viralLoadStatus: "Suppressed",
        artOutcomes: [],
        pharmacovigilanceOutcomes: []
      }
    }
  });

  const { control, watch, setValue, handleSubmit, trigger } = form;
  const watchReasonForPharmacovigilance = watch("reasonForPharmacovigilance");
  const watchHasReactions = watch("adverseDrugReactions.hasReactions");
  const watchSmokingStatus = watch("riskFactors.smoking");
  const watchAlcoholStatus = watch("riskFactors.alcohol");
  const watchPatientSex = watch("patientDetails.sex");
  const watchIsCurrentlyPregnant = watch("artPregnancy.currentlyPregnant");
  const watchIsBreastfeeding = watch("artPregnancy.isBreastfeeding");
  const watchPregnancyOutcome = watch("artPregnancy.pregnancyOutcome");
  const watchFetalOutcome = watch("artPregnancy.fetalOutcome");
  const watchAdverseDrugReactions = watch("adverseDrugReactions");
  const watchOutcomes = watch("outcomes.pharmacovigilanceOutcomes");

  // Validate mutual exclusivity for client recovered and continuing to experience ADR
  useEffect(() => {
    if (watchOutcomes) {
      const hasRecovered = watchOutcomes.includes("Client recovered");
      const isContinuing = watchOutcomes.includes("Continuing to experience ADR");
      
      if (hasRecovered && isContinuing) {
        toast({
          title: "Validation Error",
          description: "'Client recovered' and 'Continuing to experience ADR' cannot both be selected",
          variant: "destructive"
        });
        
        // Keep the most recently added option
        const newOutcomes = [...watchOutcomes];
        const indexToRemove = newOutcomes.indexOf(
          newOutcomes.length >= 2 && newOutcomes[newOutcomes.length - 1] === "Client recovered" 
            ? "Continuing to experience ADR" 
            : "Client recovered"
        );
        
        if (indexToRemove !== -1) {
          newOutcomes.splice(indexToRemove, 1);
          setValue("outcomes.pharmacovigilanceOutcomes", newOutcomes);
        }
      }
    }
  }, [watchOutcomes, setValue, toast]);

  // Check for life-threatening status vs Grade 4 ADRs
  useEffect(() => {
    if (watchOutcomes && watchAdverseDrugReactions) {
      const hasLifeThreatening = watchOutcomes.includes("Life threatening");
      const hasGrade4 = hasHighGradeAdverseReactions(watchAdverseDrugReactions);
      
      if (hasLifeThreatening && !hasGrade4) {
        toast({
          title: "Warning",
          description: "'Life threatening' outcome requires at least one Grade 4 adverse reaction",
          variant: "destructive"
        });
      }
    }
  }, [watchOutcomes, watchAdverseDrugReactions, toast]);

  // Check for Grade 3 and 4 reactions
  useEffect(() => {
    if (watchAdverseDrugReactions) {
      const hasGrade3 = hasMediumGradeAdverseReactions(watchAdverseDrugReactions);
      const hasGrade4 = hasHighGradeAdverseReactions(watchAdverseDrugReactions);
      
      // Debug logging
      console.log('ADR Data:', watchAdverseDrugReactions);
      console.log('Has Grade 3:', hasGrade3);
      console.log('Has Grade 4:', hasGrade4);
      
      if (hasGrade4) {
        setShowGrade4Warning(true);
      } else if (hasGrade3) {
        setShowGrade3Warning(true);
      }
    }
  }, [watchAdverseDrugReactions]);

  // Update for ART Change based on reason
  useEffect(() => {
    if (watchReasonForPharmacovigilance === "Change of ART Regimen" && !form.getValues().artChange) {
      setValue("artChange", {
        previousArt: "TDF + XTC + EFV",
        reasonForChange: "Programmatic Transition"
      });
    }
    
    // Handle ART Naive selection
    if (watchReasonForPharmacovigilance === "ART Naive" && !form.getValues().artNaiveMedicalHistory) {
      setValue("artNaiveMedicalHistory", "");
    }
  }, [watchReasonForPharmacovigilance, setValue, form]);

  // Handle pregnancy section display - in real usage this would be based on patient sex
  useEffect(() => {
    if (watchPatientSex === "Female") {
      if (!form.getValues().artPregnancy) {
        setValue("artPregnancy", {
          currentlyPregnant: false,
          isBreastfeeding: false
        });
      }
    } else {
      // For testing purposes, uncomment this to hide for males
      // Not hiding for demo, so testers can see the pregnancy section
      // setValue("artPregnancy", undefined); 
      
      // For testing only - uncomment if you want to be warned when displaying this on males
      // if (form.getValues().artPregnancy) {
      //  setShowTestingModalWarning(true);
      // }
    }
  }, [watchPatientSex, setValue, form]);

  // Show warning if female is pregnant
  useEffect(() => {
    if (watchPatientSex === "Female" && watchIsCurrentlyPregnant === true) {
      setShowPregnancyWarning(true);
    }
  }, [watchPatientSex, watchIsCurrentlyPregnant]);

  // Set the number of weeks based on months
  useEffect(() => {
    if (watchIsCurrentlyPregnant && form.getValues().artPregnancy?.gestationAgeMonths) {
      const months = form.getValues().artPregnancy.gestationAgeMonths || 0;
      setValue("artPregnancy.gestationAgeWeeks", months * 4);
    }
  }, [watchIsCurrentlyPregnant, setValue, form]);
  
  // Format and validation helpers
  const formatMedicationDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  const formatDays = (lastDate: string) => {
    try {
      const date = new Date(lastDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    } catch (e) {
      return "";
    }
  };

  // Handle form submission
  const onSubmit = (data: PharmacovigilanceForm) => {
    console.log("Submitting data:", data);
    onSave(data);
    setShowClinicalSummary(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="pharma-form-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0072BC]">Pharmacovigilance</DialogTitle>
            <p id="pharma-form-description" className="text-sm text-muted-foreground">Complete the adverse drug reaction assessment form with patient medication details</p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid grid-cols-7 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals & History</TabsTrigger>
                  <TabsTrigger value="reason">Reason</TabsTrigger>
                  <TabsTrigger value="adr">ADRs</TabsTrigger>
                  <TabsTrigger value="art">ART & Pregnancy</TabsTrigger>
                  <TabsTrigger value="followup">Follow Up</TabsTrigger>
                  <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Registration Details */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Registration Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NonEditableField 
                          label="Date of Reporting" 
                          value={form.getValues().registration.dateOfReporting} 
                        />
                        <NonEditableField 
                          label="Health Facility" 
                          value={form.getValues().registration.healthFacility} 
                        />
                        <NonEditableField 
                          label="District" 
                          value={form.getValues().registration.district} 
                        />
                        <NonEditableField 
                          label="Province" 
                          value={form.getValues().registration.province} 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient Details */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Patient Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NonEditableField 
                          label="Patient Name" 
                          value={`${form.getValues().patientDetails.firstName} ${form.getValues().patientDetails.lastName}`} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="Date of Birth" 
                          value={form.getValues().patientDetails.dateOfBirth} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="Sex" 
                          value={form.getValues().patientDetails.sex} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="Phone Number" 
                          value={form.getValues().patientDetails.phoneNumber} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="ART Number" 
                          value={form.getValues().patientDetails.artNumber} 
                          source="ART enrollment"
                        />
                        <NonEditableField 
                          label="ART Token Number" 
                          value={form.getValues().patientDetails.artTokenNumber} 
                          source="ART enrollment"
                        />
                      </div>

                      {/* Patient Address */}
                      <h4 className="text-md font-semibold mt-6 mb-4 text-[#0072BC]">Patient Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NonEditableField 
                          label="House Number" 
                          value={form.getValues().patientDetails.houseNumber} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="Road/Street" 
                          value={form.getValues().patientDetails.road} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="Area" 
                          value={form.getValues().patientDetails.area} 
                          source="patient registration"
                        />
                        <NonEditableField 
                          label="City/Town/Village" 
                          value={form.getValues().patientDetails.cityTownVillage} 
                          source="patient registration"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* HIV History */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">HIV History</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NonEditableField 
                          label="HIV Diagnosis Date" 
                          value={form.getValues().hivHistory.diagnosisDate} 
                          source="ART enrollment"
                        />
                        <NonEditableField 
                          label="Initial ART Date" 
                          value={form.getValues().hivHistory.initialArtDate} 
                          source="ART enrollment"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vitals" className="space-y-4">
                  {/* Vitals Section */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Vitals</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NonEditableField 
                          label="Weight" 
                          value={form.getValues().vitals.weight}
                          unit="kg" 
                          source="vitals module"
                        />
                        <NonEditableField 
                          label="Height" 
                          value={form.getValues().vitals.height}
                          unit="cm"
                          source="vitals module"
                        />
                        <NonEditableField 
                          label="BMI" 
                          value={form.getValues().vitals.bmi}
                          source="vitals module"
                        />
                        <NonEditableField 
                          label="Blood Pressure" 
                          value={form.getValues().vitals.bloodPressure}
                          source="vitals module"
                        />
                        <NonEditableField 
                          label="Temperature" 
                          value={form.getValues().vitals.temperature}
                          unit="°C"
                          source="vitals module"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medical Tests */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Medical Tests</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NonEditableField 
                          label="CD4 Count" 
                          value={form.getValues().medicalTests.cd4Count}
                          unit="cells/mm³"
                          source="lab results"
                        />
                        <NonEditableField 
                          label="CD4 Count Date" 
                          value={form.getValues().medicalTests.cd4CountDate}
                          source="lab results"
                        />
                        <NonEditableField 
                          label="Viral Load" 
                          value={form.getValues().medicalTests.viralLoad}
                          unit="copies/ml"
                          source="lab results"
                        />
                        <NonEditableField 
                          label="Viral Load Date" 
                          value={form.getValues().medicalTests.viralLoadDate}
                          source="lab results"
                        />
                        <NonEditableField 
                          label="ALT" 
                          value={form.getValues().medicalTests.alt}
                          unit="U/L"
                          source="lab results"
                        />
                        <NonEditableField 
                          label="AST" 
                          value={form.getValues().medicalTests.ast}
                          unit="U/L"
                          source="lab results"
                        />
                        <NonEditableField 
                          label="Creatinine" 
                          value={form.getValues().medicalTests.creatinine}
                          unit="mg/dL"
                          source="lab results"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Co-morbidities */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Co-morbidities</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={control}
                          name="coMorbidities.tuberculosis"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                              <FormLabel>Tuberculosis</FormLabel>
                            </FormItem>
                          )}
                        />
                        {/* Other co-morbidities fields */}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Factors */}
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Risk Factors</h3>
                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="riskFactors.smoking"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                              <FormLabel>Smoking</FormLabel>
                            </FormItem>
                          )}
                        />
                        {/* Other risk factors */}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reason" className="space-y-4">
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Reason for Pharmacovigilance Assessment</h3>
                      <FormField
                        control={control}
                        name="reasonForPharmacovigilance"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {ENTRY_OPTIONS.filter(option => !option.isSubOption).map(option => (
                                <div key={option.value} className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <input
                                      type="radio"
                                      id={option.value}
                                      checked={field.value === option.value}
                                      onChange={() => field.onChange(option.value)}
                                      className="mt-1"
                                    />
                                    <div>
                                      <label htmlFor={option.value} className="font-medium cursor-pointer">
                                        {option.value}
                                      </label>
                                      <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Show sub-options if this option has them and is selected */}
                                  {option.hasSubOptions && field.value === option.value && (
                                    <div className="ml-6 pl-4 border-l border-gray-200 space-y-2">
                                      {ENTRY_OPTIONS.filter(subOption => 
                                        subOption.isSubOption && subOption.parentValue === option.value
                                      ).map(subOption => (
                                        <div key={subOption.value} className="flex items-start space-x-2">
                                          <input
                                            type="radio"
                                            id={subOption.value}
                                            checked={field.value === subOption.value}
                                            onChange={() => field.onChange(subOption.value)}
                                            className="mt-1"
                                          />
                                          <div>
                                            <label htmlFor={subOption.value} className="font-medium cursor-pointer">
                                              {subOption.value.replace(option.value + " - ", "")}
                                            </label>
                                            <p className="text-sm text-muted-foreground">{subOption.description}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* ART Change fields */}
                      {(watchReasonForPharmacovigilance === "Change of ART Regimen") && (
                        <div className="mt-6 space-y-4">
                          <h4 className="font-medium text-[#0072BC]">ART Change Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={control}
                              name="artChange.previousArt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Previous ART Regimen</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select previous regimen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PREVIOUS_ART_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name="artChange.reasonForChange"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Change</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {REASON_FOR_CHANGE_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Medical History for ART Naive */}
                      {watchReasonForPharmacovigilance === "ART Naive" && (
                        <div className="mt-6 space-y-4">
                          <FormField
                            control={control}
                            name="artNaiveMedicalHistory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Past Medical History</FormLabel>
                                <Textarea
                                  {...field}
                                  placeholder="Enter patient's past medical history"
                                  className="h-24"
                                />
                                <FormDescription>
                                  Please include any relevant medical history for this ART-naive patient
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="adr" className="space-y-4">
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Adverse Drug Reactions</h3>
                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="adverseDrugReactions.hasReactions"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Has the patient experienced any adverse drug reactions?</FormLabel>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === true}
                                    onChange={() => field.onChange(true)}
                                    className="h-4 w-4"
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === false}
                                    onChange={() => field.onChange(false)}
                                    className="h-4 w-4"
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {watchHasReactions && (
                          <>
                            <FormField
                              control={control}
                              name="adverseDrugReactions.reactionOnsetDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Adverse Drug Reaction Onset</FormLabel>
                                  <Input type="date" {...field} max={new Date().toISOString().split('T')[0]} />
                                  <FormDescription>
                                    When did the patient first notice the adverse reaction?
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={control}
                              name="adverseDrugReactions.description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description of Adverse Drug Reaction</FormLabel>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Describe the adverse reaction in detail"
                                    className="h-24"
                                  />
                                </FormItem>
                              )}
                            />
                            
                            <div className="space-y-8 mt-6">
                              <ADRSection
                                title="Gastrointestinal"
                                symptoms={GI_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.gastrointestinal"
                              />
                              
                              <ADRSection
                                title="CNS/Neural/Psychiatric"
                                symptoms={CNS_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.cnsNeuralPsychiatric"
                              />
                              
                              <ADRSection
                                title="Cardiovascular"
                                symptoms={CVS_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.cardiovascular"
                              />
                              
                              <ADRSection
                                title="Skin/Musculoskeletal"
                                symptoms={SKIN_MUSCULO_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.skinMusculoskeletal"
                              />
                              
                              <ADRSection
                                title="Genital/Urinary"
                                symptoms={GENITAL_URINARY_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.genitalUrinary"
                              />
                              
                              <ADRSection
                                title="Systemic"
                                symptoms={SYSTEMIC_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.systemic"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="art" className="space-y-4">
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">ART and Pregnancy</h3>

                      {/* ART Medication Details */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3 text-[#0072BC]">Current Medication</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indication</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected End</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {MEDICATION_DETAILS.map((med, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2">{med.genericName}</td>
                                  <td className="px-4 py-2">{med.brandName}</td>
                                  <td className="px-4 py-2">{med.indication}</td>
                                  <td className="px-4 py-2">{med.doseRoute}</td>
                                  <td className="px-4 py-2">{formatMedicationDate(med.dateStarted)}</td>
                                  <td className="px-4 py-2">{med.expectedCompletion}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pregnancy Information - only relevant for female patients */}
                      {(watchPatientSex === "Female" || form.getValues().artPregnancy) && (
                        <div className="space-y-4">
                          <h4 className="font-medium mb-3 text-[#0072BC]">Pregnancy Information</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={control}
                              name="artPregnancy.dateOfLastMenstrualPeriod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Last Menstrual Period</FormLabel>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    max={new Date().toISOString().split('T')[0]}
                                  />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={control}
                              name="artPregnancy.currentlyPregnant"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currently Pregnant?</FormLabel>
                                  <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={field.value === true}
                                        onChange={() => field.onChange(true)}
                                        className="h-4 w-4"
                                      />
                                      <span>Yes</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={field.value === false}
                                        onChange={() => field.onChange(false)}
                                        className="h-4 w-4"
                                      />
                                      <span>No</span>
                                    </label>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            {watchIsCurrentlyPregnant && (
                              <>
                                <FormField
                                  control={control}
                                  name="artPregnancy.gestationAgeMonths"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Gestation Age (Months)</FormLabel>
                                      <Input 
                                        type="number" 
                                        min="0"
                                        max="10"
                                        {...field} 
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value);
                                          field.onChange(isNaN(value) ? 0 : value);
                                        }}
                                      />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={control}
                                  name="artPregnancy.gestationAgeWeeks"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Gestation Age (Weeks)</FormLabel>
                                      <Input 
                                        type="number" 
                                        min="0"
                                        max="42"
                                        {...field} 
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value);
                                          field.onChange(isNaN(value) ? 0 : value);
                                        }}
                                        disabled={!!form.getValues().artPregnancy?.gestationAgeMonths}
                                      />
                                      <FormDescription>
                                        {form.getValues().artPregnancy?.gestationAgeMonths 
                                          ? "Auto-calculated from months" 
                                          : "Enter gestation age in weeks"}
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                              </>
                            )}
                            
                            {!watchIsCurrentlyPregnant && (
                              <>
                                <FormField
                                  control={control}
                                  name="artPregnancy.isBreastfeeding"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Currently Breastfeeding?</FormLabel>
                                      <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            checked={field.value === true}
                                            onChange={() => field.onChange(true)}
                                            className="h-4 w-4"
                                          />
                                          <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            checked={field.value === false}
                                            onChange={() => field.onChange(false)}
                                            className="h-4 w-4"
                                          />
                                          <span>No</span>
                                        </label>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                
                                {watchIsBreastfeeding && (
                                  <FormField
                                    control={control}
                                    name="artPregnancy.ageOfChildMonths"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Age of Child (Months)</FormLabel>
                                        <Input 
                                          type="number" 
                                          min="0"
                                          max="24"
                                          {...field} 
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            field.onChange(isNaN(value) ? 0 : value);
                                          }}
                                        />
                                      </FormItem>
                                    )}
                                  />
                                )}
                                
                                <FormField
                                  control={control}
                                  name="artPregnancy.pregnancyOutcome"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Last Pregnancy Outcome</FormLabel>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select outcome" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {PREGNANCY_OUTCOME_OPTIONS.map(option => (
                                            <SelectItem key={option} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                
                                {watchPregnancyOutcome && watchPregnancyOutcome !== "Still pregnant" && (
                                  <FormField
                                    control={control}
                                    name="artPregnancy.fetalOutcome"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Fetal Outcome</FormLabel>
                                        <Select
                                          value={field.value}
                                          onValueChange={field.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select fetal outcome" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {FETAL_OUTCOME_OPTIONS.map(option => (
                                              <SelectItem key={option} value={option}>
                                                {option}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                )}
                                
                                {watchFetalOutcome === "Birth defect (Describe below)" && (
                                  <FormField
                                    control={control}
                                    name="artPregnancy.birthDefectDescription"
                                    render={({ field }) => (
                                      <FormItem className="col-span-2">
                                        <FormLabel>Describe Birth Defect</FormLabel>
                                        <Textarea 
                                          {...field} 
                                          placeholder="Describe the birth defect in detail"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                )}
                                
                                {watchPregnancyOutcome === "Other" && (
                                  <FormField
                                    control={control}
                                    name="artPregnancy.otherPregnancyOutcome"
                                    render={({ field }) => (
                                      <FormItem className="col-span-2">
                                        <FormLabel>Specify Other Outcome</FormLabel>
                                        <Input 
                                          {...field} 
                                          placeholder="Specify other pregnancy outcome"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                )}
                                
                                {watchFetalOutcome === "Other (Describe below)" && (
                                  <FormField
                                    control={control}
                                    name="artPregnancy.otherFetalOutcome"
                                    render={({ field }) => (
                                      <FormItem className="col-span-2">
                                        <FormLabel>Specify Other Fetal Outcome</FormLabel>
                                        <Input 
                                          {...field} 
                                          placeholder="Specify other fetal outcome"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="followup" className="space-y-4">
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Follow Up</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={control}
                          name="followUp.actionTaken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Action Taken</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action taken" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ACTION_TAKEN_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={control}
                          name="followUp.patientStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient Status</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select patient status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PATIENT_STATUS_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="outcomes" className="space-y-4">
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Clinical Outcomes</h3>
                      <div className="space-y-6">
                        <FormField
                          control={control}
                          name="outcomes.viralLoadStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Viral Load Status</FormLabel>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === "Suppressed"}
                                    onChange={() => field.onChange("Suppressed")}
                                    className="h-4 w-4"
                                  />
                                  <span>Suppressed (&lt;1000 copies/ml)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === "Unsuppressed"}
                                    onChange={() => field.onChange("Unsuppressed")}
                                    className="h-4 w-4"
                                  />
                                  <span>Unsuppressed (≥1000 copies/ml)</span>
                                </label>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <h4 className="font-medium mb-3 text-[#0072BC]">ART Outcomes</h4>
                          <FormField
                            control={control}
                            name="outcomes.artOutcomes"
                            render={({ field }) => (
                              <FormItem>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {ART_OUTCOMES.map(outcome => (
                                    <div key={outcome} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`art-outcome-${outcome}`}
                                        checked={field.value.includes(outcome)}
                                        onChange={e => {
                                          if (e.target.checked) {
                                            field.onChange([...field.value, outcome]);
                                          } else {
                                            field.onChange(field.value.filter((o: string) => o !== outcome));
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <label htmlFor={`art-outcome-${outcome}`} className="cursor-pointer">
                                        {outcome}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3 text-[#0072BC]">Pharmacovigilance Outcomes</h4>
                          <FormField
                            control={control}
                            name="outcomes.pharmacovigilanceOutcomes"
                            render={({ field }) => (
                              <FormItem>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {PHARMACOVIGILANCE_OUTCOMES.map(outcome => (
                                    <div key={outcome} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`pv-outcome-${outcome}`}
                                        checked={field.value.includes(outcome)}
                                        onChange={e => {
                                          if (e.target.checked) {
                                            field.onChange([...field.value, outcome]);
                                          } else {
                                            field.onChange(field.value.filter((o: string) => o !== outcome));
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <label htmlFor={`pv-outcome-${outcome}`} className="cursor-pointer">
                                        {outcome}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {form.getValues().outcomes.pharmacovigilanceOutcomes?.includes("Other") && (
                          <FormField
                            control={control}
                            name="outcomes.otherOutcome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specify Other Outcome</FormLabel>
                                <Input 
                                  {...field} 
                                  placeholder="Specify other outcome"
                                />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-[#0072BC] hover:bg-blue-700">
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Testing Modal for non-eligible patients */}
      <AlertDialog open={showTestingModalWarning} onOpenChange={setShowTestingModalWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Testing Mode Notice</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                The pregnancy section is being displayed for testing purposes. In production use, this section is only intended for:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Female patients</li>
                <li>Of reproductive age (15-49 years)</li>
              </ul>
              <p>This notice will not appear in the production version.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>I understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grade 3 (Severe) Symptoms Warning - ANC Style */}
      <AlertDialog open={showGrade3Warning} onOpenChange={setShowGrade3Warning}>
        <AlertDialogContent className="max-w-md border-l-4 border-l-orange-500 bg-orange-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" /> 
              Clinical Alert: Grade 3 Adverse Reactions
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-800">
              <div className="space-y-3">
                <div className="bg-orange-100 p-3 rounded-md border border-orange-200">
                  <div className="font-semibold text-orange-800 mb-2">
                    Severe adverse reactions detected requiring clinical assessment
                  </div>
                  <div className="space-y-2">
                    {getHighGradeSymptoms(watchAdverseDrugReactions, 3).map((item, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium text-orange-700">{item.category}:</span> 
                        <span className="ml-1">{item.symptom}</span>
                        <span className="ml-2 inline-block px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-medium">
                          Grade {item.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md border border-orange-200">
                  <div className="font-medium text-orange-800 mb-2">Recommended Actions:</div>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Conduct comprehensive clinical assessment</li>
                    <li>• Document all symptoms and severity grades</li>
                    <li>• Consider dose modification or drug change</li>
                    <li>• Schedule follow-up within 48-72 hours</li>
                    <li>• Monitor for progression to Grade 4</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-orange-600 hover:bg-orange-700 text-white">
              Clinical Assessment Acknowledged
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grade 4 (Life-Threatening) Symptoms Warning - ANC Style */}
      <AlertDialog open={showGrade4Warning} onOpenChange={setShowGrade4Warning}>
        <AlertDialogContent className="max-w-md border-l-4 border-l-red-600 bg-red-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 flex items-center gap-2">
              <AlertOctagon className="h-6 w-6" /> 
              URGENT: Grade 4 Life-Threatening Reactions
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-800">
              <div className="space-y-3">
                <div className="bg-red-100 p-3 rounded-md border border-red-200">
                  <div className="font-semibold text-red-800 mb-2">
                    IMMEDIATE INTERVENTION REQUIRED
                  </div>
                  <div className="space-y-2">
                    {getHighGradeSymptoms(watchAdverseDrugReactions, 4).map((item, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium text-red-700">{item.category}:</span> 
                        <span className="ml-1">{item.symptom}</span>
                        <span className="ml-2 inline-block px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-bold">
                          Grade {item.grade}
                        </span>
                        {item.isLifeThreatening && (
                          <span className="ml-2 inline-block px-2 py-1 bg-red-600 text-white rounded text-xs font-bold">
                            LIFE-THREATENING
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md border border-red-200">
                  <div className="font-medium text-red-800 mb-2">Emergency Protocol:</div>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• <strong>STOP suspected medication immediately</strong></li>
                    <li>• Initiate supportive care measures</li>
                    <li>• Consider emergency referral/admission</li>
                    <li>• Notify pharmacovigilance team urgently</li>
                    <li>• Document detailed adverse event report</li>
                    <li>• Continuous monitoring required</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              EMERGENCY PROTOCOL ACKNOWLEDGED
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clinical Summary */}
      {showClinicalSummary && (
        <ClinicalSummaryDialog
          open={showClinicalSummary}
          onClose={() => {
            setShowClinicalSummary(false);
            onClose();
          }}
          data={form.getValues()}
        />
      )}
    </>
  );
}