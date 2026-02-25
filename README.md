Zaroda Solutions School MIS

A Real-World CBC-Based School Management SaaS Platform for Kenya

📌 Overview

Zaroda Solutions School MIS is a full-scale, real-world School Management Information System (MIS) built as a SaaS platform designed specifically for the Kenyan education system under the Competency-Based Curriculum (CBC).

The system supports ECDE, Primary, and Junior Secondary (JS) institutions and provides complete digital management of academic, administrative, and communication processes within a school environment.

This is not a demo project — it is designed as a production-ready SaaS solution for real schools.

🎯 Vision

To digitize and simplify school operations in Kenya by providing an affordable, scalable, and CBC-compliant management system that connects administrators, teachers, students, and parents on one unified platform.

🏗️ System Architecture

Single Login System

8 Role-Based Dashboards

SaaS-Based Architecture (Multi-user & scalable)

Modular System Design

Secure Authentication & Authorization

Role-Based Access Control (RBAC)

👥 User Roles & Dashboards

The platform uses a single login form that automatically redirects users to their respective dashboards based on their assigned role:

Super Admin – Full system control and SaaS management

HOI (Head of Institution) – School-wide oversight

DHOI (Deputy Head of Institution) – Administrative support

HOD (Head of Department) – Departmental management

Teacher – Teaching, assessment, reporting

Class Teacher – Class management and student tracking

Parent – Student performance and communication access

Student – Academic progress and timetable access

📚 Core Modules
🏫 Academic Management

CBC-based Assessment Book

Competency tracking

Report generation

Subject and department management

Class allocation

📅 Automatic Timetable Generation

Smart timetable creation

Teacher allocation

Conflict detection handling

👨‍👩‍👧 Parent Communication System

Direct communication between school and parents

Performance updates

Notifications

📊 Administration & Management

Student enrollment management

Staff management

Department structuring

Academic year management

Role-based system controls

💰 SaaS Capability

Built as a rentable school system

Designed for multiple institutions

Scalable architecture

🇰🇪 CBC-Based Implementation

The system is designed around Kenya’s CBC education structure, covering:

ECDE

Primary School

Junior Secondary (JS)

It supports competency tracking, assessment recording, and structured evaluation aligned with the CBC framework.

🛠️ Technology Stack

(Modify this section to match your actual stack)

Frontend: React.js

Backend: Node.js

Database: MongoDB / Supabase

Authentication: Role-Based Access Control

Deployment: Vercel

Version Control: Git & GitHub

✅ Vercel Deploy Checklist (Build/Output + SPA Routing)

Use this checklist when deploying to avoid 404 errors on page reloads:

1) Project Root

Set Vercel Root Directory to:

zaroda-solutions-school-mis

2) Build Settings

Framework Preset: Vite

Build Command: npm run build

Output Directory: dist

Install Command: npm install

3) SPA Routing Rewrite

Ensure this file exists at project root:

vercel.json

with:

{
	"rewrites": [
		{
			"source": "/(.*)",
			"destination": "/index.html"
		}
	]
}

4) Environment Variables

Add all required production env vars in Vercel Project Settings → Environment Variables (for example Supabase URL/keys used by the app).

5) Redeploy

After saving settings and env vars, trigger a fresh deployment (not just a cache hit) to apply all changes.

6) Verification

Open a deep route directly (example: /superadmin-dashboard) and refresh the page.

Expected result: route loads normally, no 404.

7) Local Production Preview (recommended before deploy)

Run:

npm run build

npm run preview

Then open the preview URL and test deep-route refresh behavior before pushing to production.

Troubleshooting (Vercel)

- 404 on refresh/deep links

Confirm vercel.json is in the same root Vercel is building from and contains the rewrite to /index.html.

- Build succeeds but site is blank

Check browser console for runtime errors and confirm required environment variables are set in Vercel (Production environment), then redeploy.

- Wrong app/folder deployed

Verify Vercel Root Directory is zaroda-solutions-school-mis (not parent folder).

- Assets/scripts return 404

Ensure Output Directory is dist and Framework Preset is Vite.

- Latest changes not reflected

Trigger a fresh redeploy from the latest commit and clear browser cache/hard refresh.

- Environment variable changes not taking effect

After updating env vars, redeploy the project (env changes do not apply to already-finished deployments).

🚀 Key Features

Single authentication system with automatic role routing

8 fully functional dashboards

Automated timetable generation

CBC-compliant assessment tracking

Parent-school communication module

Modular, scalable SaaS design

Clean UI with structured navigation

🔐 Security & Access Control

Role-based dashboard restrictions

Controlled data visibility per user type

Secure authentication logic

Structured user permissions

🌍 Real-World Application

Zaroda Solutions School MIS is built as a practical, market-ready system intended for real educational institutions in Kenya. It addresses common challenges such as:

Manual report generation

Poor parent communication

Timetable conflicts

Disorganized student records

CBC assessment complexity

This system aims to modernize school operations and enhance efficiency across all levels of management.

📈 Future Improvements

SMS Integration

M-Pesa integration for school fee payments

AI-based performance analytics

Mobile application version

Multi-school subscription management dashboard

👨‍💻 Developer

Charles Onyango
Software Engineering Student
Email: charlesopiyo7383@gmail.com

Phone: +254 757874639

📌 Project Status

Active Development – Production Oriented SaaS System
