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
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
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
  password: '',
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

export default function HoiTeachers() {
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [subjects, setSubjects] = useState<HoiSubject[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [duties, setDuties] = useState<HoiTeacherDuty[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherPage, setTeacherPage] = useState(1);
  const [assignPage, setAssignPage] = useState(1);

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

  const [dhoiDialogOpen, setDhoiDialogOpen] = useState(false);
  const [dhoiForm, setDhoiForm] = useState({ fullName: '', email: '', password: '', phone: '', employeeId: '' });
  const [existingDhoi, setExistingDhoi] = useState<any>(null);

  const loadData = () => {
    setTeachers(hoiTeachersStorage.getAll());
    setAssignments(hoiSubjectAssignmentsStorage.getAll());
    setSubjects(hoiSubjectsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
    setDuties(hoiTeacherDutiesStorage.getAll());
    try {
      const stored = localStorage.getItem('zaroda_dhoi_account');
      const accounts = stored ? JSON.parse(stored) : [];
      setExistingDhoi(Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null);
    } catch { setExistingDhoi(null); }
  };

  useEffect(() => { loadData(); }, []);

  const openDhoiDialog = () => {
    if (existingDhoi) {
      setDhoiForm({ fullName: existingDhoi.fullName, email: existingDhoi.email, password: '', phone: existingDhoi.phone, employeeId: existingDhoi.employeeId });
    } else {
      setDhoiForm({ fullName: '', email: '', password: '', phone: '', employeeId: '' });
    }
    setDhoiDialogOpen(true);
  };

  const saveDhoiAccount = () => {
    if (!dhoiForm.fullName.trim() || !dhoiForm.email.trim() || !dhoiForm.phone.trim() || !dhoiForm.employeeId.trim()) {
      toast({ title: 'Validation Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    if (!existingDhoi && !dhoiForm.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required for new accounts.', variant: 'destructive' });
      return;
    }
    const email = dhoiForm.email.trim().toLowerCase();
    const account = {
      id: existingDhoi?.id || crypto.randomUUID(),
      fullName: dhoiForm.fullName.trim(),
      email,
      phone: dhoiForm.phone.trim(),
      employeeId: dhoiForm.employeeId.trim(),
      schoolCode: '',
      status: 'active',
      createdAt: existingDhoi?.createdAt || new Date().toISOString(),
    };
    localStorage.setItem('zaroda_dhoi_account', JSON.stringify([account]));
    if (dhoiForm.password.trim()) {
      const passwords = JSON.parse(localStorage.getItem('zaroda_passwords') || '{}');
      passwords[email] = dhoiForm.password.trim();
      localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
    }
    toast({ title: existingDhoi ? 'DHOI Account Updated' : 'DHOI Account Created', description: `${account.fullName} can now log in as DHOI.` });
    setDhoiDialogOpen(false);
    loadData();
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTeacherPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const pagedTeachers = filteredTeachers.slice((teacherPage - 1) * PAGE_SIZE, teacherPage * PAGE_SIZE);

  const totalAssignPages = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE));
  const pagedAssignments = assignments.slice((assignPage - 1) * PAGE_SIZE, assignPage * PAGE_SIZE);

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
      password: '',
    });
    setTeacherDialogOpen(true);
  };

  const saveTeacher = () => {
    if (!teacherForm.full_name.trim() || !teacherForm.email.trim() || !teacherForm.employee_id.trim()) {
      toast({ title: 'Validation Error', description: 'Full name, email, and employee ID are required.', variant: 'destructive' });
      return;
    }
    if (!editingTeacher && !teacherForm.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required when adding a new teacher.', variant: 'destructive' });
      return;
    }
    const { password, ...teacherData } = teacherForm;
    if (editingTeacher) {
      hoiTeachersStorage.update(editingTeacher.id, teacherData);
      if (password.trim()) {
        const passwords = JSON.parse(localStorage.getItem('zaroda_passwords') || '{}');
        passwords[teacherForm.email.trim().toLowerCase()] = password.trim();
        localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
      }
      toast({ title: 'Teacher Updated', description: `${teacherForm.full_name} has been updated.` });
    } else {
      const newTeacher = hoiTeachersStorage.add({ ...teacherData, hired_at: new Date().toISOString().split('T')[0] });
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
          createdBy: 'HOI',
        });
      }
      toast({ title: 'Teacher Added', description: `${teacherForm.full_name} has been added. They can now log in with their email and password.` });
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

  const uniqueTeachersInDuties = [...new Set(duties.map((d) => d.teacher_name))];

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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Teacher Management</h1>
          <p className="text-muted-foreground">Manage teachers, subject assignments, and duty roster</p>
        </div>
        <Button variant="outline" className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950" onClick={openDhoiDialog}>
          <Shield className="w-4 h-4" />
          {existingDhoi ? 'Edit DHOI Account' : 'Create DHOI Account'}
        </Button>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="mb-6">
          <TabsTrigger value="teachers" className="gap-2"><Users className="w-4 h-4" />All Teachers</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><BookOpen className="w-4 h-4" />Subject Assignments</TabsTrigger>
          <TabsTrigger value="roster" className="gap-2"><ClipboardList className="w-4 h-4" />Duty Roster</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">All Teachers ({filteredTeachers.length})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setTeacherPage(1); }} className="pl-9 w-64" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTeachers.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No teachers found.</TableCell></TableRow>
                  ) : pagedTeachers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.full_name}</TableCell>
                      <TableCell>{t.employee_id}</TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell>{t.phone}</TableCell>
                      <TableCell>{t.subject_specialization}</TableCell>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedAssignments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No assignments found.</TableCell></TableRow>
                  ) : pagedAssignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.teacher_name}</TableCell>
                      <TableCell>{a.subject_name}</TableCell>
                      <TableCell>{a.class_name}</TableCell>
                      <TableCell>{a.stream_name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDeleteAssignDialog({ open: true, id: a.id })}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={assignPage} total={totalAssignPages} setPage={setAssignPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Weekly Duty Roster</CardTitle>
                  <Button onClick={() => { setDutyForm(emptyDutyForm); setDutyDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Duty</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Teacher</TableHead>
                        {DAYS.map((d) => <TableHead key={d} className="min-w-[140px]">{d}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueTeachersInDuties.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No duties assigned yet.</TableCell></TableRow>
                      ) : uniqueTeachersInDuties.map((tName) => (
                        <TableRow key={tName}>
                          <TableCell className="font-medium">{tName}</TableCell>
                          {DAYS.map((day) => {
                            const dayDuties = duties.filter((d) => d.teacher_name === tName && d.day === day);
                            return (
                              <TableCell key={day}>
                                {dayDuties.length === 0 ? (
                                  <span className="text-muted-foreground text-xs">—</span>
                                ) : dayDuties.map((d) => (
                                  <div key={d.id} className="mb-1">
                                    <Badge variant="outline" className="text-xs capitalize">{d.duty_type}</Badge>
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

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">All Duties ({duties.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Duty</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duties.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No duties assigned.</TableCell></TableRow>
                    ) : duties.map((d) => (
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
              </CardContent>
            </Card>
          </div>
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
                <Label>Gender</Label>
                <Select value={teacherForm.gender} onValueChange={(v) => setTeacherForm({ ...teacherForm, gender: v as HoiTeacher['gender'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject Specialization</Label>
              <Input value={teacherForm.subject_specialization} onChange={(e) => setTeacherForm({ ...teacherForm, subject_specialization: e.target.value })} />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input value={teacherForm.qualification} onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })} />
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

      <Dialog open={dhoiDialogOpen} onOpenChange={setDhoiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{existingDhoi ? 'Edit DHOI Account' : 'Create DHOI Account'}</DialogTitle>
          </DialogHeader>
          {existingDhoi && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 text-sm">
              <p className="text-indigo-700 dark:text-indigo-300">Current DHOI: <strong>{existingDhoi.fullName}</strong> ({existingDhoi.email})</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input placeholder="DHOI full name" value={dhoiForm.fullName} onChange={(e) => setDhoiForm({ ...dhoiForm, fullName: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="dhoi@school.ac.ke" value={dhoiForm.email} onChange={(e) => setDhoiForm({ ...dhoiForm, email: e.target.value })} />
            </div>
            <div>
              <Label>{existingDhoi ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
              <Input type="password" placeholder="Assign a password" value={dhoiForm.password} onChange={(e) => setDhoiForm({ ...dhoiForm, password: e.target.value })} />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input type="tel" placeholder="+254 7XX XXX XXX" value={dhoiForm.phone} onChange={(e) => setDhoiForm({ ...dhoiForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Employee ID *</Label>
              <Input placeholder="e.g. EMP-DHOI-001" value={dhoiForm.employeeId} onChange={(e) => setDhoiForm({ ...dhoiForm, employeeId: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDhoiDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDhoiAccount}>{existingDhoi ? 'Update Account' : 'Create Account'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
