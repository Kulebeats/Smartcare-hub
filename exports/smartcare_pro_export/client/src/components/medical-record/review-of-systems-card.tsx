import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ReviewOfSystemsDialog } from "./review-of-systems-dialog";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

export function ReviewOfSystemsCard() {
  const [modalOpen, setModalOpen] = useState(false);

  // Example data - in a real app this would come from your API/state
  const latestReview = {
    system: "Gastro-Intestinal System",
    note: "very bad"
  };

  return (
    <>
      <Card 
        className="w-full cursor-pointer hover:bg-blue-50 transition-colors" 
        onClick={() => setModalOpen(true)}
      >
        <CardHeader className="pb-3">
          <CardTitle>Review of Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {latestReview ? (
              <>
                <div className="flex justify-between items-center">
                  <span>Physical System</span>
                  <span className="text-gray-500">: {latestReview.system}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Note</span>
                  <span className="text-gray-500">: {latestReview.note}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span></span>
                  <Link to="#">
                    <span className="text-blue-500 text-sm flex items-center">
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-gray-600">
                No system reviews recorded. Click to add.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ReviewOfSystemsDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}