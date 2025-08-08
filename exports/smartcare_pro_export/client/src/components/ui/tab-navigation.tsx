
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  tabs: {
    id: string;
    label: string;
  }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function TabNavigation({ tabs, activeTab, onChange, className }: TabNavigationProps) {
  return (
    <div className={cn("flex overflow-x-auto whitespace-nowrap py-2 px-1 bg-gray-100 rounded-md", className)}>
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          className={cn(
            "text-gray-700 text-base px-4 py-2 mx-1 border border-transparent rounded-md",
            activeTab === tab.id && "border-black bg-white"
          )}
          onClick={(e) => {
            e.preventDefault();
            onChange(tab.id);
          }}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
}

interface TabContentProps {
  id: string;
  activeTab: string;
  className?: string;
  children: React.ReactNode;
}

export function TabContent({ id, activeTab, className, children }: TabContentProps) {
  return (
    <div
      id={id}
      className={cn(
        "h-[300px] overflow-y-auto border border-gray-300 p-4 mt-5 bg-gray-50",
        activeTab !== id && "hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabbedContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
