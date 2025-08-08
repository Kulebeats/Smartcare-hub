import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ncdManagementSchema = z.object({
  smokingCessation: z.enum(["yes", "no"]),
  heartHealthyDiet: z.enum(["yes", "no"]),
  lowSodiumDiet: z.enum(["yes", "no"]),
  lowFatFoods: z.enum(["yes", "no"]),
  stressReduction: z.enum(["yes", "no"]),
  alcoholConsumption: z.enum(["yes", "no"]),
  physicalActivity: z.enum(["yes", "no"]),
  healthyWeight: z.enum(["yes", "no"]),
  drugsCollectedElsewhere: z.enum(["yes", "no"]),
  collectionLocation: z.string().optional(),
});

type NCDManagementForm = z.infer<typeof ncdManagementSchema>;

interface NCDManagementFormProps {
  onSave: (data: NCDManagementForm) => void;
}

const guidanceItems = [
  { 
    id: "smokingCessation",
    label: "Smoking Cessation Guidance",
  },
  { 
    id: "heartHealthyDiet",
    label: "Heart-Healthy Diet Guidance",
  },
  { 
    id: "lowSodiumDiet",
    label: "Low Sodium Diet Guidance",
    description: "No more than 1 teaspoon (6g) of salt in a day, including snacks, and no added salt at the table"
  },
  { 
    id: "lowFatFoods",
    label: "Low-Fat Foods Guidance",
    description: "No chicken skin, no deep-fried foods, no animal fats, no sausage"
  },
  { 
    id: "stressReduction",
    label: "Stress-Reducing Activities Guidance"
  },
  { 
    id: "alcoholConsumption",
    label: "Alcohol Consumption Guidance"
  },
  { 
    id: "physicalActivity",
    label: "Regular Physical Activity Guidance",
    description: "30 minutes daily brisk walk, at least 5 days per week (aiming for 150 minutes per week)"
  },
  { 
    id: "healthyWeight",
    label: "Healthy Weight Maintenance Guidance"
  },
];

export function NCDManagementForm({ onSave }: NCDManagementFormProps) {
  const form = useForm<NCDManagementForm>({
    resolver: zodResolver(ncdManagementSchema),
    defaultValues: {
      smokingCessation: "no",
      heartHealthyDiet: "no",
      lowSodiumDiet: "no",
      lowFatFoods: "no",
      stressReduction: "no",
      alcoholConsumption: "no",
      physicalActivity: "no",
      healthyWeight: "no",
      drugsCollectedElsewhere: "no",
    },
  });

  const handleSubmit = (data: NCDManagementForm) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Non-Pharmacological Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              {guidanceItems.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={item.id as keyof NCDManagementForm}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{item.label}</FormLabel>
                      {item.description && (
                        <FormDescription>{item.description}</FormDescription>
                      )}
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="drugsCollectedElsewhere"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drugs Collected from Other Facilities</FormLabel>
                    <FormDescription>
                      Local pharmacy, public or private facility
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Management Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
