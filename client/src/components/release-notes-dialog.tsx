import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Real changelog data imported from CHANGELOG.md
const changelogData = [
  {
    version: "1.8.0",
    date: "2025-06-18",
    sections: [
      {
        title: "🏥 3-Card Referral System Implementation",
        items: [
          "Complete referral workflow matching rapid assessment UI structure",
          "Referral Reasons Dialog with multi-category selection and conditional sub-menus",
          "Standard Clinical Categories: 13 pre-existing conditions, preeclampsia complications, 7 emergency conditions",
          "Routine Referral Checklist: 16-step comprehensive workflow across 4 sections",
          "Receiving Facility Information: Complete facility coordination system"
        ]
      },
      {
        title: "🔄 ANC Module Enhancements",
        items: [
          "Referral section restructured to exact rapid assessment UI pattern with 3 distinct cards",
          "Add Record/Edit Record buttons consistent with rapid assessment design",
          "Enhanced dialog state management with form validation and data persistence",
          "Real-time status updates with dynamic display of referral progress"
        ]
      },
      {
        title: "🐛 Bug Fixes",
        items: [
          "Resolved compilation errors and missing state variables in referral dialogs",
          "Fixed multi-select category handling and display updates",
          "Corrected referral data persistence across dialog interactions"
        ]
      }
    ]
  },
  {
    version: "1.7.0",
    date: "2025-06-12",
    sections: [
      {
        title: "🏥 Enhanced ANC Module - Obstetric History System",
        items: [
          "Comprehensive Obstetric History Dialog with dynamic pregnancy sections",
          "Dynamic Pregnancy Tracking: Auto-generates individual pregnancy sections (1-15)",
          "Advanced Business Rules with conditional field logic based on gestational age",
          "Social Habits Management with multi-select and 'None' option logic",
          "Complications Tracking with comprehensive childbirth complications checklist"
        ]
      },
      {
        title: "🔄 Clinical Workflow Enhancements",
        items: [
          "Gestational Age Controls with independent conditional field logic",
          "Delivery Mode Cascading with labor type fields",
          "Labor Type Dependencies revealing sex of infant fields",
          "Visual Field Graying for 'None' selections with better UX"
        ]
      }
    ]
  },
  {
    version: "1.6.0", 
    date: "2025-06-08",
    sections: [
      {
        title: "🛡️ Security Validation and Performance Enhancement",
        items: [
          "Comprehensive Security Validation Framework with enhanced ABAC enforcement",
          "Performance Monitoring Dashboard with real-time system metrics",
          "Advanced Error Handling with graceful degradation mechanisms",
          "Audit Trail Enhancement with complete user action tracking"
        ]
      }
    ]
  },
  {
    version: "1.5.0",
    date: "2025-06-05",
    sections: [
      {
        title: "🔍 Enhanced Patient Search System",
        items: [
          "Implemented ART Number search functionality for HIV/AIDS patient management",
          "Complete 5-parameter search system: NRC, NUPIN, Cellphone, Full Name, and ART Number",
          "Enhanced backend storage methods with optimized database queries",
          "Improved frontend interface with proper API endpoint mapping"
        ]
      },
      {
        title: "🏥 Medical Record Navigation Enhancement",
        items: [
          "Added Medical Record to sidebar navigation menu",
          "Integrated existing Medical Record components from documentation",
          "Updated application routing for seamless Medical Record access",
          "Maintained consistent 'Client' terminology throughout interface"
        ]
      },
      {
        title: "🔧 Technical Improvements",
        items: [
          "Fixed frontend search type mapping issues (full_name vs name conversion)",
          "Enhanced patient search endpoint with comprehensive API mapping",
          "Completed database storage methods for ART Number functionality",
          "Integrated search system with existing security framework"
        ]
      }
    ]
  },
  {
    version: "1.4.0",
    date: "2025-06-04",
    sections: [
      {
        title: "🔐 Enterprise Access Control System",
        items: [
          "Implemented ABAC (Attribute-Based Access Control) policy engine with 23 security policies",
          "Deployed RLS (Row-Level Security) database protection with facility-based data isolation",
          "Created comprehensive authentication context middleware for PostgreSQL sessions",
          "Established role-based access control for Clinician, Admin, and Trainer roles",
          "Integrated facility-based data segmentation ensuring cross-facility privacy"
        ]
      },
      {
        title: "🛡️ Security Framework Implementation",
        items: [
          "ABAC middleware protecting all patient data endpoints",
          "Database-level RLS policies on patients, anc_records, prescriptions, and clinical_alerts tables",
          "Session-based authentication with PostgreSQL context parameter setting",
          "Complete security validation with automated testing suite",
          "Enterprise-grade multi-layered security architecture"
        ]
      }
    ]
  },
  {
    version: "1.3.0",
    date: "2025-05-28",
    sections: [
      {
        title: "🏥 Comprehensive ANC System",
        items: [
          "Complete Antenatal Care module with 74 clinical data fields",
          "Enhanced vital signs monitoring with two-stage readings",
          "Advanced maternal examination capabilities",
          "Sophisticated fetal assessment with positioning protocols",
          "Laboratory integration with hemoglobin, syphilis, and urine analysis"
        ]
      },
      {
        title: "🧠 WHO-Compliant Clinical Decision Support",
        items: [
          "12 active clinical decision rules following WHO guidelines",
          "Real-time alert system with 5 severity levels (Red, Purple, Orange, Yellow, Blue)",
          "Critical hypoxemia detection with urgent referral protocols",
          "Severe pre-eclampsia and hypertension management",
          "Abnormal fetal heart rate management with positioning guidance"
        ]
      },
      {
        title: "💾 Enterprise Database Architecture",
        items: [
          "Comprehensive database with 6 primary ANC tables",
          "Complete foreign key relationships ensuring data integrity",
          "Performance-optimized with 13 strategic indexes",
          "Real-time alert tracking with acknowledgment management",
          "Complete audit trails for all clinical activities"
        ]
      },
      {
        title: "🚀 API Infrastructure",
        items: [
          "Complete ANC API endpoints for initial and routine visits",
          "Real-time clinical decision support evaluation endpoint",
          "Patient alert management and tracking APIs",
          "Secure authentication with comprehensive error handling",
          "Full CRUD operations for ANC records and clinical data"
        ]
      }
    ]
  },
  {
    version: "1.2.0",
    date: "2025-05-27",
    sections: [
      {
        title: "🗄️ Database Infrastructure Overhaul",
        items: [
          "Created comprehensive ANC records table with 74 clinical fields",
          "Implemented clinical decision rules table with WHO guidelines",
          "Added clinical alerts tracking system with acknowledgment features",
          "Established WHO guidelines reference table with evidence levels",
          "Created complete foreign key relationships for data integrity"
        ]
      },
      {
        title: "⚡ Performance & Security",
        items: [
          "Added 13 strategic database indexes for optimal query performance",
          "Implemented comprehensive API authentication and authorization",
          "Enhanced error handling across all system endpoints",
          "Added complete audit trails for clinical activities",
          "Optimized database queries for real-time clinical decision support"
        ]
      }
    ]
  },
  {
    version: "1.1.0",
    date: "2025-05-26",
    sections: [
      {
        title: "🩺 Advanced Clinical Capabilities",
        items: [
          "Enhanced vital signs monitoring with two-stage readings",
          "Advanced maternal examination with cervical, cardiac, and respiratory assessments",
          "Sophisticated fetal monitoring with positioning protocols",
          "Laboratory integration for hemoglobin, syphilis, and urine analysis",
          "Critical oximetry monitoring with urgent referral protocols"
        ]
      },
      {
        title: "🔬 Laboratory & Diagnostic Integration",
        items: [
          "Hemoglobin testing with severity-based anemia alerts",
          "Syphilis screening with automated treatment protocols",
          "Comprehensive urine analysis with proteinuria detection",
          "HIV status tracking with counseling documentation",
          "Integration with clinical decision support for lab results"
        ]
      }
    ]
  },
  {
    version: "1.0.0",
    date: "2025-05-25",
    sections: [
      {
        title: "🏥 Major ANC System Launch",
        items: [
          "Complete Antenatal Care module implementation",
          "Initial and routine visit workflows with comprehensive forms",
          "Basic clinical decision support with WHO compliance",
          "Patient management integration with ANC workflows",
          "Foundation database structure for clinical data storage"
        ]
      },
      {
        title: "📊 Clinical Data Management",
        items: [
          "Comprehensive patient registration with maternal health focus",
          "Visit tracking and clinical notes management",
          "Basic vital signs monitoring and recording",
          "Treatment planning and referral management",
          "Clinical workflow integration with existing patient system"
        ]
      }
    ]
  },
  {
    version: "0.4.0",
    date: "2025-05-20",
    sections: [
      {
        title: "🔧 System Foundation Updates",
        items: [
          "Enhanced user authentication and role management",
          "Improved facility management and selection workflows",
          "Advanced patient search and registration capabilities",
          "System administration tools and user management",
          "Foundation work for clinical module integration"
        ]
      },
      {
        title: "🎨 User Interface Improvements",
        items: [
          "Modernized dashboard and navigation components",
          "Enhanced responsive design for various screen sizes",
          "Improved accessibility and user experience",
          "Updated color schemes and visual hierarchy",
          "Streamlined workflows for healthcare providers"
        ]
      }
    ]
  },
  {
    version: "0.3.5",
    date: "2025-05-16",
    sections: [
      {
        title: "Added",
        items: [
          "Enhanced Patient Registration Workflow",
          "Improved success dialog with prominent green theme",
          "Clear visual hierarchy in registration completion screen",
          "Enhanced 'Proceed to Service Selection' button with better styling",
          "Reliable dialog appearance with delay mechanism"
        ]
      },
      {
        title: "Fixed",
        items: [
          "Critical UI and Navigation Issues",
          "Sidebar component now works correctly with proper imports",
          "Improved error handling during patient registration",
          "Fixed navigation between registration and service selection",
          "Patient context properly maintained during navigation"
        ]
      },
      {
        title: "Technical Updates",
        items: [
          "Code Improvements",
          "Added React useEffect import to sidebar component",
          "Enhanced error handling in patient registration process",
          "Implemented timeout mechanism for reliable dialogs",
          "Updated styling using Tailwind CSS for better consistency"
        ]
      }
    ]
  },
  {
    version: "0.3.2",
    date: "2025-05-09",
    sections: [
      {
        title: "Added",
        items: [
          "Enhanced Service Selection Page",
          "Added fourth row of healthcare services (ANC, PNC, Laboratory, etc.)",
          "Created dedicated routing for Antenatal Care (ANC) service",
          "Added mental health, eye care, dental, and nutrition services",
          "Improved visual consistency across all service cards"
        ]
      },
      {
        title: "Changed",
        items: [
          "Updated UI Elements",
          "Changed \"Training Portal\" banner to \"Prototype Portal\"",
          "Standardized service card styling with consistent icons",
          "Enhanced service routing to better support specialized clinical modules"
        ]
      },
      {
        title: "Technical Updates",
        items: [
          "Code Improvements",
          "Organized service options into structured rows with consistent styling",
          "Expanded route handling to support additional service modules",
          "Updated service identifiers to match backend API endpoints",
          "Updated documentation to reflect latest changes"
        ]
      }
    ]
  },
  {
    version: "0.3.1",
    date: "2025-05-07",
    sections: [
      {
        title: "Improved",
        items: [
          "Enhanced Client Profile UI in ANC Module",
          "Simplified UI by hiding content until \"Add Record\" button is clicked",
          "Updated all form sections to use consistent placeholder messages",
          "Matched UI pattern between Rapid Assessment and Client Profile tabs",
          "Improved user experience with cleaner information architecture"
        ]
      },
      {
        title: "Fixed",
        items: [
          "Fixed layout issues in Client Profile tab",
          "Replaced detailed empty field layouts with simplified placeholders",
          "Standardized layout across all content cards",
          "Added consistent minimum height to content areas for better visual stability",
          "Ensured consistent content display across different form sections"
        ]
      },
      {
        title: "Technical Updates",
        items: [
          "Improved code structure",
          "Standardized placeholder implementation across sections",
          "Added consistent styling for placeholder text",
          "Optimized DOM structure for better performance",
          "Updated documentation to reflect UI changes"
        ]
      }
    ]
  },
  {
    version: "0.3.0",
    date: "2025-05-07",
    sections: [
      {
        title: "Added",
        items: [
          "New Antenatal Care (ANC) Module",
          "Implemented complete ANC workflow based on WHO guidelines",
          "Created modern UI consistent with SmartCare PRO design",
          "Developed clinical decision support for danger signs assessment",
          "Added comprehensive documentation and user guides",
          "Integrated with existing patient management system"
        ]
      },
      {
        title: "Features",
        items: [
          "ANC Initial Visit Registration",
          "Multi-tab form for comprehensive data collection",
          "Automated EDD and gestational age calculations",
          "Obstetric history documentation",
          "Laboratory results tracking",
          "Medical history and chronic condition management",
          "Treatment plan documentation with standardized interventions"
        ]
      },
      {
        title: "Clinical Decision Support",
        items: [
          "Rule-based evaluation engine for danger signs",
          "Context-aware clinical recommendations",
          "Evidence-based referral pathways",
          "Detailed documentation of clinical reasoning",
          "Integration with Task Master AI for workflow prioritization",
          "Claude AI integration for advanced clinical insights"
        ]
      }
    ]
  },
  {
    version: "0.2.5",
    date: "2025-04-09",
    sections: [
      {
        title: "Added",
        items: [
          "Enhanced Pharmacovigilance Module",
          "Added \"3HP (Isoniazid + Rifapentine) initiated\" as a follow-up drug option",
          "Implemented session-based acknowledgment system for clinical alerts",
          "Added special classification for truly life-threatening symptoms in Grade 4 alerts"
        ]
      },
      {
        title: "Improved",
        items: [
          "Optimized Clinical Alert Dialogs",
          "Reduced alert dialog size by 40% (two iterations of 20%)",
          "Made alert text more concise with proper spacing",
          "Optimized typography for better readability in smaller dialogs",
          "Fixed React DOM nesting issues for improved stability"
        ]
      },
      {
        title: "Fixed",
        items: [
          "Resolved HTML structure issues in alert dialogs",
          "Improved clinical alert text to fit properly in smaller dialog windows",
          "Enhanced warning labels for Grade 3 and Grade 4 adverse reactions"
        ]
      }
    ]
  }
];

interface ReleaseNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReleaseNotesDialog: React.FC<ReleaseNotesDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600">
            Release Notes - SmartCare PRO
          </DialogTitle>
          <DialogDescription>
            Recent updates and improvements to the system
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {changelogData.map((release, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Version {release.version}</h3>
                  <span className="text-sm text-gray-500">{release.date}</span>
                </div>
                
                {release.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mt-3">
                    <h4 className="font-medium text-blue-700 mb-2">{section.title}</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
            
            <div className="text-center text-sm text-gray-500 pt-2">
              <p>View full changelog in the documentation section</p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseNotesDialog;