
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEM_OPTIONS = [
  { value: "Other", label: "Other" },
  { value: "Gastro-Intestinal System", label: "Gastro-Intestinal System" },
  { value: "Genito-Urinary System", label: "Genito-Urinary System" },
  { value: "Musculoskeletal System", label: "Musculoskeletal System" },
  { value: "Integumentary System", label: "Integumentary System" },
  { value: "Respiratory System", label: "Respiratory System" },
  { value: "Cardiovascular System", label: "Cardiovascular System" },
  { value: "Nervous System", label: "Nervous System" },
  { value: "Endocrine System", label: "Endocrine System" },
];

interface SystemReview {
  id: string;
  system: string;
  notes: string;
}

interface ReviewOfSystemsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function ReviewOfSystemsDialog({ open, onClose, onSave }: ReviewOfSystemsDialogProps) {
  const [systemReviews, setSystemReviews] = useState<SystemReview[]>([
    {
      id: "1",
      system: "Genito-Urinary System",
      notes: "ffwd/fwd"
    }
  ]);
  const [selectedSystem, setSelectedSystem] = useState<string>("-- Select --");
  const [notes, setNotes] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const [selectOpen, setSelectOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // For the past encounters section
  const pastEncounters = [
    {
      date: "18-Apr-2025",
      facility: "Masempela Rural Health Centre",
      clinician: "Administrator Administrator",
      system: "Gastro-Intestinal System",
      notes: "very bad"
    }
  ];
  
  const handleAddReview = () => {
    if (!selectedSystem || selectedSystem === "-- Select --") return;
    
    if (editingId) {
      // Update existing review
      setSystemReviews(systemReviews.map(review => 
        review.id === editingId 
          ? { ...review, system: selectedSystem, notes } 
          : review
      ));
      setEditingId(null);
    } else {
      // Add new review
      const newReview = {
        id: Date.now().toString(),
        system: selectedSystem,
        notes
      };
      setSystemReviews([...systemReviews, newReview]);
    }
    
    // Reset form - set it back to the default "-- Select --" state
    setSelectedSystem("-- Select --");
    setNotes("");
  };
  
  const handleEdit = (review: SystemReview) => {
    setSelectedSystem(review.system);
    setNotes(review.notes);
    setEditingId(review.id);
  };
  
  const handleRemove = (id: string) => {
    setSystemReviews(systemReviews.filter(review => review.id !== id));
  };
  
  const handleSave = () => {
    // Call the onSave prop if provided
    if (onSave) {
      onSave({
        reviews: systemReviews
      });
    } else {
      // Just close if no onSave provided
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review of Systems</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* System Selection */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="system" className="font-medium mr-1">
                System
              </Label>
              <span className="text-red-500">*</span>
            </div>
            <Select
              value={selectedSystem}
              onValueChange={(value) => setSelectedSystem(value)}
              open={selectOpen}
              onOpenChange={setSelectOpen}
            >
              <SelectTrigger id="system" className="bg-white border-gray-300">
                <SelectValue placeholder="-- Select --" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="-- Select --">-- Select --</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Gastro-Intestinal System">Gastro-Intestinal System</SelectItem>
                <SelectItem value="Genito-Urinary System">Genito-Urinary System</SelectItem>
                <SelectItem value="Musculoskeletal System">Musculoskeletal System</SelectItem>
                <SelectItem value="Integumentary System">Integumentary System</SelectItem>
                <SelectItem value="Respiratory System">Respiratory System</SelectItem>
                <SelectItem value="Cardiovascular System">Cardiovascular System</SelectItem>
                <SelectItem value="Nervous System">Nervous System</SelectItem>
                <SelectItem value="Endocrine System">Endocrine System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes" className="font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="min-h-20 resize-none border-gray-300"
            />
          </div>
          
          {/* Add Button */}
          <div className="pt-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddReview}
              disabled={!selectedSystem || selectedSystem === "-- Select --"}
              className={cn(
                "w-auto rounded-full text-white px-4 py-1 text-sm font-medium",
                selectedSystem && selectedSystem !== "-- Select --" 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "bg-gray-400"
              )}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {/* List of current reviews */}
          {systemReviews.length > 0 && (
            <div className="bg-blue-50 rounded-md p-4 mt-4">
              {systemReviews.map((review) => (
                <div key={review.id} className="flex justify-between items-start mb-3 last:mb-0">
                  <div>
                    <div className="flex">
                      <span className="font-medium mr-1">Physical System</span>
                      <span className="text-gray-700">: {review.system}</span>
                    </div>
                    <div className="flex mt-1">
                      <span className="font-medium mr-1">Notes</span>
                      <span className="text-gray-700">: {review.notes}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(review)}
                      className="text-blue-500 h-6 p-0"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(review.id)}
                      className="text-red-500 h-6 p-0"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Past Encounters Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Past Encounters</h3>
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm text-gray-600 mr-2">30</span>
                <button className="text-blue-500 font-bold">«</button>
                <span className="mx-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm">1</span>
                <button className="text-blue-500 font-bold">»</button>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500 h-6 p-0">
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="bg-gray-50 rounded-md">
              <div className="grid grid-cols-3 gap-4 p-2 font-medium text-sm border-b">
                <div>Encounter Date</div>
                <div>Facility</div>
                <div>Clinician</div>
              </div>
              <div className="border-b last:border-b-0">
                <div className="grid grid-cols-3 gap-4 p-2 text-sm">
                  <div>18-Apr-2025</div>
                  <div>Masempela Rural Health Centre</div>
                  <div>Administrator Administrator</div>
                </div>
                <div className="px-2 pb-2">
                  <div className="mb-1">
                    <span className="font-medium mr-1">Physical System</span>
                    <span className="text-gray-700">: Gastro-Intestinal System</span>
                  </div>
                  <div>
                    <span className="font-medium mr-1">Note</span>
                    <span className="text-gray-700">: very bad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dialog Actions */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
