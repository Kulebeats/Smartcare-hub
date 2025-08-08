"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import PharmacyPrescription from "./pharmacy-prescription"

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
}

interface Patient {
  name: string
  dateOfBirth: string
  age: number
  sex: string
  cellphone: string
  nupn: string
  nrc: string
  mothersName: string
}

type ViewType = "dispensation" | "dispenseList" | "editPrescription"

const DispensationManagement: React.FC = () => {
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

  // Load prescriptions from localStorage on component mount
  useEffect(() => {
    const loadPrescriptions = (): void => {
      try {
        const savedPrescriptions = localStorage.getItem("prescriptions")
        if (savedPrescriptions) {
          const parsed: Prescription[] = JSON.parse(savedPrescriptions)
          const prescribed = parsed.filter((p) => p.status === "prescribed")
          const dispensed = parsed.filter((p) => p.status === "dispensed")

          setPrescriptions(prescribed)
          setDispensedMedications(dispensed)
        }
      } catch (error) {
        console.error("Error loading prescriptions:", error)
      }
    }

    loadPrescriptions()
  }, [])

  const handleDispenseClick = (prescription: Prescription): void => {
    setSelectedPrescription(prescription)
    setCurrentView("dispenseList")
  }

  const handleEditClick = (prescription: Prescription): void => {
    setSelectedPrescription(prescription)
    setCurrentView("editPrescription")
  }

  const handleFinalDispense = async (): Promise<void> => {
    if (!selectedPrescription) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update prescription status
      const updatedPrescription: Prescription = {
        ...selectedPrescription,
        status: "dispensed",
      }

      // Update localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
      const updatedPrescriptions = allPrescriptions.map((p: Prescription) =>
        p.id === selectedPrescription.id ? updatedPrescription : p,
      )
      localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))

      // Update state
      setPrescriptions((prev) => prev.filter((p) => p.id !== selectedPrescription.id))
      setDispensedMedications((prev) => [...prev, updatedPrescription])

      alert("Medication dispensed successfully!")

      setCurrentView("dispensation")
      setSelectedPrescription(null)
    } catch (error) {
      alert("Failed to dispense medication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToDispensation = (): void => {
    setCurrentView("dispensation")
    setSelectedPrescription(null)
  }

  const handlePrescriptionSaved = (): void => {
    // Reload prescriptions after saving
    const savedPrescriptions = localStorage.getItem("prescriptions")
    if (savedPrescriptions) {
      const parsed: Prescription[] = JSON.parse(savedPrescriptions)
      const prescribed = parsed.filter((p) => p.status === "prescribed")
      setPrescriptions(prescribed)
    }
    setCurrentView("dispensation")
  }

  if (currentView === "editPrescription") {
    return <PharmacyPrescription onSaveComplete={handlePrescriptionSaved} onClose={handleBackToDispensation} />
  }

  if (currentView === "dispenseList") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBackToDispensation} className="mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dispense List
            </Button>
          </div>

          {/* Prescribed Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Prescribed</h2>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                Prescribed Date: {selectedPrescription?.prescribedDate}
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Prescribed by <span className="font-medium">Kuwani Banda</span> at{" "}
              <span className="font-medium">Anthu Omwe Health Center</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Drug Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Frequency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescription?.medications.map((medication) => (
                    <tr key={medication.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{medication.drugName}</td>
                      <td className="py-3 px-4">{medication.frequency}</td>
                      <td className="py-3 px-4">{medication.quantity}</td>
                      <td className="py-3 px-4">
                        {medication.duration} {medication.durationUnit}
                      </td>
                      <td className="py-3 px-4">{medication.route}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 bg-transparent">
                            Show Dispensed
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={handleFinalDispense}
                            disabled={isLoading}
                          >
                            {isLoading ? "Dispensing..." : "Dispense"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                  <option>5</option>
                  <option>10</option>
                  <option>25</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm">
                  {"<"}
                </Button>
                <Button size="sm" className="bg-blue-500 text-white">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  {">"}
                </Button>
                <Button variant="outline" size="sm">
                  {">>"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dispense
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 text-sm">
            <div>
              <div className="font-semibold text-blue-600 text-lg">{patient.name}</div>
            </div>
            <div>
              <div className="text-gray-600">Date of Birth</div>
              <div className="font-medium">{patient.dateOfBirth}</div>
            </div>
            <div>
              <div className="text-gray-600">Sex</div>
              <div className="font-medium">{patient.sex}</div>
            </div>
            <div>
              <div className="text-gray-600">Cellphone</div>
              <div className="font-medium">{patient.cellphone}</div>
            </div>
            <div>
              <div className="text-gray-600">NUPN</div>
              <div className="font-medium">{patient.nupn}</div>
            </div>
            <div>
              <div className="text-gray-600">NRC</div>
              <div className="font-medium">{patient.nrc}</div>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Mother's Name:</span>
            <span className="font-medium ml-2">{patient.mothersName}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prescribed Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Prescribed</h2>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              Order Date 08-Jul-2025
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Prescribed by <span className="font-medium">Anthu Omwe Health Center</span> at{" "}
              <span className="font-medium">Kuwani Banda</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Drug Name</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Frequency</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Duration</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Start Date</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No prescribed medications
                      </td>
                    </tr>
                  ) : (
                    prescriptions.map((prescription) =>
                      prescription.medications.map((medication) => (
                        <tr
                          key={`${prescription.id}-${medication.id}`}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3 text-sm">{medication.drugName}</td>
                          <td className="py-2 px-3 text-sm">{medication.frequency}</td>
                          <td className="py-2 px-3 text-sm">{medication.quantity}</td>
                          <td className="py-2 px-3 text-sm">
                            {medication.duration} {medication.durationUnit}
                          </td>
                          <td className="py-2 px-3 text-sm">{medication.startDate}</td>
                          <td className="py-2 px-3 text-sm">{medication.endDate}</td>
                        </tr>
                      )),
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons Row */}
            {prescriptions.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 bg-transparent"
                    onClick={() => handleDispenseClick(prescriptions[0])}
                  >
                    Dispense
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 bg-transparent"
                    onClick={() => handleEditClick(prescriptions[0])}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8">Submit</Button>
            </div>
          </div>

          {/* Dispensed Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Dispensed</h2>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              Dispensed Date 08-Jul-2025
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Drug Name</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Frequency</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Duration</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensedMedications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No dispensed medications
                      </td>
                    </tr>
                  ) : (
                    dispensedMedications.map((prescription) =>
                      prescription.medications.map((medication) => (
                        <tr key={`${prescription.id}-${medication.id}`} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-sm">{medication.drugName}</td>
                          <td className="py-2 px-3 text-sm">{medication.frequency}</td>
                          <td className="py-2 px-3 text-sm">{medication.quantity}</td>
                          <td className="py-2 px-3 text-sm">
                            {medication.duration} {medication.durationUnit}
                          </td>
                          <td className="py-2 px-3 text-sm">Regular dispensing</td>
                        </tr>
                      )),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensationManagement
