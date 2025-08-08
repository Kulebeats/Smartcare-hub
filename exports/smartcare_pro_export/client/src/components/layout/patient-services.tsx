import { HeaderTabs } from "@/components/layout/header-tabs";

const services = {
  art: { icon: ShieldIcon, title: 'ART' },
  // other services...
};

return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-500">Training Portal</h1>
          <h2 className="text-xl font-semibold text-purple-700 mt-2">ART Adult IHPAI</h2>
        </div>
        
        <div className="mt-6">
          <HeaderTabs />
        </div>
      </header>
    </div>
);