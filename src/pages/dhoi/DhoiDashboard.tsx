import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Layers,
  Users,
  GraduationCap,
  Shield,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Library,
  Trophy,
  Vote,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import zarodaLogo from '@/assets/zaroda-logo.png';

import DhoiOverview from './DhoiOverview';
import DhoiTeachers from './DhoiTeachers';
import DhoiStudents from './DhoiStudents';
import DhoiClasses from './DhoiClasses';
import DhoiSubjects from './DhoiSubjects';
import DhoiTimetable from './DhoiTimetable';
import DhoiOfficials from './DhoiOfficials';
import DhoiAttendance from './DhoiAttendance';
import DhoiLibrary from './DhoiLibrary';
import DhoiSports from './DhoiSports';
import DhoiElections from './DhoiElections';
import DhoiReports from './DhoiReports';
import DhoiSettings from './DhoiSettings';

export type SectionId =
  | 'overview' | 'teachers' | 'students' | 'classes'
  | 'officials' | 'subjects' | 'timetable' | 'attendance'
  | 'library' | 'sports' | 'elections'
  | 'reports' | 'settings';

interface MenuItem {
  id: SectionId;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Main' },
  { id: 'teachers', label: 'Teachers', icon: Users, group: 'People' },
  { id: 'students', label: 'Students', icon: GraduationCap, group: 'People' },
  { id: 'classes', label: 'Classes & Streams', icon: Layers, group: 'People' },
  { id: 'officials', label: 'Officials', icon: Shield, group: 'People' },
  { id: 'subjects', label: 'Subjects', icon: BookOpen, group: 'Academic' },
  { id: 'timetable', label: 'Timetable', icon: Calendar, group: 'Academic' },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, group: 'Academic' },
  { id: 'library', label: 'Library', icon: Library, group: 'Operations' },
  { id: 'sports', label: 'Sports', icon: Trophy, group: 'Operations' },
  { id: 'elections', label: 'Elections', icon: Vote, group: 'Operations' },
  { id: 'reports', label: 'Reports', icon: FileText, group: 'Utilities' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'Utilities' },
];

const groups = ['Main', 'People', 'Academic', 'Operations', 'Utilities'];

const DhoiDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthContext();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleItemClick = (id: SectionId) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return <DhoiOverview onNavigate={(s: string) => setActiveSection(s as SectionId)} />;
      case 'teachers': return <DhoiTeachers />;
      case 'students': return <DhoiStudents />;
      case 'classes': return <DhoiClasses />;
      case 'officials': return <DhoiOfficials />;
      case 'subjects': return <DhoiSubjects />;
      case 'timetable': return <DhoiTimetable />;
      case 'attendance': return <DhoiAttendance />;
      case 'library': return <DhoiLibrary />;
      case 'sports': return <DhoiSports />;
      case 'elections': return <DhoiElections />;
      case 'reports': return <DhoiReports />;
      case 'settings': return <DhoiSettings onSignOut={handleSignOut} />;
      default: return <DhoiOverview onNavigate={setActiveSection} />;
    }
  };

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <img src={zarodaLogo} alt="Zaroda" className="h-8 w-auto" />
              <div>
                <h1 className="text-sidebar-foreground font-semibold text-sm">Zaroda</h1>
                <p className="text-sidebar-foreground/60 text-xs">DHOI Portal</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <img src={zarodaLogo} alt="Z" className="h-8 w-auto mx-auto" />}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {groups.map((group) => {
          const items = menuItems.filter(m => m.group === group);
          return (
            <div key={group}>
              {!collapsed && (
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold px-3 mt-3 mb-1">
                  {group}
                </p>
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    'sidebar-item w-full group relative',
                    activeSection === item.id && 'sidebar-item-active'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-colors flex-shrink-0',
                      activeSection === item.id ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
                    )}
                  />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="dhoiActiveIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full"
                    />
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <button
          onClick={handleSignOut}
          className="sidebar-item w-full group text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar z-50 flex-col shadow-elevated"
      >
        {sidebarContent}
      </motion.aside>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-sidebar z-50 flex flex-col shadow-elevated transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      <div className={cn('flex-1 flex flex-col overflow-hidden transition-all duration-300', collapsed ? 'lg:ml-20' : 'lg:ml-[260px]')}>
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold capitalize">
                {menuItems.find(m => m.id === activeSection)?.label || 'Overview'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{currentUser?.fullName}</span>
              <span className="text-xs text-muted-foreground">Deputy Head of Institution</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DhoiDashboard;
