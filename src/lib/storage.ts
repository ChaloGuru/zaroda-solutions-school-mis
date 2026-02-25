import { supabase } from '@/lib/supabase';

export interface School {
  id: string;
  name: string;
  school_code: string;
  school_type: 'ECDE' | 'Primary' | 'Junior Secondary';
  county: string;
  sub_county: string;
  zone: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: 'active' | 'pending' | 'suspended';
  categories: string[];
  student_count: number;
  faculty_count: number;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  admission_no: string;
  school_id: string;
  grade: string;
  stream: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  enrolled_at: string;
}

export interface StaffEstablishment {
  id: string;
  full_name: string;
  staff_no: string;
  school_id: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  qualification: string;
  gender: 'Male' | 'Female';
  status: 'active' | 'on_leave' | 'terminated';
  hired_at: string;
}

export interface Invoice {
  id: string;
  school_id: string;
  school_name: string;
  description: string;
  amount: number;
  period: string;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export interface PlatformSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  default_currency: string;
  academic_year: string;
  term: string;
  enable_notifications: boolean;
  enable_sms: boolean;
  enable_email: boolean;
  maintenance_mode: boolean;
  max_schools: number;
  billing_cycle: 'monthly' | 'termly' | 'annually';
}

export interface AssessmentScore {
  strandNumber: number;
  subStrandName: string;
  ee?: boolean;
  me?: boolean;
  ae?: boolean;
  be?: boolean;
  cat1?: number | string;
  cat2?: number | string;
  endTerm?: number | string;
  perfLevel?: string;
  comment?: string;
}

export interface AssessmentRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  subject: string;
  term: number;
  schoolCode: string;
  activityType?: string;
  performanceLevel?: 'EE' | 'ME' | 'AE' | 'BE';
  competencyAchieved?: boolean;
  teacherComment?: string;
  scores: AssessmentScore[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  role: 'hoi' | 'teacher' | 'dhoi' | 'student' | 'parent';
  schoolCode: string;
  schoolName: string;
  phone: string;
  status: 'active' | 'suspended' | 'inactive';
  subject?: string;
  grade?: string;
  isClassTeacher?: boolean;
  classTeacherClassId?: string;
  classTeacherClassName?: string;
  classTeacherStreamId?: string;
  classTeacherStreamName?: string;
  createdAt: string;
  createdBy: string;
  lastLogin: string | null;
  loginCount: number;
}

export interface LoginActivity {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  action: 'login' | 'logout' | 'account_created' | 'account_updated' | 'account_suspended' | 'account_activated' | 'account_deleted';
  timestamp: string;
  details?: string;
}

export interface HodAccount {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  department: string;
  hodCode?: string;
  schoolCode?: string;
  status?: 'active' | 'suspended' | 'inactive';
  createdAt?: string;
}

export interface LessonNote {
  id: string;
  title: string;
  subject: string;
  className: string;
  week: number;
  teacherEmail: string;
  teacherName: string;
  content: string;
  fileName?: string;
  status?: 'submitted' | 'approved' | 'returned';
  hodComments?: string;
  createdAt: string;
}

export interface SchemeWeek {
  week: number;
  topic: string;
  subtopic?: string;
  objectives?: string;
  activities?: string;
  resources?: string;
  assessment?: string;
  status?: 'covered' | 'pending' | 'incomplete';
}

export interface SchemeOfWork {
  id: string;
  term: string;
  subject: string;
  className: string;
  schoolCode?: string;
  weeks: SchemeWeek[];
  createdAt: string;
}

export interface Exam {
  id: string;
  name: string;
  type: string;
  date: string;
  subjects: string[];
  classes: string[];
  schoolCode?: string;
  createdAt: string;
}

export interface HodObservation {
  id: string;
  hodId?: string;
  teacherId?: string;
  teacherEmail?: string;
  teacherName?: string;
  lessonDate: string;
  classObserved: string;
  topic: string;
  strengths: string;
  areasToImprove: string;
  rating: number;
  recommendations?: string;
  createdAt: string;
}

export interface ExamResultEntry {
  id: string;
  examId: string;
  subject: string;
  className: string;
  assessmentBookId?: string;
  assessmentBookLabel?: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  marksScored: number;
  marksOutOf: number;
  percentage: number;
  grade: string;
  remarks: string;
  createdAt: string;
}

export interface DepartmentProfile {
  id: string;
  name: string;
  motto?: string;
  description?: string;
  subjects?: string[];
  goals?: { id: string; text: string }[];
  meetings?: { id: string; date: string; agenda: string; minutes?: string; attendees?: string[] }[];
  createdAt: string;
}

export interface DepartmentAnnouncement {
  id: string;
  department: string;
  title: string;
  body: string;
  author?: string;
  createdAt: string;
}

export type AdminAnnouncementTargetRole = 'hoi' | 'teacher' | 'parent' | 'all';

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  targetRole: AdminAnnouncementTargetRole;
  author?: string;
  createdAt: string;
}

const mapError = (error: unknown): never => {
  throw error instanceof Error ? error : new Error(String(error));
};

