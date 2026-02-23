import React, { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, FileText, Calendar, Settings } from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';
import { useAuthContext } from '@/context/AuthContext';
import TeachersInDept from './Teachers';
import SubjectsCurriculum from './SubjectsCurriculum';
import LessonNotes from './LessonNotes';
import Exams from './Exams';
import DepartmentProfile from './DepartmentProfile';
import HodOverview from './HodOverview';

type SectionId = 'overview' | 'profile' | 'teachers' | 'subjects' | 'lessons' | 'exams' | 'settings';

const menuGroups: MenuGroup[] = [
  {
    label: 'Main',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'profile', label: 'Department Profile', icon: BookOpen },
    ],
  },
  {
    label: 'People & Curriculum',
    items: [
      { id: 'teachers', label: 'Teachers', icon: Users },
      { id: 'subjects', label: 'Subjects & Curriculum', icon: BookOpen },
      { id: 'lessons', label: 'Lesson Notes', icon: FileText },
      { id: 'exams', label: 'Exams & Assessment', icon: Calendar },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const HodDashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const { currentUser } = useAuthContext();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
            return <HodOverview onNavigate={(s: string) => setActiveSection(s as SectionId)} />;
      case 'profile': return <DepartmentProfile />;
      case 'teachers': return <TeachersInDept />;
      case 'subjects': return <SubjectsCurriculum />;
      case 'lessons': return <LessonNotes />;
      case 'exams': return <Exams />;
      case 'settings': return <div>Settings (coming)</div>;
      default: return <div />;
    }
  };

  return (
    <DashboardLayout
      portalName="HOD"
      roleLabel="Head of Department"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={(s) => setActiveSection(s as SectionId)}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default HodDashboard;
