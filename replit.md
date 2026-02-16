# Zaroda Solutions - School Management Platform

## Overview
A multi-tenant school management platform built with React, TypeScript, Vite, and Tailwind CSS. Features include multi-school sync, automated billing, parent-teacher portals, elections, sports management, and more.

## Recent Changes
- 2026-02-16: Implemented complete CBC Assessment Book for Teacher Dashboard with grade/subject assignment during signup, comprehensive curriculum data for all 12 grades (Playgroup-Grade 9), assessment records storage, dynamic scoring forms (EE/ME/AE/BE or CAT1/CAT2/END TERM), and tab-based dashboard navigation.
- 2026-02-16: Built all 5 SuperAdmin dashboard sections: Schools Management, Student Registry, Faculty Management, Finance & Billing, System Settings. Each has full CRUD, search/filter, and uses localStorage for data persistence with seed data.
- 2026-02-16: Created data layer (src/lib/storage.ts) with typed interfaces, CRUD helpers, and seed data for schools, students, faculty, invoices, and platform settings.
- 2026-02-16: Added role-based authentication system using React Context + localStorage. Roles: SuperAdmin, Teacher, HOI, DHOI, Student, Parent. SuperAdmin has hardcoded credentials. Teacher supports signup/login. Other roles show placeholder message.
- 2026-02-16: Initial import and Replit environment setup. Configured Vite dev server on port 5000 with proxy-friendly host settings.

## Project Architecture
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: React Context + localStorage (no backend yet)
- **Data**: localStorage with typed CRUD helpers (src/lib/storage.ts)
- **Routing**: React Router v6 with ProtectedRoute component
- **State/Data**: TanStack React Query + localStorage

### Authentication System
- `src/context/AuthContext.tsx` - Auth provider with login/signup/logout
- `src/components/ProtectedRoute.tsx` - Role-based route guard
- SuperAdmin credentials: Zaroda001 / oduorongo@gmail.com / ongo123
- Teacher: Can sign up and log in, data stored in localStorage
- HOI, DHOI, Student, Parent: Placeholder dashboards, no self-registration

### Data Layer (src/lib/storage.ts)
- **School**: id, name, code, type, county, sub_county, contact info, status, categories, counts
- **Student**: id, full_name, admission_no, school_id, grade, stream, guardian info, gender, dob, status
- **Faculty**: id, full_name, staff_no, school_id, role, department, email, phone, qualification, status
- **Invoice**: id, school_id, school_name, description, amount, period, status, due_date, paid_at
- **PlatformSettings**: platform config, academic year, notifications, billing cycle, maintenance mode
- Each entity has getAll/add/update/remove helpers with seed data initialization

### SuperAdmin Dashboard Sections
- `src/components/superadmin/sections/SchoolsSection.tsx` - Full CRUD school management
- `src/components/superadmin/sections/StudentsSection.tsx` - Student registry with school association
- `src/components/superadmin/sections/FacultySection.tsx` - Staff management with department/role
- `src/components/superadmin/sections/FinanceSection.tsx` - Invoice management, revenue tracking
- `src/components/superadmin/sections/SettingsSection.tsx` - Platform configuration

### Teacher Dashboard & Assessment Book
- `src/components/teacher/AssessmentBook.tsx` - Full CBC Assessment Book component
- `src/lib/assessmentData.ts` - CBC curriculum data for all 12 grades (Playgroup-Grade 9)
- Assessment storage in `src/lib/storage.ts` (assessmentStorage with upsert/find/getByTeacher)
- Teacher signup includes grade (Playgroup, PP1, PP2, Grade 1-9) and subject assignment
- Two scoring systems: EE/ME/AE/BE (Playgroup, PP1, PP2, Grade 5, 7, 8, 9) and CAT1/CAT2/END TERM (Grade 1-4, 6)
- Tab-based dashboard: Assessment Book (default) and Profile views

### Directory Structure
- `src/` - Application source code
  - `context/` - React Context providers (AuthContext)
  - `components/` - Reusable UI components (shadcn/ui based)
    - `superadmin/` - SuperAdmin dashboard components (Sidebar, TopNav, sections/)
    - `teacher/` - Teacher dashboard components (AssessmentBook)
  - `pages/` - Route page components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions, data layer (storage.ts), curriculum data (assessmentData.ts)
  - `assets/` - Static assets (images)
- `public/` - Public static files

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
