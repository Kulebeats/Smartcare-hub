import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BehavioralCounsellingData } from "../../../../shared/schema";

interface BehavioralCounsellingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BehavioralCounsellingData) => void;
  clientProfile?: {
    daily_caffeine_intake?: string;
    tobacco_use_smoking?: string;
    tobacco_use_sniffing?: string;
    anyone_smokes_in_household?: string;
    uses_alcohol_substances?: string[];
  };
  existingData?: BehavioralCounsellingData;
}

export default function BehavioralCounsellingModal({
  isOpen,
  onClose,
  onSave,
  clientProfile,
  existingData
}: BehavioralCounsellingModalProps) {
  const [formData, setFormData] = useState<BehavioralCounsellingData>(existingData || {});

  // Determine which counselling types should be shown based on client profile
  const showCaffeineCounselling = clientProfile?.daily_caffeine_intake === "yes";
  const showTobaccoCounselling = clientProfile?.tobacco_use_smoking === "yes" || clientProfile?.tobacco_use_sniffing === "yes";
  const showSecondHandSmokeCounselling = clientProfile?.anyone_smokes_in_household === "yes";
  const showAlcoholSubstanceCounselling = clientProfile?.uses_alcohol_substances && 
    clientProfile.uses_alcohol_substances.some(substance => 
      ["alcohol", "marijuana", "cocaine", "injectable_drugs"].includes(substance.toLowerCase())
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReasonChange = (counsellingType: string, reasons: string[]) => {
    setFormData(prev => ({
      ...prev,
      [`reason_${counsellingType}_counselling_was_not_done`]: reasons
    }));
  };

  const handleSpecifyChange = (counsellingType: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [`${counsellingType}_other_specify`]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Behavioral Counselling Assessment</DialogTitle>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Caffeine Counselling */}
          {showCaffeineCounselling && (
            <div className="space-y-4 border border-orange-200 rounded p-4 bg-[#fff7ed00] text-[#080808]">
              <h4 className="font-medium text-orange-800">Caffeine Reduction Counselling</h4>
              <p className="text-sm text-orange-700">Required due to daily caffeine intake reported in client profile</p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Caffeine reduction counselling</label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="caffeine_done"
                      name="caffeine_counselling"
                      value="done"
                      checked={formData.caffeine_counselling === 'done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, caffeine_counselling: e.target.value as 'done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="caffeine_done" className="text-sm">Done</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="caffeine_not_done"
                      name="caffeine_counselling"
                      value="not_done"
                      checked={formData.caffeine_counselling === 'not_done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, caffeine_counselling: e.target.value as 'not_done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="caffeine_not_done" className="text-sm">Not done</label>
                  </div>
                </div>

                {formData.caffeine_counselling === 'not_done' && (
                  <div className="ml-4 space-y-3">
                    <label className="block text-sm font-medium">Reason why caffeine counselling was not done</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="caffeine_referred"
                          value="referred_instead"
                          checked={formData.reason_caffeine_counselling_was_not_done?.includes('referred_instead') || false}
                          onChange={(e) => {
                            const current = formData.reason_caffeine_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'referred_instead']
                              : current.filter(r => r !== 'referred_instead');
                            handleReasonChange('caffeine', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="caffeine_referred" className="text-sm">Referred instead</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="caffeine_other"
                          value="other_specify"
                          checked={formData.reason_caffeine_counselling_was_not_done?.includes('other_specify') || false}
                          onChange={(e) => {
                            const current = formData.reason_caffeine_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'other_specify']
                              : current.filter(r => r !== 'other_specify');
                            handleReasonChange('caffeine', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="caffeine_other" className="text-sm">Other (specify)</label>
                      </div>
                      
                      {formData.reason_caffeine_counselling_was_not_done?.includes('other_specify') && (
                        <div className="ml-6">
                          <input
                            type="text"
                            placeholder="Specify the reason"
                            value={formData.caffeine_other_specify || ''}
                            onChange={(e) => handleSpecifyChange('caffeine', e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tobacco Counselling */}
          {showTobaccoCounselling && (
            <div className="space-y-4 border border-red-200 rounded p-4 bg-red-50">
              <h4 className="font-medium text-red-800">Tobacco Cessation Counselling</h4>
              <p className="text-sm text-red-700">Required due to tobacco use reported in client profile</p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Tobacco cessation counselling</label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="tobacco_done"
                      name="tobacco_counselling"
                      value="done"
                      checked={formData.tobacco_counselling === 'done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, tobacco_counselling: e.target.value as 'done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="tobacco_done" className="text-sm">Done</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="tobacco_not_done"
                      name="tobacco_counselling"
                      value="not_done"
                      checked={formData.tobacco_counselling === 'not_done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, tobacco_counselling: e.target.value as 'not_done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="tobacco_not_done" className="text-sm">Not done</label>
                  </div>
                </div>

                {formData.tobacco_counselling === 'not_done' && (
                  <div className="ml-4 space-y-3">
                    <label className="block text-sm font-medium">Reason why tobacco counselling was not done</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="tobacco_referred"
                          value="referred_instead"
                          checked={formData.reason_tobacco_counselling_was_not_done?.includes('referred_instead') || false}
                          onChange={(e) => {
                            const current = formData.reason_tobacco_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'referred_instead']
                              : current.filter(r => r !== 'referred_instead');
                            handleReasonChange('tobacco', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="tobacco_referred" className="text-sm">Referred instead</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="tobacco_other"
                          value="other_specify"
                          checked={formData.reason_tobacco_counselling_was_not_done?.includes('other_specify') || false}
                          onChange={(e) => {
                            const current = formData.reason_tobacco_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'other_specify']
                              : current.filter(r => r !== 'other_specify');
                            handleReasonChange('tobacco', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="tobacco_other" className="text-sm">Other (specify)</label>
                      </div>
                      
                      {formData.reason_tobacco_counselling_was_not_done?.includes('other_specify') && (
                        <div className="ml-6">
                          <input
                            type="text"
                            placeholder="Specify the reason"
                            value={formData.tobacco_other_specify || ''}
                            onChange={(e) => handleSpecifyChange('tobacco', e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Second Hand Smoke Counselling */}
          {showSecondHandSmokeCounselling && (
            <div className="space-y-4 border border-purple-200 rounded p-4 bg-[#faf5ff00]">
              <h4 className="font-medium text-purple-800">Second Hand Smoke Counselling</h4>
              <p className="text-sm text-purple-700">Required due to household smoking reported in client profile</p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Second hand smoke counselling</label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="secondhand_done"
                      name="second_hand_smoking"
                      value="done"
                      checked={formData.second_hand_smoking === 'done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, second_hand_smoking: e.target.value as 'done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="secondhand_done" className="text-sm">Done</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="secondhand_not_done"
                      name="second_hand_smoking"
                      value="not_done"
                      checked={formData.second_hand_smoking === 'not_done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, second_hand_smoking: e.target.value as 'not_done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="secondhand_not_done" className="text-sm">Not done</label>
                  </div>
                </div>

                {formData.second_hand_smoking === 'not_done' && (
                  <div className="ml-4 space-y-3">
                    <label className="block text-sm font-medium">Reason why second hand smoke counselling was not done</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="secondhand_referred"
                          value="referred_instead"
                          checked={formData.secondhand_counselling_was_not_done?.includes('referred_instead') || false}
                          onChange={(e) => {
                            const current = formData.secondhand_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'referred_instead']
                              : current.filter(r => r !== 'referred_instead');
                            handleReasonChange('secondhand', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="secondhand_referred" className="text-sm">Referred instead</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="secondhand_other"
                          value="other_specify"
                          checked={formData.secondhand_counselling_was_not_done?.includes('other_specify') || false}
                          onChange={(e) => {
                            const current = formData.secondhand_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'other_specify']
                              : current.filter(r => r !== 'other_specify');
                            handleReasonChange('secondhand', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="secondhand_other" className="text-sm">Other (specify)</label>
                      </div>
                      
                      {formData.secondhand_counselling_was_not_done?.includes('other_specify') && (
                        <div className="ml-6">
                          <input
                            type="text"
                            placeholder="Specify the reason"
                            value={formData.secondhand_other_specify || ''}
                            onChange={(e) => handleSpecifyChange('secondhand', e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alcohol/Substance Counselling */}
          {showAlcoholSubstanceCounselling && (
            <div className="space-y-4 border border-yellow-200 rounded p-4 bg-[#fefce800]">
              <h4 className="font-medium text-yellow-800">Alcohol/Substance Use Counselling</h4>
              <p className="text-sm text-yellow-700">Required due to alcohol/substance use reported in client profile</p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Alcohol/substance use counselling</label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="alcohol_substance_done"
                      name="alcohol_substance_counselling"
                      value="done"
                      checked={formData.alcohol_substance_counselling === 'done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, alcohol_substance_counselling: e.target.value as 'done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="alcohol_substance_done" className="text-sm">Done</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="alcohol_substance_not_done"
                      name="alcohol_substance_counselling"
                      value="not_done"
                      checked={formData.alcohol_substance_counselling === 'not_done'}
                      onChange={(e) => setFormData(prev => ({ ...prev, alcohol_substance_counselling: e.target.value as 'not_done' }))}
                      className="text-blue-600"
                    />
                    <label htmlFor="alcohol_substance_not_done" className="text-sm">Not done</label>
                  </div>
                </div>

                {formData.alcohol_substance_counselling === 'not_done' && (
                  <div className="ml-4 space-y-3">
                    <label className="block text-sm font-medium">Reason why alcohol/substance counselling was not done</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="alcohol_substance_referred"
                          value="referred_instead"
                          checked={formData.substance_or_alcohol_counselling_was_not_done?.includes('referred_instead') || false}
                          onChange={(e) => {
                            const current = formData.substance_or_alcohol_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'referred_instead']
                              : current.filter(r => r !== 'referred_instead');
                            handleReasonChange('substance_or_alcohol', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="alcohol_substance_referred" className="text-sm">Referred instead</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="alcohol_substance_other"
                          value="other_specify"
                          checked={formData.substance_or_alcohol_counselling_was_not_done?.includes('other_specify') || false}
                          onChange={(e) => {
                            const current = formData.substance_or_alcohol_counselling_was_not_done || [];
                            const updated = e.target.checked 
                              ? [...current, 'other_specify']
                              : current.filter(r => r !== 'other_specify');
                            handleReasonChange('substance_or_alcohol', updated);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="alcohol_substance_other" className="text-sm">Other (specify)</label>
                      </div>
                      
                      {formData.substance_or_alcohol_counselling_was_not_done?.includes('other_specify') && (
                        <div className="ml-6">
                          <input
                            type="text"
                            placeholder="Specify the reason"
                            value={formData.alcohol_substance_other_specify || ''}
                            onChange={(e) => handleSpecifyChange('alcohol_substance', e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show message if no counselling is required */}
          {!showCaffeineCounselling && !showTobaccoCounselling && !showSecondHandSmokeCounselling && !showAlcoholSubstanceCounselling && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No behavioral counselling required based on current client profile.</p>
              <p className="text-xs mt-2">Counselling requirements are determined by risk factors in the client profile such as caffeine intake, tobacco use, household smoking, and alcohol/substance use.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              disabled={!showCaffeineCounselling && !showTobaccoCounselling && !showSecondHandSmokeCounselling && !showAlcoholSubstanceCounselling}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}