const isoDate = (value?: string | null) => (value ? String(value) : new Date().toISOString());

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const schoolsStorage = {
  getAll: async (): Promise<School[]> => {
    const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: true });
    if (error) mapError(error);
    return (data || []) as School[];
  },
  save: async (schools: School[]) => {
    const { error } = await supabase.from('schools').upsert(schools, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (school: Omit<School, 'id' | 'created_at'>): Promise<School> => {
    const payload = { ...school, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('schools').insert(payload).select().single();
    if (error) mapError(error);
    return data as School;
  },
  update: async (id: string, data: Partial<School>): Promise<School | undefined> => {
    const { data: updated, error } = await supabase.from('schools').update(data).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    return updated as School | undefined;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('schools').delete().eq('id', id);
    if (error) mapError(error);
  },
  getById: async (id: string): Promise<School | undefined> => {
    const { data, error } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
    if (error) mapError(error);
    return data as School | undefined;
  },
};

export const studentsStorage = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) mapError(error);
    return (data || []) as Student[];
  },
  save: async (students: Student[]) => {
    const { error } = await supabase.from('students').upsert(students, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (student: Omit<Student, 'id' | 'enrolled_at'>): Promise<Student> => {
    const payload = { ...student, enrolled_at: new Date().toISOString().slice(0, 10) };
    const { data, error } = await supabase.from('students').insert(payload).select().single();
    if (error) mapError(error);
    return data as Student;
  },
  update: async (id: string, data: Partial<Student>): Promise<Student | undefined> => {
    const { data: updated, error } = await supabase.from('students').update(data).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    return updated as Student | undefined;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const staffEstablishmentStorage = {
  getAll: async (): Promise<StaffEstablishment[]> => {
    const { data, error } = await supabase.from('faculty').select('*');
    if (error) mapError(error);
    return (data || []) as StaffEstablishment[];
  },
  save: async (staffEstablishment: StaffEstablishment[]) => {
    const { error } = await supabase.from('faculty').upsert(staffEstablishment, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (member: Omit<StaffEstablishment, 'id' | 'hired_at'>): Promise<StaffEstablishment> => {
    const payload = { ...member, hired_at: new Date().toISOString().slice(0, 10) };
    const { data, error } = await supabase.from('faculty').insert(payload).select().single();
    if (error) mapError(error);
    return data as StaffEstablishment;
  },
  update: async (id: string, data: Partial<StaffEstablishment>): Promise<StaffEstablishment | undefined> => {
    const { data: updated, error } = await supabase.from('faculty').update(data).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    return updated as StaffEstablishment | undefined;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('faculty').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const invoicesStorage = {
  getAll: async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*');
    if (error) mapError(error);
    return (data || []) as Invoice[];
  },
  save: async (invoices: Invoice[]) => {
    const { error } = await supabase.from('invoices').upsert(invoices, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    const payload = { ...invoice, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('invoices').insert(payload).select().single();
    if (error) mapError(error);
    return data as Invoice;
  },
  update: async (id: string, data: Partial<Invoice>): Promise<Invoice | undefined> => {
    const { data: updated, error } = await supabase.from('invoices').update(data).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    return updated as Invoice | undefined;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const assessmentStorage = {
  getAll: async (): Promise<AssessmentRecord[]> => {
    const { data, error } = await supabase.from('assessments').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      studentId: row.student_id,
      studentName: row.student_name,
      admissionNo: row.admission_no,
      grade: row.grade,
      subject: row.subject,
      term: row.term,
      schoolCode: row.school_code,
      activityType: row.activity_type || undefined,
      performanceLevel: row.performance_level || undefined,
      competencyAchieved: typeof row.competency_achieved === 'boolean' ? row.competency_achieved : undefined,
      teacherComment: row.teacher_comment || undefined,
      scores: row.scores || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
  save: async (records: AssessmentRecord[]) => {
    const payload = records.map((row) => ({
      id: row.id,
      teacher_id: row.teacherId,
      teacher_name: row.teacherName,
      student_id: row.studentId,
      student_name: row.studentName,
      admission_no: row.admissionNo,
      grade: row.grade,
      subject: row.subject,
      term: row.term,
      school_code: row.schoolCode,
      activity_type: row.activityType,
      performance_level: row.performanceLevel,
      competency_achieved: row.competencyAchieved,
      teacher_comment: row.teacherComment,
      scores: row.scores,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    }));
    const { error } = await supabase.from('assessments').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  getByTeacher: async (teacherId: string): Promise<AssessmentRecord[]> => {
    const { data, error } = await supabase.from('assessments').select('*').eq('teacher_id', teacherId);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      studentId: row.student_id,
      studentName: row.student_name,
      admissionNo: row.admission_no,
      grade: row.grade,
      subject: row.subject,
      term: row.term,
      schoolCode: row.school_code,
      activityType: row.activity_type || undefined,
      performanceLevel: row.performance_level || undefined,
      competencyAchieved: typeof row.competency_achieved === 'boolean' ? row.competency_achieved : undefined,
      teacherComment: row.teacher_comment || undefined,
      scores: row.scores || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
  getByStudent: async (studentId: string): Promise<AssessmentRecord[]> => {
    const { data, error } = await supabase.from('assessments').select('*').eq('student_id', studentId);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      studentId: row.student_id,
      studentName: row.student_name,
      admissionNo: row.admission_no,
      grade: row.grade,
      subject: row.subject,
      term: row.term,
      schoolCode: row.school_code,
      activityType: row.activity_type || undefined,
      performanceLevel: row.performance_level || undefined,
      competencyAchieved: typeof row.competency_achieved === 'boolean' ? row.competency_achieved : undefined,
      teacherComment: row.teacher_comment || undefined,
      scores: row.scores || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
  find: async (teacherId: string, studentId: string, grade: string, subject: string, term: number): Promise<AssessmentRecord | undefined> => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .eq('grade', grade)
      .eq('subject', subject)
      .eq('term', term)
      .maybeSingle();
    if (error) mapError(error);
    if (!data) return undefined;
    return {
      id: data.id,
      teacherId: data.teacher_id,
      teacherName: data.teacher_name,
      studentId: data.student_id,
      studentName: data.student_name,
      admissionNo: data.admission_no,
      grade: data.grade,
      subject: data.subject,
      term: data.term,
      schoolCode: data.school_code,
      activityType: data.activity_type || undefined,
      performanceLevel: data.performance_level || undefined,
      competencyAchieved: typeof data.competency_achieved === 'boolean' ? data.competency_achieved : undefined,
      teacherComment: data.teacher_comment || undefined,
      scores: data.scores || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
  upsert: async (record: Omit<AssessmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssessmentRecord> => {
    const existing = await assessmentStorage.find(record.teacherId, record.studentId, record.grade, record.subject, record.term);
    const payload = {
      id: existing?.id,
      teacher_id: record.teacherId,
      teacher_name: record.teacherName,
      student_id: record.studentId,
      student_name: record.studentName,
      admission_no: record.admissionNo,
      grade: record.grade,
      subject: record.subject,
      term: record.term,
      school_code: record.schoolCode,
      activity_type: record.activityType,
      performance_level: record.performanceLevel,
      competency_achieved: record.competencyAchieved,
      teacher_comment: record.teacherComment,
      scores: record.scores,
      created_at: existing?.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('assessments').upsert(payload).select().single();
    if (error) mapError(error);
    return {
      id: data.id,
      teacherId: data.teacher_id,
      teacherName: data.teacher_name,
      studentId: data.student_id,
      studentName: data.student_name,
      admissionNo: data.admission_no,
      grade: data.grade,
      subject: data.subject,
      term: data.term,
      schoolCode: data.school_code,
      activityType: data.activity_type || undefined,
      performanceLevel: data.performance_level || undefined,
      competencyAchieved: typeof data.competency_achieved === 'boolean' ? data.competency_achieved : undefined,
      teacherComment: data.teacher_comment || undefined,
      scores: data.scores || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('assessments').delete().eq('id', id);
    if (error) mapError(error);
  },
  getStudentsAssessed: async (teacherId: string, grade: string, subject: string, term: number): Promise<{ studentId: string; studentName: string; admissionNo: string }[]> => {
    const { data, error } = await supabase
      .from('assessments')
      .select('student_id,student_name,admission_no')
      .eq('teacher_id', teacherId)
      .eq('grade', grade)
      .eq('subject', subject)
      .eq('term', term);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({ studentId: row.student_id, studentName: row.student_name, admissionNo: row.admission_no }));
  },
};

export const platformUsersStorage = {
  getAll: async (): Promise<PlatformUser[]> => {
    const { data, error } = await supabase.from('profiles').select('*').in('role', ['hoi', 'teacher', 'dhoi', 'student', 'parent']);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      schoolCode: row.school_code || '',
      schoolName: row.school_name || '',
      phone: row.phone || '',
      status: row.status,
      subject: row.subject,
      grade: row.grade,
      isClassTeacher: row.is_class_teacher,
      classTeacherClassId: row.class_teacher_class_id,
      classTeacherClassName: row.class_teacher_class_name,
      classTeacherStreamId: row.class_teacher_stream_id,
      classTeacherStreamName: row.class_teacher_stream_name,
      createdAt: row.created_at,
      createdBy: row.created_by || '',
      lastLogin: row.last_login,
      loginCount: row.login_count || 0,
    }));
  },
  save: async (users: PlatformUser[]) => {
    const payload = users.map((row) => ({
      id: row.id,
      email: row.email,
      full_name: row.fullName,
      role: row.role,
      school_code: row.schoolCode,
      school_name: row.schoolName,
      phone: row.phone,
      status: row.status,
      subject: row.subject,
      grade: row.grade,
      is_class_teacher: row.isClassTeacher,
      class_teacher_class_id: row.classTeacherClassId,
      class_teacher_class_name: row.classTeacherClassName,
      class_teacher_stream_id: row.classTeacherStreamId,
      class_teacher_stream_name: row.classTeacherStreamName,
      created_at: row.createdAt,
      created_by: row.createdBy,
      last_login: row.lastLogin,
      login_count: row.loginCount,
    }));
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (user: Omit<PlatformUser, 'id' | 'createdAt' | 'lastLogin' | 'loginCount'>): Promise<PlatformUser> => {
    const payload = {
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      school_code: user.schoolCode,
      school_name: user.schoolName,
      phone: user.phone,
      status: user.status,
      subject: user.subject,
      grade: user.grade,
      is_class_teacher: user.isClassTeacher,
      class_teacher_class_id: user.classTeacherClassId,
      class_teacher_class_name: user.classTeacherClassName,
      class_teacher_stream_id: user.classTeacherStreamId,
      class_teacher_stream_name: user.classTeacherStreamName,
      created_by: user.createdBy,
    };
    const { data, error } = await supabase.from('profiles').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      schoolCode: data.school_code || '',
      schoolName: data.school_name || '',
      phone: data.phone || '',
      status: data.status,
      subject: data.subject,
      grade: data.grade,
      isClassTeacher: data.is_class_teacher,
      classTeacherClassId: data.class_teacher_class_id,
      classTeacherClassName: data.class_teacher_class_name,
      classTeacherStreamId: data.class_teacher_stream_id,
      classTeacherStreamName: data.class_teacher_stream_name,
      createdAt: data.created_at,
      createdBy: data.created_by || '',
      lastLogin: data.last_login,
      loginCount: data.login_count || 0,
    };
  },
  update: async (id: string, data: Partial<PlatformUser>): Promise<PlatformUser | undefined> => {
    const payload: Record<string, unknown> = {
      email: data.email,
      full_name: data.fullName,
      role: data.role,
      school_code: data.schoolCode,
      school_name: data.schoolName,
      phone: data.phone,
      status: data.status,
      subject: data.subject,
      grade: data.grade,
      is_class_teacher: data.isClassTeacher,
      class_teacher_class_id: data.classTeacherClassId,
      class_teacher_class_name: data.classTeacherClassName,
      class_teacher_stream_id: data.classTeacherStreamId,
      class_teacher_stream_name: data.classTeacherStreamName,
      created_by: data.createdBy,
      last_login: data.lastLogin,
      login_count: data.loginCount,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const { data: updated, error } = await supabase.from('profiles').update(payload).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    if (!updated) return undefined;
    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
      role: updated.role,
      schoolCode: updated.school_code || '',
      schoolName: updated.school_name || '',
      phone: updated.phone || '',
      status: updated.status,
      subject: updated.subject,
      grade: updated.grade,
      isClassTeacher: updated.is_class_teacher,
      classTeacherClassId: updated.class_teacher_class_id,
      classTeacherClassName: updated.class_teacher_class_name,
      classTeacherStreamId: updated.class_teacher_stream_id,
      classTeacherStreamName: updated.class_teacher_stream_name,
      createdAt: updated.created_at,
      createdBy: updated.created_by || '',
      lastLogin: updated.last_login,
      loginCount: updated.login_count || 0,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) mapError(error);
  },
  findByEmail: async (email: string): Promise<PlatformUser | undefined> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (error) mapError(error);
    if (!data) return undefined;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      schoolCode: data.school_code || '',
      schoolName: data.school_name || '',
      phone: data.phone || '',
      status: data.status,
      subject: data.subject,
      grade: data.grade,
      isClassTeacher: data.is_class_teacher,
      classTeacherClassId: data.class_teacher_class_id,
      classTeacherClassName: data.class_teacher_class_name,
      classTeacherStreamId: data.class_teacher_stream_id,
      classTeacherStreamName: data.class_teacher_stream_name,
      createdAt: data.created_at,
      createdBy: data.created_by || '',
      lastLogin: data.last_login,
      loginCount: data.login_count || 0,
    };
  },
  getByRole: async (role: string): Promise<PlatformUser[]> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', role);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      schoolCode: row.school_code || '',
      schoolName: row.school_name || '',
      phone: row.phone || '',
      status: row.status,
      subject: row.subject,
      grade: row.grade,
      isClassTeacher: row.is_class_teacher,
      classTeacherClassId: row.class_teacher_class_id,
      classTeacherClassName: row.class_teacher_class_name,
      classTeacherStreamId: row.class_teacher_stream_id,
      classTeacherStreamName: row.class_teacher_stream_name,
      createdAt: row.created_at,
      createdBy: row.created_by || '',
      lastLogin: row.last_login,
      loginCount: row.login_count || 0,
    }));
  },
  getBySchool: async (schoolCode: string): Promise<PlatformUser[]> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('school_code', schoolCode);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      schoolCode: row.school_code || '',
      schoolName: row.school_name || '',
      phone: row.phone || '',
      status: row.status,
      subject: row.subject,
      grade: row.grade,
      isClassTeacher: row.is_class_teacher,
      classTeacherClassId: row.class_teacher_class_id,
      classTeacherClassName: row.class_teacher_class_name,
      classTeacherStreamId: row.class_teacher_stream_id,
      classTeacherStreamName: row.class_teacher_stream_name,
      createdAt: row.created_at,
      createdBy: row.created_by || '',
      lastLogin: row.last_login,
      loginCount: row.login_count || 0,
    }));
  },
  recordLogin: async (id: string) => {
    const { data: existing, error: fetchError } = await supabase.from('profiles').select('login_count').eq('id', id).maybeSingle();
    if (fetchError) mapError(fetchError);
    const { error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString(), login_count: (existing?.login_count || 0) + 1 })
      .eq('id', id);
    if (error) mapError(error);
  },
};

export const activityStorage = {
  getAll: async (): Promise<LoginActivity[]> => {
    const { data, error } = await supabase.from('login_activities').select('*').order('created_at', { ascending: false });
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      action: row.action,
      timestamp: row.created_at,
      details: row.details,
    }));
  },
  save: async (logs: LoginActivity[]) => {
    const payload = logs.map((row) => ({
      id: row.id,
      user_id: row.userId,
      email: row.email,
      full_name: row.fullName,
      role: row.role,
      action: row.action,
      details: row.details,
      created_at: row.timestamp,
    }));
    const { error } = await supabase.from('login_activities').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (log: Omit<LoginActivity, 'id' | 'timestamp'>): Promise<LoginActivity> => {
    const { data, error } = await supabase
      .from('login_activities')
      .insert({ user_id: log.userId, email: log.email, full_name: log.fullName, role: log.role, action: log.action, details: log.details })
      .select()
      .single();
    if (error) mapError(error);
    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      action: data.action,
      timestamp: data.created_at,
      details: data.details,
    };
  },
  getByUser: async (userId: string): Promise<LoginActivity[]> => {
    const { data, error } = await supabase.from('login_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      action: row.action,
      timestamp: row.created_at,
      details: row.details,
    }));
  },
  getRecent: async (limit = 50): Promise<LoginActivity[]> => {
    const { data, error } = await supabase.from('login_activities').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      action: row.action,
      timestamp: row.created_at,
      details: row.details,
    }));
  },
};

