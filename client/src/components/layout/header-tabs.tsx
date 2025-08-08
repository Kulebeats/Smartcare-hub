import { Link, useLocation } from "wouter";

export function HeaderTabs() {
  const [location] = useLocation();

  const tabs = [
    { name: "PrEP Initial", path: "/prep-initial" },
    { name: "PrEP Follow Up", path: "/prep-follow-up" },
    { name: "Risk Assessment", path: "/risk-assessment" },
    { name: "Treatment Plan", path: "/treatment-plan" },
    { name: "Medication", path: "/medication" },
  ];

  return (
    <div className="nav-bar">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          href={tab.path}
          className={location === tab.path ? "active" : ""}
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
}