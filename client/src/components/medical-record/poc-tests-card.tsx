import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Beaker, Edit, Plus } from "lucide-react"
import { POCTestOrderDialog } from "./poc-test-order-dialog"
import { POCTestData } from "@shared/schema"
import { ClinicalDecisionSupportModal, CDSSCondition } from "./clinical-decision-support-modal"
import { evaluatePOCTestResult } from "./poc-tests-cdss"

interface POCTestsCardProps {
  data?: POCTestData[]
  onUpdate: (data: POCTestData[]) => void
}

export function POCTestsCard({ data, onUpdate }: POCTestsCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [showCDSSModal, setShowCDSSModal] = useState(false)
  const [currentCDSSCondition, setCurrentCDSSCondition] = useState<CDSSCondition | null>(null)



  const handleSave = (newTests: POCTestData[]) => {
    const updatedTests = [...(data || []), ...newTests]
    
    // Evaluate new tests for CDSS alerts
    newTests.forEach(test => {
      if (test.result && test.result.numericResult) {
        const condition = evaluatePOCTestResult(test.selectTest, parseFloat(test.result.numericResult));
        if (condition) {
          setCurrentCDSSCondition(condition);
          setShowCDSSModal(true);
        }
      }
    });
    
    onUpdate(updatedTests)
    setShowModal(false)
  }

  const handleCDSSClose = () => {
    setShowCDSSModal(false);
    setCurrentCDSSCondition(null);
  }



  return (
    <>
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Beaker className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Point of Care Tests</h3>
              <p className="text-sm text-gray-500">Rapid diagnostic tests with immediate results</p>
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
      
      <POCTestOrderDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
      
      <ClinicalDecisionSupportModal
        condition={currentCDSSCondition}
        isOpen={showCDSSModal}
        onClose={handleCDSSClose}
        onConfirm={() => {
          // Handle CDSS confirmation if needed
          handleCDSSClose();
        }}
      />
    </>
  )
}