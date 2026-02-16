# Zaroda Solutions - School Management Platform

## Overview
A multi-tenant school management platform built with React, TypeScript, Vite, and Tailwind CSS. Features include multi-school sync, automated billing, parent-teacher portals, elections, sports management, and more.

## Recent Changes
- 2026-02-16: Implemented Class Teacher role system. HOI/DHOI can assign teachers as class teachers for specific class-stream combinations. Class teachers get additional dashboard sections: My Class (overview), Class Attendance (daily marking with 7-day history), Class Students (CRUD), Class Reports (cross-subject performance with per-subject averages, rankings, PDF export). Regular teachers keep their assessment book. Data flows: HOI/DHOI assignment → hoiTeachersStorage → platformUsersStorage sync → AuthUser on login → conditional Teacher Dashboard rendering.
- 2026-02-16: Simplified login page to a single unified form with School Code, Email, and Password fields. Removed role selector dropdown. System auto-detects user role based on credentials (checks SuperAdmin, platform users, DHOI accounts, and stored users in order).
- 2026-02-16: Built complete DHOI (Deputy Head of Institution) Dashboard with 14 sections: Overview, Teachers (with teacher codes, assignments, duty roster), Students, Classes, Subjects, Master Timetable (3 types: Upper Primary/Junior School/ECDE with locked slots, auto-generate), Officials, Attendance, Library, Sports, Elections, Reports, Settings. DHOI account created by HOI only. Added "My Timetable" read-only tab to Teacher Dashboard. All DHOI sections share HOI data via hoiStorage.ts.
- 2026-02-16: Connected auth so SuperAdmin creates HOI accounts. Added User Management section to SuperAdmin dashboard (create/edit/suspend/track users). HOI can no longer self-register - must use credentials assigned by SuperAdmin. Added PlatformUser & LoginActivity tracking, activity log, login history, and status checks (suspended accounts blocked). Teacher login also supports SuperAdmin-created accounts.
- 2026-02-16: Built complete HOI (Head of Institution) Dashboard with 15 sections: Overview, School Management, Classes & Streams, Teacher Management, Student Management, Officials Management, Subjects, Timetable, Attendance Summary, Finances, Library, Sports, Elections, Reports, Settings. All with full CRUD, search/filter, pagination, modal dialogs, charts, and localStorage persistence.
- 2026-02-16: Created HOI data layer (src/lib/hoiStorage.ts) with generic localStorage helpers, 22 typed interfaces, and seed data for all HOI entities.
- 2026-02-16: Implemented complete CBC Assessment Book for Teacher Dashboard with grade/subject assignment during signup, comprehensive curriculum data for all 12 grades (Playgroup-Grade 9), assessment records storage, dynamic scoring forms (EE/ME/AE/BE or CAT1/CAT2/END TERM), and tab-based dashboard navigation.
- 2026-02-16: Built all 5 SuperAdmin dashboard sections: Schools Management, Student Registry, Faculty Management, Finance & Billing, System Settings. Each has full CRUD, search/filter, and uses localStorage for data persistence with seed data.
- 2026-02-16: Created data layer (src/lib/storage.ts) with typed interfaces, CRUD helpers, and seed data for schools, students, faculty, invoices, and platform settings.
- 2026-02-16: Added role-based authentication system using React Context + localStorage. Roles: SuperAdmin, Teacher, HOI, DHOI, Student, Parent. SuperAdmin has hardcoded credentials. Teacher and HOI support signup/login. Other roles show placeholder message.
- 2026-02-16: Initial import and Replit environment setup. Configured Vite dev server on port 5000 with proxy-friendly host settings.

## Project Architecture
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: React Context + localStorage (no backend yet)
- **Data**: localStorage with typed CRUD helpers (src/lib/storage.ts, src/lib/hoiStorage.ts)
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Routing**: React Router v6 with ProtectedRoute component
- **State/Data**: TanStack React Query + localStorage

### Authentication System
- `src/context/AuthContext.tsx` - Auth provider with login/signup/logout + activity tracking
- `src/components/ProtectedRoute.tsx` - Role-based route guard
- Single unified login form: School Code + Email + Password (no role selector)
- Login auto-detects role: checks SuperAdmin credentials first, then platform users (HOI/Teacher/etc), then DHOI accounts, then stored users
- SuperAdmin credentials: Zaroda001 / oduorongo@gmail.com / ongo123
- HOI: Account created by SuperAdmin only. Status-checked (suspended/inactive accounts blocked).
- Teacher: Can self-register (signup) or be created by SuperAdmin. Both paths work for login. Status-checked.
- DHOI: Account created by HOI. Login checked against zaroda_dhoi_account storage.
- Student, Parent: Placeholder dashboards
- Seed HOI accounts (created on first load): hoi@greenwood.ac.ke/greenwood2024, hoi@sunrise.ac.ke/sunrise2024, hoi@heritage.ac.ke/heritage2024, hoi@victory.ac.ke/victory2024

