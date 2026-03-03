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
} from '../../lib/hoiStorage';
import { platformUsersStorage } from '@/lib/storage';
import { sendWelcomeEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCbcLevelForClassName } from '@/lib/cbcSubjects';
import { useAuthContext } from '@/context/AuthContext';

const PAGE_SIZE = 10;
const TEACHER_CODES_KEY = 'zaroda_teacher_codes';
type TeacherAccountRole = 'teacher' | 'hod';

const SYSTEM_CREATED_BY = new Set(['superadmin', 'system', 'hoi', 'dhoi']);

const CBC_LEVEL_DIALOG_LABELS: Record<string, string> = {
  ECDE: 'ECDE Learning Areas',
  'Lower Primary': 'Lower Primary Learning Areas',
  'Upper Primary': 'Upper Primary Learning Areas',
  'Junior School': 'Junior Secondary Learning Areas',
};

const CBC_LEVEL_TO_CODE_PREFIX: Record<string, 'EC-' | 'LP-' | 'UP-' | 'JS-'> = {
  ECDE: 'EC-',
  'Lower Primary': 'LP-',
  'Upper Primary': 'UP-',
  'Junior School': 'JS-',
};

const CODE_PREFIX_TO_LABEL: Record<'EC-' | 'LP-' | 'UP-' | 'JS-', string> = {
  'EC-': 'ECDE Learning Areas',
  'LP-': 'Lower Primary Learning Areas',
  'UP-': 'Upper Primary Learning Areas',
  'JS-': 'Junior Secondary Learning Areas',
};

const getSubjectCodePrefix = (code: string): 'EC-' | 'LP-' | 'UP-' | 'JS-' | null => {
  const normalized = (code || '').trim().toUpperCase();
  if (normalized.startsWith('EC-')) return 'EC-';
  if (normalized.startsWith('LP-')) return 'LP-';
  if (normalized.startsWith('UP-')) return 'UP-';
  if (normalized.startsWith('JS-')) return 'JS-';
  return null;
};

const emptyTeacherForm = {
  full_name: '',
  email: '',
  phone: '',
  employee_id: '',
  account_role: 'teacher' as TeacherAccountRole,
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

type PendingAssignmentItem = {
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  stream_id: string;
  stream_name: string;
};

const emptyDutyForm = {
  teacher_id: '',
  teacher_two_id: '',
  from_date: '',
  to_date: '',
  remarks: '',
};

async function getTeacherCodes(schoolId: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('teacher_codes')
    .select('teacher_id,code')
    .eq('school_id', schoolId);
  if (error) return {};
  return (data || []).reduce((acc: Record<string, string>, row: any) => {
    if (row.teacher_id && row.code) {
      acc[row.teacher_id] = String(row.code);
    }
    return acc;
  }, {});
}

async function saveTeacherCode(teacherId: string, code: string, schoolId: string, schoolCode: string): Promise<void> {
  await supabase
    .from('teacher_codes')
    .upsert({
      teacher_id: teacherId,
      code,
      school_id: schoolId,
      school_code: schoolCode,
    }, { onConflict: 'teacher_id' });
}

async function removeTeacherCode(teacherId: string, schoolId: string): Promise<void> {
  await supabase
    .from('teacher_codes')
    .delete()
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId);
}

