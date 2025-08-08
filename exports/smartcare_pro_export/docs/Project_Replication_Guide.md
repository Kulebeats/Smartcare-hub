# SmartCare PRO Replication Guide

This guide provides detailed instructions for replicating the SmartCare PRO project in a new Replit environment.

## Step 1: Create a New Replit Project

1. Go to [Replit](https://replit.com)
2. Create a new Replit using the "Node.js with Vite" template
3. Name your project (e.g., "SmartCare-PRO")

## Step 2: Set Up the Project Structure

Create the following directory structure:

```
/
├── client/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── medical-record/
│       │   └── ui/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       └── main.tsx
├── server/
├── shared/
└── docs/
```

## Step 3: Install Required Packages

Run the following commands in the Replit shell:

```bash
# Core dependencies
npm install express express-session passport passport-local react react-dom wouter

# TypeScript and type definitions
npm install typescript @types/node @types/express @types/react @types/react-dom @types/passport @types/passport-local @types/express-session

# Database dependencies
npm install @neondatabase/serverless drizzle-orm drizzle-zod pg

# Dev dependencies
npm install -D drizzle-kit tsx

# UI/UX dependencies
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install date-fns
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
```

## Step 4: Copy Important Configuration Files

Create the following configuration files:

### package.json

```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.25.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "connect-pg-simple": "^9.0.1",
    "date-fns": "^3.3.1",
    "drizzle-orm": "^0.30.1",
    "drizzle-zod": "^0.5.1",
    "express": "^4.19.1",
    "express-session": "^1.18.0",
    "lucide-react": "^0.344.0",
    "memorystore": "^1.6.7",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "react-icons": "^5.0.1",
    "recharts": "^2.12.2",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.10",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "^20.11.25",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "drizzle-kit": "^0.21.1",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.5"
  }
}
```

### drizzle.config.ts

```typescript
import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

### theme.json

```json
{
  "primary": "#0052CC",
  "variant": "professional",
  "appearance": "light",
  "radius": 0.5
}
```

## Step 5: Set Up Database

1. Create a PostgreSQL database in Replit or use an external provider like Neon
2. Set up the environment variables in the Replit Secrets:
   - DATABASE_URL
   - SESSION_SECRET
3. Create the initial schema in `shared/schema.ts`
4. Run the migration: `npm run db:push`

## Step 6: Core Files Implementation

### Key files to implement first:

1. **shared/schema.ts** - Database schema and types
2. **server/db.ts** - Database connection
3. **server/auth.ts** - Authentication logic
4. **server/storage.ts** - Data storage implementation
5. **server/routes.ts** - API routes
6. **server/index.ts** - Server entry point
7. **client/src/lib/queryClient.ts** - API client setup
8. **client/src/hooks/use-auth.tsx** - Authentication hook
9. **client/src/lib/protected-route.tsx** - Route protection
10. **client/src/App.tsx** - Main application component

## Step 7: UI Components

Implement the UI components in this order:

1. Base UI components (buttons, inputs, etc.)
2. Layout components (header, sidebar)
3. Form components
4. Page components
5. Complex medical record components

## Step 8: Testing and Debugging

1. Test authentication flow (login/registration)
2. Test patient registration and search
3. Test medical record components
4. Debug any issues with form validation or API calls

## Important Notes for Replication

1. **Database Configuration**: Ensure your PostgreSQL connection string is properly configured in the environment variables.

2. **Authentication**: The system uses session-based authentication with Passport.js. Make sure the session secret is properly set.

3. **File Paths**: Pay attention to the import paths in your code. The project uses path aliases (@/components, @shared) which need to be correctly configured in vite.config.ts.

4. **Component Dependencies**: Many components depend on shadcn/ui components. Make sure these are installed and properly configured.

5. **API Endpoints**: The backend API endpoints should match what the frontend expects. Review server/routes.ts and client/src/lib/queryClient.ts for consistency.

## Troubleshooting Common Issues

### Database Connection Issues
- Check that your DATABASE_URL environment variable is correctly set
- Ensure the database server is accessible from your Replit
- Verify that the schema migrations have been applied

### Authentication Problems
- Check that SESSION_SECRET is set
- Make sure the session store is properly configured

### UI Rendering Issues
- Ensure all dependencies are installed
- Check that Tailwind CSS is properly configured
- Verify that all required components are imported

### API Call Failures
- Check the browser console for error messages
- Verify network requests in the browser developer tools
- Ensure backend routes are correctly implemented

## Next Steps After Replication

1. **Data Migration**: Import any existing data into your new instance
2. **User Testing**: Have users test the new instance to verify functionality
3. **Documentation**: Update documentation as needed
4. **Features**: Implement any additional features required

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)