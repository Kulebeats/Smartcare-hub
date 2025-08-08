import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, Clock, Users, Heart, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PrepRiskDecisionModalProps {
  isOpen: boolean
  onClose: () => void
  riskData: {
    level: "Moderate Risk" | "High Risk"
    score: number
    recommendations: string[]
    clinicalActions: string[]
    followUpFrequency: string
  }
  onInitiatePrEP?: () => void
  onScheduleFollowUp?: () => void
}

export function PrepRiskDecisionModal({ 
  isOpen, 
  onClose, 
  riskData,
  onInitiatePrEP,
  onScheduleFollowUp
}: PrepRiskDecisionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const isHighRisk = riskData.level === "High Risk"
  const isModerateRisk = riskData.level === "Moderate Risk"

  const handleInitiatePrEP = async () => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onInitiatePrEP?.()
      toast({
        title: "PrEP Initiation Recorded",
        description: `${riskData.level} assessment documented. PrEP counseling and prescription initiated.`,
        variant: "success"
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record PrEP initiation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScheduleFollowUp = async () => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onScheduleFollowUp?.()
      toast({
        title: "Follow-up Scheduled",
        description: `${riskData.followUpFrequency} follow-up appointment scheduled for PrEP assessment.`,
        variant: "success"
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAcknowledge = () => {
    toast({
      title: "Assessment Acknowledged",
      description: `${riskData.level} assessment has been reviewed and acknowledged.`,
      variant: "default"
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="prep-risk-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isHighRisk ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600" />
            )}
            PrEP Clinical Decision Support
          </DialogTitle>
          <DialogDescription id="prep-risk-modal-description">
            {isHighRisk 
              ? "High-risk assessment requires immediate PrEP consideration and clinical intervention."
              : "Moderate-risk assessment indicates PrEP counseling and follow-up are recommended."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Level Summary */}
          <div className={`p-4 rounded-lg border-2 ${
            isHighRisk ? "bg-red-50 border-red-300" : "bg-yellow-50 border-yellow-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Risk Assessment Result</h3>
              <Badge variant={isHighRisk ? "destructive" : "outline"}>
                {riskData.level}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Risk Score: {riskData.score}/20</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      riskData.score >= 6 ? "bg-red-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${Math.min((riskData.score / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Recommended Follow-up</div>
                <p className="text-sm text-gray-700 font-medium">{riskData.followUpFrequency}</p>
              </div>
            </div>
          </div>

          {/* Clinical Recommendations */}
          <div className={`border-2 rounded-lg p-4 ${
            isHighRisk ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
          }`}>
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${
              isHighRisk ? "text-red-900" : "text-yellow-900"
            }`}>
              <Heart className="w-5 h-5" />
              Clinical Recommendations
            </h3>
            <div className="space-y-3">
              {riskData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className={`w-4 h-4 mt-1 flex-shrink-0 ${
                    isHighRisk ? "text-red-600" : "text-yellow-600"
                  }`} />
                  <span className={`text-sm font-medium ${
                    isHighRisk ? "text-red-800" : "text-yellow-800"
                  }`}>
                    {rec}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Actions */}
          {riskData.clinicalActions?.length > 0 && (
            <div className={`border-2 rounded-lg p-4 ${
              isHighRisk ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
            }`}>
              <h3 className={`font-bold mb-3 flex items-center gap-2 ${
                isHighRisk ? "text-red-900" : "text-yellow-900"
              }`}>
                <AlertTriangle className="w-5 h-5" />
                {isHighRisk ? "Immediate Actions Required" : "Recommended Actions"}
              </h3>
              <div className="space-y-3">
                {riskData.clinicalActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      isHighRisk ? "bg-red-400" : "bg-yellow-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      isHighRisk ? "text-red-800" : "text-yellow-800"
                    }`}>
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {isHighRisk ? (
              <>
                <Button 
                  onClick={handleInitiatePrEP}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Initiate PrEP Now"}
                </Button>
                <Button 
                  onClick={handleScheduleFollowUp}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 rounded-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleInitiatePrEP}
                  disabled={isProcessing}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Offer PrEP Counseling"}
                </Button>
                <Button 
                  onClick={handleScheduleFollowUp}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50 rounded-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </>
            )}
            <Button 
              onClick={handleAcknowledge}
              disabled={isProcessing}
              variant="outline"
              className="rounded-full bg-gray-200 hover:bg-gray-300"
            >
              Acknowledge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}