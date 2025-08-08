# SmartCare PRO Export Guide

This document contains instructions for exporting and importing the SmartCare PRO project.

## Project Files

The files listed in `important_files.txt` are the core files needed to replicate the project. These include:

- All source code files (TypeScript, React components)
- Configuration files (package.json, vite.config.ts, etc.)
- Documentation files

## Export Process

To export the project for replication:

1. Create a new Replit project using the Node.js + Vite template
2. Import the files from this export into the new project, maintaining the directory structure
3. Run the following commands in the Replit shell:

```bash
npm install
npm run db:push
npm run dev
```

## Critical Components

Pay special attention to these critical components:

### Database Setup

1. Make sure to provision a PostgreSQL database in your new Replit project
2. Set the DATABASE_URL environment variable
3. Create a SESSION_SECRET environment variable

### Authentication

The authentication system is implemented in:
- server/auth.ts
- client/src/hooks/use-auth.tsx
- client/src/lib/protected-route.tsx

### Core Medical Modules

The core medical functionalities are implemented in:
- Pharmacovigilance module (client/src/components/medical-record/pharmacovigilance-*.tsx)
- ART module (client/src/components/medical-record/art-*.tsx)
- PrEP module (client/src/components/medical-record/prep-*.tsx)
- Patient registration (client/src/pages/new-patient.tsx)

## Troubleshooting

If you encounter issues during replication:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the database schema is properly migrated

## Additional Resources

For more detailed information, refer to:
- docs/Project_Documentation.md
- docs/Project_Replication_Guide.md

## Support

If you need further assistance, please contact the project maintainer.