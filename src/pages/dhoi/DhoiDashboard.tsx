import { useState } from 'react';
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
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';

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

const menuGroups: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'teachers', label: 'Teachers', icon: Users },
      { id: 'students', label: 'Students', icon: GraduationCap },
      { id: 'classes', label: 'Classes & Streams', icon: Layers },
      { id: 'officials', label: 'Officials', icon: Shield },
    ],
  },
  {
    label: 'Academic',
    items: [
      { id: 'subjects', label: 'Subjects', icon: BookOpen },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'library', label: 'Library', icon: Library },
      { id: 'sports', label: 'Sports', icon: Trophy },
      { id: 'elections', label: 'Elections', icon: Vote },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const handleSignOut = () => {};

const DhoiDashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

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
      default: return <DhoiOverview onNavigate={(s: string) => setActiveSection(s as SectionId)} />;
    }
  };

  return (
    <DashboardLayout
      portalName="DHOI"
      roleLabel="Deputy Head of Institution"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={(s) => setActiveSection(s as SectionId)}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default DhoiDashboard;
