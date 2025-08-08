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

const familySocialHistorySchema = z.object({
  familyHistory: z.string().min(1, "Family history is required"),
  socialHistory: z.string().min(1, "Social history is required"),
  lifestyle: z.string().optional(),
  occupation: z.string().optional(),
});

type FamilySocialHistoryForm = z.infer<typeof familySocialHistorySchema>;

interface FamilySocialHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FamilySocialHistoryForm) => void;
}

export function FamilySocialHistoryDialog({
  open,
  onClose,
  onSave,
}: FamilySocialHistoryDialogProps) {
  const form = useForm<FamilySocialHistoryForm>({
    resolver: zodResolver(familySocialHistorySchema),
  });

  const handleSubmit = (data: FamilySocialHistoryForm) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Family & Social History</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="familyHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter family medical history"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter social history"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lifestyle</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter lifestyle information"
                      {...field}
                    />
                  </FormControl>
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
                    <Input placeholder="Enter occupation" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