export const initSeedPasswords = () => {
  return;
};

export const settingsStorage = {
  get: async (): Promise<PlatformSettings> => {
    const { data, error } = await supabase.from('platform_settings').select('*').eq('id', true).maybeSingle();
    if (error) mapError(error);
    if (!data) {
      const defaults: PlatformSettings = {
        platform_name: 'Zaroda Solutions',
        support_email: 'support@zaroda.io',
        support_phone: '+254 700 000 000',
        default_currency: 'KES',
        academic_year: '2024',
        term: 'Term 3',
        enable_notifications: true,
        enable_sms: true,
        enable_email: true,
        maintenance_mode: false,
        max_schools: 100,
        billing_cycle: 'termly',
      };
      const { error: insertError } = await supabase.from('platform_settings').insert({ id: true, ...defaults });
      if (insertError) mapError(insertError);
      return defaults;
    }
    return {
      platform_name: data.platform_name,
      support_email: data.support_email,
      support_phone: data.support_phone,
      default_currency: data.default_currency,
      academic_year: data.academic_year,
      term: data.term,
      enable_notifications: data.enable_notifications,
      enable_sms: data.enable_sms,
      enable_email: data.enable_email,
      maintenance_mode: data.maintenance_mode,
      max_schools: data.max_schools,
      billing_cycle: data.billing_cycle,
    };
  },
  save: async (settings: PlatformSettings) => {
    const { error } = await supabase.from('platform_settings').update(settings).eq('id', true);
    if (error) mapError(error);
  },
};

