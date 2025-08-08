"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, ChevronDown, Trash2, Edit } from "lucide-react"

interface Drug {
  id: number
  name: string
  dosage: string
  unit: string
  category: string
}

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

// Add this prop to the PrescriptionForm component
interface PrescriptionFormProps {
  onSaveComplete?: () => void
}

export default function PrescriptionForm({ onSaveComplete }: PrescriptionFormProps = {}) {
  const [drugCategory, setDrugCategory] = useState("general")
  const [searchMethod, setSearchMethod] = useState("drugs")
  const [searchTerm, setSearchTerm] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [medicationsCart, setMedicationsCart] = useState<Medication[]>([])
  const [showGuidance, setShowGuidance] = useState(false)

  const [formData, setFormData] = useState({
    drugName: "",
    dosage: "",
    itemPerDose: "",
    frequency: "",
    timePerUnit: "",
    frequencyUnit: "",
    duration: "",
    durationUnit: "",
    route: "",
    quantity: "",
    startDate: "08-07-2025",
    endDate: "",
    isPasserBy: "No",
    comments: "",
  })

  const searchResultsRef = useRef<HTMLDivElement>(null)

  // Mock drug data
  const mockDrugs: Drug[] = [
    { id: 1, name: "Paracetamol", dosage: "500", unit: "mg", category: "Analgesic" },
    { id: 2, name: "Amoxicillin", dosage: "250", unit: "mg", category: "Antibiotic" },
    { id: 3, name: "Folic Acid", dosage: "5", unit: "mg", category: "Vitamin/Supplement" },
    { id: 4, name: "Iron", dosage: "200", unit: "mg", category: "Mineral Supplement" },
    { id: 5, name: "Calcium", dosage: "500", unit: "mg", category: "Mineral Supplement" },
    { id: 6, name: "Methyldopa", dosage: "250", unit: "mg", category: "Antihypertensive" },
  ]

  const filteredDrugs = mockDrugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectDrug = (drug: Drug) => {
    const drugDisplayName = `${drug.name} ${drug.dosage}${drug.unit}`
    handleInputChange("drugName", drugDisplayName)
    handleInputChange("dosage", `${drug.dosage}${drug.unit}`)
    setSearchTerm("")
    setShowResults(false)
  }

  const handleAddToCart = () => {
    if (!formData.drugName) {
      alert("Please select a drug first")
      return
    }

    const newMedication: Medication = {
      id: Date.now(),
      ...formData,
    }

    setMedicationsCart((prev) => [...prev, newMedication])

    // Reset form
    setFormData((prev) => ({
      ...prev,
      drugName: "",
      dosage: "",
      itemPerDose: "",
      frequency: "",
      timePerUnit: "",
      frequencyUnit: "",
      duration: "",
      durationUnit: "",
      route: "",
      quantity: "",
      endDate: "",
      comments: "",
    }))
  }

  const handleRemoveFromCart = (id: number) => {
    setMedicationsCart((prev) => prev.filter((med) => med.id !== id))
  }

  const handleSavePrescription = async () => {
    if (medicationsCart.length === 0) {
      alert("Please add at least one medication to the cart")
      return
    }

    try {
      // Simulate saving prescription
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Saving prescription:", {
        medications: medicationsCart,
        prescribedBy: "Current User",
        prescribedDate: new Date().toISOString(),
      })

      alert("Prescription saved successfully!")

      // Clear the cart
      setMedicationsCart([])

      // Navigate to dispensation if callback provided
      if (onSaveComplete) {
        onSaveComplete()
      }
    } catch (error) {
      alert("Failed to save prescription")
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pharmacy Prescription</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Search & Add Medication */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Search & Add Medication</h3>

              {/* Clinical Guidance */}
              <div>
                <button
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                  onClick={() => setShowGuidance(!showGuidance)}
                >
                  <span className="text-gray-700">Clinical Guidance</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGuidance ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Drug Categories */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    drugCategory === "general"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setDrugCategory("general")}
                >
                  General Drugs
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium border-l border-gray-300 ${
                    drugCategory === "arv" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setDrugCategory("arv")}
                >
                  ARVs & ATT drugs
                </button>
              </div>

              {/* Search Methods */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium ${
                    searchMethod === "drugs" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSearchMethod("drugs")}
                >
                  Search by Drugs
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium border-l border-gray-300 ${
                    searchMethod === "physical"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSearchMethod("physical")}
                >
                  Search by Physical Systems
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium border-l border-gray-300 ${
                    searchMethod === "utility"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSearchMethod("utility")}
                >
                  Search by Utility
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium border-l border-gray-300 ${
                    searchMethod === "classes"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSearchMethod("classes")}
                >
                  Search by Classes
                </button>
              </div>

              {/* Search and Select Drug */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Search and Select Drug</Label>
                <div className="relative mt-1">
                  <Input
                    placeholder="Type to search medications..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowResults(e.target.value.length >= 2)
                    }}
                    onFocus={() => {
                      if (searchTerm.length >= 2) setShowResults(true)
                    }}
                    className="w-full"
                  />

                  {showResults && searchTerm.length >= 2 && (
                    <div
                      ref={searchResultsRef}
                      className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200"
                    >
                      {filteredDrugs.length > 0 ? (
                        filteredDrugs.map((drug) => (
                          <div
                            key={drug.id}
                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleSelectDrug(drug)}
                          >
                            <div className="font-medium">{drug.name}</div>
                            <div className="text-xs text-gray-500">
                              {drug.dosage}
                              {drug.unit} - {drug.category}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No drugs found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-4">
                {/* General Drug */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    General Drug <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter General Drug"
                    value={formData.drugName}
                    onChange={(e) => handleInputChange("drugName", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Dosage */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Dosage <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Dosage"
                    value={formData.dosage}
                    onChange={(e) => handleInputChange("dosage", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Item Per Dose */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Item Per Dose <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Item Per Dose"
                    value={formData.itemPerDose}
                    onChange={(e) => handleInputChange("itemPerDose", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Frequency"
                    value={formData.frequency}
                    onChange={(e) => handleInputChange("frequency", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Time Per (Time Unit) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Time Per (Time Unit) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.timePerUnit}
                    onValueChange={(value) => handleInputChange("timePerUnit", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency Unit (If not Time unit) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Frequency Unit (If not Time unit) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.frequencyUnit}
                    onValueChange={(value) => handleInputChange("frequencyUnit", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="times">Times</SelectItem>
                      <SelectItem value="doses">Doses</SelectItem>
                      <SelectItem value="tablets">Tablets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Duration Unit */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Duration Unit</Label>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => handleInputChange("durationUnit", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Route */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Route <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.route} onValueChange={(value) => handleInputChange("route", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Per-Oral (PO)</SelectItem>
                      <SelectItem value="iv">Intravenous (IV)</SelectItem>
                      <SelectItem value="im">Intramuscular (IM)</SelectItem>
                      <SelectItem value="sc">Subcutaneous (SC)</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="dd-mm-yyyy"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="mt-1 bg-gray-50"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                  <Input
                    placeholder="Enter Quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Is Passer By */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Is Passer By</Label>
                  <Select value={formData.isPasserBy} onValueChange={(value) => handleInputChange("isPasserBy", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Comments */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Comments</Label>
                  <Textarea
                    placeholder="Enter Comments"
                    value={formData.comments}
                    onChange={(e) => handleInputChange("comments", e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleAddToCart}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Right Side - Medication Cart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medication Cart</h3>

              {medicationsCart.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2">No medications added</div>
                    <p>Cart items will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicationsCart.map((medication) => (
                    <div key={medication.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Drug Name :</span> {medication.drugName}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Frequency :</span>{" "}
                          {medication.frequency || "1 Time Per"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Quantity :</span> {medication.quantity || "180"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Dosage :</span> {medication.dosage || "1"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Item Per Dosage :</span>{" "}
                          {medication.itemPerDose || "2"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duration :</span> {medication.duration || "3"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Start Date :</span> {medication.startDate}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Comment :</span> {medication.comments || ""}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Quantity :</span> {medication.quantity || "180"}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                          onClick={() => handleRemoveFromCart(medication.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="px-6 bg-transparent">
                      Close
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6" onClick={handleSavePrescription}>
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
