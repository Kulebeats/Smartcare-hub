import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Clock, MapPin, Truck, Plane, DollarSign, Users, Heart, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface TransferRequest {
  patientId: number;
  fromFacility: string;
  urgency: 'Emergency' | 'Urgent' | 'Scheduled';
  condition: string;
  requiredServices: string[];
  requiredSpecialty?: string;
  transportNeeds: 'Ambulance' | 'Air Transport' | 'Standard Transport';
  medicalEscort: boolean;
  timeConstraint?: number;
  preferredDestination?: string;
}

interface TransferRoute {
  destination: {
    id: string;
    name: string;
    type: string;
    province: string;
    district: string;
    services: string[];
    capacity: { beds: number; icu: number; maternity: number; nicu: number };
    currentOccupancy: { beds: number; icu: number; maternity: number; nicu: number };
  };
  distance: number;
  estimatedTravelTime: number;
  routeType: string;
  transportMethod: string;
  cost: number;
  availability: boolean;
  waitingList: number;
  recommendationScore: number;
  reasoning: string[];
}

export default function PatientTransferPage() {
  const { toast } = useToast();
  const [transferRequest, setTransferRequest] = useState<Partial<TransferRequest>>({
    urgency: 'Urgent',
    transportNeeds: 'Ambulance',
    medicalEscort: false,
    requiredServices: []
  });
  const [searchResults, setSearchResults] = useState<TransferRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransferRoute | null>(null);

  // Available services for selection
  const availableServices = [
    'Emergency', 'ICU', 'Surgery', 'Maternity', 'NICU', 'Cardiology', 
    'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Obstetrics'
  ];

  const availableSpecialties = [
    'Cardiology', 'Neurology', 'Obstetrics', 'Pediatrics', 'Surgery',
    'Internal Medicine', 'Emergency Medicine', 'Anesthesiology'
  ];

  // Search for optimal transfer routes
  const searchTransferRoutes = useMutation({
    mutationFn: async (request: TransferRequest) => {
      const response = await apiRequest('POST', '/api/transfers/search', request);
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.routes || []);
      toast({
        title: "Transfer routes found",
        description: `Found ${data.routes?.length || 0} suitable facilities`
      });
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Unable to find transfer routes. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initiate transfer
  const initiateTransfer = useMutation({
    mutationFn: async (route: TransferRoute) => {
      const response = await apiRequest('POST', '/api/transfers/initiate', {
        ...transferRequest,
        selectedRoute: route
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer initiated",
        description: `Transfer ID: ${data.transferId}. Transport arrangements in progress.`
      });
      setSelectedRoute(null);
      setSearchResults([]);
      setTransferRequest({
        urgency: 'Urgent',
        transportNeeds: 'Ambulance',
        medicalEscort: false,
        requiredServices: []
      });
    }
  });

  const handleServiceToggle = (service: string) => {
    const currentServices = transferRequest.requiredServices || [];
    const updatedServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    
    setTransferRequest(prev => ({
      ...prev,
      requiredServices: updatedServices
    }));
  };

  const handleSearch = () => {
    if (!transferRequest.patientId || !transferRequest.fromFacility || !transferRequest.condition) {
      toast({
        title: "Missing information",
        description: "Please fill in patient ID, source facility, and condition",
        variant: "destructive"
      });
      return;
    }

    searchTransferRoutes.mutate(transferRequest as TransferRequest);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-500';
      case 'Urgent': return 'bg-orange-500';
      case 'Scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityBadge = (route: TransferRoute) => {
    const utilization = route.destination.currentOccupancy.beds / route.destination.capacity.beds;
    if (utilization >= 0.9) return <Badge variant="destructive">High Occupancy</Badge>;
    if (utilization >= 0.7) return <Badge variant="outline">Moderate Occupancy</Badge>;
    return <Badge variant="secondary">Good Availability</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Patient Transfer</h1>
          <p className="text-gray-600">Intelligent routing for inter-facility patient transfers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="h-8 w-8 text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">SmartTransfer Engine</span>
        </div>
      </div>

      {/* Transfer Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Transfer Request Details</span>
          </CardTitle>
          <CardDescription>
            Complete patient and transfer information for optimal routing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                type="number"
                placeholder="Enter patient ID"
                value={transferRequest.patientId || ''}
                onChange={(e) => setTransferRequest(prev => ({
                  ...prev,
                  patientId: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            <div>
              <Label htmlFor="fromFacility">Source Facility</Label>
              <Select onValueChange={(value) => setTransferRequest(prev => ({ ...prev, fromFacility: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHIKANDO_RHC">Chikando Rural Health Centre</SelectItem>
                  <SelectItem value="CHAMAKUBI_HP">Chamakubi Health Post</SelectItem>
                  <SelectItem value="KAFUE_DISTRICT">Kafue District Hospital</SelectItem>
                  <SelectItem value="NDOLA_CENTRAL">Ndola Central Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="urgency">Transfer Urgency</Label>
              <Select 
                value={transferRequest.urgency || 'Urgent'}
                onValueChange={(value: 'Emergency' | 'Urgent' | 'Scheduled') => 
                  setTransferRequest(prev => ({ ...prev, urgency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency">🚨 Emergency</SelectItem>
                  <SelectItem value="Urgent">⚡ Urgent</SelectItem>
                  <SelectItem value="Scheduled">📅 Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="condition">Patient Condition</Label>
            <Textarea
              id="condition"
              placeholder="Describe the patient's condition requiring transfer"
              value={transferRequest.condition || ''}
              onChange={(e) => setTransferRequest(prev => ({ ...prev, condition: e.target.value }))}
            />
          </div>

          <div>
            <Label>Required Services</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {availableServices.map(service => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={transferRequest.requiredServices?.includes(service) || false}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm">{service}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialty">Required Specialty (Optional)</Label>
              <Select onValueChange={(value) => setTransferRequest(prev => ({ ...prev, requiredSpecialty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty if needed" />
                </SelectTrigger>
                <SelectContent>
                  {availableSpecialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transportNeeds">Transport Method</Label>
              <Select 
                value={transferRequest.transportNeeds || 'Ambulance'}
                onValueChange={(value: 'Ambulance' | 'Air Transport' | 'Standard Transport') => 
                  setTransferRequest(prev => ({ ...prev, transportNeeds: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ambulance">🚑 Ambulance</SelectItem>
                  <SelectItem value="Air Transport">✈️ Air Transport</SelectItem>
                  <SelectItem value="Standard Transport">🚗 Standard Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="medicalEscort"
              checked={transferRequest.medicalEscort || false}
              onCheckedChange={(checked) => setTransferRequest(prev => ({ 
                ...prev, 
                medicalEscort: checked as boolean 
              }))}
            />
            <Label htmlFor="medicalEscort">Medical escort required</Label>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={searchTransferRoutes.isPending}
            className="w-full"
          >
            {searchTransferRoutes.isPending ? (
              <Activity className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            Find Optimal Transfer Routes
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Recommended Transfer Routes</span>
            </CardTitle>
            <CardDescription>
              Routes ranked by suitability, capacity, and distance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map((route, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{route.destination.name}</h3>
                      <Badge variant="outline">{route.destination.type}</Badge>
                      {getAvailabilityBadge(route)}
                      <span className="text-sm text-gray-500">
                        Score: {route.recommendationScore.toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{route.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{route.estimatedTravelTime.toFixed(1)} hours</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {route.transportMethod === 'Air' ? (
                          <Plane className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Truck className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{route.transportMethod}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${route.cost.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Location:</span>
                        <br />
                        {route.destination.district}, {route.destination.province}
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span>
                        <br />
                        {route.destination.capacity.beds - route.destination.currentOccupancy.beds} beds available
                      </div>
                      <div>
                        <span className="font-medium">Services:</span>
                        <br />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {route.destination.services.slice(0, 3).map(service => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {route.destination.services.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{route.destination.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Reasoning: </span>
                      {route.reasoning.join(' • ')}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => setSelectedRoute(route)}
                      variant={index === 0 ? "default" : "outline"}
                      size="sm"
                    >
                      {index === 0 ? "Recommended" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected Route Confirmation */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Confirm Transfer</span>
            </CardTitle>
            <CardDescription>
              Review transfer details before initiation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Selected Facility:</strong> {selectedRoute.destination.name}
                <br />
                <strong>Estimated Cost:</strong> ${selectedRoute.cost.toFixed(0)}
                <br />
                <strong>Travel Time:</strong> {selectedRoute.estimatedTravelTime.toFixed(1)} hours
              </AlertDescription>
            </Alert>

            <div className="flex space-x-4">
              <Button
                onClick={() => initiateTransfer.mutate(selectedRoute)}
                disabled={initiateTransfer.isPending}
                className="flex-1"
              >
                {initiateTransfer.isPending ? (
                  <Activity className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Truck className="h-4 w-4 mr-2" />
                )}
                Initiate Transfer
              </Button>
              <Button
                onClick={() => setSelectedRoute(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}