export const hodStorage = {
  getAll: async (): Promise<HodAccount[]> => {
    const { data, error } = await supabase.from('hod_accounts').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      employeeId: row.employee_id,
      department: row.department,
      hodCode: row.hod_code,
      schoolCode: row.school_code,
      status: row.status,
      createdAt: row.created_at,
    }));
  },
  save: async (hods: HodAccount[]) => {
    const payload = hods.map((h) => ({
      id: h.id,
      full_name: h.fullName,
      email: h.email,
      phone: h.phone,
      employee_id: h.employeeId,
      department: h.department,
      hod_code: h.hodCode,
      school_code: h.schoolCode,
      status: h.status,
      created_at: h.createdAt,
    }));
    const { error } = await supabase.from('hod_accounts').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<HodAccount, 'id' | 'createdAt'>): Promise<HodAccount> => {
    const payload = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      employee_id: data.employeeId,
      department: data.department,
      hod_code: data.hodCode,
      school_code: data.schoolCode,
      status: data.status || 'active',
    };
    const { data: inserted, error } = await supabase.from('hod_accounts').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      fullName: inserted.full_name,
      email: inserted.email,
      phone: inserted.phone,
      employeeId: inserted.employee_id,
      department: inserted.department,
      hodCode: inserted.hod_code,
      schoolCode: inserted.school_code,
      status: inserted.status,
      createdAt: inserted.created_at,
    };
  },
  update: async (id: string, data: Partial<HodAccount>): Promise<HodAccount | undefined> => {
    const payload: Record<string, unknown> = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      employee_id: data.employeeId,
      department: data.department,
      hod_code: data.hodCode,
      school_code: data.schoolCode,
      status: data.status,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const { data: updated, error } = await supabase.from('hod_accounts').update(payload).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    if (!updated) return undefined;
    return {
      id: updated.id,
      fullName: updated.full_name,
      email: updated.email,
      phone: updated.phone,
      employeeId: updated.employee_id,
      department: updated.department,
      hodCode: updated.hod_code,
      schoolCode: updated.school_code,
      status: updated.status,
      createdAt: updated.created_at,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('hod_accounts').delete().eq('id', id);
    if (error) mapError(error);
  },
  findByEmail: async (email: string): Promise<HodAccount | undefined> => {
    const { data, error } = await supabase.from('hod_accounts').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (error) mapError(error);
    if (!data) return undefined;
    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      employeeId: data.employee_id,
      department: data.department,
      hodCode: data.hod_code,
      schoolCode: data.school_code,
      status: data.status,
      createdAt: data.created_at,
    };
  },
};

