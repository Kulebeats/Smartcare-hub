"use client"

import { useState, useEffect } from "react"
import { X, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface Patient {
  id: string
  nrc: string
  nupn: string
  firstName: string
  lastName: string
  sex: string
  dob: string
  cellPhone: string
  motherName?: string
}

interface PatientSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPatientBind: (patient: Patient, relationshipType: string, attributes: string[]) => void
}

// Phase 2: Defensive Programming - Utility functions for data validation
const validateUniqueIds = (patients: Patient[]): { isValid: boolean; duplicates: string[] } => {
  const seenIds = new Set<string>()
  const duplicates: string[] = []
  
  for (const patient of patients) {
    if (seenIds.has(patient.id)) {
      duplicates.push(patient.id)
    } else {
      seenIds.add(patient.id)
    }
  }
  
  return {
    isValid: duplicates.length === 0,
    duplicates: [...new Set(duplicates)] // Remove duplicate entries in duplicates array
  }
}

// Enhanced patient array with validation
const createValidatedPatientList = (rawPatients: Patient[]): Patient[] => {
  const validation = validateUniqueIds(rawPatients)
  
  if (!validation.isValid) {
    console.warn(`⚠️ Duplicate patient IDs detected: ${validation.duplicates.join(', ')}`)
    // In development, this helps identify issues early
    if (import.meta.env.DEV) {
      console.error('Patient ID validation failed. Please ensure all patient IDs are unique.')
    }
  }
  
  return rawPatients
}

// Raw patient data that will be validated
const rawMockPatients: Patient[] = [
  {
    id: "1",
    nrc: "358916/61/1",
    nupn: "8ADB0225-A265-44",
    firstName: "CHANDA",
    lastName: "MWANZA",
    sex: "Male",
    dob: "1985-03-30T00:00:00",
    cellPhone: "+260977123456",
  },
  {
    id: "2",
    nrc: "358916/16/1",
    nupn: "E68A194A-C75E-48",
    firstName: "JOSEPH",
    lastName: "PHIRI",
    sex: "Male",
    dob: "1988-07-15T00:00:00",
    cellPhone: "+260966789012",
    motherName: "MARGARET",
  },
  {
    id: "3",
    nrc: "450123/85/1",
    nupn: "K9F2B845-D123-67",
    firstName: "DAVIES",
    lastName: "TEMBO",
    sex: "Male",
    dob: "1985-06-15T00:00:00",
    cellPhone: "+260955234567",
    motherName: "GRACE",
  },
  {
    id: "4",
    nrc: "450987/88/1", 
    nupn: "K8E4C123-F987-89",
    firstName: "MERCY",
    lastName: "SIMUKANGA",
    sex: "Female",
    dob: "1988-12-22T00:00:00",
    cellPhone: "+260976543210",
    motherName: "ESTHER",
  },
  {
    id: "5",
    nrc: "451456/90/1",
    nupn: "K7D9A567-B321-45",
    firstName: "PATRICK",
    lastName: "SAKALA",
    sex: "Male", 
    dob: "1990-09-10T00:00:00",
    cellPhone: "+260965551234",
    motherName: "BEATRICE",
  },
  {
    id: "6",
    nrc: "452789/87/1",
    nupn: "K6C8F234-A654-78",
    firstName: "ANGELA",
    lastName: "MUBANGA",
    sex: "Female",
    dob: "1987-04-18T00:00:00",
    cellPhone: "+260987778888",
    motherName: "JOYCE",
  },
  {
    id: "7",
    nrc: "453012/85/1",
    nupn: "K5B7E890-C432-12",
    firstName: "KENNEDY",
    lastName: "LUBINDA",
    sex: "Male",
    dob: "1985-11-03T00:00:00",
    cellPhone: "+260954443333",
    motherName: "PATRICIA",
  },
  {
    id: "8",
    nrc: "454321/92/1",
    nupn: "K4A6D123-E876-54",
    firstName: "FAITH",
    lastName: "MUSONDA",
    sex: "Female",
    dob: "1992-07-15T00:00:00",
    cellPhone: "+260962223333",
    motherName: "ALICE",
  },
  {
    id: "9",
    nrc: "455678/89/1",
    nupn: "K3C9F456-A210-98",
    firstName: "DANIEL",
    lastName: "MULONGOTI",
    sex: "Male",
    dob: "1989-01-28T00:00:00",
    cellPhone: "+260968887777",
    motherName: "RACHAEL",
  },
  {
    id: "10",
    nrc: "456789/91/1",
    nupn: "K2E8H789-B543-21",
    firstName: "MULENGA",
    lastName: "NYAMBE",
    sex: "Female",
    dob: "1991-05-12T00:00:00",
    cellPhone: "+260976665555",
    motherName: "FLORENCE",
  },
  {
    id: "11",
    nrc: "358916/12/1",
    nupn: "F72B285C-D86F-49",
    firstName: "MICHAEL",
    lastName: "ZULU",
    sex: "Male",
    dob: "1985-03-30T00:00:00",
    cellPhone: "+260963456789",
  },
]

