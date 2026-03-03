import { supabase } from '@/lib/supabase';
import { type CbcSubjectLevel } from '@/lib/cbcSubjects';

export interface HoiClass {
  id: string;
  name: string;
  level: 'ecde' | 'primary' | 'junior_secondary';
  created_at: string;
}

export interface HoiStream {
  id: string;
  class_id: string;
  name: string;
  class_teacher_id?: string;
  class_teacher_name?: string;
  student_count: number;
}

export interface HoiTeacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  subject_specialization: string;
  gender: 'Male' | 'Female';
  qualification: string;
  status: 'active' | 'on_leave' | 'deactivated';
  hired_at: string;
  is_class_teacher?: boolean;
  class_teacher_class_id?: string;
  class_teacher_class_name?: string;
  class_teacher_stream_id?: string;
  class_teacher_stream_name?: string;
}

export interface HoiSubjectAssignment {
  id: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  stream_id: string;
  stream_name: string;
}

export interface HoiTeacherDuty {
  id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_two_id?: string;
  teacher_two_name?: string;
  from_date: string;
  to_date: string;
  remarks?: string;
  duty_type?: 'gate' | 'dining' | 'games' | 'assembly' | 'cleaning supervision';
  day?: string;
  time_slot?: string;
}

export interface HoiStudent {
  id: string;
  full_name: string;
  admission_no: string;
  upi?: string;
  class_id: string;
  class_name: string;
  stream_id: string;
  stream_name: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  status: 'active' | 'transferred' | 'graduated';
  enrolled_at: string;
}

export interface HoiOfficial {
  id: string;
  full_name: string;
  role: 'Deputy Head' | 'HOD' | 'Senior Teacher' | 'Prefect' | 'Games Captain';
  department?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'on_leave' | 'deactivated';
}

export interface HoiSubject {
  id: string;
  name: string;
  code: string;
  category: CbcSubjectLevel;
  description?: string;
}

export interface HoiTimetableSlot {
  id: string;
  class_id: string;
  class_name: string;
  stream_id: string;
  stream_name: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  time_start: string;
  time_end: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  room: string;
}

export interface HoiAttendance {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  stream_id: string;
  stream_name: string;
  date: string;
  status: 'present' | 'absent';
  marked_by: string;
}

export interface HoiFeePayment {
  id: string;
  student_id: string;
  student_name: string;
  admission_no: string;
  amount: number;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  year: number;
  date: string;
  payment_method: 'cash' | 'mpesa' | 'bank';
  receipt_no: string;
  recorded_by: string;
}

export interface HoiExpense {
  id: string;
  item: string;
  amount: number;
  category: 'utilities' | 'supplies' | 'maintenance' | 'salaries' | 'transport' | 'other';
  date: string;
  approved_by: string;
  notes?: string;
}

export interface HoiBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  copies_available: number;
  total_copies: number;
  category: 'textbook' | 'fiction' | 'reference' | 'periodical';
}

export interface HoiBookIssue {
  id: string;
  book_id: string;
  book_title: string;
  student_id: string;
  student_name: string;
  date_issued: string;
  due_date: string;
  date_returned?: string;
  status: 'issued' | 'returned' | 'overdue';
}

export interface HoiSport {
  id: string;
  name: string;
  category: 'team' | 'individual';
  coach_name?: string;
}

export interface HoiSportsTeam {
  id: string;
  sport_id: string;
  sport_name: string;
  student_id: string;
  student_name: string;
  admission_no?: string;
  class_name?: string;
  stream_name?: string;
  date_of_birth?: string;
  upi?: string;
  position?: string;
}

export interface HoiSportsEvent {
  id: string;
  name: string;
  sport_id: string;
  sport_name: string;
  date: string;
  venue: string;
  teams_involved: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  results?: string;
}

export interface HoiElection {
  id: string;
  name: string;
  positions: string[];
  date: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface HoiCandidate {
  id: string;
  election_id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  position: string;
  votes: number;
  photo?: string;
}

export interface HoiAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  author: string;
}

export interface HoiSchoolProfile {
  name: string;
  address: string;
  motto: string;
  logo?: string;
  contact_email: string;
  contact_phone: string;
  county: string;
  sub_county: string;
  zone: string;
  school_code: string;
  academic_year: string;
  current_term: 'Term 1' | 'Term 2' | 'Term 3';
  term_start_date: string;
  term_end_date: string;
}

export interface HoiCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'sports' | 'holiday' | 'exam' | 'meeting';
  description?: string;
}

type RowMapper<T> = (row: any) => T;
type InsertMapper<T> = (item: Omit<T, 'id'>) => Record<string, unknown>;
type UpdateMapper<T> = (updates: Partial<T>) => Record<string, unknown>;