### Data Layer
#### Platform-wide (src/lib/storage.ts)
- **School**: id, name, code, type, county, sub_county, contact info, status, categories, counts
- **Student**: id, full_name, admission_no, school_id, grade, stream, guardian info, gender, dob, status
- **Faculty**: id, full_name, staff_no, school_id, role, department, email, phone, qualification, status
- **Invoice**: id, school_id, school_name, description, amount, period, status, due_date, paid_at
- **PlatformSettings**: platform config, academic year, notifications, billing cycle, maintenance mode
- **AssessmentRecord**: teacher/student assessment data with scoring

#### HOI-specific (src/lib/hoiStorage.ts)
- Generic helpers: getData, setData, addItem, updateItem, deleteItem (crypto.randomUUID)
- 22 interfaces: HoiClass, HoiStream, HoiTeacher, HoiStudent, HoiOfficial, HoiSubject, HoiSubjectAssignment, HoiTeacherDuty, HoiTimetableSlot, HoiAttendance, HoiFeePayment, HoiExpense, HoiBook, HoiBookIssue, HoiSport, HoiSportsTeam, HoiSportsEvent, HoiElection, HoiCandidate, HoiAnnouncement, HoiSchoolProfile, HoiCalendarEvent
- All with seed data and localStorage key naming: zaroda_hoi_*

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

### HOI Dashboard (src/pages/hoi/)
- `HoiDashboard.tsx` - Main layout with collapsible sidebar and 15 sections
- `HoiOverview.tsx` - Stats cards, charts, activity feed, quick actions, announcements
- `HoiSchool.tsx` - School profile, academic settings, calendar events
- `HoiClasses.tsx` - Classes & streams management, class teacher assignment
- `HoiTeachers.tsx` - Teacher CRUD, subject assignments, duty roster
- `HoiStudents.tsx` - Student CRUD, transfer, bulk import UI
- `HoiOfficials.tsx` - School officials management
- `HoiSubjects.tsx` - Subject CRUD with teacher/class linkage
- `HoiTimetable.tsx` - Weekly timetable grid per class/stream
- `HoiAttendance.tsx` - Attendance summary, charts, mark attendance
- `HoiFinances.tsx` - Fee payments, expenses, financial summary with charts
- `HoiLibrary.tsx` - Books CRUD, issue/return, overdue tracking
- `HoiSports.tsx` - Sports management, teams, events
- `HoiElections.tsx` - Student council elections, candidates, results with charts
- `HoiReports.tsx` - Attendance/financial/duty/student reports with print
- `HoiSettings.tsx` - Password, notifications, theme, logout

### Directory Structure
- `src/` - Application source code
  - `context/` - React Context providers (AuthContext)
  - `components/` - Reusable UI components (shadcn/ui based)
    - `superadmin/` - SuperAdmin dashboard components (Sidebar, TopNav, sections/)
    - `teacher/` - Teacher dashboard components (AssessmentBook)
  - `pages/` - Route page components
    - `hoi/` - HOI dashboard (15 section pages + main layout)
    - `dhoi/` - DHOI dashboard (14 section pages + main layout + timetable generator)
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions, data layers (storage.ts, hoiStorage.ts), curriculum data (assessmentData.ts)
  - `assets/` - Static assets (images)
- `public/` - Public static files

### Route Map
- `/` - Landing page
- `/login` - Unified login page with role selector
- `/superadmin-dashboard` - SuperAdmin dashboard (protected)
- `/teacher-dashboard` - Teacher dashboard (protected)
- `/hoi-dashboard` - HOI dashboard with 15 sections (protected)
- `/dhoi-dashboard` - DHOI dashboard with 14 sections (protected)
- `/student-dashboard` - Student placeholder (protected)
- `/parent-dashboard` - Parent placeholder (protected)

## User Preferences
- Keep existing login page design, only add logic
- No Supabase auth - use React Context + localStorage
- All data stored in localStorage with clear key names (zaroda_*)
- Every item has unique id (crypto.randomUUID)
- Tables have pagination (10 rows per page)
- All forms have validation
- All add/edit actions open in modal dialogs
- Use recharts for charts