export const lessonNotesStorage = {
  getAll: async (): Promise<LessonNote[]> => {
    const { data, error } = await supabase.from('lesson_notes').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      className: row.class_name,
      week: row.week,
      teacherEmail: row.teacher_email,
      teacherName: row.teacher_name,
      content: row.content,
      fileName: row.file_name,
      status: row.status,
      hodComments: row.hod_comments,
      createdAt: row.created_at,
    }));
  },
  save: async (items: LessonNote[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      class_name: row.className,
      week: row.week,
      teacher_email: row.teacherEmail,
      teacher_name: row.teacherName,
      content: row.content,
      file_name: row.fileName,
      status: row.status,
      hod_comments: row.hodComments,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('lesson_notes').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (note: Omit<LessonNote, 'id' | 'createdAt'>): Promise<LessonNote> => {
    const payload = {
      title: note.title,
      subject: note.subject,
      class_name: note.className,
      week: note.week,
      teacher_email: note.teacherEmail,
      teacher_name: note.teacherName,
      content: note.content,
      file_name: note.fileName,
      status: note.status || 'submitted',
      hod_comments: note.hodComments,
    };
    const { data, error } = await supabase.from('lesson_notes').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      className: data.class_name,
      week: data.week,
      teacherEmail: data.teacher_email,
      teacherName: data.teacher_name,
      content: data.content,
      fileName: data.file_name,
      status: data.status,
      hodComments: data.hod_comments,
      createdAt: data.created_at,
    };
  },
  update: async (id: string, data: Partial<LessonNote>): Promise<LessonNote | undefined> => {
    const payload: Record<string, unknown> = {
      title: data.title,
      subject: data.subject,
      class_name: data.className,
      week: data.week,
      teacher_email: data.teacherEmail,
      teacher_name: data.teacherName,
      content: data.content,
      file_name: data.fileName,
      status: data.status,
      hod_comments: data.hodComments,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const { data: updated, error } = await supabase.from('lesson_notes').update(payload).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    if (!updated) return undefined;
    return {
      id: updated.id,
      title: updated.title,
      subject: updated.subject,
      className: updated.class_name,
      week: updated.week,
      teacherEmail: updated.teacher_email,
      teacherName: updated.teacher_name,
      content: updated.content,
      fileName: updated.file_name,
      status: updated.status,
      hodComments: updated.hod_comments,
      createdAt: updated.created_at,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('lesson_notes').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const schemeOfWorkStorage = {
  getAll: async (): Promise<SchemeOfWork[]> => {
    const { data, error } = await supabase.from('scheme_of_work').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      term: row.term,
      subject: row.subject,
      className: row.class_name,
      schoolCode: row.school_code,
      weeks: row.weeks || [],
      createdAt: row.created_at,
    }));
  },
  save: async (items: SchemeOfWork[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      term: row.term,
      subject: row.subject,
      class_name: row.className,
      school_code: row.schoolCode,
      weeks: row.weeks,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('scheme_of_work').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<SchemeOfWork, 'id' | 'createdAt'>): Promise<SchemeOfWork> => {
    const payload = { term: data.term, subject: data.subject, class_name: data.className, school_code: data.schoolCode, weeks: data.weeks };
    const { data: inserted, error } = await supabase.from('scheme_of_work').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      term: inserted.term,
      subject: inserted.subject,
      className: inserted.class_name,
      schoolCode: inserted.school_code,
      weeks: inserted.weeks || [],
      createdAt: inserted.created_at,
    };
  },
  update: async (id: string, data: Partial<SchemeOfWork>): Promise<SchemeOfWork | undefined> => {
    const payload: Record<string, unknown> = {
      term: data.term,
      subject: data.subject,
      class_name: data.className,
      school_code: data.schoolCode,
      weeks: data.weeks,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const { data: updated, error } = await supabase.from('scheme_of_work').update(payload).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    if (!updated) return undefined;
    return {
      id: updated.id,
      term: updated.term,
      subject: updated.subject,
      className: updated.class_name,
      schoolCode: updated.school_code,
      weeks: updated.weeks || [],
      createdAt: updated.created_at,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('scheme_of_work').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const examsStorage = {
  getAll: async (): Promise<Exam[]> => {
    const { data, error } = await supabase.from('exams').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      date: row.exam_date,
      subjects: row.subjects || [],
      classes: row.classes || [],
      schoolCode: row.school_code,
      createdAt: row.created_at,
    }));
  },
  save: async (items: Exam[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      exam_date: row.date,
      subjects: row.subjects,
      classes: row.classes,
      school_code: row.schoolCode,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('exams').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<Exam, 'id' | 'createdAt'>): Promise<Exam> => {
    const payload = {
      name: data.name,
      type: data.type,
      exam_date: data.date,
      subjects: data.subjects,
      classes: data.classes,
      school_code: data.schoolCode,
    };
    const { data: inserted, error } = await supabase.from('exams').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      name: inserted.name,
      type: inserted.type,
      date: inserted.exam_date,
      subjects: inserted.subjects || [],
      classes: inserted.classes || [],
      schoolCode: inserted.school_code,
      createdAt: inserted.created_at,
    };
  },
  update: async (id: string, data: Partial<Exam>): Promise<Exam | undefined> => {
    const payload: Record<string, unknown> = {
      name: data.name,
      type: data.type,
      exam_date: data.date,
      subjects: data.subjects,
      classes: data.classes,
      school_code: data.schoolCode,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const { data: updated, error } = await supabase.from('exams').update(payload).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    if (!updated) return undefined;
    return {
      id: updated.id,
      name: updated.name,
      type: updated.type,
      date: updated.exam_date,
      subjects: updated.subjects || [],
      classes: updated.classes || [],
      schoolCode: updated.school_code,
      createdAt: updated.created_at,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const hodObservationsStorage = {
  getAll: async (): Promise<HodObservation[]> => {
    const { data, error } = await supabase.from('hod_observations').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      hodId: row.hod_id,
      teacherId: row.teacher_id,
      teacherEmail: row.teacher_email,
      teacherName: row.teacher_name,
      lessonDate: row.lesson_date,
      classObserved: row.class_observed,
      topic: row.topic,
      strengths: row.strengths,
      areasToImprove: row.areas_to_improve,
      rating: row.rating,
      recommendations: row.recommendations,
      createdAt: row.created_at,
    }));
  },
  save: async (items: HodObservation[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      hod_id: row.hodId,
      teacher_id: row.teacherId,
      teacher_email: row.teacherEmail,
      teacher_name: row.teacherName,
      lesson_date: row.lessonDate,
      class_observed: row.classObserved,
      topic: row.topic,
      strengths: row.strengths,
      areas_to_improve: row.areasToImprove,
      rating: row.rating,
      recommendations: row.recommendations,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('hod_observations').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<HodObservation, 'id' | 'createdAt'>): Promise<HodObservation> => {
    const payload = {
      hod_id: data.hodId,
      teacher_id: data.teacherId,
      teacher_email: data.teacherEmail,
      teacher_name: data.teacherName,
      lesson_date: data.lessonDate,
      class_observed: data.classObserved,
      topic: data.topic,
      strengths: data.strengths,
      areas_to_improve: data.areasToImprove,
      rating: data.rating,
      recommendations: data.recommendations,
    };
    const { data: inserted, error } = await supabase.from('hod_observations').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      hodId: inserted.hod_id,
      teacherId: inserted.teacher_id,
      teacherEmail: inserted.teacher_email,
      teacherName: inserted.teacher_name,
      lessonDate: inserted.lesson_date,
      classObserved: inserted.class_observed,
      topic: inserted.topic,
      strengths: inserted.strengths,
      areasToImprove: inserted.areas_to_improve,
      rating: inserted.rating,
      recommendations: inserted.recommendations,
      createdAt: inserted.created_at,
    };
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('hod_observations').delete().eq('id', id);
    if (error) mapError(error);
  },
};

export const examResultsStorage = {
  getAll: async (): Promise<ExamResultEntry[]> => {
    const { data, error } = await supabase.from('exam_results').select('*');
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      examId: row.exam_id,
      subject: row.subject,
      className: row.class_name,
      assessmentBookId: row.assessment_book_id,
      assessmentBookLabel: row.assessment_book_label,
      studentId: row.student_id,
      studentName: row.student_name,
      admissionNo: row.admission_no,
      marksScored: Number(row.marks_scored || 0),
      marksOutOf: Number(row.marks_out_of || 0),
      percentage: Number(row.percentage || 0),
      grade: row.grade,
      remarks: row.remarks,
      createdAt: row.created_at,
    }));
  },
  save: async (items: ExamResultEntry[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      exam_id: row.examId,
      subject: row.subject,
      class_name: row.className,
      assessment_book_id: row.assessmentBookId,
      assessment_book_label: row.assessmentBookLabel,
      student_id: row.studentId,
      student_name: row.studentName,
      admission_no: row.admissionNo,
      marks_scored: row.marksScored,
      marks_out_of: row.marksOutOf,
      grade: row.grade,
      remarks: row.remarks,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('exam_results').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<ExamResultEntry, 'id' | 'percentage' | 'grade' | 'remarks' | 'createdAt'>): Promise<ExamResultEntry> => {
    const percentage = Math.round((data.marksScored / data.marksOutOf) * 100);
    const grade = percentage >= 75 ? 'EE' : percentage >= 50 ? 'ME' : percentage >= 25 ? 'AE' : 'BE';
    const remarks = percentage >= 75 ? 'Exceeds Expectation' : percentage >= 50 ? 'Meets Expectation' : percentage >= 25 ? 'Approaching Expectation' : 'Below Expectation';
    const payload = {
      exam_id: data.examId,
      subject: data.subject,
      class_name: data.className,
      assessment_book_id: data.assessmentBookId,
      assessment_book_label: data.assessmentBookLabel,
      student_id: data.studentId,
      student_name: data.studentName,
      admission_no: data.admissionNo,
      marks_scored: data.marksScored,
      marks_out_of: data.marksOutOf,
      grade,
      remarks,
    };
    const { data: inserted, error } = await supabase.from('exam_results').insert(payload).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      examId: inserted.exam_id,
      subject: inserted.subject,
      className: inserted.class_name,
      assessmentBookId: inserted.assessment_book_id,
      assessmentBookLabel: inserted.assessment_book_label,
      studentId: inserted.student_id,
      studentName: inserted.student_name,
      admissionNo: inserted.admission_no,
      marksScored: Number(inserted.marks_scored || 0),
      marksOutOf: Number(inserted.marks_out_of || 0),
      percentage: Number(inserted.percentage || 0),
      grade: inserted.grade,
      remarks: inserted.remarks,
      createdAt: inserted.created_at,
    };
  },
  findByExamSubjectClass: async (examId: string, subject: string, className: string): Promise<ExamResultEntry[]> => {
    const { data, error } = await supabase.from('exam_results').select('*').eq('exam_id', examId).eq('subject', subject).eq('class_name', className);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      examId: row.exam_id,
      subject: row.subject,
      className: row.class_name,
      assessmentBookId: row.assessment_book_id,
      assessmentBookLabel: row.assessment_book_label,
      studentId: row.student_id,
      studentName: row.student_name,
      admissionNo: row.admission_no,
      marksScored: Number(row.marks_scored || 0),
      marksOutOf: Number(row.marks_out_of || 0),
      percentage: Number(row.percentage || 0),
      grade: row.grade,
      remarks: row.remarks,
      createdAt: row.created_at,
    }));
  },
};

