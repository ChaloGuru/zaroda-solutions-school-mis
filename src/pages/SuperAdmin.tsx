import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar, TopNav, RevenueChart } from '@/components/superadmin';
import SchoolsSection from '@/components/superadmin/sections/SchoolsSection';
import StudentsSection from '@/components/superadmin/sections/StudentsSection';
import FacultySection from '@/components/superadmin/sections/FacultySection';
import FinanceSection from '@/components/superadmin/sections/FinanceSection';
import SettingsSection from '@/components/superadmin/sections/SettingsSection';
import UsersSection from '@/components/superadmin/sections/UsersSection';
import { schoolsStorage, studentsStorage, facultyStorage, invoicesStorage } from '@/lib/storage';

const SuperAdmin = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">SuperAdmin Dashboard</h1>
            <p className="text-muted-foreground">Manage all schools and system analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                {schools.length}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{schools.length}</p>
              <p className="text-sm text-muted-foreground">Total Schools</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600">
                <ArrowUpRight className="w-3 h-3" />
                {students.length}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{students.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-600">
                <ArrowUpRight className="w-3 h-3" />
                {faculty.length}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{faculty.length}</p>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                KES
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">KES {totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">School Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{activeSchools}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="flex items-center gap-3">
                  <Pause className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{pendingSchools}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Suspended</span>
                </div>
                <span className="text-lg font-bold text-red-600">{suspendedSchools}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('schools')}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  Manage Schools
                </button>
                <button
                  onClick={() => setActiveSection('students')}
                  className="w-full py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-sm border border-border/50"
                >
                  View Students
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className="w-full py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-sm border border-border/50"
                >
                  Manage Users
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
              <div>
                <p className="text-sm text-foreground">{students.length} students enrolled across {schools.length} schools</p>
                <p className="text-xs text-muted-foreground">Platform-wide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <p className="text-sm text-foreground">{faculty.length} faculty members active</p>
                <p className="text-xs text-muted-foreground">Across all schools</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
              <div>
                <p className="text-sm text-foreground">{invoices.filter(i => i.status === 'pending').length} pending invoices require attention</p>
                <p className="text-xs text-muted-foreground">Review in Finance section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
              <div>
                <p className="text-sm text-foreground">{invoices.filter(i => i.status === 'overdue').length} overdue invoices</p>
                <p className="text-xs text-muted-foreground">Immediate action required</p>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return <UsersSection />;
      case 'schools':
        return <SchoolsSection />;
      case 'students':
        return <StudentsSection />;
      case 'faculty':
        return <FacultySection />;
      case 'finance':
        return <FinanceSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onSignOut={handleSignOut}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <TopNav />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin;
