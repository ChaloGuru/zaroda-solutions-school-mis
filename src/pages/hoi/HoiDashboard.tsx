import { useState } from 'react';
import {
  LayoutDashboard,
  School,
  Layers,
  Users,
  GraduationCap,
  Shield,
  BookOpen,
  Calendar,
  ClipboardCheck,
  DollarSign,
  Library,
  Trophy,
  Vote,
  FileText,
  Settings,
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';

import HoiOverview from './HoiOverview';
import HoiSchool from './HoiSchool';
import HoiClasses from './HoiClasses';
import HoiTeachers from './HoiTeachers';
import HoiStudents from './HoiStudents';
import HoiOfficials from './HoiOfficials';
import HoiSubjects from './HoiSubjects';
import HoiTimetable from './HoiTimetable';
import HoiAttendance from './HoiAttendance';
import HoiFinances from './HoiFinances';
import HoiLibrary from './HoiLibrary';
import HoiSports from './HoiSports';
import HoiElections from './HoiElections';
import HoiReports from './HoiReports';
import HoiSettings from './HoiSettings';

export type SectionId =
  | 'overview' | 'school' | 'classes' | 'teachers' | 'students'
  | 'officials' | 'subjects' | 'timetable' | 'attendance'
  | 'finances' | 'library' | 'sports' | 'elections'
  | 'reports' | 'settings';

const menuGroups: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'school', label: 'School Management', icon: School },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'classes', label: 'Classes & Streams', icon: Layers },
      { id: 'teachers', label: 'Teachers', icon: Users },
      { id: 'students', label: 'Students', icon: GraduationCap },
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
      { id: 'finances', label: 'Finances', icon: DollarSign },
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

const HoiDashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const handleSignOut = () => {};

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return <HoiOverview onNavigate={(s: string) => setActiveSection(s as SectionId)} />;
      case 'school': return <HoiSchool />;
      case 'classes': return <HoiClasses />;
      case 'teachers': return <HoiTeachers />;
      case 'students': return <HoiStudents />;
      case 'officials': return <HoiOfficials />;
      case 'subjects': return <HoiSubjects />;
      case 'timetable': return <HoiTimetable />;
      case 'attendance': return <HoiAttendance />;
      case 'finances': return <HoiFinances />;
      case 'library': return <HoiLibrary />;
      case 'sports': return <HoiSports />;
      case 'elections': return <HoiElections />;
      case 'reports': return <HoiReports />;
      case 'settings': return <HoiSettings onSignOut={handleSignOut} />;
      default: return <HoiOverview onNavigate={setActiveSection} />;
    }
  };

  return (
    <DashboardLayout
      portalName="HOI"
      roleLabel="Head of Institution"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={(s) => setActiveSection(s as SectionId)}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default HoiDashboard;
