# Texas Brains CRM

## Project Overview
Texas Brains CRM is a professional customer relationship management system designed for speed, scalability, and universal architectural integrity.

**Main Technologies:**
- **Framework:** [Next.js 16+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration)
- **Backend/Database:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Architecture:** Feature-based (Vertical Slicing), SSOT for data and styles.

## Core Mandates
1. **Prioritize Speed:** Optimize for both development velocity and application runtime performance.
2. **Universal Architecture:** Group logic, types, and UI by feature (`src/features/`). Avoid logic duplication across the codebase.
3. **Single Source of Truth (SSOT):**
   - **Data:** Use Supabase/Database schema as the primary type definition.
   - **API:** Centralize all external calls in `src/lib/api/` or feature services.
   - **Design:** Use Tailwind v4 `@theme` variables in `globals.css`.
4. **Styling Standards:**
   - Always use Tailwind CSS.
   - **NEVER** use inline styles.
   - Adhere strictly to Tailwind v4 rules (CSS variables, `@theme`, no `tailwind.config.js`).

## Project Structure
- `src/app/`: Next.js App Router (Routes & Layouts).
- `src/features/`: Feature-specific logic, components, and types.
- `src/components/ui/`: Atomic, reusable UI components.
- `src/hooks/`: Shared React hooks.
- `src/lib/`: Shared utility functions and service clients.
- `public/`: Static assets.

## Building and Running
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`

## Setup Instructions
1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
4. Run `npm run dev` to start the development server.

## Features & Logic (`src/features/`)
- **Clients**: Comprehensive CRM for lead and client tracking with 360° views.
- **Income**: Financial transaction management, payment recording, and bank account tracking.
- **Ledger**: Project-based financial visibility, contract tracking, and outstanding balance management.
- **Performance**: Agent productivity and sales target monitoring.

## Recent Architectural Updates
- **Cross-Feature Integration**: Enhanced communication between `clients` and `income` features (e.g., filtered project selection in payment modals).
- **Universal Design**: Full adoption of Tailwind CSS v4 and Apple-grade minimalism.
- **Data Integrity**: Unified `ProjectLedger` types across all financial modules.
- **Build Optimization**: Fixed Vercel deployment issues by correcting `package.json` dependencies (Next.js 16/17, Tailwind v4, React Compiler).
- **PWA/Mobile Optimization**: Fixed horizontal scrolling on Ledger page, optimized PWA navigation for iPhone safe areas (removed blank space in standalone mode), and implemented global overflow protection.
