import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Search, Calendar, FileText, AlertTriangle } from "lucide-react";
import { PharmacovigilanceDialog } from "@/components/medical-record/pharmacovigilance-dialog";
import type { PharmacovigilanceForm } from "@/components/medical-record/pharmacovigilance-dialog";
import { useToast } from "@/hooks/use-toast";

export default function PharmacovigilancePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reports, setReports] = useState<PharmacovigilanceForm[]>([]);
  const { toast } = useToast();

  const handleSaveReport = (data: PharmacovigilanceForm) => {
    setReports(prev => [...prev, data]);
    toast({
      title: "Pharmacovigilance Report Saved",
      description: "The adverse event report has been successfully recorded.",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-orange-500" />
              Pharmacovigilance
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and report adverse drug reactions to ensure patient safety
            </p>
          </div>
          
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New ADR Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => {
                      const reportDate = r.registration?.dateOfReporting;
                      return reportDate && new Date(reportDate).getMonth() === new Date().getMonth();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Reports</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => r.adverseDrugReactions?.hasReactions).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => r.outcomes?.viralLoadStatus).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Pharmacovigilance Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pharmacovigilance reports yet.</p>
                <p className="text-sm text-gray-500">Click "New ADR Report" to create your first report.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(-5).reverse().map((report, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          report.adverseDrugReactions?.hasReactions ? "destructive" : "secondary"
                        }>
                          {report.adverseDrugReactions?.hasReactions ? "Active ADR" : "Monitoring"}
                        </Badge>
                        <span className="font-medium">
                          {report.patientDetails?.firstName} {report.patientDetails?.lastName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {report.registration?.dateOfReporting}
                      </span>
                    </div>
                    <p className="text-sm">
                      <strong>Reason:</strong> {report.reasonForPharmacovigilance}
                    </p>
                    <p className="text-sm">
                      <strong>Facility:</strong> {report.registration?.healthFacility}
                    </p>
                    {report.adverseDrugReactions?.description && (
                      <p className="text-sm">
                        <strong>Description:</strong> {report.adverseDrugReactions.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <PharmacovigilanceDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveReport}
        />
      </div>
    </MainLayout>
  );
}