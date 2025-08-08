# SmartCare PRO Project Documentation

## Project Overview

SmartCare PRO is a comprehensive Electronic Health Record (EHR) system tailored for the Zambian healthcare infrastructure, focusing on advanced pharmacovigilance tracking and patient-centric medical record management. The system provides facility-specific access controls with detailed medical outcome monitoring and features a secure, responsive design optimized for local healthcare environments.

## Core Technologies

- **Frontend**: React + TypeScript with Tailwind CSS and shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based authentication
- **Form Validation**: react-hook-form with zod
- **State Management**: TanStack Query (React Query)
- **Routing**: wouter

## Project Structure

```
/
├── client/ - Frontend React application
│   ├── src/
│   │   ├── components/ - UI components
│   │   │   ├── layout/ - Layout components (header, sidebar)
│   │   │   ├── medical-record/ - Medical record components
│   │   │   └── ui/ - Reusable UI components
│   │   ├── hooks/ - Custom React hooks
│   │   ├── lib/ - Utility functions
│   │   ├── pages/ - Page components
│   │   └── main.tsx - Entry point
├── server/ - Backend Express application
│   ├── auth.ts - Authentication logic
│   ├── db.ts - Database connection
│   ├── index.ts - Server entry point
│   ├── routes.ts - API routes
│   ├── storage.ts - Data storage implementation
│   └── vite.ts - Vite configuration for development
├── shared/ - Shared code between frontend and backend
│   └── schema.ts - Database schema and types
├── docs/ - Documentation
└── drizzle.config.ts - Drizzle ORM configuration
```

## Key Features

### Patient Management

1. **Patient Registration**
   - Multi-step registration form with comprehensive patient details
   - Age-based conditional fields
   - Validation using react-hook-form and zod
   - Summary view before saving

2. **Patient Records**
   - Search and view patient records
   - Edit patient information
   - View patient history

### Medical Records

1. **ART (Antiretroviral Therapy) Module**
   - Follow-up visits
   - Treatment plans
   - Medication tracking

2. **Pharmacovigilance Module**
   - Adverse drug reaction tracking with severity grading (1-4)
   - Clinical alerts for severe reactions
   - Follow-up tracking
   - Co-morbidities tracking
   - Comprehensive system review by body systems

3. **Risk Assessment**
   - Patient risk profiling
   - Color-coded visualization of risk levels
   - Actionable recommendations

## Database Schema

The database schema includes tables for:

1. **Users** - Authentication and authorization
2. **Patients** - Patient demographic and contact information
3. **ART Follow-ups** - ART visits and treatment information
4. **Prescriptions** - Medication prescriptions

## Implementation Details

### Authentication System

- Session-based authentication using Passport.js
- Login and registration screens
- Protected routes for authenticated users

### Form Validation

- Strong typing with TypeScript
- Schema validation with zod
- Form handling with react-hook-form
- Client-side error messages

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive layout for various screen sizes
- Accessible UI components from shadcn/ui

### Data Persistence

- PostgreSQL database for data storage
- Drizzle ORM for type-safe database operations
- Session storage for authentication state

## Recent Updates

### Version 0.2.5 (April 9, 2025)

- Enhanced Pharmacovigilance Module with additional drug options
- Implemented session-based acknowledgment system for clinical alerts
- Added special classification for truly life-threatening symptoms
- Optimized clinical alert dialogs for better readability
- Fixed React DOM nesting issues

### Version 0.2.4 (April 4, 2025)

- Enhanced scrolling functionality in all sections
- Improved patient dashboard layout
- Added sticky headers for better navigation
- Increased content capacity with proper overflow handling

## Setting Up the Project

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   SESSION_SECRET=your_session_secret
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Business Rules and Logic

### Pharmacovigilance

1. **Adverse Drug Reaction Grading**
   - Grade 1: Mild
   - Grade 2: Moderate
   - Grade 3: Severe
   - Grade 4: Life-threatening

2. **Clinical Decision Support**
   - Grade 3 and 4 reactions trigger clinical alerts
   - Life-threatening symptoms are clearly marked
   - Provides recommended actions based on severity

3. **Pregnancy and ART**
   - Specialized tracking for pregnant patients
   - Fetal outcome tracking
   - Conditional fields based on pregnancy status

4. **Follow-up Management**
   - Initial visit vs. follow-up visit differentiation
   - Action tracking (medication continued, switched, or alternative initiated)
   - Patient status tracking (not admitted, admitted, or died)

### Patient Information

1. **Age-based Fields**
   - NRC field appears only for patients 16 years and above
   - Under Five Card Number field appears only for children under 5 years

2. **Data Validation Rules**
   - No future dates allowed for date of birth
   - Required fields based on context
   - Conditional validation based on selected options

## Deployment

The application can be deployed on any Node.js hosting platform that supports:
- Node.js runtime
- PostgreSQL database
- Environment variable configuration

Recommended platforms include:
- Replit
- Railway
- Render
- Heroku

## Contributing

When contributing to this project:

1. Follow the established code style and patterns
2. Ensure proper TypeScript typing
3. Write tests for new features
4. Update documentation as needed
5. Follow the commit message conventions

## License

This project is proprietary and intended for use within the Zambian healthcare system.
