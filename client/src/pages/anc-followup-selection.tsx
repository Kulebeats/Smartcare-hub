import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, ArrowRight, Clock } from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number?: string;
  art_number?: string;
  last_anc_visit?: string;
  visit_count?: number;
}

export default function ANCFollowupSelection(): JSX.Element {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch recent ANC patients
  const { data: recentPatients, isLoading: loadingRecent } = useQuery({
    queryKey: ['/api/patients/recent-anc'],
    queryFn: async () => {
      const response = await fetch('/api/patients/recent-anc');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : data.patients || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setLocation(`/patients/${patientId}/anc/followup`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeSinceLastVisit = (dateString: string) => {
    const lastVisit = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ANC Follow-up Visit</h1>
          <p className="text-gray-600 mt-2">Select a patient for follow-up assessment</p>
        </div>

        {/* Patient Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Patient</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Search by name, ART number, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePatientSelect(patient.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <User className="w-8 h-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{patient.first_name} {patient.last_name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>DOB: {formatDate(patient.date_of_birth)}</span>
                            {patient.art_number && <span>ART: {patient.art_number}</span>}
                            {patient.phone_number && <span>Phone: {patient.phone_number}</span>}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No patients found matching your search</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent ANC Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent ANC Patients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading recent patients...</p>
              </div>
            ) : recentPatients && recentPatients.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map((patient: Patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handlePatientSelect(patient.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <User className="w-8 h-8 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{patient.first_name} {patient.last_name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>DOB: {formatDate(patient.date_of_birth)}</span>
                          {patient.art_number && <span>ART: {patient.art_number}</span>}
                        </div>
                        {patient.last_anc_visit && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Last visit: {getTimeSinceLastVisit(patient.last_anc_visit)}
                            </span>
                            {patient.visit_count && (
                              <Badge variant="outline" className="text-xs">
                                Visit {patient.visit_count + 1}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No recent ANC patients found</p>
                <p className="text-sm mt-1">Use the search above to find a patient for follow-up</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}