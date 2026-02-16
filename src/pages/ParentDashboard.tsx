import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  User,
  Construction,
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';

const menuGroups: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'children', label: 'My Children', icon: Users },
      { id: 'grades', label: 'Academic Reports', icon: BookOpen },
      { id: 'fees', label: 'Fee Payments', icon: DollarSign },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
  },
];

const ParentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <DashboardLayout
      portalName="Parent"
      roleLabel="Parent/Guardian"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Construction size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
        <p className="text-gray-500 text-center max-w-md">
          This dashboard is under construction. Parent features will be available soon.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
