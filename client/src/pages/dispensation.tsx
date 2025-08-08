"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Search, Package, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useLocation } from "wouter"

interface Medication {
  id: number
  drugName: string
  dosage: string
  itemPerDose: string
  frequency: string
  timePerUnit: string
  frequencyUnit: string
  duration: string
  durationUnit: string
  route: string
  quantity: string
  startDate: string
  endDate: string
  isPasserBy: string
  comments: string
}

interface Prescription {
  id: number
  medications: Medication[]
  prescribedBy: string
  prescribedDate: string
  patientName: string
  status: "prescribed" | "dispensed"
  prescriptionNumber: string
  patientId: number
  totalCost: number
  validUntil: string
}

interface Patient {
  id: number
  name: string
  dateOfBirth: string
  age: number
  sex: string
  cellphone: string
  nupn: string
  nrc: string
  mothersName: string
  address: string
  emergencyContact: string
  allergies: string
  insurance: string
  lastVisit: string
  doctor: string
}

type ViewType = "dispensation" | "dispenseList" | "editPrescription"

export default function DispensationPage() {
  const [, setLocation] = useLocation()
  const [currentView, setCurrentView] = useState<ViewType>("dispensation")
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [dispensedMedications, setDispensedMedications] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)


  const patient: Patient = {
    name: "JANE DOE",
    dateOfBirth: "6-Apr-1995 (30Y)",
    age: 30,
    sex: "Female",
    cellphone: "+260 0777777777",
    nupn: "8006-0014P-61326-8",
    nrc: "111111/11/1",
    mothersName: "USA",
  }

  // Initialize sample prescriptions and load from localStorage on component mount
  useEffect(() => {
    const initializePrescriptions = (): void => {
      try {
        const savedPrescriptions = localStorage.getItem("prescriptions")
        let prescriptionsData: Prescription[] = []
        
        if (savedPrescriptions) {
          prescriptionsData = JSON.parse(savedPrescriptions)
        } else {
          // Create sample prescriptions if none exist
          const samplePrescriptions: Prescription[] = [
            {
              id: 1,
              patientId: 1001,
              patientName: "Mary Chanda",
              prescriptionNumber: "PRX-2025-001",
              prescribedBy: "Dr. John Mwanza",
              prescribedDate: "2025-01-11",
              status: "prescribed",
              validUntil: "2025-01-18",
              totalCost: 125.50,
              medications: [
                {
                  id: 1,
                  drugName: "Iron + Folic Acid",
                  dosage: "200mg + 0.4mg",
                  itemPerDose: "1",
                  frequency: "Once daily",
                  timePerUnit: "1",
                  frequencyUnit: "daily",
                  duration: "30",
                  durationUnit: "days",
                  route: "Oral",
                  quantity: "30",
                  startDate: "2025-01-11",
                  endDate: "2025-02-10",
                  isPasserBy: "No",
                  comments: "Take with food to reduce stomach upset"
                }
              ]
            },
            {
              id: 2,
              patientId: 1002,
              patientName: "Grace Mulenga",
              prescriptionNumber: "PRX-2025-002",
              prescribedBy: "Dr. Sarah Banda",
              prescribedDate: "2025-01-11",
              status: "prescribed",
              validUntil: "2025-01-18",
              totalCost: 89.75,
              medications: [
                {
                  id: 2,
                  drugName: "Paracetamol",
                  dosage: "500mg",
                  itemPerDose: "1",
                  frequency: "Three times daily",
                  timePerUnit: "3",
                  frequencyUnit: "daily",
                  duration: "7",
                  durationUnit: "days",
                  route: "Oral",
                  quantity: "21",
                  startDate: "2025-01-11",
                  endDate: "2025-01-18",
                  isPasserBy: "No",
                  comments: "For pain and fever management"
                }
              ]
            },
            {
              id: 3,
              patientId: 1003,
              patientName: "Joyce Tembo",
              prescriptionNumber: "PRX-2025-003",
              prescribedBy: "Dr. Peter Kunda",
              prescribedDate: "2025-01-11",
              status: "prescribed",
              validUntil: "2025-01-18",
              totalCost: 245.00,
              medications: [
                {
                  id: 3,
                  drugName: "Amoxicillin",
                  dosage: "500mg",
                  itemPerDose: "1",
                  frequency: "Three times daily",
                  timePerUnit: "3",
                  frequencyUnit: "daily",
                  duration: "10",
                  durationUnit: "days",
                  route: "Oral",
                  quantity: "30",
                  startDate: "2025-01-11",
                  endDate: "2025-01-21",
                  isPasserBy: "No",
                  comments: "Complete full course even if symptoms improve"
                }
              ]
            },
            {
              id: 4,
              patientId: 1004,
              patientName: "Ruth Phiri",
              prescriptionNumber: "PRX-2025-004",
              prescribedBy: "Dr. Michael Zulu",
              prescribedDate: "2025-01-11",
              status: "prescribed",
              validUntil: "2025-01-18",
              totalCost: 175.25,
              medications: [
                {
                  id: 4,
                  drugName: "Sulfadoxine-Pyrimethamine",
                  dosage: "500mg + 25mg",
                  itemPerDose: "3",
                  frequency: "Single dose",
                  timePerUnit: "1",
                  frequencyUnit: "once",
                  duration: "1",
                  durationUnit: "day",
                  route: "Oral",
                  quantity: "3",
                  startDate: "2025-01-11",
                  endDate: "2025-01-11",
                  isPasserBy: "No",
                  comments: "IPTp-SP for malaria prevention during pregnancy"
                }
              ]
            },
            {
              id: 5,
              patientId: 1005,
              patientName: "Esther Mwape",
              prescriptionNumber: "PRX-2025-005",
              prescribedBy: "Dr. Agnes Chilufya",
              prescribedDate: "2025-01-11",
              status: "prescribed",
              validUntil: "2025-01-18",
              totalCost: 320.00,
              medications: [
                {
                  id: 5,
                  drugName: "Efavirenz",
                  dosage: "600mg",
                  itemPerDose: "1",
                  frequency: "Once daily",
                  timePerUnit: "1",
                  frequencyUnit: "daily",
                  duration: "30",
                  durationUnit: "days",
                  route: "Oral",
                  quantity: "30",
                  startDate: "2025-01-11",
                  endDate: "2025-02-10",
                  isPasserBy: "No",
                  comments: "HIV treatment - take at bedtime to reduce side effects"
                }
              ]
            }
          ]
          
          prescriptionsData = samplePrescriptions
          localStorage.setItem("prescriptions", JSON.stringify(samplePrescriptions))
        }
        
        const prescribed = prescriptionsData.filter((p) => p.status === "prescribed")
        const dispensed = prescriptionsData.filter((p) => p.status === "dispensed")
        setPrescriptions(prescribed)
        setDispensedMedications(dispensed)
      } catch (error) {
        console.error("Error initializing prescriptions:", error)
      }
    }

    initializePrescriptions()
  }, [])



  const handleDispenseClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setCurrentView("dispenseList")
  }

  const handleBackClick = () => {
    if (currentView === "dispensation") {
      setLocation("/pharmacy")
    } else {
      setCurrentView("dispensation")
      setSelectedPrescription(null)
    }
  }

  const handleFinalDispense = () => {
    if (!selectedPrescription) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const updatedPrescription = { ...selectedPrescription, status: "dispensed" as const }
      
      // Update localStorage
      const savedPrescriptions = localStorage.getItem("prescriptions")
      if (savedPrescriptions) {
        const parsed: Prescription[] = JSON.parse(savedPrescriptions)
        const updated = parsed.map(p => 
          p.id === selectedPrescription.id ? updatedPrescription : p
        )
        localStorage.setItem("prescriptions", JSON.stringify(updated))
      }
      
      // Update state
      setPrescriptions(prev => prev.filter(p => p.id !== selectedPrescription.id))
      setDispensedMedications(prev => [...prev, updatedPrescription])
      
      setIsLoading(false)
      setCurrentView("dispensation")
      setSelectedPrescription(null)
    }, 1000)
  }

  const PatientInfoCard = () => (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
          <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Date of Birth</p>
          <p className="text-gray-600">{patient.dateOfBirth}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Sex</p>
          <p className="text-gray-600">{patient.sex}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Age</p>
          <p className="text-gray-600">{patient.age} years</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Cellphone</p>
          <p className="text-gray-600">{patient.cellphone}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">NUPIN</p>
          <p className="text-gray-600">{patient.nupn}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">NRC</p>
          <p className="text-gray-600">{patient.nrc}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Address</p>
          <p className="text-gray-600">{patient.address}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Emergency Contact</p>
          <p className="text-gray-600">{patient.emergencyContact}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Allergies</p>
          <p className="text-gray-600">{patient.allergies}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Insurance</p>
          <p className="text-gray-600">{patient.insurance}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Last Visit</p>
          <p className="text-gray-600">{patient.lastVisit}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Doctor</p>
          <p className="text-gray-600">{patient.doctor}</p>
        </div>
      </div>
    </div>
  )

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span>Prescription #{prescription.prescriptionNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600">Pending</span>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Prescribed by: {prescription.prescribedBy} | Date: {prescription.prescribedDate}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prescription.medications.map((med, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{med.drugName}</h4>
                <span className="text-sm text-gray-500">Qty: {med.quantity}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>Dosage: {med.dosage}</div>
                <div>Frequency: {med.frequency}</div>
                <div>Duration: {med.duration} {med.durationUnit}</div>
                <div>Route: {med.route}</div>
              </div>
              {med.comments && (
                <div className="mt-2 text-sm text-gray-600">
                  Comments: {med.comments}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={() => handleDispenseClick(prescription)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Package className="w-4 h-4 mr-2" />
            Dispense
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const DispenseListView = () => {
    if (!selectedPrescription) return null

    return (
      <div className="space-y-6">
        <PatientInfoCard />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Dispensation Details
            </CardTitle>
            <p className="text-sm text-gray-600">
              Prescription #{selectedPrescription.prescriptionNumber} - {selectedPrescription.prescribedDate}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPrescription.medications.map((med, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-lg">{med.drugName}</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Ready to Dispense</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <Label className="text-gray-600">Quantity</Label>
                      <p className="font-medium">{med.quantity}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Dosage</Label>
                      <p className="font-medium">{med.dosage}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Frequency</Label>
                      <p className="font-medium">{med.frequency}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Duration</Label>
                      <p className="font-medium">{med.duration} {med.durationUnit}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Route</Label>
                      <p className="font-medium">{med.route}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Start Date</Label>
                      <p className="font-medium">{med.startDate}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">End Date</Label>
                      <p className="font-medium">{med.endDate}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Passer By</Label>
                      <p className="font-medium">{med.isPasserBy}</p>
                    </div>
                  </div>
                  
                  {med.comments && (
                    <div className="mt-3">
                      <Label className="text-gray-600">Comments</Label>
                      <p className="text-sm">{med.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setCurrentView("dispensation")}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinalDispense}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Dispensing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Dispensation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const MainDispensationView = () => (
    <div className="space-y-6">
      <PatientInfoCard />
      
      {/* Pending Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Prescriptions ({prescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No pending prescriptions found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispensed Medications */}
      {dispensedMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recently Dispensed ({dispensedMedications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dispensedMedications.slice(0, 5).map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Prescription #{prescription.prescriptionNumber}</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Dispensed</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Patient: {prescription.patientName} | Prescribed: {prescription.prescribedDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    Medications: {prescription.medications.map(m => m.drugName).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentView === "dispensation" ? "Back to Pharmacy" : "Back to Dispensation"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dispensation Management</h1>
            <p className="text-gray-600">
              {currentView === "dispensation" 
                ? "Manage prescription dispensations" 
                : "Complete medication dispensation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Content */}
      {currentView === "dispensation" && <MainDispensationView />}
      {currentView === "dispenseList" && <DispenseListView />}
    </div>
  )
}