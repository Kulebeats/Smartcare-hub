import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Scale, Shield, FileText } from "lucide-react";

const agreementSchema = z.object({
  userAgreement: z.boolean().refine(val => val === true, {
    message: "You must agree to the User Accountability Agreement to proceed"
  }),
});

type AgreementForm = z.infer<typeof agreementSchema>;

interface AgreementStepProps {
  data: AgreementForm;
  onNext: (data: AgreementForm) => void;
  onPrevious: () => void;
  isLastStep: boolean;
}

export default function AgreementStep({ data, onNext, onPrevious, isLastStep }: AgreementStepProps) {
  const form = useForm<AgreementForm>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      userAgreement: data?.userAgreement || false,
    },
  });

  const handleSubmit = (formData: AgreementForm) => {
    onNext(formData);
  };

  const isAgreed = form.watch("userAgreement");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">User Accountability Agreement</h2>
        <p className="text-gray-600 mt-2">Please review and accept the terms of use for SmartCare Pro</p>
      </div>

      <Card className="border-2 border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Legal Agreement Required
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-96 w-full border rounded-md p-4 bg-gray-50">
            <div className="space-y-4 text-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">SmartCare Pro User Accountability Agreement</h3>
                <p className="text-gray-700 font-medium">
                  By accessing SmartCare Pro, I acknowledge full responsibility for all activities under my account and agree to comply with Zambian law.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    1. Account Responsibility & Security
                  </h4>
                  <div className="space-y-2 text-gray-700 pl-6">
                    <p><strong>Account Responsibility:</strong> I am solely responsible for all actions, transactions, and activities performed under my account, whether authorized by me or not. This includes any data entry, modifications, or access to patient records or system functions conducted using my credentials.</p>
                    
                    <p><strong>Safeguarding Credentials:</strong> I undertake to protect my username, password, and any two-factor authentication methods associated with my account. I will not share my credentials with any other individual, as stipulated under Section 25 of the Data Protection Act, 2021, which mandates data controllers and processors to implement appropriate security measures to protect personal data.</p>
                    
                    <p><strong>Liability for Misuse:</strong> I acknowledge that any unauthorized or negligent use of my account that results in data breaches, unauthorized access, or harm to patients or the healthcare system may lead to disciplinary action, termination of access, and potential legal consequences as prescribed under Zambian law.</p>
                    
                    <div className="mt-2">
                      <p className="font-medium">Additional security requirements:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Use multi-factor authentication as required</li>
                        <li>Immediately report any suspected unauthorized access</li>
                        <li>Log out properly after each session</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4" />
                    2. Legal Compliance
                  </h4>
                  <div className="space-y-2 text-gray-700 pl-6">
                    <p>I understand that account misuse violates Zambian law and agree to comply with:</p>
                    
                    <div>
                      <p className="font-medium">Data Protection Act, 2021:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Section 25: Implement appropriate security measures for personal data</li>
                        <li>Section 29: Process data only in ways that do not cause harm to patients</li>
                        <li>Section 44: Unauthorized processing penalty - up to 500,000 penalty units or 5 years imprisonment</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Electronic Communications and Transactions Act, 2021:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Section 54: Unauthorized system access penalty - up to 300,000 penalty units or 3 years imprisonment</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Healthcare Professional Standards:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Public Health Act, Cap. 295: Maintain professional conduct and patient safety standards</li>
                        <li>Medical and Allied Professions Act, 2021: Uphold medical ethics and professional accountability</li>
                        <li>Nurses and Midwives Act, 2022: Adhere to nursing professional conduct requirements</li>
                        <li>Health Professions Act, 2009: Comply with healthcare practitioner licensing obligations</li>
                        <li>Patient confidentiality and duty of care as mandated by medical law</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    3. Consequences of Misuse
                  </h4>
                  <div className="space-y-2 text-gray-700 pl-6">
                    <p>Unauthorized or negligent account use may result in:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Immediate account suspension or termination</li>
                      <li>Criminal charges under data protection, cybercrime, and medical professional laws</li>
                      <li>Professional disciplinary action by medical boards and potential license revocation</li>
                      <li>Medical malpractice liability for patient harm resulting from data misuse</li>
                      <li>Breach of professional duty under healthcare practitioner codes</li>
                      <li>Civil liability for damages caused to patients or the healthcare system</li>
                      <li>Financial penalties as prescribed under Zambian law</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    4. Monitoring & Reporting
                  </h4>
                  <div className="space-y-2 text-gray-700 pl-6">
                    <p>I consent to:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Continuous monitoring of my account activities for security and compliance</li>
                      <li>Mandatory reporting of suspected breaches within 2 hours to system administrators</li>
                      <li>Formal breach notification to the Data Protection Office within 72 hours as required by law</li>
                      <li>Participation in security audits and compliance assessments</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    5. Professional Obligations
                  </h4>
                  <div className="space-y-2 text-gray-700 pl-6">
                    <p>As a healthcare professional, I commit to:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Processing patient data only for legitimate medical purposes and within scope of practice</li>
                      <li>Upholding the Hippocratic Oath and professional medical ethics</li>
                      <li>Maintaining clinical records accuracy as required by medical practice standards</li>
                      <li>Respecting patient autonomy and informed consent principles</li>
                      <li>Ensuring continuity of care through proper documentation and data management</li>
                      <li>Complying with medical audit and quality assurance requirements</li>
                      <li>Reporting adverse events or patient safety concerns as mandated by medical law</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Acknowledgment:</h4>
                  <p className="text-gray-700 text-sm">
                    I understand this agreement is governed by Zambian law. Violations will be prosecuted under applicable statutes including the Data Protection Act, 2021, Electronic Communications and Transactions Act, 2021, and relevant medical practice laws. I may face proceedings in Zambian courts, the Data Protection Tribunal, medical disciplinary boards (Health Professions Council of Zambia, Medical Council of Zambia, Nurses and Midwives Council), or professional regulatory bodies.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userAgreement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-base font-medium text-blue-900">
                    I agree to this User Accountability Agreement and understand my legal obligations under Zambian law.
                  </FormLabel>
                  <FormDescription className="text-blue-700">
                    By checking this box, you acknowledge that you have read, understood, and agree to comply with all terms and conditions outlined in the User Accountability Agreement.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormMessage />

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="px-8"
            >
              Previous
            </Button>
            <Button
              type="submit"
              disabled={!isAgreed}
              className={`px-8 ${
                isAgreed 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLastStep ? 'Register User' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}