export default function DhoiTeachers() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

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

  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<HoiTeacher | null>(null);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);

  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; teacher: HoiTeacher | null }>({ open: false, teacher: null });
  const [deleteTeacherDialog, setDeleteTeacherDialog] = useState<{ open: boolean; teacher: HoiTeacher | null }>({ open: false, teacher: null });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssignmentForm);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignmentItem[]>([]);

  const [dutyDialogOpen, setDutyDialogOpen] = useState(false);
  const [dutyForm, setDutyForm] = useState(emptyDutyForm);

  const [deleteAssignDialog, setDeleteAssignDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [deleteDutyDialog, setDeleteDutyDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const loadData = async () => {
    setTeachers(hoiTeachersStorage.getAll());
    setAssignments(hoiSubjectAssignmentsStorage.getAll());
    setSubjects(hoiSubjectsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
    setDuties(hoiTeacherDutiesStorage.getAll());
    if (!currentUser?.schoolId) {
      setTeacherCodesState({});
      return;
    }

    const [classResult, streamResult, subjectResult, assignmentResult, teacherResult] = await Promise.all([
      supabase
        .from('hoi_classes')
        .select('id,name,level,created_at')
        .eq('school_id', currentUser.schoolId)
        .order('created_at', { ascending: true }),
      supabase
        .from('hoi_streams')
        .select('id,class_id,name,class_teacher_id,class_teacher_name,student_count')
        .eq('school_id', currentUser.schoolId),
      supabase
        .from('hoi_subjects')
        .select('id,name,code,category,description,school_id')
        .eq('school_id', currentUser.schoolId)
        .order('name', { ascending: true }),
      supabase
        .from('hoi_subject_assignments')
        .select('*')
        .eq('school_id', currentUser.schoolId)
        .order('teacher_name', { ascending: true }),
      supabase
        .from('hoi_teachers')
        .select('*')
        .eq('school_id', currentUser.schoolId)
        .order('full_name', { ascending: true }),
    ]);

    if (!teacherResult.error) {
      const loadedTeachers: HoiTeacher[] = (teacherResult.data || []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name || '',
        email: row.email || '',
        phone: row.phone || '',
        employee_id: row.employee_id || '',
        subject_specialization: row.subject_specialization || '',
        gender: row.gender === 'Female' ? 'Female' : 'Male',
        qualification: row.qualification || '',
        status: row.status || 'active',
        hired_at: row.hired_at || '',
        is_class_teacher: Boolean(row.is_class_teacher),
        class_teacher_class_id: row.class_teacher_class_id || undefined,
        class_teacher_class_name: row.class_teacher_class_name || undefined,
        class_teacher_stream_id: row.class_teacher_stream_id || undefined,
        class_teacher_stream_name: row.class_teacher_stream_name || undefined,
      }));
      setTeachers(loadedTeachers);
    }

    if (!classResult.error) {
      const loadedClasses: HoiClass[] = (classResult.data || []).map((row: any) => ({
        id: row.id,
        name: row.name || '',
        level: row.level || 'primary',
        created_at: row.created_at || '',
      }));
      setClasses(loadedClasses);
    }

    if (!streamResult.error) {
      const loadedStreams: HoiStream[] = (streamResult.data || []).map((row: any) => ({
        id: row.id,
        class_id: row.class_id || '',
        name: row.name || '',
        class_teacher_id: row.class_teacher_id || undefined,
        class_teacher_name: row.class_teacher_name || undefined,
        student_count: Number(row.student_count || 0),
      }));
      setStreams(loadedStreams);
    }

    if (!subjectResult.error) {
      const byName = new Map<string, HoiSubject>();
      (subjectResult.data || []).forEach((row: any) => {
        const key = String(row.name || '').trim().toLowerCase();
        if (!key || byName.has(key)) return;
        byName.set(key, {
          id: String(row.id),
          name: String(row.name || ''),
          code: String(row.code || ''),
          category: (row.category || 'Lower Primary') as HoiSubject['category'],
          description: row.description || '',
        });
      });
      setSubjects(Array.from(byName.values()));
    }

    if (!assignmentResult.error) {
      const mappedAssignments: HoiSubjectAssignment[] = (assignmentResult.data || []).map((row: any) => ({
        id: row.id,
        teacher_id: row.teacher_id || '',
        teacher_name: row.teacher_name || '',
        subject_id: row.subject_id || '',
        subject_name: row.subject_name || '',
        class_id: row.class_id || '',
        class_name: row.class_name || '',
        stream_id: row.stream_id || '',
        stream_name: row.stream_name || '',
      }));
      setAssignments(mappedAssignments);
    }

    setTeacherCodesState(await getTeacherCodes(currentUser.schoolId));
  };

  useEffect(() => { void loadData(); }, [currentUser?.schoolId]);

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
  const selectedAssignClass = classes.find((classItem) => classItem.id === assignForm.class_id);
  const selectedAssignClassLevel = selectedAssignClass ? getCbcLevelForClassName(selectedAssignClass.name) : null;
  const selectedAssignCodePrefix = selectedAssignClassLevel
    ? CBC_LEVEL_TO_CODE_PREFIX[selectedAssignClassLevel] || null
    : null;
  const selectedAssignGroupLabel = selectedAssignCodePrefix
    ? CODE_PREFIX_TO_LABEL[selectedAssignCodePrefix]
    : null;
  const selectedAssignClassStreams = streams.filter((stream) => stream.class_id === assignForm.class_id);
  const filteredAssignSubjects = selectedAssignCodePrefix
    ? subjects.filter((subject) => getSubjectCodePrefix(subject.code) === selectedAssignCodePrefix)
    : [];

  const rosterEntries = [...duties].sort((a, b) => a.from_date.localeCompare(b.from_date));

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
      account_role: 'teacher',
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

  const saveTeacher = async () => {
    if (!teacherForm.full_name.trim() || !teacherForm.email.trim() || !teacherForm.employee_id.trim() || !teacherForm.teacher_code.trim()) {
      toast({ title: 'Validation Error', description: 'Full name, email, employee ID, and teacher code are required.', variant: 'destructive' });
      return;
    }
    if (!editingTeacher && !teacherForm.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required when adding a new teacher.', variant: 'destructive' });
      return;
    }
    if (!currentUser?.schoolId || !currentUser.schoolCode || !currentUser.schoolName) {
      toast({ title: 'Validation Error', description: 'Your account is missing school tenant details.', variant: 'destructive' });
      return;
    }
    const codeVal = teacherForm.teacher_code.trim().toUpperCase();
    const existingCodes = await getTeacherCodes(currentUser.schoolId);
    const codeConflict = Object.entries(existingCodes).find(([tid, c]) => c === codeVal && tid !== (editingTeacher?.id || ''));
    if (codeConflict) {
      toast({ title: 'Duplicate Code', description: `Teacher code "${codeVal}" is already assigned to another teacher.`, variant: 'destructive' });
      return;
    }

    const { teacher_code, account_role, password, is_class_teacher, class_teacher_class_id, class_teacher_stream_id, ...teacherData } = teacherForm;
    const profileRole: 'teacher' | 'hod' = account_role === 'hod' ? 'hod' : 'teacher';
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
      await saveTeacherCode(editingTeacher.id, codeVal, currentUser.schoolId, currentUser.schoolCode);
      if (password.trim()) {
        toast({
          title: 'Password Notice',
          description: 'Teacher profile updated in Supabase. Password changes must be handled via Supabase Auth.',
        });
      }
      const existingPU = await platformUsersStorage.findByEmail(teacherForm.email.trim().toLowerCase());
      if (existingPU) {
        await platformUsersStorage.update(existingPU.id, {
          role: account_role,
          isClassTeacher: classTeacherFields.is_class_teacher,
          classTeacherClassId: classTeacherFields.class_teacher_class_id,
          classTeacherClassName: classTeacherFields.class_teacher_class_name,
          classTeacherStreamId: classTeacherFields.class_teacher_stream_id,
          classTeacherStreamName: classTeacherFields.class_teacher_stream_name,
        });
      }
      toast({ title: 'Teacher Updated', description: `${teacherForm.full_name} has been updated.` });
    } else {
      const signupEmail = teacherForm.email.trim().toLowerCase();
      const { data: authData, error: createAuthError } = await supabase.auth.signUp({
        email: signupEmail,
        password: password.trim(),
        options: {
          data: {
            full_name: teacherForm.full_name.trim(),
            role: profileRole,
            school_code: currentUser.schoolCode,
          },
        },
      });
      if (createAuthError) {
        toast({ title: 'Teacher Save Error', description: createAuthError.message, variant: 'destructive' });
        return;
      }

      const authUser = authData.user;
      if (!authUser) {
        toast({ title: 'Teacher Save Error', description: 'Auth user was not created.', variant: 'destructive' });
        return;
      }

      const { error: profileUpsertError } = await supabase.from('profiles').insert({
        id: authUser.id,
        email: signupEmail,
        full_name: teacherForm.full_name.trim(),
        role: profileRole,
        school_id: currentUser.schoolId,
        school_code: currentUser.schoolCode,
        school_name: currentUser.schoolName,
        phone: teacherForm.phone.trim() || null,
        status: 'active',
        subject: teacherForm.subject_specialization.trim() || null,
        created_by: 'DHOI',
      });
      if (profileUpsertError) {
        toast({ title: 'Teacher Save Error', description: profileUpsertError.message, variant: 'destructive' });
        return;
      }

      const { data: insertedTeacher, error: teacherInsertError } = await supabase
        .from('hoi_teachers')
        .insert({
          full_name: teacherForm.full_name.trim(),
          email: signupEmail,
          phone: teacherForm.phone.trim() || null,
          employee_id: teacherForm.employee_id.trim(),
          subject_specialization: teacherForm.subject_specialization.trim() || null,
          gender: teacherForm.gender,
          qualification: teacherForm.qualification.trim() || null,
          status: teacherForm.status,
          hired_at: new Date().toISOString().split('T')[0],
          is_class_teacher: classTeacherFields.is_class_teacher,
          class_teacher_class_id: classTeacherFields.class_teacher_class_id || null,
          class_teacher_class_name: classTeacherFields.class_teacher_class_name || null,
          class_teacher_stream_id: classTeacherFields.class_teacher_stream_id || null,
          class_teacher_stream_name: classTeacherFields.class_teacher_stream_name || null,
          school_id: currentUser.schoolId,
          school_code: currentUser.schoolCode,
          school_name: currentUser.schoolName,
          profile_id: authUser.id,
        })
        .select('id')
        .maybeSingle();

      if (teacherInsertError || !insertedTeacher?.id) {
        toast({ title: 'Teacher Save Error', description: teacherInsertError?.message || 'Teacher record was not created.', variant: 'destructive' });
        return;
      }

      await saveTeacherCode(insertedTeacher.id, codeVal, currentUser.schoolId, currentUser.schoolCode);

      if (password.trim()) {
        toast({
          title: 'Password Notice',
          description: 'Teacher profile created in Supabase. Password setup must be completed via Supabase Auth.',
        });
      }
      const allUsers = await platformUsersStorage.getAll();
      const existing = allUsers.find(u => u.email.toLowerCase() === teacherForm.email.trim().toLowerCase());
      if (!existing) {
        await platformUsersStorage.add({
          email: signupEmail,
          fullName: teacherForm.full_name.trim(),
          role: profileRole,
          schoolCode: currentUser.schoolCode,
          schoolName: currentUser.schoolName,
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
        await platformUsersStorage.update(existing.id, {
          isClassTeacher: classTeacherFields.is_class_teacher,
          classTeacherClassId: classTeacherFields.class_teacher_class_id,
          classTeacherClassName: classTeacherFields.class_teacher_class_name,
          classTeacherStreamId: classTeacherFields.class_teacher_stream_id,
          classTeacherStreamName: classTeacherFields.class_teacher_stream_name,
        });
      }

      void sendWelcomeEmail({
        email: signupEmail,
        fullName: teacherForm.full_name.trim(),
        role: profileRole,
        schoolCode: currentUser.schoolCode,
        createdBy: 'DHOI',
      });

      if (profileRole === 'teacher') {
        toast({
          title: 'Success',
          description: `Teacher created! They can login with school code ${currentUser.schoolCode} and their email`,
        });
      } else {
        toast({
          title: 'Success',
          description: `HOD created successfully. They can login with school code ${currentUser.schoolCode} and their email`,
        });
      }
    }
    setTeacherDialogOpen(false);
    await loadData();
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

  const isSystemCreatedTeacher = async (teacher: HoiTeacher) => {
    const platformUser = await platformUsersStorage.findByEmail(teacher.email);
    if (!platformUser) return true;
    if (platformUser.role !== 'teacher') return false;
    const createdBy = (platformUser.createdBy || '').trim().toLowerCase();
    return SYSTEM_CREATED_BY.has(createdBy);
  };

  const deleteTeacher = async () => {
    const teacher = deleteTeacherDialog.teacher;
    if (!teacher) return;

    if (!(await isSystemCreatedTeacher(teacher))) {
      toast({
        title: 'Delete Not Allowed',
        description: 'Only system-created teacher accounts can be deleted by HOI/DHOI.',
        variant: 'destructive',
      });
      setDeleteTeacherDialog({ open: false, teacher: null });
      return;
    }

    hoiSubjectAssignmentsStorage
      .getAll()
      .filter((assignment) => assignment.teacher_id === teacher.id)
      .forEach((assignment) => hoiSubjectAssignmentsStorage.remove(assignment.id));

    hoiTeacherDutiesStorage
      .getAll()
      .filter((duty) => duty.teacher_id === teacher.id)
      .forEach((duty) => hoiTeacherDutiesStorage.remove(duty.id));

    hoiStreamsStorage
      .getAll()
      .filter((stream) => stream.class_teacher_id === teacher.id)
      .forEach((stream) => hoiStreamsStorage.update(stream.id, {
        class_teacher_id: undefined,
        class_teacher_name: undefined,
      }));

    hoiTeachersStorage.remove(teacher.id);

    const teacherAccount = await platformUsersStorage.findByEmail(teacher.email);
    if (teacherAccount?.role === 'teacher') {
      await platformUsersStorage.remove(teacherAccount.id);
    }

    if (currentUser?.schoolId) {
      await removeTeacherCode(teacher.id, currentUser.schoolId);
    }

    toast({ title: 'Teacher Deleted', description: `${teacher.full_name} and related records have been removed.` });
    setDeleteTeacherDialog({ open: false, teacher: null });
    await loadData();
  };

  const buildPendingAssignment = () => {
    if (!assignForm.teacher_id || !assignForm.subject_id || !assignForm.class_id) {
      toast({ title: 'Validation Error', description: 'Teacher, learning area, and class are required.', variant: 'destructive' });
      return null;
    }

    const classStreams = streams.filter((s) => s.class_id === assignForm.class_id);
    const requiresStream = classStreams.length > 1;
    const resolvedStreamId = assignForm.stream_id || (classStreams.length === 1 ? classStreams[0].id : '');

    if (requiresStream && !resolvedStreamId) {
      toast({ title: 'Validation Error', description: 'Stream is required when the selected class has multiple streams.', variant: 'destructive' });
      return null;
    }

    const teacher = teachers.find((t) => t.id === assignForm.teacher_id);
    const subject = subjects.find((s) => s.id === assignForm.subject_id);
    const cls = classes.find((c) => c.id === assignForm.class_id);
    const stream = resolvedStreamId ? streams.find((s) => s.id === resolvedStreamId) : null;
    if (!teacher || !subject || !cls) return null;

    const classLevel = getCbcLevelForClassName(cls.name);
    const expectedPrefix = classLevel ? CBC_LEVEL_TO_CODE_PREFIX[classLevel] : null;
    const subjectPrefix = getSubjectCodePrefix(subject.code);
    if (expectedPrefix && subjectPrefix !== expectedPrefix) {
      toast({
        title: 'Validation Error',
        description: `Only ${CODE_PREFIX_TO_LABEL[expectedPrefix]} can be assigned to ${cls.name}.`,
        variant: 'destructive',
      });
      return null;
    }
    if (resolvedStreamId && !stream) {
      toast({ title: 'Validation Error', description: 'Selected stream is invalid for this class.', variant: 'destructive' });
      return null;
    }

    const existsInPending = pendingAssignments.some((assignment) =>
      assignment.teacher_id === teacher.id &&
      assignment.subject_id === subject.id &&
      assignment.class_id === cls.id &&
      assignment.stream_id === (stream?.id || '')
    );

    if (existsInPending) {
      toast({ title: 'Duplicate Entry', description: 'This learning area assignment is already added.', variant: 'destructive' });
      return null;
    }

    return {
      teacher_id: teacher.id,
      teacher_name: teacher.full_name,
      subject_id: subject.id,
      subject_name: subject.name,
      class_id: cls.id,
      class_name: cls.name,
      stream_id: stream?.id || '',
      stream_name: stream?.name || 'No streams (whole class)',
    } as PendingAssignmentItem;
  };

  const addAnotherAssignment = () => {
    const pendingAssignment = buildPendingAssignment();
    if (!pendingAssignment) return;
    setPendingAssignments((prev) => [...prev, pendingAssignment]);
    setAssignForm((prev) => ({ ...prev, class_id: '', stream_id: '', subject_id: '' }));
  };

  const removePendingAssignment = (index: number) => {
    setPendingAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAssignment = async () => {
    if (!currentUser?.schoolId) {
      toast({ title: 'Validation Error', description: 'Missing school context.', variant: 'destructive' });
      return;
    }

    let batch = [...pendingAssignments];
    const hasCurrentSelection = Boolean(assignForm.teacher_id || assignForm.class_id || assignForm.subject_id || assignForm.stream_id);
    if (hasCurrentSelection) {
      const pendingAssignment = buildPendingAssignment();
      if (!pendingAssignment) return;
      batch = [...batch, pendingAssignment];
    }

    if (batch.length === 0) {
      toast({ title: 'Validation Error', description: 'Add at least one assignment before saving.', variant: 'destructive' });
      return;
    }

    const payload = batch.map((assignment) => ({
      school_id: currentUser.schoolId,
      school_code: currentUser.schoolCode || null,
      teacher_id: assignment.teacher_id,
      teacher_name: assignment.teacher_name,
      subject_id: assignment.subject_id,
      subject_name: assignment.subject_name,
      class_id: assignment.class_id,
      class_name: assignment.class_name,
      stream_id: assignment.stream_id || null,
      stream_name: assignment.stream_id ? assignment.stream_name : null,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('hoi_subject_assignments').insert(payload);

    if (error) {
      toast({ title: 'Assignment Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Learning areas assigned successfully.' });
    setAssignDialogOpen(false);
    setAssignForm(emptyAssignmentForm);
    setPendingAssignments([]);
    await loadData();
  };

  const deleteAssignment = () => {
    if (deleteAssignDialog.id) {
      void (async () => {
        const { error } = await supabase
          .from('hoi_subject_assignments')
          .delete()
          .eq('school_id', currentUser?.schoolId || '')
          .eq('id', deleteAssignDialog.id);

        if (error) {
          toast({ title: 'Delete Error', description: error.message, variant: 'destructive' });
          return;
        }

        toast({ title: 'Success', description: 'Learning area assignment removed successfully' });
        setDeleteAssignDialog({ open: false, id: null });
        await loadData();
      })();
    }
  };

  const saveDuty = () => {
    if (!dutyForm.teacher_id || !dutyForm.from_date || !dutyForm.to_date) {
      toast({ title: 'Validation Error', description: 'Teacher, from date, and to date are required.', variant: 'destructive' });
      return;
    }
    if (dutyForm.from_date > dutyForm.to_date) {
      toast({ title: 'Validation Error', description: 'From date cannot be after to date.', variant: 'destructive' });
      return;
    }
    const teacher = teachers.find((t) => t.id === dutyForm.teacher_id);
    const teacherTwo = dutyForm.teacher_two_id ? teachers.find((t) => t.id === dutyForm.teacher_two_id) : null;
    if (!teacher) return;
    hoiTeacherDutiesStorage.add({
      teacher_id: teacher.id,
      teacher_name: teacher.full_name,
      teacher_two_id: teacherTwo?.id || '',
      teacher_two_name: teacherTwo?.full_name || '',
      from_date: dutyForm.from_date,
      to_date: dutyForm.to_date,
      remarks: dutyForm.remarks.trim(),
    });
    toast({
      title: 'Weekly Rotation Saved',
      description: teacherTwo
        ? `${teacher.full_name} and ${teacherTwo.full_name} assigned for ${dutyForm.from_date} to ${dutyForm.to_date}`
        : `${teacher.full_name} assigned for ${dutyForm.from_date} to ${dutyForm.to_date}`,
    });
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
        <p className="text-muted-foreground">Manage teachers, learning area assignments, and weekly duty roster</p>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="mb-6">
          <TabsTrigger value="teachers" className="gap-2"><Users className="w-4 h-4" />All Teachers</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><BookOpen className="w-4 h-4" />Learning Area Assignments</TabsTrigger>
          <TabsTrigger value="roster" className="gap-2"><ClipboardList className="w-4 h-4" />Weekly Duty Roster</TabsTrigger>
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
                      <SelectItem value="all">All Status</SelectItem>
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
                            {isSystemCreatedTeacher(t) && (
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTeacherDialog({ open: true, teacher: t })}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
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
                <CardTitle className="text-lg">Learning Area Assignments ({assignments.length})</CardTitle>
                <Button onClick={() => { setAssignForm(emptyAssignmentForm); setPendingAssignments([]); setAssignDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Assign Learning Area</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Learning Area</TableHead>
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

        <TabsContent value="roster">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Weekly Duty Roster</CardTitle>
                <Button onClick={() => { setDutyForm(emptyDutyForm); setDutyDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Weekly Rotation</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Teacher 2 (Optional)</TableHead>
                      <TableHead>From Date</TableHead>
                      <TableHead>To Date</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rosterEntries.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No weekly rotations assigned.</TableCell></TableRow>
                    ) : rosterEntries.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.teacher_name}</TableCell>
                        <TableCell>{d.teacher_two_name || '—'}</TableCell>
                        <TableCell>{d.from_date}</TableCell>
                        <TableCell>{d.to_date}</TableCell>
                        <TableCell>{d.remarks || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDeleteDutyDialog({ open: true, id: d.id })}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                        </TableCell>
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
                <Label>Role *</Label>
                <Select value={teacherForm.account_role} onValueChange={(v) => setTeacherForm({ ...teacherForm, account_role: v as TeacherAccountRole })} disabled={!!editingTeacher}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="hod">HOD</SelectItem>
                  </SelectContent>
                </Select>
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
            <div>
              <Label>Qualification</Label>
              <Input value={teacherForm.qualification} onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })} />
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

      <AlertDialog open={deleteTeacherDialog.open} onOpenChange={(open) => setDeleteTeacherDialog({ ...deleteTeacherDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTeacherDialog.teacher?.full_name}, including their learning area assignments and duty records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTeacher}>Delete Teacher</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignDialogOpen} onOpenChange={(open) => {
        setAssignDialogOpen(open);
        if (!open) {
          setAssignForm(emptyAssignmentForm);
          setPendingAssignments([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Learning Area to Teacher</DialogTitle>
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
              <Label>Class *</Label>
              <Select value={assignForm.class_id} onValueChange={(v) => setAssignForm({ ...assignForm, class_id: v, stream_id: '', subject_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Learning Area *</Label>
              <select
                value={assignForm.subject_id}
                onChange={(event) => setAssignForm({ ...assignForm, subject_id: event.target.value })}
                disabled={!assignForm.class_id}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-h-64 overflow-y-auto disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled>
                  {assignForm.class_id ? 'Select learning area' : 'Select class first'}
                </option>
                {selectedAssignGroupLabel && filteredAssignSubjects.length > 0 && (
                  <optgroup label={selectedAssignGroupLabel}>
                    {filteredAssignSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div>
              <Label>Stream (optional for single-stream classes)</Label>
              <Select
                value={assignForm.stream_id || '_whole_class'}
                onValueChange={(v) => setAssignForm({ ...assignForm, stream_id: v === '_whole_class' ? '' : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent>
                  {selectedAssignClassStreams.length === 0 && (
                    <SelectItem value="_whole_class">No streams (whole class)</SelectItem>
                  )}
                  {selectedAssignClassStreams.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {pendingAssignments.length > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                <Label>Assignments to save</Label>
                <div className="space-y-2">
                  {pendingAssignments.map((assignment, index) => (
                    <div key={`${assignment.teacher_id}-${assignment.subject_id}-${assignment.class_id}-${assignment.stream_id}-${index}`} className="flex items-center justify-between text-sm">
                      <span>{assignment.class_name} | {assignment.stream_name} | {assignment.subject_name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePendingAssignment(index)}>×</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="outline" onClick={addAnotherAssignment}>Add Another</Button>
            <Button onClick={saveAssignment}>Assign All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAssignDialog.open} onOpenChange={(open) => setDeleteAssignDialog({ ...deleteAssignDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the learning area assignment. This action cannot be undone.</AlertDialogDescription>
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
            <DialogTitle>Add Weekly Duty Rotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
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
              <Label>Second Teacher (Optional)</Label>
              <Select value={dutyForm.teacher_two_id || 'none'} onValueChange={(v) => setDutyForm({ ...dutyForm, teacher_two_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select second teacher" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teachers.filter((t) => t.status === 'active' && t.id !== dutyForm.teacher_id).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Date *</Label>
                <Input type="date" value={dutyForm.from_date} onChange={(e) => setDutyForm({ ...dutyForm, from_date: e.target.value })} />
              </div>
              <div>
                <Label>To Date *</Label>
                <Input type="date" value={dutyForm.to_date} onChange={(e) => setDutyForm({ ...dutyForm, to_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Remarks</Label>
              <Input placeholder="Optional notes for the week" value={dutyForm.remarks} onChange={(e) => setDutyForm({ ...dutyForm, remarks: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDutyDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDuty}>Save Rotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDutyDialog.open} onOpenChange={(open) => setDeleteDutyDialog({ ...deleteDutyDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Weekly Rotation?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the weekly rotation entry. This action cannot be undone.</AlertDialogDescription>
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