// Validate and ensure unique IDs in the mock patients array
const mockPatients: Patient[] = createValidatedPatientList(rawMockPatients)

const relationshipTypes = [
  "Sibling",
  "Spouse",
  "Parent",
  "Child",
  "Cousin",
  "Grandparent",
  "Grandchild",
  "Uncle/Aunt",
  "Nephew/Niece",
  "In-laws (Father/Mother)",
  "In-laws (Son/Daughter)",
  "In-laws (Brother/Sister)",
  "Guardian",
  "Ward",
  "Stepparent",
  "Stepchild",
]

export function PatientSearchModal({ open, onOpenChange, onPatientBind }: PatientSearchModalProps) {
  const [activeTab, setActiveTab] = useState("NRC")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Search form states
  const [nrcSearch, setNrcSearch] = useState("")
  const [nupnSearch, setNupnSearch] = useState("")
  const [cellphoneSearch, setCellphoneSearch] = useState("")
  const [countryCode, setCountryCode] = useState("ZM (+260)")
  const [firstNameSearch, setFirstNameSearch] = useState("")
  const [lastNameSearch, setLastNameSearch] = useState("")
  const [dobSearch, setDobSearch] = useState("")
  const [genderSearch, setGenderSearch] = useState("")

  // Relationship binding states
  const [selectedRelationships, setSelectedRelationships] = useState<{ [key: string]: string }>({})
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>({})

  const handleSearch = () => {
    // Simulate search - in real app this would call an API
    setSearchResults(mockPatients)
    setSearchPerformed(true)
  }

  const handleRelationshipChange = (patientId: string, relationship: string) => {
    setSelectedRelationships((prev) => ({
      ...prev,
      [patientId]: relationship,
    }))
  }

  const handleAttributeChange = (patientId: string, attribute: string, checked: boolean) => {
    setSelectedAttributes((prev) => {
      const current = prev[patientId] || []
      if (checked) {
        return {
          ...prev,
          [patientId]: [...current, attribute],
        }
      } else {
        return {
          ...prev,
          [patientId]: current.filter((attr) => attr !== attribute),
        }
      }
    })
  }

  const handleBind = (patient: Patient) => {
    const relationshipType = selectedRelationships[patient.id]
    const attributes = selectedAttributes[patient.id] || []

    if (relationshipType) {
      onPatientBind(patient, relationshipType, attributes)
      onOpenChange(false)
    }
  }



  const renderSearchForm = () => {
    switch (activeTab) {
      case "NRC":
        return (
          <div className="space-y-4">
            <Input
              placeholder="------/--/-"
              value={nrcSearch}
              onChange={(e) => setNrcSearch(e.target.value)}
              className="text-center"
            />
          </div>
        )

      case "NUPN":
        return (
          <div className="space-y-4">
            <Input placeholder="Enter Enter NUPN" value={nupnSearch} onChange={(e) => setNupnSearch(e.target.value)} />
          </div>
        )

      case "Cellphone":
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZM (+260)">ZM (+260)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter Cellphone"
                value={cellphoneSearch}
                onChange={(e) => setCellphoneSearch(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        )

      case "Full Name":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="kuwani"
                value={firstNameSearch}
                onChange={(e) => setFirstNameSearch(e.target.value)}
              />
              <Input placeholder="banda" value={lastNameSearch} onChange={(e) => setLastNameSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="DOB" type="date" value={dobSearch} onChange={(e) => setDobSearch(e.target.value)} />
              <Select value={genderSearch} onValueChange={setGenderSearch}>
                <SelectTrigger>
                  <SelectValue placeholder="Male" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderSearchResults = () => {
    if (!searchPerformed) return null

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Show {itemsPerPage} entries</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1}>
              {"<"}
            </Button>
            <Badge variant="default">{currentPage}</Badge>
            <Button variant="outline" size="sm">
              {">"}
            </Button>
          </div>
        </div>

        {searchResults.map((patient) => (
          <div key={patient.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="font-semibold text-blue-600">
                  {patient.firstName} {patient.lastName}
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">NRC:</span> {patient.nrc}
                  </div>
                  <div>
                    <span className="font-medium">DOB:</span> {new Date(patient.dob).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Cell Phone:</span> {patient.cellPhone}
                  </div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Sex:</span> {patient.sex}
                </div>
                <div>
                  <span className="font-medium">NUPN:</span> {patient.nupn}
                </div>
                {patient.motherName && (
                  <div>
                    <span className="font-medium">Mother Name:</span> {patient.motherName}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Relation Type</label>
                <Select
                  value={selectedRelationships[patient.id] || ""}
                  onValueChange={(value) => handleRelationshipChange(patient.id, value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`household-${patient.id}`}
                      checked={(selectedAttributes[patient.id] || []).includes("Household")}
                      onCheckedChange={(checked) => handleAttributeChange(patient.id, "Household", checked as boolean)}
                    />
                    <label htmlFor={`household-${patient.id}`} className="text-sm">
                      Household
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`buddy-${patient.id}`}
                      checked={(selectedAttributes[patient.id] || []).includes("Buddy")}
                      onCheckedChange={(checked) => handleAttributeChange(patient.id, "Buddy", checked as boolean)}
                    />
                    <label htmlFor={`buddy-${patient.id}`} className="text-sm">
                      Buddy
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`tb-contact-${patient.id}`}
                      checked={(selectedAttributes[patient.id] || []).includes("TB Contact")}
                      onCheckedChange={(checked) => handleAttributeChange(patient.id, "TB Contact", checked as boolean)}
                    />
                    <label htmlFor={`tb-contact-${patient.id}`} className="text-sm">
                      TB Contact
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`guardian-${patient.id}`}
                      checked={(selectedAttributes[patient.id] || []).includes("Guardian")}
                      onCheckedChange={(checked) => handleAttributeChange(patient.id, "Guardian", checked as boolean)}
                    />
                    <label htmlFor={`guardian-${patient.id}`} className="text-sm">
                      Guardian
                    </label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`hts-index-${patient.id}`}
                    checked={(selectedAttributes[patient.id] || []).includes("HTS Index")}
                    onCheckedChange={(checked) => handleAttributeChange(patient.id, "HTS Index", checked as boolean)}
                  />
                  <label htmlFor={`hts-index-${patient.id}`} className="text-sm">
                    HTS Index
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => handleBind(patient)}
                  disabled={!selectedRelationships[patient.id]}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Bind
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Search Client
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Search for patients by NRC, NUPN, or cellphone number to create relationships
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {["NRC", "NUPN", "Cellphone", "Full Name"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-blue-500 text-white" : "text-gray-700 hover:text-gray-900 bg-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="space-y-4">
            {renderSearchForm()}
            <Button onClick={handleSearch} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Search Results */}
          {renderSearchResults()}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}