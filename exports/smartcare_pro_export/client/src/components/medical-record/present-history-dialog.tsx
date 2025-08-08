import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const presentHistorySchema = z.object({
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  presentingHistory: z.string().min(1, "Presenting history is required"),
  duration: z.string().min(1, "Duration is required"),
  severity: z.string().min(1, "Severity is required"),
  associatedSymptoms: z.string().optional(),
});

type PresentHistoryForm = z.infer<typeof presentHistorySchema>;

interface PresentHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PresentHistoryForm) => void;
}

export function PresentHistoryDialog({
  open,
  onClose,
  onSave,
}: PresentHistoryDialogProps) {
  const form = useForm<PresentHistoryForm>({
    resolver: zodResolver(presentHistorySchema),
  });

  const handleSubmit = (data: PresentHistoryForm) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Present History</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter chief complaint" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="presentingHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presenting History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter presenting history"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 days, 1 week" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mild, Moderate, Severe" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="associatedSymptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter associated symptoms"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
