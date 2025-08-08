import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

interface PrepClinicalDecisionSupportModalProps {
  isOpen: boolean
  onClose: () => void
  riskData: {
    level: string
    score: number
    recommendations: string[]
    contraindications: string[]
    followUpFrequency: string
  }
}

export function PrepClinicalDecisionSupportModal({ 
  isOpen, 
  onClose, 
  riskData 
}: PrepClinicalDecisionSupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[85vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-900 flex items-center gap-2">
            <span>🩺</span>
            Clinical Decision Support - PrEP Assessment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Level Summary */}
          <div className={`p-4 rounded-lg border-2 ${
            riskData.level === "High Risk" ? "bg-red-50 border-red-300" :
            riskData.level === "Moderate Risk" ? "bg-yellow-50 border-yellow-300" :
            riskData.level === "Low Risk" ? "bg-green-50 border-green-300" :
            riskData.level === "Contraindicated" ? "bg-red-100 border-red-400" :
            "bg-gray-50 border-gray-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Risk Assessment Result</h3>
              <Badge variant={
                riskData.level === "High Risk" || riskData.level === "Contraindicated" ? "destructive" :
                riskData.level === "Moderate Risk" ? "outline" :
                "default"
              }>
                {riskData.level}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Risk Score: {riskData.score}/20</Label>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                  <div 
                    className={`h-3 rounded-full ${
                      riskData.score >= 10 ? "bg-red-500" :
                      riskData.score >= 5 ? "bg-yellow-500" :
                      "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((riskData.score / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Recommended Follow-up Frequency</Label>
                <p className="text-sm text-gray-700 font-medium">{riskData.followUpFrequency}</p>
              </div>
            </div>
          </div>

          {/* Contraindications - Show first if present */}
          {riskData.contraindications.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                Contraindications & Precautions
              </h3>
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-red-800">
                  IMPORTANT: Address these contraindications before considering PrEP initiation
                </p>
              </div>
              <ul className="space-y-3">
                {riskData.contraindications.map((contra, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-red-600 mt-1 font-bold">⚠</span>
                    <span className="text-sm text-red-800 font-medium">{contra}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clinical Recommendations */}
          {riskData.recommendations.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Clinical Recommendations
              </h3>
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-blue-800">
                  Evidence-based clinical guidance for ANC PrEP assessment and management
                </p>
              </div>
              <div className="space-y-4">
                {riskData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1 font-bold">•</span>
                    <div className="flex-1">
                      <span className="text-sm text-blue-800 font-medium">{rec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Decision Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📊</span>
              Clinical Decision Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Risk Level:</span>
                <span className="text-sm font-bold">{riskData.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Risk Score:</span>
                <span className="text-sm font-bold">{riskData.score}/15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Follow-up Frequency:</span>
                <span className="text-sm font-bold">{riskData.followUpFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Contraindications:</span>
                <span className="text-sm font-bold">{riskData.contraindications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Recommendations:</span>
                <span className="text-sm font-bold">{riskData.recommendations.length}</span>
              </div>
            </div>
          </div>

          {/* PrEP Recommendation */}
          <div className={`p-4 rounded-lg border-2 ${
            riskData.level === "Very High Risk" || riskData.level === "High Risk" ? "bg-green-50 border-green-300" :
            riskData.level === "Moderate Risk" ? "bg-yellow-50 border-yellow-300" :
            riskData.level === "Contraindicated" ? "bg-red-50 border-red-300" :
            "bg-blue-50 border-blue-300"
          }`}>
            <h3 className="font-bold text-lg mb-2">PrEP Recommendation</h3>
            <p className={`text-sm font-medium ${
              riskData.level === "Very High Risk" || riskData.level === "High Risk" ? "text-green-800" :
              riskData.level === "Moderate Risk" ? "text-yellow-800" :
              riskData.level === "Contraindicated" ? "text-red-800" :
              "text-blue-800"
            }`}>
              {riskData.level === "Very High Risk" ? "IMMEDIATE PrEP INITIATION STRONGLY RECOMMENDED" :
               riskData.level === "High Risk" ? "PrEP INITIATION STRONGLY RECOMMENDED" :
               riskData.level === "Moderate Risk" ? "PrEP RECOMMENDED WITH RISK REDUCTION COUNSELING" :
               riskData.level === "Low-Moderate Risk" ? "CONSIDER PrEP BASED ON INDIVIDUAL ASSESSMENT" :
               riskData.level === "Low Risk" ? "CONTINUE RISK REDUCTION COUNSELING" :
               riskData.level === "Contraindicated" ? "ADDRESS CONTRAINDICATIONS BEFORE PrEP CONSIDERATION" :
               "ASSESS INDIVIDUAL RISK FACTORS"}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button 
            onClick={onClose}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6 py-2"
          >
            Continue Assessment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}