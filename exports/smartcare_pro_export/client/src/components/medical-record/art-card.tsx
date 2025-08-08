
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArtDialog } from "./art-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";

export function ArtCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const handleOpenDialog = (isEdit = false) => {
    setEditMode(isEdit);
    setDialogOpen(true);
  };

  const handleSave = (data: any) => {
    console.log("Saving ART data:", data);
    toast({
      title: editMode ? "ART Record Updated" : "ART Record Added",
      description: `Successfully ${editMode ? "updated" : "added"} ART record`,
    });
    setDialogOpen(false);
  };

  // Check if there's existing art data (mock data for now)
  const hasArtData = false;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Antiretroviral Therapy (ART)</CardTitle>
            <div className="flex space-x-2">
              {hasArtData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleOpenDialog(true)}
                >
                  <Edit className="mr-1 h-3.5 w-3.5" />
                  Edit Record
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                className="h-8 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                onClick={() => handleOpenDialog(false)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasArtData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Regimen:</span>
                <span className="font-medium">TDF + 3TC + DTG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date:</span>
                <span className="font-medium">15-Apr-2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next Appointment:</span>
                <span className="font-medium">15-Jun-2025</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No ART records available. Click Add Record to create one.</p>
          )}
        </CardContent>
      </Card>

      <ArtDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
