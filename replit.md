# Zaroda Solutions - School Management Platform

## Overview
A multi-tenant school management platform built with React, TypeScript, Vite, and Tailwind CSS. Features include multi-school sync, automated billing, parent-teacher portals, elections, sports management, and more.

## Recent Changes
- 2026-02-16: Added role-based authentication system using React Context + localStorage. Roles: SuperAdmin, Teacher, HOI, DHOI, Student, Parent. SuperAdmin has hardcoded credentials. Teacher supports signup/login. Other roles show placeholder message.
- 2026-02-16: Initial import and Replit environment setup. Configured Vite dev server on port 5000 with proxy-friendly host settings.

## Project Architecture
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: React Context + localStorage (no backend yet)
- **Routing**: React Router v6 with ProtectedRoute component
- **State/Data**: TanStack React Query

### Authentication System
- `src/context/AuthContext.tsx` - Auth provider with login/signup/logout
- `src/components/ProtectedRoute.tsx` - Role-based route guard
- SuperAdmin credentials: Zaroda001 / oduorongo@gmail.com / ongo123
- Teacher: Can sign up and log in, data stored in localStorage
- HOI, DHOI, Student, Parent: Placeholder dashboards, no self-registration

### Directory Structure
- `src/` - Application source code
  - `context/` - React Context providers (AuthContext)
  - `components/` - Reusable UI components (shadcn/ui based)
  - `pages/` - Route page components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `assets/` - Static assets (images)
- `public/` - Public static files
- `supabase/` - Supabase configuration, migrations, and edge functions

### Route Map
- `/` - Landing page
- `/login` - Unified login page with role selector
- `/superadmin-dashboard` - SuperAdmin dashboard (protected)
- `/teacher-dashboard` - Teacher dashboard (protected)
- `/hoi-dashboard` - HOI placeholder (protected)
- `/dhoi-dashboard` - DHOI placeholder (protected)
- `/student-dashboard` - Student placeholder (protected)
- `/parent-dashboard` - Parent placeholder (protected)

## User Preferences
- Keep existing login page design, only add logic
- No Supabase auth - use React Context + localStorage
