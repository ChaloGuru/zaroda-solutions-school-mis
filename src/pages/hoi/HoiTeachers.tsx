import { useState, useEffect, useMemo, useRef } from 'react';
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
import { platformUsersStorage, schoolsStorage, type PlatformUser, type School } from '@/lib/storage';
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
  Shield,
  Upload,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCbcLevelForClassName } from '@/lib/cbcSubjects';
import { useAuthContext } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const PAGE_SIZE = 10;
type TeacherAccountRole = 'teacher' | 'hod';

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

const SYSTEM_CREATED_BY = new Set(['superadmin', 'system', 'hoi', 'dhoi']);

type DhoiAccount = {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  createdAt?: string;
  schoolCode?: string;
  status?: 'active' | 'suspended' | 'inactive';
};

type StaffRow = HoiTeacher & {
  staffRole: 'teacher' | 'hoi' | 'dhoi' | 'hod';
};

type AssignableStaffRole = 'teacher' | 'hoi' | 'dhoi' | 'hod';

type AssignableStaff = {
  id: string;
  full_name: string;
  role: AssignableStaffRole;
  email?: string;
  phone?: string;
  status?: HoiTeacher['status'];
};

const emptyTeacherForm = {
  full_name: '',
  email: '',
  phone: '',
  employee_id: '',
  teacher_code: '',
  account_role: 'teacher' as TeacherAccountRole,
  subject_specialization: '',
  gender: 'Male' as HoiTeacher['gender'],
  qualification: '',
  status: 'active' as HoiTeacher['status'],
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

const formatErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object') {
    const details = error as { message?: string; error_description?: string };
    return details.message || details.error_description || JSON.stringify(error) || 'Please try again.';
  }
  return String(error || 'Please try again.');
};

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

