import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Zap, 
  Activity,
  Download,
  RefreshCw,
  Settings,
  Shield,
  BarChart3,
  ArrowLeft
} from "lucide-react";

interface DAKRule {
  id: number;
  ruleCode: string;
  moduleCode: string;
  ruleName: string;
  alertSeverity: string;
  dakReference: string;
  evidenceQuality: string;
  isActive: boolean;
  guidelineVersion: string;
  createdAt: string;
}

interface ProcessingJob {
  id: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  createdAt: string;
  completedAt?: string;
  errorDetails?: string;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalQueries: number;
  cacheSize: number;
  lastUpdated: string;
}

export default function AdminDAK() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch DAK rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/admin/dak/rules"],
    retry: false,
  });

  // Fetch processing jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/admin/dak/jobs"],
    retry: false,
  });

  // Fetch cache statistics
  const { data: cacheStats, isLoading: cacheLoading } = useQuery({
    queryKey: ["/api/admin/dak/cache/stats"],
    retry: false,
  });

  // File upload mutation using raw CSV data
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Read file as text to send as raw CSV data
      const csvData = await file.text();
      
      // Use the raw CSV upload endpoint to bypass multipart form issues
      const response = await fetch('/api/admin/dak/upload-csv-raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: csvData,
          fileName: file.name
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `CSV uploaded successfully. Job ID: ${data.jobId}`,
      });
      setSelectedFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dak/jobs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CSV file",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  // Integrity check mutation
  const integrityMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/dak/integrity-check');
    },
    onSuccess: (data) => {
      toast({
        title: "Integrity Check Complete",
        description: `${data.validRules}/${data.totalRules} rules passed validation`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Integrity Check Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cache management mutations
  const warmCacheMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/dak/cache/warm', {
        method: 'POST',
        body: JSON.stringify({ modules: ['ANC', 'ART', 'PHARMACOVIGILANCE'] }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Cache Warmed",
        description: "Decision support cache has been preloaded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dak/cache/stats"] });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/dak/cache/clear', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Cache Cleared",
        description: "Decision support cache has been cleared",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dak/cache/stats"] });
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  }, [toast]);

  const handleUpload = useCallback(() => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  }, [selectedFile, uploadMutation]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'red': return 'destructive';
      case 'yellow': return 'secondary';
      case 'green': return 'default';
      default: return 'outline';
    }
  };

  const getEvidenceColor = (quality: string) => {
    switch (quality?.toUpperCase()) {
      case 'A': return 'default';
      case 'B': return 'secondary';
      case 'C': return 'outline';
      case 'D': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/admin-panel'}
              className="flex items-center space-x-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin Panel</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">DAK Clinical Decision Support</h1>
              <p className="text-muted-foreground">
                Manage clinical decision rules with full governance and traceability
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>DAK-Traceable</span>
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <TabsTrigger value="upload" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:text-blue-800 hover:bg-blue-100 transition-all">Upload Rules</TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-700 hover:text-green-800 hover:bg-green-100 transition-all">Manage Rules</TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-orange-700 hover:text-orange-800 hover:bg-orange-100 transition-all">Processing Jobs</TabsTrigger>
          <TabsTrigger value="cache" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-700 hover:text-purple-800 hover:bg-purple-100 transition-all">Cache Management</TabsTrigger>
          <TabsTrigger value="integrity" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-red-700 hover:text-red-800 hover:bg-red-100 transition-all">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Upload className="h-5 w-5 text-blue-600" />
                <span>Upload Clinical Decision Rules</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Upload CSV files containing WHO guideline-compliant clinical decision rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                />
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>File Selected</AlertTitle>
                  <AlertDescription>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">Processing upload...</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload & Process</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const element = document.createElement('a');
                    element.href = '/sample-dak-template.csv';
                    element.download = 'dak-template.csv';
                    element.click();
                  }}
                  className="flex items-center space-x-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 hover:text-green-800 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>CSV Format Requirements</AlertTitle>
                <AlertDescription>
                  Include: rule_identifier, dak_source_id, guideline_doc_version, evidence_rating,
                  applicable_module, rule_name, alert_severity, trigger_conditions, recommendations
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Database className="h-5 w-5 text-blue-600" />
                <span>Clinical Decision Rules</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage and monitor active clinical decision support rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : rulesData?.rules?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Code</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>DAK Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rulesData.rules.map((rule: DAKRule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-mono text-sm">{rule.ruleCode}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.moduleCode}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{rule.ruleName}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(rule.alertSeverity)}>
                            {rule.alertSeverity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEvidenceColor(rule.evidenceQuality)}>
                            Grade {rule.evidenceQuality}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{rule.dakReference}</TableCell>
                        <TableCell>
                          {rule.isActive ? (
                            <Badge variant="default" className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Active</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No clinical decision rules found. Upload a CSV file to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Processing Jobs</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Monitor CSV upload and processing job status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : jobsData?.jobs?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Total Records</TableHead>
                      <TableHead>Failed Records</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobsData.jobs.map((job: ProcessingJob) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-sm">{job.id}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={job.status === 'completed' ? 'default' : 
                                   job.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress 
                              value={(job.processedRecords / job.totalRecords) * 100} 
                              className="w-20 h-2" 
                            />
                            <span className="text-xs text-muted-foreground">
                              {job.processedRecords}/{job.totalRecords}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{job.totalRecords}</TableCell>
                        <TableCell>
                          {job.failedRecords > 0 ? (
                            <span className="text-destructive">{job.failedRecords}</span>
                          ) : (
                            job.failedRecords
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(job.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No processing jobs found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Cache Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cacheLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : cacheStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Hit Rate</span>
                      <span className="font-semibold">{cacheStats.hitRate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Queries</span>
                      <span className="font-semibold">{cacheStats.totalQueries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Size</span>
                      <span className="font-semibold">{cacheStats.cacheSize} entries</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Last Updated</span>
                      <span>{cacheStats.lastUpdated}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    Cache statistics unavailable
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Cache Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => warmCacheMutation.mutate()}
                  disabled={warmCacheMutation.isPending}
                  className="w-full flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Warm Cache</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => clearCacheMutation.mutate()}
                  disabled={clearCacheMutation.isPending}
                  className="w-full flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Clear Cache</span>
                </Button>

                <p className="text-sm text-muted-foreground">
                  Warm cache for better performance or clear to reset cached data
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>System Health & Integrity</span>
              </CardTitle>
              <CardDescription>
                Monitor system health and run integrity checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => integrityMutation.mutate()}
                disabled={integrityMutation.isPending}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Run Integrity Check</span>
              </Button>

              {integrityMutation.isPending && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Running integrity check...</span>
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>DAK Compliance Features</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>• Full DAK reference tracking for governance</p>
                  <p>• Evidence quality grading (A-D rating system)</p>
                  <p>• WHO guideline version control</p>
                  <p>• Automated compliance monitoring</p>
                  <p>• Complete audit trail for all rule changes</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}