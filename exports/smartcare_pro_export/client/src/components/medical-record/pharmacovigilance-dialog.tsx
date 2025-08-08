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
      <h4 className="font-medium">{title}</h4>
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
                          className="flex items-center gap-2"
                        >
                          {[1, 2, 3, 4].map((grade) => (
                            <div key={grade} className="flex items-center space-x-1">
                              <RadioGroupItem value={grade.toString()} />
                              <label>{grade}</label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {symptom.symptom === "Other" && (
                      <Input
                        placeholder="Specify other symptom"
                        value={symptom.otherSpecify || ""}
                        onChange={(e) => {
                          const newSymptoms = [...field.value];
                          newSymptoms[index] = {
                            ...symptom,
                            otherSpecify: e.target.value
                          };
                          field.onChange(newSymptoms);
                        }}
                        className="w-[200px]"
                      />
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  field.onChange([...field.value, { symptom: "None" }]);
                }}
              >
                Add Symptom
              </Button>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

// Helper functions to check for high-grade adverse reactions
function hasHighGradeAdverseReactions(adrData: any): boolean {
  return checkForGradeAdverseReactions(adrData, 4);
}

function hasMediumGradeAdverseReactions(adrData: any): boolean {
  return checkForGradeAdverseReactions(adrData, 3);
}

// Generic function to check for specific grade adverse reactions
function checkForGradeAdverseReactions(adrData: any, grade: number): boolean {
  // Check all ADR categories for specific grade reactions
  const categories = [
    'gastrointestinal',
    'cnsNeuralPsychiatric',
    'cardiovascular',
    'skinMusculoskeletal',
    'genitalUrinary',
    'systemic'
  ];
  
  // If patient has no reactions, return false
  if (!adrData.hasReactions) {
    return false;
  }
  
  // Check each category for symptoms of the specified grade
  for (const category of categories) {
    const hasGradeX = adrData[category]?.some((symptom: any) => 
      symptom.symptom !== "None" && symptom.grade === grade
    );
    if (hasGradeX) {
      return true;
    }
  }
  
  return false;
}

// Define which symptoms are truly life-threatening at Grade 4
// Based on clinical practice, not all Grade 4 symptoms have the same urgency
const LIFE_THREATENING_SYMPTOMS = {
  gastrointestinal: ["Vomiting", "Diarrhoea"], // Nausea alone is rarely life-threatening
  cnsNeuralPsychiatric: ["Insomnia", "Headache", "Dizziness"], // All CNS symptoms can be serious at Grade 4
  cardiovascular: ["Palpitations", "Chest pain"], // All cardiovascular are potentially life-threatening
  skinMusculoskeletal: ["Rash"], // Severe rash can indicate Stevens-Johnson syndrome
  genitalUrinary: ["Change in urine colour"], // May indicate kidney failure
  systemic: ["Weight loss"] // Severe weight loss can be life-threatening
};

// Function to check if a specific symptom at Grade 4 should be considered life-threatening
function isLifeThreateningSymptom(category: string, symptom: string): boolean {
  const lifeThreateningList = LIFE_THREATENING_SYMPTOMS[category as keyof typeof LIFE_THREATENING_SYMPTOMS];
  if (!lifeThreateningList) return false;
  return lifeThreateningList.includes(symptom);
}

// Function to get details of high-grade symptoms
function getHighGradeSymptoms(adrData: any, grade: number): {category: string, symptom: string, grade: number, isLifeThreatening?: boolean}[] {
  const categories = [
    { id: 'gastrointestinal', name: 'Gastrointestinal' },
    { id: 'cnsNeuralPsychiatric', name: 'CNS/Neural/Psychiatric' },
    { id: 'cardiovascular', name: 'Cardiovascular' },
    { id: 'skinMusculoskeletal', name: 'Skin/Musculoskeletal' },
    { id: 'genitalUrinary', name: 'Genital/Urinary' },
    { id: 'systemic', name: 'Systemic' }
  ];
  
  const highGradeSymptoms: {category: string, symptom: string, grade: number, isLifeThreatening?: boolean}[] = [];
  
  // If patient has no reactions, return empty array
  if (!adrData.hasReactions) {
    return highGradeSymptoms;
  }
  
  // Check each category for symptoms of the specified grade
  for (const category of categories) {
    const symptoms = adrData[category.id]?.filter((symptom: any) => 
      symptom.symptom !== "None" && symptom.grade === grade
    );
    
    if (symptoms && symptoms.length > 0) {
      symptoms.forEach((symptom: any) => {
        // For Grade 4 symptoms, also determine if they are truly life-threatening
        const isLifeThreatening = symptom.grade === 4 ? 
          isLifeThreateningSymptom(category.id, symptom.symptom) : false;
          
        highGradeSymptoms.push({
          category: category.name,
          symptom: symptom.symptom,
          grade: symptom.grade,
          isLifeThreatening
        });
      });
    }
  }
  
  return highGradeSymptoms;
}

export function PharmacovigilanceDialog({
  open,
  onClose,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: PharmacovigilanceForm) => void;
}) {
  const [showPregnancyWarning, setShowPregnancyWarning] = useState(false);
  const [showTestingModalWarning, setShowTestingModalWarning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [showGrade3Warning, setShowGrade3Warning] = useState(false);
  const [showGrade4Warning, setShowGrade4Warning] = useState(false);
  const [grade3Acknowledged, setGrade3Acknowledged] = useState(false);
  const [grade4Acknowledged, setGrade4Acknowledged] = useState(false);
  const [highGradeSymptoms, setHighGradeSymptoms] = useState<{category: string, symptom: string, grade: number, isLifeThreatening?: boolean}[]>([]); 
  const form = useForm<PharmacovigilanceForm>({
    resolver: zodResolver(pharmacovigilanceSchema),
    defaultValues: {
      registration: {
        dateOfReporting: format(new Date(), "yyyy-MM-dd"),
        healthFacility: "Chilenje Mini Hospital",
        district: "Lusaka",
        province: "Lusaka"
      },
      patientDetails: {
        firstName: "Neo",
        lastName: "Mubita",
        dateOfBirth: "30/03/1985",
        sex: "Male",
        phoneNumber: "+260 987654321",
        artNumber: "No-00498-05300-8",
        artTokenNumber: "987654463245332",
        houseNumber: "23110",
        road: "chamba valley",
        area: "chamba valley mearwood",
        cityTownVillage: "lusaka"
      },
      hivHistory: {
        diagnosisDate: "2024-01-15",
        initialArtDate: "2024-01-20"
      },
      vitals: {
        weight: 75.5,
        height: 170,
        bmi: 26.1,
        bloodPressure: "120/80",
        temperature: 36.8
      },
      medicalTests: {
        cd4Count: 450,
        cd4CountDate: "2025-03-20",
        viralLoad: 40,
        viralLoadDate: "2025-03-20",
        alt: 35,
        ast: 28,
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
        alcohol: false,
        other: ""
      },
      reasonForPharmacovigilance: "Routine Follow Up Visit",
      artNaiveMedicalHistory: "",
      adverseDrugReactions: {
        hasReactions: false,
        reactionOnsetDate: "",
        description: "",
        gastrointestinal: [{ symptom: "None" }],
        cnsNeuralPsychiatric: [{ symptom: "None" }],
        cardiovascular: [{ symptom: "None" }],
        skinMusculoskeletal: [{ symptom: "None" }],
        genitalUrinary: [{ symptom: "None" }],
        systemic: [{ symptom: "None" }]
      },
      artPregnancy: {
        dateOfLastMenstrualPeriod: "",
        currentlyPregnant: false,
        gestationAgeWeeks: 0,
        gestationAgeMonths: 0,
        isBreastfeeding: false,
        ageOfChildMonths: 0,
        pregnancyOutcome: undefined,
        fetalOutcome: undefined,
        birthDefectDescription: "",
        otherPregnancyOutcome: "",
        otherFetalOutcome: ""
      },
      followUp: {
        actionTaken: undefined,
        patientStatus: undefined
      },
      outcomes: {
        viralLoadStatus: "Suppressed",
        artOutcomes: [],
        pharmacovigilanceOutcomes: [],
        otherOutcome: ""
      }
    }
  });

  const { control, watch, setValue, getValues } = form;
  const { toast } = useToast();
  const watchReason = watch("reasonForPharmacovigilance");
  const watchHasReactions = watch("adverseDrugReactions.hasReactions");
  const watchFetalOutcome = watch("artPregnancy.fetalOutcome");
  const watchPregnancyOutcome = watch("artPregnancy.pregnancyOutcome");
  const watchLmp = watch("artPregnancy.dateOfLastMenstrualPeriod");
  const watchCurrentlyPregnant = watch("artPregnancy.currentlyPregnant");
  const watchReactionOnsetDate = watch("adverseDrugReactions.reactionOnsetDate");

  // Show toast when user attempts to use a future date
  useEffect(() => {
    if (watchReactionOnsetDate) {
      const currentDate = new Date();
      const inputDate = new Date(watchReactionOnsetDate);
      
      if (!isNaN(inputDate.getTime()) && inputDate > currentDate) {
        toast({
          title: "Invalid Date",
          description: "Future dates are not allowed in clinical records. Please select a current or past date.",
          variant: "destructive",
          duration: 4000,
          className: "modern-toast",
          action: (
            <div className="toast-progress-container">
              <div className="toast-progress-bar"></div>
            </div>
          )
        });
        // Clear the invalid date
        setValue("adverseDrugReactions.reactionOnsetDate", "");
      }
    }
  }, [watchReactionOnsetDate, setValue, toast]);

  // Calculate months since LMP
  useEffect(() => {
    if (watchLmp) {
      try {
        const lmpDate = new Date(watchLmp);
        const today = new Date();
        const monthsSinceLmp = differenceInMonths(today, lmpDate);

        // If more than 10 months since LMP, can't be currently pregnant
        if (monthsSinceLmp > 10) {
          setValue("artPregnancy.currentlyPregnant", false);
        }
      } catch (error) {
        console.error("Error calculating months since LMP:", error);
      }
    }
  }, [watchLmp, setValue])

  // Show pregnancy warning when user indicates that patient is pregnant
  useEffect(() => {
    if (watchCurrentlyPregnant === true) {
      setShowPregnancyWarning(true);
    }
  }, [watchCurrentlyPregnant]);

  // Function to check if patient is of childbearing age (15-49)
  const isPatientInChildbearingAge = () => {
    const patientDetails = form.getValues().patientDetails;

    // Split the dateOfBirth string into components and create a date
    const dobParts = patientDetails.dateOfBirth.split('/');
    if (dobParts.length !== 3) return false;

    const day = parseInt(dobParts[0], 10);
    const month = parseInt(dobParts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(dobParts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;

    const dob = new Date(year, month, day);
    const today = new Date();

    const age = today.getFullYear() - dob.getFullYear();
    const isBirthdayPassed = 
      today.getMonth() > dob.getMonth() || 
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    const finalAge = isBirthdayPassed ? age : age - 1;

    if (patientDetails.sex !== "Female") return false;
    return finalAge >= 15 && finalAge <= 49;
  };

  // Show pregnancy warning when ART tab is clicked if patient is female of childbearing age
  useEffect(() => {
    if (selectedTab === "art") {
      const patientSex = form.getValues().patientDetails.sex;

      if (patientSex === "Female") {
        if (isPatientInChildbearingAge()) {
          setShowPregnancyWarning(true);
        } else {
          setShowPregnancyWarning(false);
        }
      } else {
        // Show testing modal warning for male patients
        setShowTestingModalWarning(true);
      }
    }
  }, [selectedTab]);

  // Check for high-grade adverse reactions
  useEffect(() => {
    // Only check for reactions if there are actually any reactions recorded
    if (!form.getValues().adverseDrugReactions.hasReactions) {
      return;
    }
    
    // Check for Grade 4 (critical) reactions
    if (hasHighGradeAdverseReactions(form.getValues().adverseDrugReactions)) {
      const symptoms = getHighGradeSymptoms(form.getValues().adverseDrugReactions, 4);
      setHighGradeSymptoms(symptoms);
      
      // Only show Grade 4 warning if there are truly life-threatening symptoms
      // This uses clinical practice guidelines to determine which symptoms are truly urgent
      const hasLifeThreateningSymptoms = symptoms.some(s => s.isLifeThreatening);
      
      if (hasLifeThreateningSymptoms && !grade4Acknowledged) {
        setShowGrade4Warning(true);
      } else if (!grade3Acknowledged) {
        // If Grade 4 symptoms aren't life-threatening, show Grade 3 warning instead
        const symptoms = getHighGradeSymptoms(form.getValues().adverseDrugReactions, 3);
        setHighGradeSymptoms(symptoms);
        setShowGrade3Warning(true);
      }
    } 
    // Check for Grade 3 (severe) reactions if no Grade 4
    else if (hasMediumGradeAdverseReactions(form.getValues().adverseDrugReactions) && !grade3Acknowledged) {
      const symptoms = getHighGradeSymptoms(form.getValues().adverseDrugReactions, 3);
      setHighGradeSymptoms(symptoms);
      setShowGrade3Warning(true);
    }
  }, [
    // Watch all ADR symptom categories to update when any of them change
    watch("adverseDrugReactions.gastrointestinal"),
    watch("adverseDrugReactions.cnsNeuralPsychiatric"),
    watch("adverseDrugReactions.cardiovascular"),
    watch("adverseDrugReactions.skinMusculoskeletal"),
    watch("adverseDrugReactions.genitalUrinary"),
    watch("adverseDrugReactions.systemic"),
    watch("adverseDrugReactions.hasReactions"),
    grade3Acknowledged,
    grade4Acknowledged
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="pharma-form-description">
          <DialogHeader>
            <DialogTitle>Adverse Drug Reaction Form</DialogTitle>
            <p id="pharma-form-description" className="text-sm text-muted-foreground">Complete the adverse drug reaction assessment form with patient medication details</p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)}>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <div className="flex flex-col">
                  <div className="sticky top-0 bg-white z-10">
                    <div className="nav-bar">
                      <a href="#" 
                        className={selectedTab === "details" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("details"); }}>
                        Details
                      </a>
                      <a href="#" 
                        className={selectedTab === "vitals" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("vitals"); }}>
                        Vitals & History
                      </a>
                      <a href="#" 
                        className={selectedTab === "reason" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("reason"); }}>
                        Reason
                      </a>
                      <a href="#" 
                        className={selectedTab === "adr" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("adr"); }}>
                        ADRs
                      </a>
                      <a href="#" 
                        className={selectedTab === "art" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("art"); }}>
                        ART & Pregnancy
                      </a>
                      <a href="#" 
                        className={selectedTab === "followup" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("followup"); }}>
                        Follow Up
                      </a>
                      <a href="#" 
                        className={selectedTab === "outcomes" ? "active" : ""} 
                        onClick={(e) => { e.preventDefault(); setSelectedTab("outcomes"); }}>
                        Outcomes
                      </a>
                    </div>
                  </div>

                  <TabsContent value="details" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Registration Details */}
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Registration Details</h3>
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
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Patient Details</h3>
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
                        <h4 className="text-md font-semibold mt-6 mb-4">Patient Address</h4>
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
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">HIV History</h3>
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

                  <TabsContent value="vitals" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Vitals Section */}
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Vitals</h3>
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
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Medical Tests</h3>
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
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Co-morbidities</h3>
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
                          <FormField
                            control={control}
                            name="coMorbidities.diabetesMellitus"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Diabetes Mellitus</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.hypertension"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Hypertension</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.mentalIllness"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Mental Illness</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.renalDisease"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Renal Disease</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.liverDisease"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Liver Disease</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.stroke"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Stroke</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.cardiovascularDisease"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Cardiovascular Disease (CVD)</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.seizures"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Seizures</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="coMorbidities.allergies"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                <FormLabel>Allergies (including Asthma)</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Risk Factors */}
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Risk Factors</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <FormField
                              control={control}
                              name="riskFactors.smoking"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.checked);
                                      if (!e.target.checked) {
                                        setValue("riskFactors.smokingIntensity", undefined);
                                      }
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <FormLabel>Smoking</FormLabel>
                                </FormItem>
                              )}
                            />

                            {watch("riskFactors.smoking") && (
                              <FormField
                                control={control}
                                name="riskFactors.smokingIntensity"
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Select intensity" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {SMOKING_INTENSITY_OPTIONS.map((option) => (
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
                          </div>

                          <div className="flex items-center gap-4">
                            <FormField
                              control={control}
                              name="riskFactors.alcohol"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.checked);
                                      if (!e.target.checked) {
                                        setValue("riskFactors.alcoholFrequency", undefined);
                                      }
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <FormLabel>Alcohol</FormLabel>
                                </FormItem>
                              )}
                            />

                            {watch("riskFactors.alcohol") && (
                              <FormField
                                control={control}
                                name="riskFactors.alcoholFrequency"
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ALCOHOL_FREQUENCY_OPTIONS.map((option) => (
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
                          </div>

                          <div>
                            <FormField
                              control={control}
                              name="riskFactors.other"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Other Risk Factors</FormLabel>
                                  <Textarea
                                    placeholder="Specify other risk factors"
                                    {...field}
                                    className="mt-1"
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reason" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Reason for Pharmacovigilance Assessment</h3>
                        <div className="space-y-4">
                          <FormField
                            control={control}
                            name="reasonForPharmacovigilance"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-4">
                                  {ENTRY_OPTIONS.filter(option => !option.isSubOption).map((option) => (
                                    <div key={option.value}>
                                      <div
                                        className={`p-4 border rounded-md ${
                                          field.value === option.value
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200"
                                        }`}
                                        onClick={() => field.onChange(option.value)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            checked={field.value === option.value}
                                            onChange={() => field.onChange(option.value)}
                                            className="h-4 w-4"
                                          />
                                          <span className="font-medium">{option.value}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600 ml-6">
                                          {option.description}
                                        </p>
                                      </div>
                                      
                                      {/* Show sub-options only when parent is selected */}
                                      {option.hasSubOptions && field.value === option.value && (
                                        <div className="ml-8 mt-2 space-y-2">
                                          {ENTRY_OPTIONS.filter(subOption => 
                                            subOption.isSubOption && 
                                            subOption.parentValue === option.value
                                          ).map(subOption => (
                                            <div
                                              key={subOption.value}
                                              className={`p-3 border-l-2 border-blue-300 pl-4 ${
                                                field.value === subOption.value
                                                  ? "bg-blue-50"
                                                  : ""
                                              }`}
                                              onClick={() => field.onChange(subOption.value)}
                                            >
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  checked={field.value === subOption.value}
                                                  onChange={() => field.onChange(subOption.value)}
                                                  className="h-4 w-4"
                                                />
                                                <span className="font-medium">
                                                  {subOption.value.replace(`${option.value} - `, '')}
                                                </span>
                                              </div>
                                              <p className="mt-1 text-sm text-gray-600 ml-6">
                                                {subOption.description}
                                              </p>
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
                        </div>

                        {watchReason === "Change of ART Regimen" && (
                          <div className="mt-6 space-y-4">
                            <h4 className="font-medium">ART Change Details</h4>
                            <div className="grid grid-cols-1 gap-4">
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
                                        <SelectValue placeholder="Select reason for change" />
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
                        
                        {watchReason === "ART Naive" && (
                          <div className="mt-6 space-y-4">
                            <h4 className="font-medium">Patient Medical History</h4>
                            <FormField
                              control={control}
                              name="artNaiveMedicalHistory"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Known Past Medical History (Relevant Conditions)</FormLabel>
                                  <Textarea
                                    placeholder="Enter any known past medical history that is relevant to ART treatment"
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                  <FormDescription>
                                    Include any conditions, allergies, or previous medications that might affect ART treatment
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="adr" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Adverse Drug Reactions</h3>
                        <div className="space-y-6">
                          <FormField
                            control={control}
                            name="adverseDrugReactions.hasReactions"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-2">
                                  <FormLabel>Has the patient experienced any adverse drug reactions?</FormLabel>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id="adr-yes"
                                        checked={field.value === true}
                                        onChange={() => field.onChange(true)}
                                        className="h-4 w-4"
                                      />
                                      <label htmlFor="adr-yes">Yes</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id="adr-no"
                                        checked={field.value === false}
                                        onChange={() => field.onChange(false)}
                                        className="h-4 w-4"
                                      />
                                      <label htmlFor="adr-no">No</label>
                                    </div>
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />

                          {watchHasReactions && (
                            <FormField
                              control={control}
                              name="adverseDrugReactions.reactionOnsetDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Adverse Drug Reaction Onset</FormLabel>
                                  <Input
                                    type="date"
                                    {...field}
                                    className="mt-1"
                                  />
                                  <FormDescription>
                                    When did the adverse reaction begin?
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          )}

                          {watchHasReactions && (
                            <FormField
                              control={control}
                              name="adverseDrugReactions.description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description of Adverse Reaction</FormLabel>
                                  <Textarea
                                    placeholder="Describe the adverse reaction"
                                    {...field}
                                    className="mt-1"
                                  />
                                </FormItem>
                              )}
                            />
                          )}

                          {watchHasReactions && (
                            <div className="space-y-6">
                              <h4 className="font-medium border-b pb-2">System Review</h4>

                              <ADRSection
                                title="Gastrointestinal Symptoms"
                                symptoms={GI_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.gastrointestinal"
                              />

                              <ADRSection
                                title="CNS/Neural/Psychiatric Symptoms"
                                symptoms={CNS_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.cnsNeuralPsychiatric"
                              />

                              <ADRSection
                                title="Cardiovascular Symptoms"
                                symptoms={CVS_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.cardiovascular"
                              />

                              <ADRSection
                                title="Skin & Musculoskeletal Symptoms"
                                symptoms={SKIN_MUSCULO_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.skinMusculoskeletal"
                              />

                              <ADRSection
                                title="Genital & Urinary Symptoms"
                                symptoms={GENITAL_URINARY_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.genitalUrinary"
                              />

                              <ADRSection
                                title="Systemic Symptoms"
                                symptoms={SYSTEMIC_SYMPTOMS}
                                control={control}
                                name="adverseDrugReactions.systemic"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="art" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">ART and Pregnancy</h3>
                        <div className="space-y-6">
                          {/* Show for all patients, but with warning for non-eligible patients */}
                          {true && (
                            <div className="space-y-4 mt-6">
                              <h4 className="font-medium">Pregnancy Information</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={control}
                                  name="artPregnancy.dateOfLastMenstrualPeriod"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Date of Last Menstrual Period (if applicable):</FormLabel>
                                      <Input
                                        type="date"
                                        {...field}
                                        className="mt-1"
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        Must be a valid date, ≤ current date
                                      </span>
                                    </FormItem>
                                  )}
                                />

                                {/* Always show for testing */}
                                {true && (
                                  <FormField
                                    control={control}
                                    name="artPregnancy.currentlyPregnant"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Currently Pregnant</FormLabel>
                                        <div className="flex items-center gap-4 mt-2">
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              id="pregnant-yes"
                                              checked={field.value === true}
                                              onChange={() => field.onChange(true)}
                                              className="h-4 w-4"
                                            />
                                            <label htmlFor="pregnant-yes">Yes</label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              id="pregnant-no"
                                              checked={field.value === false}
                                              onChange={() => field.onChange(false)}
                                              className="h-4 w-4"
                                            />
                                            <label htmlFor="pregnant-no">No</label>
                                          </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          Required if patient is female
                                        </span>
                                      </FormItem>
                                    )}
                                  />
                                )}

                                {watchCurrentlyPregnant && (
                                  <>
                                    <FormField
                                      control={control}
                                      name="artPregnancy.gestationAgeWeeks"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Gestation Age (Weeks)</FormLabel>
                                          <div className="flex items-center">
                                            <Input
                                              type="number"
                                              min={0}
                                              max={42}
                                              {...field}
                                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                                              className="mt-1 w-20"
                                            />
                                            <span className="ml-2">weeks</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            Must be 0-42 if pregnant
                                          </span>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={control}
                                      name="artPregnancy.gestationAgeMonths"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Gestation Age (Months)</FormLabel>
                                          <div className="flex items-center">
                                            <Input
                                              type="number"
                                              min={0}
                                              max={10}
                                              {...field}
                                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                                              className="mt-1 w-20"
                                            />
                                            <span className="ml-2">months</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            Must be 0-10 if pregnant
                                          </span>
                                        </FormItem>
                                      )}
                                    />
                                  </>
                                )}

                                {!watchCurrentlyPregnant && (
                                  <>
                                    <FormField
                                      control={control}
                                      name="artPregnancy.isBreastfeeding"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Is the Patient Breastfeeding?</FormLabel>
                                          <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center space-x-2">
                                              <input
                                                type="radio"
                                                id="bf-yes"
                                                checked={field.value === true}
                                                onChange={() => field.onChange(true)}
                                                className="h-4 w-4"
                                              />
                                              <label htmlFor="bf-yes">Yes</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <input
                                                type="radio"
                                                id="bf-no"
                                                checked={field.value === false}
                                                onChange={() => field.onChange(false)}
                                                className="h-4 w-4"
                                              />
                                              <label htmlFor="bf-no">No</label>
                                            </div>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            Required if N2 = No (if patient is not pregnant)
                                          </span>
                                        </FormItem>
                                      )}
                                    />

                                    {watch("artPregnancy.isBreastfeeding") && (
                                      <FormField
                                        control={control}
                                        name="artPregnancy.ageOfChildMonths"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Age of Child (Months)</FormLabel>
                                            <div className="flex items-center">
                                              <Input
                                                type="number"
                                                min={0}
                                                max={24}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                className="mt-1 w-20"
                                              />
                                              <span className="ml-2">months</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                              Must be 0-24 if N5 = Yes (if breastfeeding)
                                            </span>
                                          </FormItem>
                                        )}
                                      />
                                    )}

                                    <FormField
                                      control={control}
                                      name="artPregnancy.pregnancyOutcome"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Pregnancy Outcome</FormLabel>
                                          <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select outcome" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {PREGNANCY_OUTCOME_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                  {option}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <span className="text-xs text-muted-foreground">
                                            Required if N2 = Yes or if previously pregnant
                                          </span>
                                        </FormItem>
                                      )}
                                    />

                                    {watchPregnancyOutcome === "Other" && (
                                      <FormField
                                        control={control}
                                        name="artPregnancy.otherPregnancyOutcome"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Specify Other Outcome</FormLabel>
                                            <Input
                                              {...field}
                                              className="mt-1"
                                            />
                                          </FormItem>
                                        )}
                                      />
                                    )}

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
                                                {FETAL_OUTCOME_OPTIONS.map((option) => (
                                                  <SelectItem key={option} value={option}>
                                                    {option}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <span className="text-xs text-muted-foreground">
                                              Required if N6 ≠ "Still pregnant" (if pregnancy outcome is not "Still pregnant")
                                            </span>
                                          </FormItem>
                                        )}
                                      />
                                    )}

                                    {(watchFetalOutcome === "Birth defect (Describe below)" || 
                                       watchFetalOutcome === "Other (Describe below)") && (
                                      <FormField
                                        control={control}
                                        name="artPregnancy.birthDefectDescription"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Describe Birth Defect/Other</FormLabel>
                                            <Textarea
                                              {...field}
                                              className="mt-1"
                                              placeholder="Provide detailed description"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                              Required if N7 = "Birth defect (Describe below)" or "Other (Describe below)"
                                            </span>
                                          </FormItem>
                                        )}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <AlertDialog open={showPregnancyWarning} onOpenChange={setShowPregnancyWarning}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Pregnancy Risk Warning</AlertDialogTitle>
                          <AlertDialogDescription>
                            Some ART medications may pose risks during pregnancy. Please ensure proper counseling and monitoring for pregnant patients on ART.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end">
                          <Button onClick={() => setShowPregnancyWarning(false)}>I Understand</Button>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TabsContent>

                  <TabsContent value="followup" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Follow Up</h3>
                        <div className="space-y-6">
                          <h4 className="font-medium">Current Medications</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border border-gray-300 px-4 py-2 text-left">Generic Name</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Brand Name</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Batch No.</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Manufacturer</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Indication</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Dose/Route</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Date Started</th>
                                  <th className="border border-gray-300 px-4 py-2 text-left">Expected Completion</th>
                                </tr>
                              </thead>
                              <tbody>
                                {MEDICATION_DETAILS.map((med, index) => (
                                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border border-gray-300 px-4 py-2">{med.genericName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.brandName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.batchNo}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.manufacturer}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.indication}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.doseRoute}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.dateStarted}</td>
                                    <td className="border border-gray-300 px-4 py-2">{med.expectedCompletion}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

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
                                    disabled={watchReason !== "Adverse Reaction Onset - Follow Up Visit"}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ACTION_TAKEN_OPTIONS.map((option) => (
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
                                    disabled={watchReason !== "Adverse Reaction Onset - Follow Up Visit"}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PATIENT_STATUS_OPTIONS.map((option) => (
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

                          {/* Follow up section is now always available per simplified business rules */}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="outcomes" className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pt-2">Outcomes</h3>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <NonEditableField 
                              label="Viral Load Status" 
                              value={form.getValues().outcomes.viralLoadStatus}
                              source="lab results"
                            />
                            <NonEditableField 
                              label="Last Viral Load Test" 
                              value={form.getValues().medicalTests.viralLoad}
                              unit="copies/ml"
                              source="lab results"
                            />
                            <NonEditableField 
                              label="Viral Load Test Date" 
                              value={form.getValues().medicalTests.viralLoadDate}
                              source="lab results"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <FormField
                                control={control}
                                name="outcomes.artOutcomes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ART Outcomes</FormLabel>
                                    <div className="space-y-2 mt-2">
                                      {ART_OUTCOMES.map((outcome) => {
                                        // Business rules for ART outcomes
                                        const isDisabled = 
                                          // Disable Death option if patient status is not "Died"
                                          (outcome === "Death" && 
                                            watch("followUp.patientStatus") !== "Died") ||
                                          // Disable WHO Clinical Stage outcomes if CD4 count is high (>500)
                                          (outcome === "WHO Clinical Stage 3 or 4, along with (OIs) and Tuberculosis" && 
                                            form.getValues().medicalTests.cd4Count > 500);
                                           
                                        return (
                                          <div key={outcome} className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`art-${outcome}`}
                                              checked={field.value.includes(outcome)}
                                              onChange={(e) => {
                                                if (isDisabled) return;
                                                const newOutcomes = e.target.checked
                                                  ? [...field.value, outcome]
                                                  : field.value.filter((o) => o !== outcome);
                                                field.onChange(newOutcomes);
                                              }}
                                              className="h-4 w-4"
                                              disabled={isDisabled}
                                            />
                                            <label 
                                              htmlFor={`art-${outcome}`}
                                              className={isDisabled ? "text-gray-400" : ""}
                                            >
                                              {outcome}
                                              {isDisabled && outcome === "Death" && 
                                                <span className="text-xs text-orange-500 block">
                                                  (Requires patient status to be "Died")
                                                </span>
                                              }
                                              {isDisabled && outcome === "WHO Clinical Stage 3 or 4, along with (OIs) and Tuberculosis" && 
                                                <span className="text-xs text-orange-500 block">
                                                  (Not applicable for CD4 count greater than 500)
                                                </span>
                                              }
                                            </label>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div>
                              <FormField
                                control={control}
                                name="outcomes.pharmacovigilanceOutcomes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pharmacovigilance Outcomes</FormLabel>
                                    <div className="space-y-2 mt-2">
                                      {PHARMACOVIGILANCE_OUTCOMES.map((outcome) => {
                                        // Business rules for Pharmacovigilance outcomes
                                        const isDisabled = 
                                          // "Client recovered" and "Continuing to experience ADR" are mutually exclusive
                                          (outcome === "Client recovered" && 
                                            field.value.includes("Continuing to experience ADR")) ||
                                          (outcome === "Continuing to experience ADR" && 
                                            field.value.includes("Client recovered")) ||
                                          // "Life threatening" only if there are severe ADRs
                                          (outcome === "Life threatening" && 
                                            !hasHighGradeAdverseReactions(form.getValues().adverseDrugReactions));
                                          
                                        return (
                                          <div key={outcome} className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`pharma-${outcome}`}
                                              checked={field.value.includes(outcome)}
                                              onChange={(e) => {
                                                if (isDisabled) return;
                                                
                                                // Additional business logic for mutual exclusion
                                                let newOutcomes = [...field.value];
                                                
                                                if (e.target.checked) {
                                                  // If selecting "Client recovered", remove "Continuing to experience ADR"
                                                  if (outcome === "Client recovered") {
                                                    newOutcomes = newOutcomes.filter(o => o !== "Continuing to experience ADR");
                                                  }
                                                  // If selecting "Continuing to experience ADR", remove "Client recovered"
                                                  else if (outcome === "Continuing to experience ADR") {
                                                    newOutcomes = newOutcomes.filter(o => o !== "Client recovered");
                                                  }
                                                  
                                                  newOutcomes.push(outcome);
                                                } else {
                                                  newOutcomes = newOutcomes.filter(o => o !== outcome);
                                                }
                                                
                                                field.onChange(newOutcomes);
                                              }}
                                              className="h-4 w-4"
                                              disabled={isDisabled}
                                            />
                                            <label 
                                              htmlFor={`pharma-${outcome}`}
                                              className={isDisabled ? "text-gray-400" : ""}
                                            >
                                              {outcome}
                                              {isDisabled && outcome === "Client recovered" && field.value.includes("Continuing to experience ADR") && 
                                                <span className="text-xs text-orange-500 block">
                                                  (Cannot select both "Client recovered" and "Continuing to experience ADR")
                                                </span>
                                              }
                                              {isDisabled && outcome === "Continuing to experience ADR" && field.value.includes("Client recovered") && 
                                                <span className="text-xs text-orange-500 block">
                                                  (Cannot select both "Client recovered" and "Continuing to experience ADR")
                                                </span>
                                              }
                                              {isDisabled && outcome === "Life threatening" && 
                                                <span className="text-xs text-orange-500 block">
                                                  (Requires Grade 4 adverse reactions)
                                                </span>
                                              }
                                            </label>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {watch("outcomes.pharmacovigilanceOutcomes").includes("Other") && (
                            <FormField
                              control={control}
                              name="outcomes.otherOutcome"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specify Other Outcome</FormLabel>
                                  <Input
                                    {...field}
                                    className="mt-1"
                                  />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </form>
          </Form>

          <ClinicalSummaryDialog 
            open={showSummary}
            onClose={() => setShowSummary(false)}
            data={form.getValues()}
          />

          <div className="flex justify-end gap-2 sticky bottom-0 bg-white py-3 border-t z-10">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="outline" onClick={() => setShowSummary(true)}>View Summary</Button>
            <Button onClick={form.handleSubmit(onSave)}>Save</Button>
          </div>
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
                <li>Of childbearing age (15-49 years)</li>
              </ul>
              <p>
                Please proceed with testing, but note that in a clinical environment, this section would not be 
                visible for male patients or females outside the childbearing age range.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grade 3 (Severe) Symptoms Warning */}
      <AlertDialog open={showGrade3Warning} onOpenChange={setShowGrade3Warning}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" /> 
              Alert: Grade 3 Adverse Reactions
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left">
                <div className="font-medium text-sm">
                  Grade 3 adverse reactions detected requiring assessment:
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <div className="font-semibold text-base mb-2">Detected Symptoms:</div>
                  <ul className="list-disc ml-6 space-y-1">
                    {highGradeSymptoms.map((symptom, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{symptom.category}:</span> {symptom.symptom} 
                        <span className="ml-1">(G{symptom.grade})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="font-semibold text-base mb-2 text-amber-700">Recommended Actions:</div>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Schedule follow-up within 48-72 hours</li>
                    <li>Consider medication adjustment/alternative</li>
                    <li>Provide symptomatic treatment</li>
                    <li>Document symptoms thoroughly</li>
                    <li>Counsel on warning signs for urgent care</li>
                  </ul>
                </div>
                
                <div className="text-xs italic mt-2 text-amber-600">
                  <span className="font-bold">Note:</span> Grade 3 reactions are severe but not immediately life-threatening.
                  May require hospitalization or limit self-care.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setGrade3Acknowledged(true)}
            >
              Acknowledge and Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grade 4 (Life-Threatening) Symptoms Warning */}
      <AlertDialog open={showGrade4Warning} onOpenChange={setShowGrade4Warning}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2 text-base">
              <AlertOctagon className="h-5 w-5" /> 
              URGENT: Grade 4 Adverse Reactions
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left">
                <div className="font-medium text-sm text-red-600">
                  Grade 4 adverse reactions detected requiring urgent assessment:
                </div>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="font-semibold text-base mb-2">Critical Symptoms:</div>
                  <ul className="list-disc ml-6 space-y-1">
                    {highGradeSymptoms.map((symptom, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{symptom.category}:</span> {symptom.symptom} 
                        <span className="ml-1">(G{symptom.grade})</span>
                        {symptom.isLifeThreatening && <span className="ml-1 text-xs font-semibold text-red-500">⚠️ Life-threatening</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="font-semibold text-base mb-2 text-red-700">Actions Required:</div>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li className="font-bold">URGENT: Immediate medical attention for life-threatening symptoms</li>
                    <li>Consider medication modification/discontinuation</li>
                    <li>Begin supportive care based on severity</li>
                    <li>Contact attending physician/clinical officer</li>
                    <li>Refer to higher level care if needed</li>
                    <li>Document all findings and interventions</li>
                  </ul>
                </div>
                
                <div className="text-xs italic mt-2 text-red-600">
                  <span className="font-bold">WARNING:</span> Grade 4 reactions require urgent intervention. 
                  Evaluate life-threatening symptoms immediately. Do not delay medical care.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setGrade4Acknowledged(true)}
            >
              Acknowledge and Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}