import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Megaphone,
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';
import AssessmentBook from '@/components/teacher/AssessmentBook';
import ClassOverview from '@/components/teacher/classteacher/ClassOverview';
import ClassAttendance from '@/components/teacher/classteacher/ClassAttendance';
import ClassStudents from '@/components/teacher/classteacher/ClassStudents';
import ClassReports from '@/components/teacher/classteacher/ClassReports';
import { adminAnnouncementsStorage, adminAnnouncementReadStorage, type AdminAnnouncement } from '@/lib/storage';

type SubjectAssignmentRecord = {
  teacher_id?: string;
  subject_name?: string;
  class_name?: string;
  stream_name?: string;
};

type TeacherTimetableSlot = {
  id?: string;
  teacherId?: string;
  teacherCode?: string;
  day: string;
  isLocked?: boolean;
  periodIndex?: number;
  timeStart?: string;
  timeEnd?: string;
  subjectName?: string;
  className?: string;
  streamName?: string;
};

const Dashboard = () => {
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState('assessment');
  const [myTimetable, setMyTimetable] = useState<TeacherTimetableSlot[]>([]);
  const [teacherCode, setTeacherCode] = useState('');
  const [selectedAssessmentClass, setSelectedAssessmentClass] = useState('');
  const [selectedAssessmentSubject, setSelectedAssessmentSubject] = useState('');
  const [adminAnnouncements, setAdminAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [readAdminAnnouncementIds, setReadAdminAnnouncementIds] = useState<string[]>([]);

  const adminAnnouncementUserKey = useMemo(() => {
    const identity = currentUser?.id || currentUser?.email || 'teacher_guest';
    return `teacher:${identity}`;
  }, [currentUser]);

  const teacherAssignments = useMemo(() => {
    if (!currentUser) return [] as SubjectAssignmentRecord[];
    try {
      const raw = JSON.parse(localStorage.getItem('zaroda_hoi_subject_assignments') || '[]');
      if (!Array.isArray(raw)) return [];
      return (raw as SubjectAssignmentRecord[]).filter((assignment) => assignment?.teacher_id === currentUser.id);
    } catch {
      return [];
    }
  }, [currentUser]);

  const assessmentPairs = useMemo(() => {
    const pairs = teacherAssignments
      .filter((assignment) => assignment?.class_name && assignment?.subject_name)
      .map((assignment) => ({
        className: String(assignment.class_name),
        subjectName: String(assignment.subject_name),
        streamName: assignment?.stream_name ? String(assignment.stream_name) : '',
      }));

    const unique = new Map<string, { className: string; subjectName: string; streamNames: string[] }>();
    pairs.forEach((pair) => {
      const key = `${pair.className}::${pair.subjectName}`;
      const existing = unique.get(key);
      if (!existing) {
        unique.set(key, {
          className: pair.className,
          subjectName: pair.subjectName,
          streamNames: pair.streamName ? [pair.streamName] : [],
        });
      } else if (pair.streamName && !existing.streamNames.includes(pair.streamName)) {
        existing.streamNames.push(pair.streamName);
      }
    });

    if (unique.size > 0) return Array.from(unique.values());

    if (currentUser?.grade && currentUser?.subject) {
      return [{ className: currentUser.grade, subjectName: currentUser.subject, streamNames: [] }];
    }

    if (currentUser?.classTeacherClassName && currentUser?.subject) {
      return [{ className: currentUser.classTeacherClassName, subjectName: currentUser.subject, streamNames: [] }];
    }

    return [] as Array<{ className: string; subjectName: string; streamNames: string[] }>;
  }, [teacherAssignments, currentUser]);

  const availableAssessmentClasses = useMemo(() => {
    return Array.from(new Set(assessmentPairs.map((pair) => pair.className)));
  }, [assessmentPairs]);

  const availableAssessmentSubjects = useMemo(() => {
    return assessmentPairs
      .filter((pair) => pair.className === selectedAssessmentClass)
      .map((pair) => pair.subjectName);
  }, [assessmentPairs, selectedAssessmentClass]);

  const assessmentSubjectOptions = useMemo(() => {
    return assessmentPairs
      .filter((pair) => pair.className === selectedAssessmentClass)
      .map((pair) => {
        const streamLabel = pair.streamNames.length > 0 ? pair.streamNames.join('/') : '';
        return {
          value: pair.subjectName,
          label: streamLabel
            ? `${pair.className} • ${pair.subjectName} • ${streamLabel}`
            : `${pair.className} • ${pair.subjectName}`,
        };
      });
  }, [assessmentPairs, selectedAssessmentClass]);

  useEffect(() => {
    if (assessmentPairs.length === 0) {
      setSelectedAssessmentClass('');
      setSelectedAssessmentSubject('');
      return;
    }

    const initialClass = selectedAssessmentClass && availableAssessmentClasses.includes(selectedAssessmentClass)
      ? selectedAssessmentClass
      : assessmentPairs[0].className;

    const classSubjects = assessmentPairs
      .filter((pair) => pair.className === initialClass)
      .map((pair) => pair.subjectName);

    const initialSubject = selectedAssessmentSubject && classSubjects.includes(selectedAssessmentSubject)
      ? selectedAssessmentSubject
      : classSubjects[0] || '';

    if (initialClass !== selectedAssessmentClass) setSelectedAssessmentClass(initialClass);
    if (initialSubject !== selectedAssessmentSubject) setSelectedAssessmentSubject(initialSubject);
  }, [assessmentPairs, availableAssessmentClasses, selectedAssessmentClass, selectedAssessmentSubject]);

  const effectiveGrade = selectedAssessmentClass || currentUser?.grade || teacherAssignments[0]?.class_name || currentUser?.classTeacherClassName || '';
  const effectiveSubject = selectedAssessmentSubject || currentUser?.subject || teacherAssignments[0]?.subject_name || '';

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
      const filtered = (Array.isArray(allSlots) ? allSlots : [] as unknown[])
        .filter((slot): slot is TeacherTimetableSlot => typeof slot === 'object' && slot !== null)
        .filter((slot) => slot.teacherId === currentUser.id || slot.teacherCode === codes[currentUser.id]);
      setMyTimetable(filtered);
      setAdminAnnouncements(adminAnnouncementsStorage.getByTargetRole('teacher'));
      setReadAdminAnnouncementIds(adminAnnouncementReadStorage.getReadIds(adminAnnouncementUserKey));
    } catch { setMyTimetable([]); }
  }, [currentUser, activeTab, adminAnnouncementUserKey]);

  const unreadAdminCount = adminAnnouncements.filter((announcement) => !readAdminAnnouncementIds.includes(announcement.id)).length;

  const markAllAdminAnnouncementsRead = () => {
    const ids = adminAnnouncements.map((announcement) => announcement.id);
    adminAnnouncementReadStorage.markManyRead(adminAnnouncementUserKey, ids);
    setReadAdminAnnouncementIds(adminAnnouncementReadStorage.getReadIds(adminAnnouncementUserKey));
  };

  if (!currentUser) return null;

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  return (
    <DashboardLayout
      portalName="Teacher"
      roleLabel={`${effectiveGrade || ''} - ${effectiveSubject || 'Teacher'}${isClassTeacher ? ' | Class Teacher' : ''}`}
      menuGroups={menuGroups}
      activeSection={activeTab}
      onSectionChange={setActiveTab}
    >
      {activeTab === 'assessment' && assessmentPairs.length > 1 && (
        <Card className="mb-4 max-w-2xl bg-white shadow-sm border-gray-200">
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wide text-gray-500">Class</Label>
                <Select value={selectedAssessmentClass} onValueChange={setSelectedAssessmentClass}>
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssessmentClasses.map((className) => (
                      <SelectItem key={className} value={className}>{className}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-gray-500">Subject</Label>
                <Select value={selectedAssessmentSubject} onValueChange={setSelectedAssessmentSubject}>
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentSubjectOptions.map((subjectOption) => (
                      <SelectItem key={subjectOption.value} value={subjectOption.value}>{subjectOption.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'assessment' && effectiveGrade && effectiveSubject && (
        <AssessmentBook
          teacherId={currentUser.id}
          teacherName={currentUser.fullName}
          grade={effectiveGrade}
          subject={effectiveSubject}
          schoolCode={currentUser.schoolCode}
        />
      )}

      {activeTab === 'assessment' && (!effectiveGrade || !effectiveSubject) && (
        <Card className="max-w-lg mx-auto mt-12 bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="text-primary" size={24} />
              Assessment Book Not Available
            </CardTitle>
            <CardDescription>
              No class-subject assignment was found for your account. Please ask HOI/DHOI to assign at least one subject and class.
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
                  <p className="text-gray-500">The timetable is generated automatically once subject assignments are available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-muted text-foreground font-semibold">Day</TableHead>
                        <TableHead className="bg-muted text-foreground font-semibold">Time</TableHead>
                        <TableHead className="bg-muted text-foreground font-semibold">Subject</TableHead>
                        <TableHead className="bg-muted text-foreground font-semibold">Class</TableHead>
                        <TableHead className="bg-muted text-foreground font-semibold">Stream</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DAYS.map(day => {
                        const daySlots = myTimetable
                          .filter((slot) => slot.day === day && !slot.isLocked)
                          .sort((firstSlot, secondSlot) => (firstSlot.periodIndex || 0) - (secondSlot.periodIndex || 0));
                        if (daySlots.length === 0) return null;
                        return daySlots.map((slot, idx: number) => (
                          <TableRow key={slot.id || `${day}-${idx}`}>
                            {idx === 0 && (
                              <TableCell rowSpan={daySlots.length} className="bg-primary/10 text-primary font-bold align-middle text-center">{day}</TableCell>
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
                    <Label className="text-gray-500 text-xs uppercase tracking-wide">SCHOOL KNEC CODE</Label>
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

            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Megaphone className="text-primary" size={20} />
                  Admin Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unreadAdminCount > 0 && (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">{unreadAdminCount} NEW</Badge>
                    <Button size="sm" variant="outline" onClick={markAllAdminAnnouncementsRead}>Mark all read</Button>
                  </div>
                )}
                {adminAnnouncements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements available.</p>
                ) : (
                  adminAnnouncements.slice(0, 4).map((announcement) => (
                    <div key={announcement.id} className={`border rounded-lg p-3 ${!readAdminAnnouncementIds.includes(announcement.id) ? 'border-primary/40 bg-primary/5' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{announcement.title}</p>
                        {!readAdminAnnouncementIds.includes(announcement.id) && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">NEW</Badge>}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{announcement.message}</p>
                      <p className="text-[10px] text-gray-500 mt-2">{new Date(announcement.createdAt).toLocaleString()} • {announcement.author || 'SuperAdmin'}</p>
                    </div>
                  ))
                )}
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
