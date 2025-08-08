import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Edit, Plus } from "lucide-react"
import { ANCPrepModal } from "./anc-prep-modal"
import { ANCPrepAssessmentData } from "@/shared/schema"
import { useToast } from "@/hooks/use-toast"

interface ANCPrepCardProps {
  data?: ANCPrepAssessmentData
  onUpdate: (data: ANCPrepAssessmentData) => void
  isVisible: boolean
}

export function ANCPrepCard({ data, onUpdate, isVisible }: ANCPrepCardProps) {
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()

  const handleSave = (prepData: ANCPrepAssessmentData) => {
    onUpdate(prepData)
    setShowModal(false)
  }

  const handleButtonClick = () => {
    setShowModal(true)
  }

  // Don't render card if not visible
  if (!isVisible) {
    return null
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">ANC PrEP Assessment</h3>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
              onClick={handleButtonClick}
            >
              <Edit className="w-4 h-4" />
              Edit Record
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
              onClick={handleButtonClick}
            >
              <Plus className="w-4 h-4" />
              Add Record
            </Button>
          </div>
        </CardContent>
      </Card>

      <ANCPrepModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={data}
      />
    </>
  )
}