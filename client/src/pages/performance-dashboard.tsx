import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PageLoader, DataLoader, CardLoader } from "@/components/ui/loading-spinner";
import { 
  Activity, 
  Database, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Server,
  Users,
  BarChart3,
  Trash2,
  RefreshCw
} from "lucide-react";

interface PerformanceMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  queueProcessingRate: number;
  databaseConnectionPool: number;
  memoryUsage: string;
  activeUsers: number;
  systemLoad: number;
}

interface OptimizationRecommendation {
  category: 'cache' | 'database' | 'queue' | 'memory' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
  estimatedImpact: string;
}

interface DashboardData {
  currentMetrics: PerformanceMetrics;
  recommendations: OptimizationRecommendation[];
  trends: {
    cacheHitRateTrend: number[];
    responseTimeTrend: number[];
    queueProcessingTrend: number[];
  };
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

const getHealthColor = (health: string) => {
  switch (health) {
    case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
    case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-blue-100 text-blue-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'cache': return <Database className="h-4 w-4" />;
    case 'database': return <Server className="h-4 w-4" />;
    case 'queue': return <Activity className="h-4 w-4" />;
    case 'memory': return <BarChart3 className="h-4 w-4" />;
    case 'network': return <Zap className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

export default function PerformanceDashboard() {
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const queryClient = useQueryClient();

  // Fetch performance dashboard data
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/admin/performance/dashboard'],
    refetchInterval: refreshInterval,
  });

  // Fetch cache stats
  const { data: cacheStats } = useQuery({
    queryKey: ['/api/admin/cache/stats'],
    refetchInterval: refreshInterval,
  });

  // Apply automatic optimizations
  const applyOptimizationsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/performance/optimize', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/performance/dashboard'] });
    },
  });

  // Clear cache
  const clearCacheMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/cache/clear', 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cache/stats'] });
    },
  });

  if (isLoading) {
    return <PageLoader text="Loading SmartCare PRO Performance Dashboard..." />;
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load performance dashboard. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const metrics = dashboardData?.currentMetrics;
  const recommendations = dashboardData?.recommendations || [];
  const systemHealth = dashboardData?.systemHealth || 'unknown';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SmartCare PRO Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time system performance monitoring and optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getHealthColor(systemHealth)}>
            {systemHealth === 'excellent' && <CheckCircle className="h-3 w-3 mr-1" />}
            {systemHealth === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {systemHealth === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
            System: {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/performance/dashboard'] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
              <Progress value={metrics.cacheHitRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.cacheHitRate >= 80 ? 'Excellent' : metrics.cacheHitRate >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.averageResponseTime <= 500 ? 'Excellent' : 
                 metrics.averageResponseTime <= 1000 ? 'Good' : 'Slow'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue Processing</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queueProcessingRate.toFixed(1)}%</div>
              <Progress value={metrics.queueProcessingRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.queueProcessingRate >= 90 ? 'Optimal' : 'Bottleneck Detected'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Optimization Recommendations</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="queues">Queue Monitoring</TabsTrigger>
          <TabsTrigger value="system">System Details</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Recommendations</h3>
            <Button 
              onClick={() => applyOptimizationsMutation.mutate()}
              disabled={applyOptimizationsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {applyOptimizationsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Apply Auto-Optimizations
            </Button>
          </div>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">System Running Optimally</h3>
                  <p className="text-gray-600">No performance issues detected at this time.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getCategoryIcon(rec.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(rec.severity)}>
                            {rec.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500 capitalize">{rec.category}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{rec.description}</h4>
                        <p className="text-sm text-gray-600 mb-2">{rec.action}</p>
                        <p className="text-xs text-green-600 font-medium">
                          Expected Impact: {rec.estimatedImpact}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cache Management</h3>
            <Button 
              variant="destructive"
              onClick={() => clearCacheMutation.mutate()}
              disabled={clearCacheMutation.isPending}
            >
              {clearCacheMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear All Cache
            </Button>
          </div>

          {cacheStats?.data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cache Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Keys:</span>
                      <span className="font-medium">{cacheStats.data.totalKeys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hit Rate:</span>
                      <span className="font-medium">{cacheStats.data.hitRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Memory Usage:</span>
                      <span className="font-medium">{cacheStats.data.memoryUsage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Queue Monitoring</h3>
            <Button variant="outline" asChild>
              <a href="/admin/queues" target="_blank" rel="noopener noreferrer">
                <Activity className="h-4 w-4 mr-2" />
                View Detailed Queue Dashboard
              </a>
            </Button>
          </div>

          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Queue processing is running smoothly. Visit the detailed dashboard for real-time job monitoring.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <h3 className="text-lg font-semibold">System Information</h3>
          
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">System Load:</span>
                      <span className="font-medium">{metrics.systemLoad.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Memory Usage:</span>
                      <span className="font-medium">{metrics.memoryUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">DB Records:</span>
                      <span className="font-medium">{metrics.databaseConnectionPool.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cache Trend:</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Trend:</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Queue Trend:</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}