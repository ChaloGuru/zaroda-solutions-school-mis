import { useState, useEffect } from 'react';
import {
  hoiTeachersStorage,
  hoiSubjectAssignmentsStorage,
  hoiSubjectsStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  hoiTeacherDutiesStorage,
  HoiTeacher,
  HoiSubjectAssignment,
  HoiSubject,
  HoiClass,
  HoiStream,
  HoiTeacherDuty,
} from '@/lib/hoiStorage';
import { platformUsersStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  BookOpen,
  ClipboardList,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;
const TEACHER_CODES_KEY = 'zaroda_teacher_codes';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT: Record<string, string> = { Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI' };
const DUTY_TYPES: HoiTeacherDuty['duty_type'][] = ['gate', 'dining', 'games', 'assembly', 'cleaning supervision'];

const emptyTeacherForm = {
  full_name: '',
  email: '',
  phone: '',
  employee_id: '',
  subject_specialization: '',
  gender: 'Male' as HoiTeacher['gender'],
  qualification: '',
  status: 'active' as HoiTeacher['status'],
  teacher_code: '',
  password: '',
  is_class_teacher: false,
  class_teacher_class_id: '',
  class_teacher_stream_id: '',
};

const emptyAssignmentForm = {
  teacher_id: '',
  subject_id: '',
  class_id: '',
  stream_id: '',
};

const emptyDutyForm = {
  teacher_id: '',
  duty_type: 'gate' as HoiTeacherDuty['duty_type'],
  day: 'Monday',
  time_slot: '',
};

function getTeacherCodes(): Record<string, string> {
  try {
    const stored = localStorage.getItem(TEACHER_CODES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setTeacherCodes(codes: Record<string, string>) {
  localStorage.setItem(TEACHER_CODES_KEY, JSON.stringify(codes));
}

export default function DhoiTeachers() {
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [subjects, setSubjects] = useState<HoiSubject[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [duties, setDuties] = useState<HoiTeacherDuty[]>([]);
  const [teacherCodes, setTeacherCodesState] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherPage, setTeacherPage] = useState(1);
  const [assignPage, setAssignPage] = useState(1);
  const [dutyPage, setDutyPage] = useState(1);

  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<HoiTeacher | null>(null);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);

  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; teacher: HoiTeacher | null }>({ open: false, teacher: null });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssignmentForm);

  const [dutyDialogOpen, setDutyDialogOpen] = useState(false);
  const [dutyForm, setDutyForm] = useState(emptyDutyForm);

  const [deleteAssignDialog, setDeleteAssignDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [deleteDutyDialog, setDeleteDutyDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const loadData = () => {
    setTeachers(hoiTeachersStorage.getAll());
    setAssignments(hoiSubjectAssignmentsStorage.getAll());
    setSubjects(hoiSubjectsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
    setDuties(hoiTeacherDutiesStorage.getAll());
    setTeacherCodesState(getTeacherCodes());
  };

  useEffect(() => { loadData(); }, []);

  const getCode = (teacherId: string) => teacherCodes[teacherId] || '—';

  const getSubjectsForTeacher = (teacherId: string) => {
    const teacherAssignments = assignments.filter((a) => a.teacher_id === teacherId);
    const uniqueSubjects = [...new Set(teacherAssignments.map((a) => a.subject_name))];
    return uniqueSubjects.join(', ') || '—';
  };

  const getClassesForTeacher = (teacherId: string) => {
    const teacherAssignments = assignments.filter((a) => a.teacher_id === teacherId);
    const uniqueClasses = [...new Set(teacherAssignments.map((a) => `${a.class_name} ${a.stream_name}`))];
    return uniqueClasses.join(', ') || '—';
  };

  const filteredTeachers = teachers.filter((t) => {
    const code = (teacherCodes[t.id] || '').toLowerCase();
    const matchesSearch = t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTeacherPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const pagedTeachers = filteredTeachers.slice((teacherPage - 1) * PAGE_SIZE, teacherPage * PAGE_SIZE);

  const totalAssignPages = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE));
  const pagedAssignments = assignments.slice((assignPage - 1) * PAGE_SIZE, assignPage * PAGE_SIZE);

  const totalDutyPages = Math.max(1, Math.ceil(duties.length / PAGE_SIZE));
  const pagedDuties = duties.slice((dutyPage - 1) * PAGE_SIZE, dutyPage * PAGE_SIZE);

  const statusBadge = (status: HoiTeacher['status']) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-700 border-green-500/30',
      on_leave: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      deactivated: 'bg-red-500/20 text-red-700 border-red-500/30',
    };
    return <Badge variant="outline" className={colors[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const openAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherForm(emptyTeacherForm);
    setTeacherDialogOpen(true);
  };

  const openEditTeacher = (t: HoiTeacher) => {
    setEditingTeacher(t);
    setTeacherForm({
      full_name: t.full_name,
      email: t.email,
      phone: t.phone,
      employee_id: t.employee_id,
      subject_specialization: t.subject_specialization,
      gender: t.gender,
      qualification: t.qualification,
      status: t.status,
      teacher_code: teacherCodes[t.id] || '',
      password: '',
      is_class_teacher: t.is_class_teacher || false,
      class_teacher_class_id: t.class_teacher_class_id || '',
      class_teacher_stream_id: t.class_teacher_stream_id || '',
    });
    setTeacherDialogOpen(true);
  };

  const saveTeacher = () => {
    if (!teacherForm.full_name.trim() || !teacherForm.email.trim() || !teacherForm.employee_id.trim() || !teacherForm.teacher_code.trim()) {
      toast({ title: 'Validation Error', description: 'Full name, email, employee ID, and teacher code are required.', variant: 'destructive' });
      return;
    }
    if (!editingTeacher && !teacherForm.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required when adding a new teacher.', variant: 'destructive' });
      return;
    }
    const codeVal = teacherForm.teacher_code.trim().toUpperCase();
    const existingCodes = getTeacherCodes();
    const codeConflict = Object.entries(existingCodes).find(([tid, c]) => c === codeVal && tid !== (editingTeacher?.id || ''));
    if (codeConflict) {
      toast({ title: 'Duplicate Code', description: `Teacher code "${codeVal}" is already assigned to another teacher.`, variant: 'destructive' });
      return;
    }

    const { teacher_code, password, is_class_teacher, class_teacher_class_id, class_teacher_stream_id, ...teacherData } = teacherForm;
    const selectedClass = classes.find(c => c.id === class_teacher_class_id);
    const selectedStream = streams.find(s => s.id === class_teacher_stream_id);
    const classTeacherFields = is_class_teacher && selectedClass && selectedStream ? {
      is_class_teacher: true,
      class_teacher_class_id: selectedClass.id,
      class_teacher_class_name: selectedClass.name,
      class_teacher_stream_id: selectedStream.id,
      class_teacher_stream_name: selectedStream.name,
    } : {
      is_class_teacher: false,
      class_teacher_class_id: undefined,
      class_teacher_class_name: undefined,
      class_teacher_stream_id: undefined,
      class_teacher_stream_name: undefined,
    };

    if (editingTeacher) {
      hoiTeachersStorage.update(editingTeacher.id, { ...teacherData, ...classTeacherFields });
      const codes = getTeacherCodes();
      codes[editingTeacher.id] = codeVal;
      setTeacherCodes(codes);
      if (password.trim()) {
        const passwords = JSON.parse(localStorage.getItem('zaroda_passwords') || '{}');
        passwords[teacherForm.email.trim().toLowerCase()] = password.trim();
        localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
      }
      const existingPU = platformUsersStorage.findByEmail(teacherForm.email.trim().toLowerCase());
      if (existingPU) {
        platformUsersStorage.update(existingPU.id, {
          isClassTeacher: classTeacherFields.is_class_teacher,
          classTeacherClassId: classTeacherFields.class_teacher_class_id,
          classTeacherClassName: classTeacherFields.class_teacher_class_name,
          classTeacherStreamId: classTeacherFields.class_teacher_stream_id,
          classTeacherStreamName: classTeacherFields.class_teacher_stream_name,
        });
      }
      toast({ title: 'Teacher Updated', description: `${teacherForm.full_name} has been updated.` });
    } else {
      const newTeacher = hoiTeachersStorage.add({ ...teacherData, ...classTeacherFields, hired_at: new Date().toISOString().split('T')[0] });
      const codes = getTeacherCodes();
      codes[newTeacher.id] = codeVal;
      setTeacherCodes(codes);
      const passwords = JSON.parse(localStorage.getItem('zaroda_passwords') || '{}');
      passwords[teacherForm.email.trim().toLowerCase()] = password.trim();
      localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
      const existing = platformUsersStorage.getAll().find(u => u.email.toLowerCase() === teacherForm.email.trim().toLowerCase());
      if (!existing) {
        platformUsersStorage.add({
          email: teacherForm.email.trim().toLowerCase(),
          fullName: teacherForm.full_name.trim(),
          role: 'teacher',
          schoolCode: '',
          schoolName: '',
          phone: teacherForm.phone.trim(),
          status: 'active',
          createdBy: 'DHOI',
          isClassTeacher: classTeacherFields.is_class_teacher,
          classTeacherClassId: classTeacherFields.class_teacher_class_id,
          classTeacherClassName: classTeacherFields.class_teacher_class_name,
          classTeacherStreamId: classTeacherFields.class_teacher_stream_id,
          classTeacherStreamName: classTeacherFields.class_teacher_stream_name,
        });
      } else {
        platformUsersStorage.update(existing.id, {
          isClassTeacher: classTeacherFields.is_class_teacher,
          classTeacherClassId: classTeacherFields.class_teacher_class_id,
          classTeacherClassName: classTeacherFields.class_teacher_class_name,
          classTeacherStreamId: classTeacherFields.class_teacher_stream_id,
          classTeacherStreamName: classTeacherFields.class_teacher_stream_name,
        });
      }
      toast({ title: 'Teacher Added', description: `${teacherForm.full_name} has been added with code ${codeVal}. They can now log in with their email and password.` });
    }
    setTeacherDialogOpen(false);
    loadData();
  };

  const toggleTeacherStatus = () => {
    const t = deactivateDialog.teacher;
    if (!t) return;
    const newStatus = t.status === 'deactivated' ? 'active' : 'deactivated';
    hoiTeachersStorage.update(t.id, { status: newStatus });
    toast({ title: newStatus === 'active' ? 'Teacher Reactivated' : 'Teacher Deactivated', description: `${t.full_name} is now ${newStatus}.` });
    setDeactivateDialog({ open: false, teacher: null });
    loadData();
  };

  const saveAssignment = () => {
    if (!assignForm.teacher_id || !assignForm.subject_id || !assignForm.class_id || !assignForm.stream_id) {
      toast({ title: 'Validation Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    const teacher = teachers.find((t) => t.id === assignForm.teacher_id);
    const subject = subjects.find((s) => s.id === assignForm.subject_id);
    const cls = classes.find((c) => c.id === assignForm.class_id);
    const stream = streams.find((s) => s.id === assignForm.stream_id);
    if (!teacher || !subject || !cls || !stream) return;
    hoiSubjectAssignmentsStorage.add({
      teacher_id: teacher.id,
      teacher_name: teacher.full_name,
      subject_id: subject.id,
      subject_name: subject.name,
      class_id: cls.id,
      class_name: cls.name,
      stream_id: stream.id,
      stream_name: stream.name,
    });
    toast({ title: 'Assignment Created', description: `${teacher.full_name} assigned to ${subject.name} - ${cls.name} ${stream.name}` });
    setAssignDialogOpen(false);
    setAssignForm(emptyAssignmentForm);
    loadData();
  };

  const deleteAssignment = () => {
    if (deleteAssignDialog.id) {
      hoiSubjectAssignmentsStorage.remove(deleteAssignDialog.id);
      toast({ title: 'Assignment Removed' });
      setDeleteAssignDialog({ open: false, id: null });
      loadData();
    }
  };

  const saveDuty = () => {
    if (!dutyForm.teacher_id || !dutyForm.time_slot.trim()) {
      toast({ title: 'Validation Error', description: 'Teacher and time slot are required.', variant: 'destructive' });
      return;
    }
    const teacher = teachers.find((t) => t.id === dutyForm.teacher_id);
    if (!teacher) return;
    hoiTeacherDutiesStorage.add({
      teacher_id: teacher.id,
      teacher_name: teacher.full_name,
      duty_type: dutyForm.duty_type,
      day: dutyForm.day,
      time_slot: dutyForm.time_slot,
    });
    toast({ title: 'Duty Assigned', description: `${teacher.full_name} assigned ${dutyForm.duty_type} on ${dutyForm.day}` });
    setDutyDialogOpen(false);
    setDutyForm(emptyDutyForm);
    loadData();
  };

  const deleteDuty = () => {
    if (deleteDutyDialog.id) {
      hoiTeacherDutiesStorage.remove(deleteDutyDialog.id);
      toast({ title: 'Duty Removed' });
      setDeleteDutyDialog({ open: false, id: null });
      loadData();
    }
  };

  const Pagination = ({ page, total, setPage }: { page: number; total: number; setPage: (p: number) => void }) => (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">Page {page} of {total}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" disabled={page >= total} onClick={() => setPage(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Teacher Management</h1>
        <p className="text-muted-foreground">Manage teachers, subject assignments, duties, and weekly roster</p>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="mb-6">
          <TabsTrigger value="teachers" className="gap-2"><Users className="w-4 h-4" />All Teachers</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><BookOpen className="w-4 h-4" />Subject Assignments</TabsTrigger>
          <TabsTrigger value="duties" className="gap-2"><ClipboardList className="w-4 h-4" />Teacher Duties</TabsTrigger>
          <TabsTrigger value="roster" className="gap-2"><CalendarDays className="w-4 h-4" />Weekly Duty Roster</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">All Teachers ({filteredTeachers.length})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name, email, or code..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setTeacherPage(1); }} className="pl-9 w-64" />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setTeacherPage(1); }}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={openAddTeacher} className="gap-2"><Plus className="w-4 h-4" />Add Teacher</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subjects Assigned</TableHead>
                      <TableHead>Classes Assigned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedTeachers.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No teachers found.</TableCell></TableRow>
                    ) : pagedTeachers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell><Badge variant="secondary" className="font-mono">{getCode(t.id)}</Badge></TableCell>
                        <TableCell className="font-medium">
                          {t.full_name}
                          {t.is_class_teacher && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-300 text-[10px]">Class Teacher</Badge>
                          )}
                          {t.is_class_teacher && t.class_teacher_class_name && (
                            <p className="text-[10px] text-amber-600 mt-0.5">{t.class_teacher_class_name} {t.class_teacher_stream_name}</p>
                          )}
                        </TableCell>
                        <TableCell>{t.email}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{getSubjectsForTeacher(t.id)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{getClassesForTeacher(t.id)}</TableCell>
                        <TableCell>{statusBadge(t.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditTeacher(t)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeactivateDialog({ open: true, teacher: t })}>
                              {t.status === 'deactivated' ? <UserCheck className="w-4 h-4 text-green-600" /> : <UserX className="w-4 h-4 text-red-600" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination page={teacherPage} total={totalTeacherPages} setPage={setTeacherPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Subject Assignments ({assignments.length})</CardTitle>
                <Button onClick={() => { setAssignForm(emptyAssignmentForm); setAssignDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Assign Subject</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Teacher Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedAssignments.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No assignments found.</TableCell></TableRow>
                    ) : pagedAssignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.subject_name}</TableCell>
                        <TableCell>{a.class_name}</TableCell>
                        <TableCell>{a.stream_name}</TableCell>
                        <TableCell className="font-medium">{a.teacher_name}</TableCell>
                        <TableCell><Badge variant="secondary" className="font-mono">{getCode(a.teacher_id)}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDeleteAssignDialog({ open: true, id: a.id })}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination page={assignPage} total={totalAssignPages} setPage={setAssignPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duties">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Teacher Duties ({duties.length})</CardTitle>
                <Button onClick={() => { setDutyForm(emptyDutyForm); setDutyDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Duty</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Duty Type</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedDuties.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No duties assigned.</TableCell></TableRow>
                    ) : pagedDuties.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.teacher_name}</TableCell>
                        <TableCell className="capitalize">{d.duty_type}</TableCell>
                        <TableCell>{d.day}</TableCell>
                        <TableCell>{d.time_slot}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDeleteDutyDialog({ open: true, id: d.id })}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination page={dutyPage} total={totalDutyPages} setPage={setDutyPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Weekly Duty Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Duty</TableHead>
                      {DAYS.map((d) => <TableHead key={d} className="min-w-[160px] text-center">{DAY_SHORT[d]}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DUTY_TYPES.map((dutyType) => (
                      <TableRow key={dutyType}>
                        <TableCell className="font-medium capitalize">{dutyType}</TableCell>
                        {DAYS.map((day) => {
                          const slotDuties = duties.filter((d) => d.duty_type === dutyType && d.day === day);
                          return (
                            <TableCell key={day} className="text-center">
                              {slotDuties.length === 0 ? (
                                <span className="text-muted-foreground text-xs">—</span>
                              ) : slotDuties.map((d) => (
                                <div key={d.id} className="mb-1">
                                  <p className="text-sm font-medium">{d.teacher_name}</p>
                                  <p className="text-[10px] text-muted-foreground">{d.time_slot}</p>
                                </div>
                              ))}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={teacherForm.full_name} onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee ID *</Label>
                <Input value={teacherForm.employee_id} onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })} />
              </div>
              <div>
                <Label>Teacher Code *</Label>
                <Input placeholder="e.g. TCH001" value={teacherForm.teacher_code} onChange={(e) => setTeacherForm({ ...teacherForm, teacher_code: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Subject Specialization</Label>
              <Input value={teacherForm.subject_specialization} onChange={(e) => setTeacherForm({ ...teacherForm, subject_specialization: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Select value={teacherForm.gender} onValueChange={(v) => setTeacherForm({ ...teacherForm, gender: v as HoiTeacher['gender'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Qualification</Label>
                <Input value={teacherForm.qualification} onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={teacherForm.status} onValueChange={(v) => setTeacherForm({ ...teacherForm, status: v as HoiTeacher['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg p-4 space-y-3 bg-amber-50/50">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="dhoiClassTeacherToggle" checked={teacherForm.is_class_teacher} onChange={(e) => setTeacherForm({ ...teacherForm, is_class_teacher: e.target.checked, class_teacher_class_id: '', class_teacher_stream_id: '' })} className="w-4 h-4 rounded border-gray-300" />
                <Label htmlFor="dhoiClassTeacherToggle" className="font-semibold text-amber-800 cursor-pointer">Assign as Class Teacher</Label>
              </div>
              {teacherForm.is_class_teacher && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Class *</Label>
                    <Select value={teacherForm.class_teacher_class_id} onValueChange={(v) => setTeacherForm({ ...teacherForm, class_teacher_class_id: v, class_teacher_stream_id: '' })}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Stream *</Label>
                    <Select value={teacherForm.class_teacher_stream_id} onValueChange={(v) => setTeacherForm({ ...teacherForm, class_teacher_stream_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                      <SelectContent>
                        {streams.filter(s => s.class_id === teacherForm.class_teacher_class_id).map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Login Password {!editingTeacher ? '*' : '(leave blank to keep current)'}</Label>
              <Input type="password" placeholder={editingTeacher ? 'Leave blank to keep current' : 'Set login password'} value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">This password will be used by the teacher to log in to the platform.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeacherDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTeacher}>{editingTeacher ? 'Update' : 'Add'} Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deactivateDialog.open} onOpenChange={(open) => setDeactivateDialog({ ...deactivateDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deactivateDialog.teacher?.status === 'deactivated' ? 'Reactivate' : 'Deactivate'} Teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateDialog.teacher?.status === 'deactivated'
                ? `Are you sure you want to reactivate ${deactivateDialog.teacher?.full_name}?`
                : `Are you sure you want to deactivate ${deactivateDialog.teacher?.full_name}? They will no longer appear as active.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleTeacherStatus}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Subject to Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Teacher *</Label>
              <Select value={assignForm.teacher_id} onValueChange={(v) => setAssignForm({ ...assignForm, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.filter((t) => t.status === 'active').map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Select value={assignForm.subject_id} onValueChange={(v) => setAssignForm({ ...assignForm, subject_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class *</Label>
              <Select value={assignForm.class_id} onValueChange={(v) => setAssignForm({ ...assignForm, class_id: v, stream_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stream *</Label>
              <Select value={assignForm.stream_id} onValueChange={(v) => setAssignForm({ ...assignForm, stream_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent>
                  {streams.filter((s) => s.class_id === assignForm.class_id).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAssignment}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAssignDialog.open} onOpenChange={(open) => setDeleteAssignDialog({ ...deleteAssignDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the subject assignment. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAssignment}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dutyDialogOpen} onOpenChange={setDutyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Duty</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Teacher *</Label>
              <Select value={dutyForm.teacher_id} onValueChange={(v) => setDutyForm({ ...dutyForm, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.filter((t) => t.status === 'active').map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duty Type *</Label>
              <Select value={dutyForm.duty_type} onValueChange={(v) => setDutyForm({ ...dutyForm, duty_type: v as HoiTeacherDuty['duty_type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DUTY_TYPES.map((dt) => (
                    <SelectItem key={dt} value={dt} className="capitalize">{dt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Day *</Label>
              <Select value={dutyForm.day} onValueChange={(v) => setDutyForm({ ...dutyForm, day: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Slot *</Label>
              <Input placeholder="e.g. 6:30 AM - 7:30 AM" value={dutyForm.time_slot} onChange={(e) => setDutyForm({ ...dutyForm, time_slot: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDutyDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDuty}>Assign Duty</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDutyDialog.open} onOpenChange={(open) => setDeleteDutyDialog({ ...deleteDutyDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Duty?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the duty assignment. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDuty}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
