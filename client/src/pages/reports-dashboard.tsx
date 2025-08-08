import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Users, Activity, TrendingUp, FileText, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch authentic reports data
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/reports/summary'],
  });

  // Fetch facility performance data
  const { data: facilityData, isLoading: facilityLoading } = useQuery({
    queryKey: ['/api/reports/facility-performance'],
  });

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    // Implement Excel export functionality
    console.log('Exporting to Excel...');
  };

  // Loading state
  if (summaryLoading || facilityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  // Use authentic data or provide safe fallbacks
  const totalPatients = summaryData?.totalPatients || 0;
  const monthlyVisits = summaryData?.monthlyVisits || 0;
  const activeFacilities = summaryData?.activeFacilities || 0;
  const avgSatisfaction = summaryData?.avgSatisfaction || 0;
  const patientTrends = summaryData?.patientTrends || [];
  const serviceStats = summaryData?.serviceStats || [];
  const facilityPerformance = facilityData?.facilityMetrics || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports Dashboard</h1>
          <p className="text-muted-foreground">Healthcare analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Visits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Visits in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFacilities}</div>
            <p className="text-xs text-muted-foreground">Healthcare facilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Patient satisfaction rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="quarter">This Quarter</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Statistics</CardTitle>
                <CardDescription>New patients and total visits over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newPatients" fill="#8884d8" name="New Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>Breakdown of services provided</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Facility Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Performance</CardTitle>
              <CardDescription>Patient volume and satisfaction by facility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facilityPerformance.map((facility, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{facility.facility}</h4>
                      <p className="text-sm text-muted-foreground">{facility.patients} patients</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{facility.satisfaction}/5</div>
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}