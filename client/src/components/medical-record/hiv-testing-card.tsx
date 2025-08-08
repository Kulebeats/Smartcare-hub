import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TestTube2, Edit, Plus } from "lucide-react"
import { HIVTestingModal } from "./hiv-testing-modal"
import { HIVTestingData } from "@/shared/schema"

interface HIVTestingCardProps {
  data?: HIVTestingData
  onUpdate: (data: HIVTestingData) => void
  isANCContext?: boolean
}

export function HIVTestingCard({ data, onUpdate, isANCContext = false }: HIVTestingCardProps) {
  const [showModal, setShowModal] = useState(false)



  const handleSave = (updatedData: HIVTestingData) => {
    const finalData = {
      ...updatedData,
      testStatus: 'completed' as const,
      completedDate: new Date(),
    }
    onUpdate(finalData)
    setShowModal(false)
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TestTube2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">HIV Testing</h3>
              <p className="text-sm text-gray-500">Comprehensive HIV testing and counseling protocols</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <Edit className="w-4 h-4" />
              Edit Record
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-4 h-4" />
              Add Record
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <HIVTestingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={data}
        isANCContext={isANCContext}
      />
    </>
  )
}