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
  Megaphone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RevenueChart } from '@/components/superadmin';
import SchoolsSection from '@/components/superadmin/sections/SchoolsSection';
import StudentsSection from '@/components/superadmin/sections/StudentsSection';
import FacultySection from '@/components/superadmin/sections/FacultySection';
import FinanceSection from '@/components/superadmin/sections/FinanceSection';
import SettingsSection from '@/components/superadmin/sections/SettingsSection';
import UsersSection from '@/components/superadmin/sections/UsersSection';
import CommunicationSection from '@/components/superadmin/sections/CommunicationSection';
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
      { id: 'communication', label: 'Communication', icon: Megaphone },
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all schools and system analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[
            { label: 'Total Schools', value: schools.length, color: 'bg-primary/10 text-primary', icon: '🏫' },
            { label: 'Total Students', value: students.length, color: 'bg-secondary/10 text-secondary', icon: '👨‍🎓' },
            { label: 'Total Faculty', value: faculty.length, color: 'bg-accent/10 text-accent', icon: '👩‍🏫' },
            { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, color: 'bg-primary/10 text-primary', icon: '💰' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>{stat.icon}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-secondary"><ArrowUpRight className="w-3 h-3" /></span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-4">School Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">Active</span>
                </div>
                <span className="text-lg font-bold text-secondary">{activeSchools}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Pending</span>
                </div>
                <span className="text-lg font-bold text-accent">{pendingSchools}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-foreground">Suspended</span>
                </div>
                <span className="text-lg font-bold text-destructive">{suspendedSchools}</span>
              </div>
            </div>
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button onClick={() => setActiveSection('schools')} className="w-full py-2 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-sm">
                  Manage Schools
                </button>
                <button onClick={() => setActiveSection('users')} className="w-full py-2 px-4 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm">
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
      case 'communication': return <CommunicationSection />;
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