export default function HoiTeachers() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [subjects, setSubjects] = useState<HoiSubject[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [duties, setDuties] = useState<HoiTeacherDuty[]>([]);
  const [teacherCodes, setTeacherCodesState] = useState<Record<string, string>>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [dhoiStaff, setDhoiStaff] = useState<PlatformUser[]>([]);
  const [leadershipAssignableStaff, setLeadershipAssignableStaff] = useState<AssignableStaff[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherPage, setTeacherPage] = useState(1);
  const [assignPage, setAssignPage] = useState(1);

  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<HoiTeacher | null>(null);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [teacherSchoolId, setTeacherSchoolId] = useState('');

  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; teacher: HoiTeacher | null }>({ open: false, teacher: null });
  const [deleteTeacherDialog, setDeleteTeacherDialog] = useState<{ open: boolean; teacher: HoiTeacher | null }>({ open: false, teacher: null });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssignmentForm);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignmentItem[]>([]);

  const [dutyDialogOpen, setDutyDialogOpen] = useState(false);
  const [dutyForm, setDutyForm] = useState(emptyDutyForm);

  const [deleteAssignDialog, setDeleteAssignDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [deleteDutyDialog, setDeleteDutyDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const [dhoiDialogOpen, setDhoiDialogOpen] = useState(false);
  const [dhoiForm, setDhoiForm] = useState({ fullName: '', email: '', password: '', phone: '', employeeId: '' });
  const [existingDhoi, setExistingDhoi] = useState<DhoiAccount | null>(null);
  const teacherCsvInputRef = useRef<HTMLInputElement>(null);
  const [teacherBulkImportOpen, setTeacherBulkImportOpen] = useState(false);
  const [teacherCsvRows, setTeacherCsvRows] = useState<Array<Record<string, string>>>([]);
  const [teacherCsvPreview, setTeacherCsvPreview] = useState<string[][]>([]);
  const [teacherImportPayload, setTeacherImportPayload] = useState<any[]>([]);
  const [teacherImportCodes, setTeacherImportCodes] = useState<Record<string, string>>({});
  const [teacherValidationErrors, setTeacherValidationErrors] = useState<string[]>([]);
  const [teacherValidationWarnings, setTeacherValidationWarnings] = useState<string[]>([]);

  const loadAssignmentsFromSupabase = async (schoolId: string) => {
    const { data, error } = await supabase
      .from('hoi_subject_assignments')
      .select('*')
      .eq('school_id', schoolId)
      .order('teacher_name', { ascending: true });

    if (error) {
      toast({
        title: 'Assignments Load Error',
        description: error.message,
        variant: 'destructive',
      });
      setAssignments([]);
      return;
    }

    const mappedAssignments: HoiSubjectAssignment[] = (data || []).map((row: any) => ({
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
  };

  const loadData = async () => {
    setTeachers(hoiTeachersStorage.getAll());
    setSubjects(hoiSubjectsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
    setDuties(hoiTeacherDutiesStorage.getAll());
    if (currentUser?.schoolId) {
      setTeacherCodesState(await getTeacherCodes(currentUser.schoolId));
    } else {
      setTeacherCodesState({});
    }
    try {
      const schoolRows = await schoolsStorage.getAll();
      console.log('HOI teacher form schools loaded:', schoolRows);
      const scopedSchools = currentUser?.schoolId
        ? schoolRows.filter((school) => school.id === currentUser.schoolId)
        : schoolRows;
      setSchools(scopedSchools);
      if (!teacherSchoolId && scopedSchools.length > 0) {
        setTeacherSchoolId(scopedSchools[0].id);
      }
    } catch (error) {
      console.error('HOI teacher school load error:', error);
    }
    try {
      const dhoiUsers = await platformUsersStorage.getByRole('dhoi');
      setDhoiStaff(dhoiUsers);
      const first = dhoiUsers[0];
      setExistingDhoi(first ? {
        id: first.id,
        fullName: first.fullName,
        email: first.email,
        phone: first.phone,
        employeeId: '',
        createdAt: first.createdAt,
        schoolCode: first.schoolCode,
        status: first.status,
      } : null);
    } catch {
      setDhoiStaff([]);
      setExistingDhoi(null);
    }

    if (currentUser?.schoolId) {
      const [classResult, streamResult, subjectResult, teacherResult] = await Promise.all([
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

      await loadAssignmentsFromSupabase(currentUser.schoolId);

      const { data: leadershipRows } = await supabase
        .from('profiles')
        .select('id, full_name, role, school_id, status, email, phone')
        .eq('school_id', currentUser.schoolId)
        .in('role', ['hoi', 'dhoi', 'hod']);

      if (leadershipRows && Array.isArray(leadershipRows)) {
        const mapped = leadershipRows
          .filter((row) => row.id && row.full_name && (row.status === 'active' || !row.status))
          .map((row) => ({
            id: String(row.id),
            full_name: String(row.full_name),
            role: (row.role === 'hoi' || row.role === 'dhoi' || row.role === 'hod' ? row.role : 'teacher') as AssignableStaffRole,
            email: row.email ? String(row.email) : '',
            phone: row.phone ? String(row.phone) : '',
            status: row.status === 'deactivated' ? 'deactivated' : 'active',
          } as AssignableStaff));
        setLeadershipAssignableStaff(mapped);
      } else {
        setLeadershipAssignableStaff([]);
      }
    } else {
      setLeadershipAssignableStaff([]);
    }
  };

  useEffect(() => { void loadData(); }, [currentUser?.schoolId]);

  const assignableStaff = useMemo(() => {
    const activeTeachers: AssignableStaff[] = teachers
      .filter((teacher) => teacher.status === 'active')
      .map((teacher) => ({ id: teacher.id, full_name: teacher.full_name, role: 'teacher' }));

    const activeLeadership = leadershipAssignableStaff.filter((staff) => (staff.status || 'active') === 'active');

    const merged = new Map<string, AssignableStaff>();
    activeTeachers.forEach((staff) => merged.set(staff.id, staff));
    activeLeadership.forEach((staff) => {
      if (!merged.has(staff.id)) merged.set(staff.id, staff);
    });

    return Array.from(merged.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [teachers, leadershipAssignableStaff]);

  const openDhoiDialog = () => {
    if (existingDhoi) {
      setDhoiForm({ fullName: existingDhoi.fullName, email: existingDhoi.email, password: '', phone: existingDhoi.phone, employeeId: existingDhoi.employeeId });
    } else {
      setDhoiForm({ fullName: '', email: '', password: '', phone: '', employeeId: '' });
    }
    setDhoiDialogOpen(true);
  };

  const saveDhoiAccount = async () => {
    if (!dhoiForm.fullName.trim() || !dhoiForm.email.trim() || !dhoiForm.phone.trim() || !dhoiForm.employeeId.trim()) {
      toast({ title: 'Validation Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    const email = dhoiForm.email.trim().toLowerCase();
    const account: DhoiAccount = {
      id: existingDhoi?.id || crypto.randomUUID(),
      fullName: dhoiForm.fullName.trim(),
      email,
      phone: dhoiForm.phone.trim(),
      employeeId: dhoiForm.employeeId.trim(),
      schoolCode: '',
      status: 'active',
      createdAt: existingDhoi?.createdAt || new Date().toISOString(),
    };
    const existingByEmail = await platformUsersStorage.findByEmail(email);
    if (existingByEmail) {
      await platformUsersStorage.update(existingByEmail.id, {
        fullName: account.fullName,
        phone: account.phone || '',
        role: 'dhoi',
        status: 'active',
        schoolCode: account.schoolCode || '',
        schoolName: '',
      });
    } else {
      await platformUsersStorage.add({
        email: account.email,
        fullName: account.fullName,
        role: 'dhoi',
        schoolCode: account.schoolCode || '',
        schoolName: '',
        phone: account.phone || '',
        status: 'active',
        createdBy: 'HOI',
      });
    }

    if (!existingDhoi) {
      void sendWelcomeEmail({
        email: account.email,
        fullName: account.fullName,
        role: 'dhoi',
        schoolCode: account.schoolCode,
        createdBy: 'HOI',
      });
    }

    if (dhoiForm.password.trim()) {
      toast({
        title: 'Password Notice',
        description: 'Profile saved to Supabase. Password setup should be handled via Supabase Auth invite or reset flow.',
      });
    }

    toast({ title: existingDhoi ? 'DHOI Account Updated' : 'DHOI Account Created', description: `${account.fullName} can now log in as DHOI.` });
    setDhoiDialogOpen(false);
    await loadData();
  };

  const staffRows: StaffRow[] = [
    ...teachers.map((teacher) => ({ ...teacher, staffRole: 'teacher' as const })),
    ...leadershipAssignableStaff
      .filter((staff) => !teachers.some((teacher) => teacher.id === staff.id || teacher.email.toLowerCase() === (staff.email || '').toLowerCase()))
      .map((staff) => ({
        id: staff.id,
        full_name: staff.full_name,
        email: staff.email || '',
        phone: staff.phone || '',
        employee_id: '—',
        subject_specialization: 'School Administration',
        gender: 'Male' as HoiTeacher['gender'],
        qualification: '—',
        status: (staff.status || 'active') as HoiTeacher['status'],
        hired_at: new Date().toISOString().split('T')[0],
        is_class_teacher: false,
        staffRole: staff.role,
      })),
  ];

  const filteredTeachers = staffRows.filter((t) => {
    const matchesSearch = t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTeacherPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const pagedTeachers = filteredTeachers.slice((teacherPage - 1) * PAGE_SIZE, teacherPage * PAGE_SIZE);

  const getTeacherRoleLabel = (teacher: StaffRow) => {
    if (teacher.staffRole === 'hoi') return 'HOI';
    if (teacher.staffRole === 'dhoi') return 'DHOI';
    if (teacher.staffRole === 'hod') return 'HOD';
    if (teacher.is_class_teacher) return 'Class Teacher';
    return 'Learning Area Teacher';
  };

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
  const hasCurrentSelection = Boolean(assignForm.teacher_id && assignForm.class_id && assignForm.subject_id);
  const assignAllCount = pendingAssignments.length + (hasCurrentSelection ? 1 : 0);

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
    setTeacherSchoolId(currentUser?.schoolId || schools[0]?.id || '');
    setTeacherDialogOpen(true);
  };

  const openEditTeacher = (t: HoiTeacher) => {
    setEditingTeacher(t);
    setTeacherForm({
      full_name: t.full_name,
      email: t.email,
      phone: t.phone,
      employee_id: t.employee_id,
      teacher_code: teacherCodes[t.id] || '',
      account_role: 'teacher',
      subject_specialization: t.subject_specialization,
      gender: t.gender,
      qualification: t.qualification,
      status: t.status,
      password: '',
      is_class_teacher: t.is_class_teacher || false,
      class_teacher_class_id: t.class_teacher_class_id || '',
      class_teacher_stream_id: t.class_teacher_stream_id || '',
    });
    setTeacherSchoolId(currentUser?.schoolId || schools[0]?.id || '');
    setTeacherDialogOpen(true);
  };

  const syncClassTeacherStreamLink = async (
    teacherId: string,
    teacherName: string,
    assignment: {
      is_class_teacher: boolean;
      class_teacher_stream_id?: string;
    }
  ) => {
    await supabase
      .from('hoi_streams')
      .update({ class_teacher_id: null, class_teacher_name: null })
      .eq('school_id', currentUser?.schoolId || '')
      .eq('class_teacher_id', teacherId);

    if (assignment.is_class_teacher && assignment.class_teacher_stream_id) {
      await supabase
        .from('hoi_streams')
        .update({
          class_teacher_id: teacherId,
          class_teacher_name: teacherName,
        })
        .eq('school_id', currentUser?.schoolId || '')
        .eq('id', assignment.class_teacher_stream_id);
    }
  };

  const saveTeacher = async () => {
    if (!teacherForm.full_name.trim() || !teacherForm.email.trim() || !teacherForm.employee_id.trim() || !teacherForm.teacher_code.trim()) {
      toast({ title: 'Validation Error', description: 'Full name, email, employee ID, and teacher code are required.', variant: 'destructive' });
      return;
    }
    if (!currentUser?.schoolId || !currentUser.schoolCode || !currentUser.schoolName) {
      toast({ title: 'Validation Error', description: 'Your account is missing school tenant details.', variant: 'destructive' });
      return;
    }
    if (!editingTeacher && !teacherForm.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required when adding a new teacher.', variant: 'destructive' });
      return;
    }
    try {
      const selectedSchool = schools.find((s) => s.id === teacherSchoolId);
      const tenantSchoolId = currentUser.schoolId;
      const tenantSchoolCode = currentUser.schoolCode;
      const tenantSchoolName = currentUser.schoolName;
      const codeVal = teacherForm.teacher_code.trim().toUpperCase();
      const existingCodes = await getTeacherCodes(tenantSchoolId);
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
        await saveTeacherCode(editingTeacher.id, codeVal, tenantSchoolId, tenantSchoolCode);
        await syncClassTeacherStreamLink(
          editingTeacher.id,
          teacherForm.full_name.trim(),
          {
            is_class_teacher: classTeacherFields.is_class_teacher,
            class_teacher_stream_id: classTeacherFields.class_teacher_stream_id,
          }
        );
        if (password.trim()) {
          toast({
            title: 'Password Notice',
            description: 'Teacher profile updated in Supabase. Password changes must be done through Supabase Auth.',
          });
        }
        const existingPU = await platformUsersStorage.findByEmail(teacherForm.email.trim().toLowerCase());
        if (existingPU) {
          await platformUsersStorage.update(existingPU.id, {
            role: account_role,
            schoolCode: selectedSchool?.school_code || existingPU.schoolCode,
            schoolName: selectedSchool?.name || existingPU.schoolName,
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
              school_code: tenantSchoolCode,
            },
          },
        });
        if (createAuthError) throw createAuthError;

        const authUser = authData.user;
        if (!authUser) throw new Error('Auth user was not created.');

        const { error: profileInsertError } = await supabase.from('profiles').insert({
          id: authUser.id,
          email: signupEmail,
          full_name: teacherForm.full_name.trim(),
          role: profileRole,
          school_id: tenantSchoolId,
          school_code: tenantSchoolCode,
          school_name: tenantSchoolName,
          phone: teacherForm.phone.trim() || null,
          status: 'active',
          subject: teacherForm.subject_specialization.trim() || null,
          created_by: 'HOI',
        });
        if (profileInsertError) throw profileInsertError;

        const { data: insertedTeacher, error: insertTeacherError } = await supabase
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
            school_id: tenantSchoolId,
            school_code: tenantSchoolCode,
            school_name: tenantSchoolName,
            profile_id: authUser.id,
          })
          .select('id,full_name')
          .maybeSingle();
        if (insertTeacherError) throw insertTeacherError;
        if (!insertedTeacher?.id) throw new Error('Teacher record was not created.');

        await saveTeacherCode(insertedTeacher.id, codeVal, tenantSchoolId, tenantSchoolCode);

        await syncClassTeacherStreamLink(
          insertedTeacher.id,
          insertedTeacher.full_name || teacherForm.full_name.trim(),
          {
            is_class_teacher: classTeacherFields.is_class_teacher,
            class_teacher_stream_id: classTeacherFields.class_teacher_stream_id,
          }
        );

        const allUsers = await platformUsersStorage.getAll();
        const existing = allUsers.find(u => u.email.toLowerCase() === teacherForm.email.trim().toLowerCase());
        if (!existing) {
          await platformUsersStorage.add({
            email: teacherForm.email.trim().toLowerCase(),
            fullName: teacherForm.full_name.trim(),
            role: profileRole,
            schoolCode: tenantSchoolCode || selectedSchool?.school_code || '',
            schoolName: tenantSchoolName || selectedSchool?.name || '',
            phone: teacherForm.phone.trim(),
            status: 'active',
            createdBy: 'HOI',
            isClassTeacher: classTeacherFields.is_class_teacher,
            classTeacherClassId: classTeacherFields.class_teacher_class_id,
            classTeacherClassName: classTeacherFields.class_teacher_class_name,
            classTeacherStreamId: classTeacherFields.class_teacher_stream_id,
            classTeacherStreamName: classTeacherFields.class_teacher_stream_name,
          });
        } else {
          await platformUsersStorage.update(existing.id, {
            schoolCode: tenantSchoolCode || selectedSchool?.school_code || existing.schoolCode,
            schoolName: tenantSchoolName || selectedSchool?.name || existing.schoolName,
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
          schoolCode: tenantSchoolCode,
          createdBy: 'HOI',
        });

        if (profileRole === 'teacher') {
          toast({
            title: 'Success',
            description: `Teacher created! They can login with School KNEC Code ${tenantSchoolCode} and their email`,
          });
        } else {
          toast({
            title: 'Success',
            description: `HOD created successfully. They can login with School KNEC Code ${tenantSchoolCode} and their email`,
          });
        }
      }
      setTeacherDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('HOI teacher save error:', error);
      toast({
        title: 'Teacher save failed',
        description: formatErrorMessage(error),
        variant: 'destructive',
      });
    }
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
    const resolvedStreamId =
      assignForm.stream_id || (classStreams.length === 1 ? classStreams[0].id : '');

    if (requiresStream && !resolvedStreamId) {
      toast({ title: 'Validation Error', description: 'Stream is required when the selected class has multiple streams.', variant: 'destructive' });
      return null;
    }

    const teacher = assignableStaff.find((t) => t.id === assignForm.teacher_id);
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
    setAssignForm((prev) => ({ ...prev, stream_id: '', subject_id: '' }));
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
    if (hasCurrentSelection) {
      const pendingAssignment = buildPendingAssignment();
      if (!pendingAssignment) return;
      batch = [...batch, pendingAssignment];
    }

    if (batch.length === 0) {
      toast({ title: 'Validation Error', description: 'Add at least one assignment before saving.', variant: 'destructive' });
      return;
    }

    const rowsToInsert = batch.map((assignment) => ({
      school_id: currentUser.schoolId,
      school_code: currentUser.schoolCode || null,
      teacher_id: assignment.teacher_id,
      teacher_name: assignment.teacher_name,
      subject_id: assignment.subject_id,
      subject_name: assignment.subject_name,
      class_id: assignment.class_id,
      class_name: assignment.class_name,
      stream_id: assignment.stream_id || '',
      stream_name: assignment.stream_id ? assignment.stream_name : '',
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('hoi_subject_assignments')
      .upsert(rowsToInsert, {
        onConflict: 'school_id,teacher_id,subject_name,class_name,stream_id',
        ignoreDuplicates: true,
      });

    if (error) {
      toast({
        title: 'Assignment Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Success', description: 'Learning areas assigned successfully.' });
    setPendingAssignments([]);
    setAssignDialogOpen(false);
    setAssignForm(emptyAssignmentForm);

    const { data: refreshedAssignments } = await supabase
      .from('hoi_subject_assignments')
      .select('*')
      .eq('school_id', currentUser.schoolId);

    const mappedAssignments: HoiSubjectAssignment[] = (refreshedAssignments || []).map((row: any) => ({
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
          toast({
            title: 'Delete Error',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        toast({ title: 'Success', description: 'Learning Area assignment removed successfully' });
        setDeleteAssignDialog({ open: false, id: null });
        if (currentUser?.schoolId) {
          await loadAssignmentsFromSupabase(currentUser.schoolId);
        }
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

  const rosterEntries = [...duties].sort((a, b) => a.from_date.localeCompare(b.from_date));

  const resetTeacherImportState = () => {
    setTeacherCsvRows([]);
    setTeacherCsvPreview([]);
    setTeacherImportPayload([]);
    setTeacherImportCodes({});
    setTeacherValidationErrors([]);
    setTeacherValidationWarnings([]);
    if (teacherCsvInputRef.current) teacherCsvInputRef.current.value = '';
  };

  const prepareTeacherImport = (rows: Array<Record<string, string>>) => {
    if (!currentUser?.schoolId) {
      setTeacherImportPayload([]);
      setTeacherImportCodes({});
      setTeacherValidationErrors(['Missing school context.']);
      setTeacherValidationWarnings([]);
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const payload: any[] = [];
    const teacherCodesByEmail: Record<string, string> = {};

    rows.forEach((mapped, idx) => {
      const rowNumber = idx + 2;
      const fullName = (mapped.full_name || '').trim();
      const email = (mapped.email || '').trim().toLowerCase();
      const phone = (mapped.phone || '').trim();
      const employeeId = (mapped.employee_id || '').trim();
      const teacherCode = (mapped.teacher_code || '').trim().toUpperCase();
      const specialization = (mapped.subject_specialization || '').trim();
      const genderRaw = (mapped.gender || '').trim();
      const qualification = (mapped.qualification || '').trim();
      const classNameInput = (mapped.class_name || '').trim();

      const missingFields: string[] = [];
      if (!fullName) missingFields.push('full_name');
      if (!email) missingFields.push('email');
      if (!employeeId) missingFields.push('employee_id');
      if (!teacherCode) missingFields.push('teacher_code');

      if (missingFields.length > 0) {
        errors.push(`Row ${rowNumber}: Missing required fields (${missingFields.join(', ')}).`);
        return;
      }

      if (!email.includes('@')) {
        errors.push(`Row ${rowNumber}: Invalid email "${email}".`);
        return;
      }

      let gender: 'Male' | 'Female' = 'Male';
      if (genderRaw) {
        if (genderRaw.toLowerCase() === 'male') gender = 'Male';
        else if (genderRaw.toLowerCase() === 'female') gender = 'Female';
        else {
          errors.push(`Row ${rowNumber}: Invalid gender "${genderRaw}".`);
          return;
        }
      }

      if (classNameInput) {
        const classMatch = classes.find((classItem) => classItem.name.toLowerCase() === classNameInput.toLowerCase());
        if (!classMatch) {
          warnings.push(`Row ${rowNumber}: Class "${classNameInput}" not found in this school. Import will continue.`);
        }
      }

      payload.push({
        full_name: fullName,
        email,
        phone,
        employee_id: employeeId,
        subject_specialization: specialization,
        gender,
        qualification,
        status: 'active',
        hired_at: new Date().toISOString().split('T')[0],
        school_id: currentUser.schoolId,
        school_code: currentUser.schoolCode || null,
      });
      teacherCodesByEmail[email] = teacherCode;
    });

    setTeacherImportPayload(payload);
    setTeacherImportCodes(teacherCodesByEmail);
    setTeacherValidationErrors(errors);
    setTeacherValidationWarnings(warnings);
  };

  const handleTeacherCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const rows = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(',').map((cell) => cell.trim()));

      if (rows.length < 2) {
        resetTeacherImportState();
        toast({ title: 'Import Failed', description: 'CSV file has no data rows.', variant: 'destructive' });
        return;
      }

      const headers = rows[0].map((header) => header.toLowerCase());
      const parsedRows = rows.slice(1).map((row) => {
        const mapped: Record<string, string> = {};
        headers.forEach((header, headerIndex) => {
          mapped[header] = row[headerIndex] || '';
        });
        return mapped;
      });

      setTeacherCsvRows(parsedRows);
      setTeacherCsvPreview([rows[0], ...rows.slice(1, 6)]);
      prepareTeacherImport(parsedRows);
      setTeacherBulkImportOpen(true);
    };

    reader.readAsText(file);
  };

  const handleTeacherBulkImport = async () => {
    if (!currentUser?.schoolId) {
      toast({ title: 'Import Failed', description: 'Missing school context.', variant: 'destructive' });
      return;
    }

    if (teacherImportPayload.length === 0) {
      toast({ title: 'Import Failed', description: 'No CSV rows are ready to import.', variant: 'destructive' });
      return;
    }

    const failures: string[] = [];
    let importedCount = 0;

    const { data: insertedTeachers, error: insertError } = await supabase
      .from('hoi_teachers')
      .insert(teacherImportPayload)
      .select('id,email,full_name,phone,employee_id,subject_specialization,gender,qualification,status,hired_at,is_class_teacher,class_teacher_class_id,class_teacher_class_name,class_teacher_stream_id,class_teacher_stream_name');

    if (insertError) {
      failures.push(`Database insert failed: ${insertError.message}`);
    } else {
      importedCount = teacherImportPayload.length;

      const teacherCodeRows = (insertedTeachers || [])
        .map((teacher: any) => {
          const code = teacherImportCodes[String(teacher.email || '').toLowerCase()];
          if (!teacher.id || !code) return null;
          return {
            teacher_id: teacher.id,
            code,
            school_id: currentUser.schoolId,
            school_code: currentUser.schoolCode || null,
          };
        })
        .filter(Boolean);

      if (teacherCodeRows.length > 0) {
        const { error: codeError } = await supabase
          .from('teacher_codes')
          .upsert(teacherCodeRows as any[], { onConflict: 'teacher_id' });
        if (codeError) {
          failures.push(`Teacher code save failed: ${codeError.message}`);
        }
      }
    }

    if (importedCount > 0) {
      toast({ title: 'Import Successful', description: `Imported ${importedCount} teacher record(s).` });
    }

    if (failures.length > 0) {
      toast({
        title: 'Import Errors',
        description: failures.slice(0, 5).join(' | '),
        variant: 'destructive',
      });
    }

    if (importedCount > 0) {
      await loadData();
      setTeacherBulkImportOpen(false);
      resetTeacherImportState();
    }
  };

  const downloadTeacherTemplate = () => {
    const csvContent = [
      'full_name,email,phone,employee_id,teacher_code,subject_specialization,gender,qualification',
      'Mary Wanjiku,m.wanjiku@school.com,0712345678,EMP001,TCH001,Mathematics,Female,BEd',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teachers_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Teacher Management</h1>
          <p className="text-muted-foreground">Manage teachers, learning area assignments, and duty roster</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={openDhoiDialog}>
          <Shield className="w-4 h-4" />
          {existingDhoi ? 'Edit DHOI Account' : 'Create DHOI Account'}
        </Button>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="teachers" className="gap-2"><Users className="w-4 h-4" />All Teachers</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><BookOpen className="w-4 h-4" />Learning Area Assignments</TabsTrigger>
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    ref={teacherCsvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleTeacherCsvUpload}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={downloadTeacherTemplate} className="gap-2">
                    Download Template
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Teacher CSV column help">
                        <Info className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      Required columns: full_name, email, employee_id, teacher_code. Optional: phone, subject_specialization, gender, qualification, class_name.
                    </TooltipContent>
                  </Tooltip>
                  <Button variant="outline" onClick={() => teacherCsvInputRef.current?.click()} className="gap-2">
                    <Upload className="w-4 h-4" />Import CSV
                  </Button>
                  <Button onClick={openAddTeacher} className="gap-2"><Plus className="w-4 h-4" />Add Teacher</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
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
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No teachers found.</TableCell></TableRow>
                  ) : pagedTeachers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.full_name}
                        {t.is_class_teacher && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-300 text-[10px]">Class Teacher</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                          {getTeacherRoleLabel(t)}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.employee_id}</TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell>{t.phone}</TableCell>
                      <TableCell>
                        {t.subject_specialization}
                        {t.is_class_teacher && t.class_teacher_class_name && (
                          <p className="text-[10px] text-amber-600 mt-0.5">{t.class_teacher_class_name} {t.class_teacher_stream_name}</p>
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(t.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {t.staffRole === 'teacher' ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEditTeacher(t)}><Pencil className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeactivateDialog({ open: true, teacher: t })}>
                                {t.status === 'deactivated' ? <UserCheck className="w-4 h-4 text-green-600" /> : <UserX className="w-4 h-4 text-red-600" />}
                              </Button>
                              {isSystemCreatedTeacher(t) && (
                                <Button variant="ghost" size="sm" onClick={() => setDeleteTeacherDialog({ open: true, teacher: t })}>
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 border-indigo-500/30">Managed in profile</Badge>
                          )}
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
                <CardTitle className="text-lg">Learning Area Assignments ({assignments.length})</CardTitle>
                <Button onClick={() => { setAssignForm(emptyAssignmentForm); setAssignDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Assign Learning Area</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Learning Area</TableHead>
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
                  <Button onClick={() => { setDutyForm(emptyDutyForm); setDutyDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Weekly Rotation</Button>
                </div>
              </CardHeader>
              <CardContent>
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
                <Label>Role *</Label>
                <Select value={teacherForm.account_role} onValueChange={(v) => setTeacherForm({ ...teacherForm, account_role: v as TeacherAccountRole })} disabled={!!editingTeacher}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="hod">HOD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Employee ID *</Label>
                <Input value={teacherForm.employee_id} onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })} />
              </div>
              <div>
                <Label>Teacher Code *</Label>
                <Input placeholder="e.g. TCH001" value={teacherForm.teacher_code} onChange={(e) => setTeacherForm({ ...teacherForm, teacher_code: e.target.value })} />
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
              <Label>Learning Area Specialization</Label>
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
            <div className="border rounded-lg p-4 space-y-3 bg-amber-50/50">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="classTeacherToggle" checked={teacherForm.is_class_teacher} onChange={(e) => setTeacherForm({ ...teacherForm, is_class_teacher: e.target.checked, class_teacher_class_id: '', class_teacher_stream_id: '' })} className="w-4 h-4 rounded border-gray-300" />
                <Label htmlFor="classTeacherToggle" className="font-semibold text-amber-800 cursor-pointer">Assign as Class Teacher</Label>
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
                  {assignableStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>{staff.full_name}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {staff.role === 'teacher' ? 'Teacher' : staff.role.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
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
                <Label>Pending ({pendingAssignments.length}): {pendingAssignments.map((assignment) => `${assignment.subject_name} ${assignment.class_name}`).join(', ')}</Label>
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
            <Button onClick={saveAssignment}>Assign All ({assignAllCount})</Button>
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

      <Dialog open={teacherBulkImportOpen} onOpenChange={(open) => { setTeacherBulkImportOpen(open); if (!open) resetTeacherImportState(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Bulk Import Teachers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <p className="font-medium">{teacherImportPayload.length} rows ready to import</p>
              <p className="text-muted-foreground">Total rows in file: {teacherCsvRows.length}</p>
            </div>

            {teacherValidationErrors.length > 0 && (
              <div className="border rounded-lg p-3 bg-destructive/5">
                <h4 className="font-semibold text-sm mb-2 text-destructive">Validation errors</h4>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {teacherValidationErrors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {teacherValidationWarnings.length > 0 && (
              <div className="border rounded-lg p-3 bg-amber-50">
                <h4 className="font-semibold text-sm mb-2 text-amber-700">Warnings</h4>
                <ul className="text-sm space-y-1 list-disc pl-5 text-amber-700">
                  {teacherValidationWarnings.slice(0, 10).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {teacherCsvPreview.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Preview (first 5 rows)</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {teacherCsvPreview[0]?.map((header, index) => <TableHead key={index}>{header}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherCsvPreview.slice(1).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => <TableCell key={cellIndex}>{cell}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTeacherBulkImportOpen(false); resetTeacherImportState(); }}>Cancel</Button>
            <Button onClick={handleTeacherBulkImport} disabled={teacherImportPayload.length === 0}>Confirm Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
