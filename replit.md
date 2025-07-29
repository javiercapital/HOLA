# Investment Simulator - Papeles Comerciales

## Overview

This is a full-stack investment simulator web application designed specifically for "Papeles Comerciales" (Commercial Papers) investments. The application provides dynamic user interfaces that change based on the user's profile (Investor vs. Issuing Company) and includes comprehensive financial calculations with PDF report generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Hook Form for form state with Zod validation
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for simulation management
- **Development**: Hot reload with Vite integration in development mode

### Database & ORM
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### 1. Dynamic Form System
The simulator features a sophisticated form system that dynamically shows/hides fields based on user profile:
- **Investor Profile**: Shows only investment amount field, all other parameters are hidden/read-only
- **Company Profile**: Shows comprehensive form with all investment parameters including company details, terms, and financial settings

### 2. Financial Calculation Engine
Located in `client/src/lib/financial-calculations.ts`, this engine:
- Calculates investment returns for investors
- Computes emission costs for companies
- Handles currency conversions (USD/Bolivares)
- Processes various fees and taxes
- Generates comprehensive financial metrics including ROI calculations

### 3. PDF Report Generation
The system generates different PDF reports based on user profile:
- **Investor Reports**: Simplified reports focusing on returns and investment summary
- **Company Reports**: Detailed reports including all costs, fees, and comprehensive financial breakdowns

### 4. Storage System
Implements an abstraction layer for data persistence:
- **Interface**: `IStorage` defines the contract
- **Implementation**: `MemStorage` for in-memory storage (development)
- **Future-ready**: Designed to easily swap to database storage

## Data Flow

1. **User Input**: Dynamic form collects investment parameters based on profile
2. **Validation**: Zod schemas validate input data on both client and server
3. **Calculation**: Financial engine processes data and generates results
4. **Storage**: Simulation data is persisted via storage abstraction
5. **Display**: Results are shown in responsive tables and summary cards
6. **Export**: PDF reports are generated client-side using jsPDF

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state management
- **@radix-ui/***: Accessible UI component primitives
- **zod**: Runtime type validation
- **jsPDF**: Client-side PDF generation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESLint**: Code linting and formatting

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Assets**: Static assets are served from the build directory

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Express serves static files and API endpoints
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Hosting Requirements
- **Node.js**: Runtime environment for Express server
- **PostgreSQL**: Database (configured for Neon Database service)
- **Static File Serving**: For built React application
- **Environment Variables**: For database connection and configuration

The application is designed to be deployed on platforms like Replit, Vercel, or any Node.js hosting service with PostgreSQL support.