function createStore<T extends { id: string }>(
  table: string,
  mapRow: RowMapper<T>,
  mapInsert: InsertMapper<T>,
  mapUpdate: UpdateMapper<T> = (updates) => updates as Record<string, unknown>
) {
  let cache: T[] = [];
  let hydrated = false;

  const refresh = async () => {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) return;
      cache = (data || []).map(mapRow);
      hydrated = true;
    } catch {
    }
  };

  const ensureHydrated = () => {
    if (!hydrated) {
      hydrated = true;
      void refresh();
    }
  };

  return {
    getAll: (): T[] => {
      ensureHydrated();
      return [...cache];
    },
    add: (item: Omit<T, 'id'>): T => {
      ensureHydrated();
      const optimistic = { ...item, id: crypto.randomUUID() } as T;
      cache = [...cache, optimistic];
      void (async () => {
        const { data, error } = await supabase.from(table).insert(mapInsert(item)).select().maybeSingle();
        if (!error && data) {
          const mapped = mapRow(data);
          cache = cache.map((row) => (row.id === optimistic.id ? mapped : row));
        }
      })();
      return optimistic;
    },
    update: (id: string, updates: Partial<T>): T | undefined => {
      ensureHydrated();
      let updatedRow: T | undefined;
      cache = cache.map((row) => {
        if (row.id !== id) return row;
        updatedRow = { ...row, ...updates };
        return updatedRow;
      });
      if (!updatedRow) return undefined;
      void supabase.from(table).update(mapUpdate(updates)).eq('id', id);
      return updatedRow;
    },
    remove: (id: string): void => {
      ensureHydrated();
      cache = cache.filter((row) => row.id !== id);
      void supabase.from(table).delete().eq('id', id);
    },
    refresh,
  };
}

const mapClass = (row: any): HoiClass => ({
  id: row.id,
  name: row.name || '',
  level: row.level || 'primary',
  created_at: row.created_at || new Date().toISOString(),
});

const mapStream = (row: any): HoiStream => ({
  id: row.id,
  class_id: row.class_id || '',
  name: row.name || '',
  class_teacher_id: row.class_teacher_id || undefined,
  class_teacher_name: row.class_teacher_name || undefined,
  student_count: Number(row.student_count || 0),
});

const mapTeacher = (row: any): HoiTeacher => ({
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
});

const mapSubject = (row: any): HoiSubject => ({
  id: row.id,
  name: row.name || '',
  code: row.code || '',
  category: row.category || 'Junior School',
  description: row.description || undefined,
});

const mapAssignment = (row: any): HoiSubjectAssignment => ({
  id: row.id,
  teacher_id: row.teacher_id || '',
  teacher_name: row.teacher_name || '',
  subject_id: row.subject_id || '',
  subject_name: row.subject_name || '',
  class_id: row.class_id || '',
  class_name: row.class_name || '',
  stream_id: row.stream_id || '',
  stream_name: row.stream_name || '',
});

const mapDuty = (row: any): HoiTeacherDuty => ({
  id: row.id,
  teacher_id: row.teacher_id || '',
  teacher_name: row.teacher_name || '',
  teacher_two_id: row.teacher_two_id || '',
  teacher_two_name: row.teacher_two_name || '',
  from_date: row.from_date || '',
  to_date: row.to_date || '',
  remarks: row.remarks || '',
  duty_type: row.duty_type || undefined,
  day: row.day || undefined,
  time_slot: row.time_slot || undefined,
});

const mapStudent = (row: any): HoiStudent => ({
  id: row.id,
  full_name: row.full_name || '',
  admission_no: row.admission_no || '',
  upi: row.upi || '',
  class_id: row.class_id || '',
  class_name: row.class_name || '',
  stream_id: row.stream_id || '',
  stream_name: row.stream_name || '',
  gender: row.gender === 'Female' ? 'Female' : 'Male',
  date_of_birth: row.date_of_birth || '',
  guardian_name: row.guardian_name || '',
  guardian_phone: row.guardian_phone || '',
  guardian_email: row.guardian_email || '',
  status: row.status || 'active',
  enrolled_at: row.enrolled_at || row.created_at || '',
});

const mapOfficial = (row: any): HoiOfficial => ({
  id: row.id,
  full_name: row.full_name || '',
  role: row.role || 'Senior Teacher',
  department: row.department || undefined,
  email: row.email || undefined,
  phone: row.phone || undefined,
  status: row.status || 'active',
});