export const departmentsStorage = {
  getAll: async (): Promise<DepartmentProfile[]> => {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) mapError(error);
    const departments = data || [];

    const ids = departments.map((d: any) => d.id);
    const { data: goals } = ids.length ? await supabase.from('department_goals').select('*').in('department_id', ids) : { data: [] as any[] };
    const { data: meetings } = ids.length ? await supabase.from('department_meetings').select('*').in('department_id', ids) : { data: [] as any[] };

    return departments.map((row: any) => ({
      id: row.id,
      name: row.name,
      motto: row.motto || undefined,
      description: row.description || undefined,
      subjects: row.subjects || [],
      goals: (goals || []).filter((g: any) => g.department_id === row.id).map((g: any) => ({ id: g.id, text: g.goal_text })),
      meetings: (meetings || []).filter((m: any) => m.department_id === row.id).map((m: any) => ({ id: m.id, date: m.meeting_date, agenda: m.agenda, minutes: m.minutes || undefined, attendees: m.attendees || [] })),
      createdAt: row.created_at,
    }));
  },
  save: async (items: DepartmentProfile[]) => {
    for (const item of items) {
      const { error } = await supabase.from('departments').upsert({
        id: item.id,
        name: item.name,
        motto: item.motto,
        description: item.description,
        subjects: item.subjects || [],
        created_at: item.createdAt,
      }, { onConflict: 'id' });
      if (error) mapError(error);

      await supabase.from('department_goals').delete().eq('department_id', item.id);
      await supabase.from('department_meetings').delete().eq('department_id', item.id);

      if (item.goals?.length) {
        const { error: goalsError } = await supabase.from('department_goals').insert(item.goals.map((goal) => ({ id: goal.id, department_id: item.id, goal_text: goal.text })));
        if (goalsError) mapError(goalsError);
      }

      if (item.meetings?.length) {
        const { error: meetingError } = await supabase.from('department_meetings').insert(item.meetings.map((meeting) => ({
          id: meeting.id,
          department_id: item.id,
          meeting_date: meeting.date,
          agenda: meeting.agenda,
          minutes: meeting.minutes,
          attendees: meeting.attendees || [],
        })));
        if (meetingError) mapError(meetingError);
      }
    }
  },
  add: async (data: Omit<DepartmentProfile, 'id' | 'createdAt'>): Promise<DepartmentProfile> => {
    const { data: inserted, error } = await supabase.from('departments').insert({
      name: data.name,
      motto: data.motto,
      description: data.description,
      subjects: data.subjects || [],
    }).select().single();
    if (error) mapError(error);

    if (data.goals?.length) {
      const { error: goalsError } = await supabase.from('department_goals').insert(data.goals.map((goal) => ({ id: goal.id, department_id: inserted.id, goal_text: goal.text })));
      if (goalsError) mapError(goalsError);
    }

    if (data.meetings?.length) {
      const { error: meetingsError } = await supabase.from('department_meetings').insert(data.meetings.map((meeting) => ({
        id: meeting.id,
        department_id: inserted.id,
        meeting_date: meeting.date,
        agenda: meeting.agenda,
        minutes: meeting.minutes,
        attendees: meeting.attendees || [],
      })));
      if (meetingsError) mapError(meetingsError);
    }

    return {
      id: inserted.id,
      name: inserted.name,
      motto: inserted.motto || undefined,
      description: inserted.description || undefined,
      subjects: inserted.subjects || [],
      goals: data.goals || [],
      meetings: data.meetings || [],
      createdAt: inserted.created_at,
    };
  },
  update: async (id: string, data: Partial<DepartmentProfile>): Promise<DepartmentProfile | undefined> => {
    const payload: Record<string, unknown> = {
      name: data.name,
      motto: data.motto,
      description: data.description,
      subjects: data.subjects,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const { data: updated, error } = await supabase.from('departments').update(payload).eq('id', id).select().maybeSingle();
    if (error) mapError(error);
    if (!updated) return undefined;

    if (data.goals) {
      await supabase.from('department_goals').delete().eq('department_id', id);
      if (data.goals.length) {
        const { error: goalsError } = await supabase.from('department_goals').insert(data.goals.map((goal) => ({ id: goal.id, department_id: id, goal_text: goal.text })));
        if (goalsError) mapError(goalsError);
      }
    }

    if (data.meetings) {
      await supabase.from('department_meetings').delete().eq('department_id', id);
      if (data.meetings.length) {
        const { error: meetingsError } = await supabase.from('department_meetings').insert(data.meetings.map((meeting) => ({
          id: meeting.id,
          department_id: id,
          meeting_date: meeting.date,
          agenda: meeting.agenda,
          minutes: meeting.minutes,
          attendees: meeting.attendees || [],
        })));
        if (meetingsError) mapError(meetingsError);
      }
    }

    const full = await departmentsStorage.getAll();
    return full.find((d) => d.id === id);
  },
  findByName: async (name: string): Promise<DepartmentProfile | undefined> => {
    const all = await departmentsStorage.getAll();
    return all.find((d) => d.name === name);
  },
};

