import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Pause,
  ArrowUpRight,
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  DollarSign,
  Settings,
  UserCog,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RevenueChart } from '@/components/superadmin';
import SchoolsSection from '@/components/superadmin/sections/SchoolsSection';
import StudentsSection from '@/components/superadmin/sections/StudentsSection';
import FacultySection from '@/components/superadmin/sections/FacultySection';
import FinanceSection from '@/components/superadmin/sections/FinanceSection';
import SettingsSection from '@/components/superadmin/sections/SettingsSection';
import UsersSection from '@/components/superadmin/sections/UsersSection';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';
import { schoolsStorage, studentsStorage, facultyStorage, invoicesStorage } from '@/lib/storage';

const menuGroups: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'User Management', icon: UserCog },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'schools', label: 'Schools', icon: School },
      { id: 'students', label: 'Student Registry', icon: Users },
      { id: 'faculty', label: 'Faculty', icon: GraduationCap },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'finance', label: 'Finance', icon: DollarSign },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const SuperAdmin = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderDashboardContent = () => {
    const schools = schoolsStorage.getAll();
    const students = studentsStorage.getAll();
    const faculty = facultyStorage.getAll();
    const invoices = invoicesStorage.getAll();
    const activeSchools = schools.filter(s => s.status === 'active').length;
    const pendingSchools = schools.filter(s => s.status === 'pending').length;
    const suspendedSchools = schools.filter(s => s.status === 'suspended').length;
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all schools and system analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[
            { label: 'Total Schools', value: schools.length, color: 'bg-primary/10 text-primary', icon: '🏫' },
            { label: 'Total Students', value: students.length, color: 'bg-blue-50 text-blue-600', icon: '👨‍🎓' },
            { label: 'Total Faculty', value: faculty.length, color: 'bg-purple-50 text-purple-600', icon: '👩‍🏫' },
            { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-600', icon: '💰' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>{stat.icon}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowUpRight className="w-3 h-3" /></span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">School Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{activeSchools}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{pendingSchools}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Suspended</span>
                </div>
                <span className="text-lg font-bold text-red-600">{suspendedSchools}</span>
              </div>
            </div>
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button onClick={() => setActiveSection('schools')} className="w-full py-2 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-sm">
                  Manage Schools
                </button>
                <button onClick={() => setActiveSection('users')} className="w-full py-2 px-4 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboardContent();
      case 'users': return <UsersSection />;
      case 'schools': return <SchoolsSection />;
      case 'students': return <StudentsSection />;
      case 'faculty': return <FacultySection />;
      case 'finance': return <FinanceSection />;
      case 'settings': return <SettingsSection />;
      default: return renderDashboardContent();
    }
  };

  return (
    <DashboardLayout
      portalName="SuperAdmin"
      roleLabel="System Administrator"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default SuperAdmin;