const mapTimetable = (row: any): HoiTimetableSlot => ({
  id: row.id,
  class_id: row.class_id || '',
  class_name: row.class_name || '',
  stream_id: row.stream_id || '',
  stream_name: row.stream_name || '',
  day: row.day || 'Monday',
  period: Number(row.period || 0),
  time_start: row.time_start || '',
  time_end: row.time_end || '',
  subject_id: row.subject_id || '',
  subject_name: row.subject_name || '',
  teacher_id: row.teacher_id || '',
  teacher_name: row.teacher_name || '',
  room: row.room || '',
});

const mapAttendance = (row: any): HoiAttendance => ({
  id: row.id,
  student_id: row.student_id || '',
  student_name: row.student_name || '',
  class_id: row.class_id || '',
  class_name: row.class_name || '',
  stream_id: row.stream_id || '',
  stream_name: row.stream_name || '',
  date: row.date || '',
  status: row.status || 'present',
  marked_by: row.marked_by || '',
});

const mapFee = (row: any): HoiFeePayment => ({
  id: row.id,
  student_id: row.student_id || '',
  student_name: row.student_name || '',
  admission_no: row.admission_no || '',
  amount: Number(row.amount || 0),
  term: row.term || 'Term 1',
  year: Number(row.year || new Date().getFullYear()),
  date: row.date || '',
  payment_method: row.payment_method || 'cash',
  receipt_no: row.receipt_no || '',
  recorded_by: row.recorded_by || '',
});

const mapExpense = (row: any): HoiExpense => ({
  id: row.id,
  item: row.item || '',
  amount: Number(row.amount || 0),
  category: row.category || 'other',
  date: row.date || '',
  approved_by: row.approved_by || '',
  notes: row.notes || undefined,
});

const mapBook = (row: any): HoiBook => ({
  id: row.id,
  title: row.title || '',
  author: row.author || '',
  isbn: row.isbn || '',
  copies_available: Number(row.copies_available || 0),
  total_copies: Number(row.total_copies || 0),
  category: row.category || 'textbook',
});

const mapBookIssue = (row: any): HoiBookIssue => ({
  id: row.id,
  book_id: row.book_id || '',
  book_title: row.book_title || '',
  student_id: row.student_id || '',
  student_name: row.student_name || '',
  date_issued: row.date_issued || '',
  due_date: row.due_date || '',
  date_returned: row.date_returned || undefined,
  status: row.status || 'issued',
});

const mapSport = (row: any): HoiSport => ({
  id: row.id,
  name: row.name || '',
  category: row.category || 'team',
  coach_name: row.coach_name || undefined,
});

const mapSportsTeam = (row: any): HoiSportsTeam => ({
  id: row.id,
  sport_id: row.sport_id || '',
  sport_name: row.sport_name || '',
  student_id: row.student_id || '',
  student_name: row.student_name || '',
  admission_no: row.admission_no || '',
  class_name: row.class_name || '',
  stream_name: row.stream_name || '',
  date_of_birth: row.date_of_birth || '',
  upi: row.upi || '',
  position: row.position || undefined,
});

const mapSportsEvent = (row: any): HoiSportsEvent => ({
  id: row.id,
  name: row.name || '',
  sport_id: row.sport_id || '',
  sport_name: row.sport_name || '',
  date: row.date || '',
  venue: row.venue || '',
  teams_involved: row.teams_involved || '',
  status: row.status || 'upcoming',
  results: row.results || undefined,
});

const mapElection = (row: any): HoiElection => ({
  id: row.id,
  name: row.name || '',
  positions: row.positions || [],
  date: row.date || '',
  status: row.status || 'upcoming',
});

const mapCandidate = (row: any): HoiCandidate => ({
  id: row.id,
  election_id: row.election_id || '',
  student_id: row.student_id || '',
  student_name: row.student_name || '',
  class_name: row.class_name || '',
  position: row.position || '',
  votes: Number(row.votes || 0),
  photo: row.photo || undefined,
});

const mapAnnouncement = (row: any): HoiAnnouncement => ({
  id: row.id,
  title: row.title || '',
  content: row.content || '',
  priority: row.priority || 'low',
  date: row.date || '',
  author: row.author || '',
});

const mapCalendarEvent = (row: any): HoiCalendarEvent => ({
  id: row.id,
  title: row.title || '',
  date: row.date || '',
  type: row.type || 'academic',
  description: row.description || undefined,
});