export const departmentAnnouncementsStorage = {
  getAll: async (): Promise<DepartmentAnnouncement[]> => {
    const { data, error } = await supabase.from('department_announcements').select('*').order('created_at', { ascending: false });
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      department: row.department,
      title: row.title,
      body: row.body,
      author: row.author || undefined,
      createdAt: row.created_at,
    }));
  },
  save: async (items: DepartmentAnnouncement[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      department: row.department,
      title: row.title,
      body: row.body,
      author: row.author,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('department_announcements').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<DepartmentAnnouncement, 'id' | 'createdAt'>): Promise<DepartmentAnnouncement> => {
    const { data: inserted, error } = await supabase.from('department_announcements').insert({
      department: data.department,
      title: data.title,
      body: data.body,
      author: data.author,
    }).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      department: inserted.department,
      title: inserted.title,
      body: inserted.body,
      author: inserted.author || undefined,
      createdAt: inserted.created_at,
    };
  },
  getByDepartment: async (dept: string): Promise<DepartmentAnnouncement[]> => {
    const { data, error } = await supabase.from('department_announcements').select('*').eq('department', dept).order('created_at', { ascending: false });
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      department: row.department,
      title: row.title,
      body: row.body,
      author: row.author || undefined,
      createdAt: row.created_at,
    }));
  },
};

