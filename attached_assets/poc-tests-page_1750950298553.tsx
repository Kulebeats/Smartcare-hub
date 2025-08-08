import { POCTests } from "@/components/medical-record/poc-tests";

export default function POCTestsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Point-of-Care Tests</h1>
      <div className="max-w-3xl mx-auto">
        <POCTests patientId={1} />
      </div>
    </div>
  );
}