export const hoiClassesStorage = createStore<HoiClass>('hoi_classes', mapClass, (item) => item as unknown as Record<string, unknown>);
export const hoiStreamsStorage = createStore<HoiStream>('hoi_streams', mapStream, (item) => item as unknown as Record<string, unknown>);
export const hoiTeachersStorage = createStore<HoiTeacher>('hoi_teachers', mapTeacher, (item) => item as unknown as Record<string, unknown>);
export const hoiSubjectsStorage = createStore<HoiSubject>('hoi_subjects', mapSubject, (item) => item as unknown as Record<string, unknown>);
export const hoiSubjectAssignmentsStorage = createStore<HoiSubjectAssignment>('hoi_subject_assignments', mapAssignment, (item) => item as unknown as Record<string, unknown>);
export const hoiTeacherDutiesStorage = createStore<HoiTeacherDuty>('hoi_teacher_duties', mapDuty, (item) => item as unknown as Record<string, unknown>);
export const hoiStudentsStorage = createStore<HoiStudent>('hoi_students', mapStudent, (item) => item as unknown as Record<string, unknown>);
export const hoiOfficialsStorage = createStore<HoiOfficial>('hoi_officials', mapOfficial, (item) => item as unknown as Record<string, unknown>);
export const hoiTimetableStorage = createStore<HoiTimetableSlot>('hoi_timetable', mapTimetable, (item) => item as unknown as Record<string, unknown>);
export const hoiAttendanceStorage = createStore<HoiAttendance>('hoi_attendance', mapAttendance, (item) => item as unknown as Record<string, unknown>);
export const hoiFeesStorage = createStore<HoiFeePayment>('hoi_fees', mapFee, (item) => item as unknown as Record<string, unknown>);
export const hoiExpensesStorage = createStore<HoiExpense>('hoi_expenses', mapExpense, (item) => item as unknown as Record<string, unknown>);
export const hoiBooksStorage = createStore<HoiBook>('hoi_books', mapBook, (item) => item as unknown as Record<string, unknown>);
export const hoiBookIssuesStorage = createStore<HoiBookIssue>('hoi_book_issues', mapBookIssue, (item) => item as unknown as Record<string, unknown>);
export const hoiSportsStorage = createStore<HoiSport>('hoi_sports', mapSport, (item) => item as unknown as Record<string, unknown>);
export const hoiSportsTeamsStorage = createStore<HoiSportsTeam>('hoi_sports_teams', mapSportsTeam, (item) => item as unknown as Record<string, unknown>);
export const hoiSportsEventsStorage = createStore<HoiSportsEvent>('hoi_sports_events', mapSportsEvent, (item) => item as unknown as Record<string, unknown>);
export const hoiElectionsStorage = createStore<HoiElection>('hoi_elections', mapElection, (item) => item as unknown as Record<string, unknown>);
export const hoiCandidatesStorage = createStore<HoiCandidate>('hoi_candidates', mapCandidate, (item) => item as unknown as Record<string, unknown>);
export const hoiAnnouncementsStorage = createStore<HoiAnnouncement>('hoi_announcements', mapAnnouncement, (item) => item as unknown as Record<string, unknown>);
export const hoiCalendarEventsStorage = createStore<HoiCalendarEvent>('hoi_calendar_events', mapCalendarEvent, (item) => item as unknown as Record<string, unknown>);

const DEFAULT_SCHOOL_PROFILE: HoiSchoolProfile = {
  name: 'School',
  address: '',
  motto: '',
  contact_email: '',
  contact_phone: '',
  county: '',
  sub_county: '',
  zone: '',
  school_code: '',
  academic_year: `${new Date().getFullYear()}`,
  current_term: 'Term 1',
  term_start_date: '',
  term_end_date: '',
};

let schoolProfileCache: HoiSchoolProfile = DEFAULT_SCHOOL_PROFILE;
let schoolProfileHydrated = false;

const refreshSchoolProfile = async () => {
  const { data, error } = await supabase.from('hoi_school_profile').select('*').limit(1).maybeSingle();
  if (error || !data) return;
  schoolProfileCache = {
    name: data.name || 'School',
    address: data.address || '',
    motto: data.motto || '',
    logo: data.logo || undefined,
    contact_email: data.contact_email || '',
    contact_phone: data.contact_phone || '',
    county: data.county || '',
    sub_county: data.sub_county || '',
    zone: data.zone || '',
    school_code: data.school_code || '',
    academic_year: data.academic_year || `${new Date().getFullYear()}`,
    current_term: data.current_term || 'Term 1',
    term_start_date: data.term_start_date || '',
    term_end_date: data.term_end_date || '',
  };
  schoolProfileHydrated = true;
};

export const hoiSchoolProfileStorage = {
  get: (): HoiSchoolProfile => {
    if (!schoolProfileHydrated) {
      schoolProfileHydrated = true;
      void refreshSchoolProfile();
    }
    return schoolProfileCache;
  },
  save: (profile: HoiSchoolProfile) => {
    schoolProfileCache = profile;
    void supabase.from('hoi_school_profile').upsert(profile as unknown as Record<string, unknown>);
  },
};