export const adminAnnouncementsStorage = {
  getAll: async (): Promise<AdminAnnouncement[]> => {
    const { data, error } = await supabase.from('admin_announcements').select('*').order('created_at', { ascending: false });
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      targetRole: row.target_role,
      author: row.author || undefined,
      createdAt: row.created_at,
    }));
  },
  save: async (items: AdminAnnouncement[]) => {
    const payload = items.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      target_role: row.targetRole,
      author: row.author,
      created_at: row.createdAt,
    }));
    const { error } = await supabase.from('admin_announcements').upsert(payload, { onConflict: 'id' });
    if (error) mapError(error);
  },
  add: async (data: Omit<AdminAnnouncement, 'id' | 'createdAt'>): Promise<AdminAnnouncement> => {
    const { data: inserted, error } = await supabase.from('admin_announcements').insert({
      title: data.title,
      message: data.message,
      target_role: data.targetRole,
      author: data.author,
    }).select().single();
    if (error) mapError(error);
    return {
      id: inserted.id,
      title: inserted.title,
      message: inserted.message,
      targetRole: inserted.target_role,
      author: inserted.author || undefined,
      createdAt: inserted.created_at,
    };
  },
  getByTargetRole: async (role: Exclude<AdminAnnouncementTargetRole, 'all'>): Promise<AdminAnnouncement[]> => {
    const { data, error } = await supabase.from('admin_announcements').select('*').or(`target_role.eq.all,target_role.eq.${role}`);
    if (error) mapError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      targetRole: row.target_role,
      author: row.author || undefined,
      createdAt: row.created_at,
    }));
  },
};

const resolveUserId = async (userKey: string): Promise<string | null> => {
  if (isUuid(userKey)) return userKey;
  const { data, error } = await supabase.from('profiles').select('id').eq('email', userKey.toLowerCase()).maybeSingle();
  if (error) mapError(error);
  return data?.id || null;
};

export const adminAnnouncementReadStorage = {
  getReadIds: async (userKey: string): Promise<string[]> => {
    const userId = await resolveUserId(userKey);
    if (!userId) return [];
    const { data, error } = await supabase.from('admin_announcement_reads').select('announcement_id').eq('user_id', userId);
    if (error) mapError(error);
    return (data || []).map((row: any) => row.announcement_id);
  },
  markRead: async (userKey: string, announcementId: string) => {
    const userId = await resolveUserId(userKey);
    if (!userId) return;
    const { error } = await supabase.from('admin_announcement_reads').upsert({ user_id: userId, announcement_id: announcementId }, { onConflict: 'announcement_id,user_id' });
    if (error) mapError(error);
  },
  markManyRead: async (userKey: string, announcementIds: string[]) => {
    const userId = await resolveUserId(userKey);
    if (!userId || !announcementIds.length) return;
    const payload = announcementIds.map((announcementId) => ({ user_id: userId, announcement_id: announcementId }));
    const { error } = await supabase.from('admin_announcement_reads').upsert(payload, { onConflict: 'announcement_id,user_id' });
    if (error) mapError(error);
  },
};
