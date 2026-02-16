import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  School,
  User,
  Phone,
  Mail,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  AlertCircle,
  LayoutDashboard,
  Users,
  FileText,
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';
import AssessmentBook from '@/components/teacher/AssessmentBook';
import ClassOverview from '@/components/teacher/classteacher/ClassOverview';
import ClassAttendance from '@/components/teacher/classteacher/ClassAttendance';
import ClassStudents from '@/components/teacher/classteacher/ClassStudents';
import ClassReports from '@/components/teacher/classteacher/ClassReports';

const Dashboard = () => {
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState('assessment');
  const [myTimetable, setMyTimetable] = useState<any[]>([]);
  const [teacherCode, setTeacherCode] = useState('');

  const isClassTeacher = currentUser?.isClassTeacher && currentUser?.classTeacherClassId && currentUser?.classTeacherStreamId;

  const menuGroups: MenuGroup[] = useMemo(() => {
    const groups: MenuGroup[] = [
      {
        label: 'Main Menu',
        items: [
          { id: 'assessment', label: 'Assessment Book', icon: ClipboardList },
          { id: 'timetable', label: 'My Timetable', icon: Calendar },
          { id: 'profile', label: 'My Profile', icon: User },
        ],
      },
    ];
    if (isClassTeacher) {
      groups.push({
        label: 'Class Teacher',
        items: [
          { id: 'class-overview', label: 'My Class', icon: LayoutDashboard },
          { id: 'class-attendance', label: 'Class Attendance', icon: ClipboardList },
          { id: 'class-students', label: 'Class Students', icon: Users },
          { id: 'class-reports', label: 'Class Reports', icon: FileText },
        ],
      });
    }
    return groups;
  }, [isClassTeacher]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      const codes: Record<string, string> = JSON.parse(localStorage.getItem('zaroda_teacher_codes') || '{}');
      const myCode = codes[currentUser.id] || Object.entries(codes).find(([, c]) => c && currentUser.fullName)?.toString() || '';
      setTeacherCode(typeof myCode === 'string' ? myCode : '');
      const allSlots = JSON.parse(localStorage.getItem('zaroda_master_timetable') || '[]');
      const filtered = allSlots.filter((s: any) => s.teacherId === currentUser.id || s.teacherCode === codes[currentUser.id]);
      setMyTimetable(filtered);
    } catch { setMyTimetable([]); }
  }, [currentUser, activeTab]);

  if (!currentUser) return null;

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  return (
    <DashboardLayout
      portalName="Teacher"
      roleLabel={`${currentUser.grade || ''} - ${currentUser.subject || 'Teacher'}${isClassTeacher ? ' | Class Teacher' : ''}`}
      menuGroups={menuGroups}
      activeSection={activeTab}
      onSectionChange={setActiveTab}
    >
      {activeTab === 'assessment' && currentUser.grade && currentUser.subject && (
        <AssessmentBook
          teacherId={currentUser.id}
          teacherName={currentUser.fullName}
          grade={currentUser.grade}
          subject={currentUser.subject}
          schoolCode={currentUser.schoolCode}
        />
      )}

      {activeTab === 'assessment' && (!currentUser.grade || !currentUser.subject) && (
        <Card className="max-w-lg mx-auto mt-12 bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="text-primary" size={24} />
              Assessment Book Not Available
            </CardTitle>
            <CardDescription>
              Your account is missing grade or subject information. Please contact your administrator to update your profile.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {activeTab === 'timetable' && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Weekly Timetable</h1>
            <p className="text-gray-500 text-sm mt-1">
              {teacherCode && <Badge variant="outline" className="mr-2">Code: {teacherCode}</Badge>}
              Your assigned classes and schedule
            </p>
          </div>
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="pt-6">
              {myTimetable.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Your timetable has not been set yet</h3>
                  <p className="text-gray-500">Contact the DHOI to have your timetable generated.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-sidebar text-white font-bold">Day</TableHead>
                        <TableHead className="bg-teal text-white">Time</TableHead>
                        <TableHead className="bg-teal text-white">Subject</TableHead>
                        <TableHead className="bg-teal text-white">Class</TableHead>
                        <TableHead className="bg-teal text-white">Stream</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DAYS.map(day => {
                        const daySlots = myTimetable
                          .filter((s: any) => s.day === day && !s.isLocked)
                          .sort((a: any, b: any) => a.periodIndex - b.periodIndex);
                        if (daySlots.length === 0) return null;
                        return daySlots.map((slot: any, idx: number) => (
                          <TableRow key={slot.id || `${day}-${idx}`}>
                            {idx === 0 && (
                              <TableCell rowSpan={daySlots.length} className="bg-sidebar text-white font-bold align-middle text-center">{day}</TableCell>
                            )}
                            <TableCell className="text-sm whitespace-nowrap">{slot.timeStart} - {slot.timeEnd}</TableCell>
                            <TableCell className="font-semibold">{slot.subjectName}</TableCell>
                            <TableCell>{slot.className}</TableCell>
                            <TableCell>{slot.streamName}</TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'profile' && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Your account information</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary" size={20} />
                  Teacher Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase tracking-wide">Full Name</Label>
                    <p className="font-semibold text-gray-900">{currentUser.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase tracking-wide">School Code</Label>
                    <p className="font-mono text-lg bg-gray-100 px-3 py-1 rounded inline-block text-gray-800">{currentUser.schoolCode}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase tracking-wide">Email</Label>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Mail size={14} className="text-gray-400" />
                      {currentUser.email}
                    </p>
                  </div>
                  {currentUser.phone && (
                    <div className="space-y-1">
                      <Label className="text-gray-500 text-xs uppercase tracking-wide">Phone</Label>
                      <p className="flex items-center gap-2 text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        {currentUser.phone}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {currentUser.grade && (
                    <div className="space-y-1">
                      <Label className="text-gray-500 text-xs uppercase tracking-wide">Grade Assigned</Label>
                      <p className="flex items-center gap-2 text-gray-700">
                        <GraduationCap size={14} className="text-gray-400" />
                        {currentUser.grade}
                      </p>
                    </div>
                  )}
                  {currentUser.subject && (
                    <div className="space-y-1">
                      <Label className="text-gray-500 text-xs uppercase tracking-wide">Subject</Label>
                      <p className="flex items-center gap-2 text-gray-700">
                        <BookOpen size={14} className="text-gray-400" />
                        {currentUser.subject}
                      </p>
                    </div>
                  )}
                </div>
                {isClassTeacher && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 uppercase font-bold tracking-wide mb-1">Class Teacher Assignment</p>
                    <p className="text-amber-900 font-semibold">{currentUser.classTeacherClassName} - {currentUser.classTeacherStreamName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="text-primary" size={20} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('assessment')}>
                  <ClipboardList size={16} className="mr-2" />
                  Open Assessment Book
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('timetable')}>
                  <Calendar size={16} className="mr-2" />
                  View Timetable
                </Button>
                {isClassTeacher && (
                  <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setActiveTab('class-overview')}>
                    <Users size={16} className="mr-2" />
                    My Class Dashboard
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/">
                    <School size={16} className="mr-2" />
                    View Homepage
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isClassTeacher && activeTab === 'class-overview' && (
        <ClassOverview
          classId={currentUser.classTeacherClassId!}
          className={currentUser.classTeacherClassName!}
          streamId={currentUser.classTeacherStreamId!}
          streamName={currentUser.classTeacherStreamName!}
          teacherName={currentUser.fullName}
        />
      )}

      {isClassTeacher && activeTab === 'class-attendance' && (
        <ClassAttendance
          classId={currentUser.classTeacherClassId!}
          className={currentUser.classTeacherClassName!}
          streamId={currentUser.classTeacherStreamId!}
          streamName={currentUser.classTeacherStreamName!}
          teacherName={currentUser.fullName}
        />
      )}

      {isClassTeacher && activeTab === 'class-students' && (
        <ClassStudents
          classId={currentUser.classTeacherClassId!}
          className={currentUser.classTeacherClassName!}
          streamId={currentUser.classTeacherStreamId!}
          streamName={currentUser.classTeacherStreamName!}
        />
      )}

      {isClassTeacher && activeTab === 'class-reports' && (
        <ClassReports
          classId={currentUser.classTeacherClassId!}
          className={currentUser.classTeacherClassName!}
          streamId={currentUser.classTeacherStreamId!}
          streamName={currentUser.classTeacherStreamName!}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
