import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardCheck,
  User,
  Construction,
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';

const menuGroups: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'grades', label: 'My Grades', icon: BookOpen },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
  },
];

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <DashboardLayout
      portalName="Student"
      roleLabel="Student"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Construction size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-500 text-center max-w-md">
          This dashboard is under construction. Student features will be available soon.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
