export interface HoiClass {
  id: string;
  name: string;
  level: 'primary' | 'secondary';
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
  duty_type: 'gate' | 'dining' | 'games' | 'assembly' | 'cleaning supervision';
  day: string;
  time_slot: string;
}

export interface HoiStudent {
  id: string;
  full_name: string;
  admission_no: string;
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
  category: 'core' | 'elective';
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

function getData<T>(key: string): T[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  return [];
}

function setData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function addItem<T extends { id: string }>(key: string, item: Omit<T, 'id'>): T {
  const data = getData<T>(key);
  const newItem = { ...item, id: crypto.randomUUID() } as T;
  data.push(newItem);
  setData(key, data);
  return newItem;
}

function updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
  const data = getData<T>(key);
  const idx = data.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;
  data[idx] = { ...data[idx], ...updates };
  setData(key, data);
  return data[idx];
}

function deleteItem<T extends { id: string }>(key: string, id: string): void {
  const data = getData<T>(key).filter((item) => item.id !== id);
  setData(key, data);
}

function getSeeded<T>(key: string, seed: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function getObject<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function setObject<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

const SEED_CLASSES: HoiClass[] = [
  { id: 'c1', name: 'Form 1', level: 'secondary', created_at: '2025-01-10' },
  { id: 'c2', name: 'Form 2', level: 'secondary', created_at: '2025-01-10' },
  { id: 'c3', name: 'Form 3', level: 'secondary', created_at: '2025-01-10' },
  { id: 'c4', name: 'Form 4', level: 'secondary', created_at: '2025-01-10' },
  { id: 'c5', name: 'Grade 7', level: 'primary', created_at: '2025-01-10' },
  { id: 'c6', name: 'Grade 8', level: 'primary', created_at: '2025-01-10' },
];

const SEED_STREAMS: HoiStream[] = [
  { id: 'str1', class_id: 'c1', name: 'East', class_teacher_id: 't1', class_teacher_name: 'Jane Muthoni', student_count: 42 },
  { id: 'str2', class_id: 'c1', name: 'West', class_teacher_id: 't2', class_teacher_name: 'Robert Ouma', student_count: 40 },
  { id: 'str3', class_id: 'c2', name: 'East', class_teacher_id: 't3', class_teacher_name: 'Alice Njoroge', student_count: 38 },
  { id: 'str4', class_id: 'c2', name: 'West', class_teacher_id: 't4', class_teacher_name: 'Thomas Kimani', student_count: 41 },
  { id: 'str5', class_id: 'c3', name: 'East', class_teacher_id: 't5', class_teacher_name: 'Caroline Achieng', student_count: 39 },
  { id: 'str6', class_id: 'c3', name: 'West', class_teacher_id: 't6', class_teacher_name: 'Emmanuel Kipchoge', student_count: 37 },
  { id: 'str7', class_id: 'c4', name: 'A', class_teacher_id: 't7', class_teacher_name: 'Diana Wairimu', student_count: 44 },
  { id: 'str8', class_id: 'c5', name: 'A', student_count: 35 },
  { id: 'str9', class_id: 'c6', name: 'A', student_count: 33 },
];

const SEED_TEACHERS: HoiTeacher[] = [
  { id: 't1', full_name: 'Jane Muthoni', email: 'j.muthoni@school.ac.ke', phone: '+254 711 100 002', employee_id: 'EMP-001', subject_specialization: 'Mathematics', gender: 'Female', qualification: 'B.Ed Mathematics', status: 'active', hired_at: '2021-03-10' },
  { id: 't2', full_name: 'Robert Ouma', email: 'r.ouma@school.ac.ke', phone: '+254 711 200 001', employee_id: 'EMP-002', subject_specialization: 'English', gender: 'Male', qualification: 'M.Ed Administration', status: 'active', hired_at: '2019-06-15' },
  { id: 't3', full_name: 'Alice Njoroge', email: 'a.njoroge@school.ac.ke', phone: '+254 711 200 002', employee_id: 'EMP-003', subject_specialization: 'English', gender: 'Female', qualification: 'B.Ed English', status: 'active', hired_at: '2022-01-20' },
  { id: 't4', full_name: 'Thomas Kimani', email: 't.kimani@school.ac.ke', phone: '+254 711 300 001', employee_id: 'EMP-004', subject_specialization: 'Chemistry', gender: 'Male', qualification: 'M.Sc Chemistry', status: 'active', hired_at: '2020-09-01' },
  { id: 't5', full_name: 'Caroline Achieng', email: 'c.achieng@school.ac.ke', phone: '+254 711 300 002', employee_id: 'EMP-005', subject_specialization: 'Kiswahili', gender: 'Female', qualification: 'B.Ed Kiswahili', status: 'on_leave', hired_at: '2021-05-15' },
  { id: 't6', full_name: 'Emmanuel Kipchoge', email: 'e.kipchoge@school.ac.ke', phone: '+254 711 400 001', employee_id: 'EMP-006', subject_specialization: 'Physical Education', gender: 'Male', qualification: 'B.Ed PE', status: 'active', hired_at: '2023-02-01' },
  { id: 't7', full_name: 'Diana Wairimu', email: 'd.wairimu@school.ac.ke', phone: '+254 711 600 001', employee_id: 'EMP-007', subject_specialization: 'Biology', gender: 'Female', qualification: 'M.Ed Curriculum', status: 'active', hired_at: '2020-03-10' },
  { id: 't8', full_name: 'Samuel Kariuki', email: 's.kariuki@school.ac.ke', phone: '+254 711 100 001', employee_id: 'EMP-008', subject_specialization: 'Physics', gender: 'Male', qualification: 'PhD Education', status: 'active', hired_at: '2020-01-05' },
];

const SEED_SUBJECTS: HoiSubject[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH', category: 'core' },
  { id: 'sub2', name: 'English', code: 'ENG', category: 'core' },
  { id: 'sub3', name: 'Kiswahili', code: 'KIS', category: 'core' },
  { id: 'sub4', name: 'Chemistry', code: 'CHEM', category: 'core' },
  { id: 'sub5', name: 'Biology', code: 'BIO', category: 'core' },
  { id: 'sub6', name: 'Physics', code: 'PHY', category: 'core' },
  { id: 'sub7', name: 'History', code: 'HIST', category: 'elective' },
  { id: 'sub8', name: 'Geography', code: 'GEO', category: 'elective' },
  { id: 'sub9', name: 'Computer Studies', code: 'COMP', category: 'elective', description: 'Introduction to computing and programming' },
  { id: 'sub10', name: 'Business Studies', code: 'BUS', category: 'elective' },
];

const SEED_SUBJECT_ASSIGNMENTS: HoiSubjectAssignment[] = [
  { id: 'sa1', teacher_id: 't1', teacher_name: 'Jane Muthoni', subject_id: 'sub1', subject_name: 'Mathematics', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East' },
  { id: 'sa2', teacher_id: 't1', teacher_name: 'Jane Muthoni', subject_id: 'sub1', subject_name: 'Mathematics', class_id: 'c1', class_name: 'Form 1', stream_id: 'str2', stream_name: 'West' },
  { id: 'sa3', teacher_id: 't2', teacher_name: 'Robert Ouma', subject_id: 'sub2', subject_name: 'English', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East' },
  { id: 'sa4', teacher_id: 't3', teacher_name: 'Alice Njoroge', subject_id: 'sub2', subject_name: 'English', class_id: 'c2', class_name: 'Form 2', stream_id: 'str3', stream_name: 'East' },
  { id: 'sa5', teacher_id: 't4', teacher_name: 'Thomas Kimani', subject_id: 'sub4', subject_name: 'Chemistry', class_id: 'c3', class_name: 'Form 3', stream_id: 'str5', stream_name: 'East' },
  { id: 'sa6', teacher_id: 't5', teacher_name: 'Caroline Achieng', subject_id: 'sub3', subject_name: 'Kiswahili', class_id: 'c2', class_name: 'Form 2', stream_id: 'str4', stream_name: 'West' },
  { id: 'sa7', teacher_id: 't7', teacher_name: 'Diana Wairimu', subject_id: 'sub5', subject_name: 'Biology', class_id: 'c4', class_name: 'Form 4', stream_id: 'str7', stream_name: 'A' },
  { id: 'sa8', teacher_id: 't8', teacher_name: 'Samuel Kariuki', subject_id: 'sub6', subject_name: 'Physics', class_id: 'c3', class_name: 'Form 3', stream_id: 'str6', stream_name: 'West' },
];

const SEED_TEACHER_DUTIES: HoiTeacherDuty[] = [
  { id: 'td1', teacher_id: 't1', teacher_name: 'Jane Muthoni', duty_type: 'gate', day: 'Monday', time_slot: '6:30 AM - 7:30 AM' },
  { id: 'td2', teacher_id: 't2', teacher_name: 'Robert Ouma', duty_type: 'dining', day: 'Monday', time_slot: '12:30 PM - 1:30 PM' },
  { id: 'td3', teacher_id: 't3', teacher_name: 'Alice Njoroge', duty_type: 'assembly', day: 'Tuesday', time_slot: '7:30 AM - 8:00 AM' },
  { id: 'td4', teacher_id: 't4', teacher_name: 'Thomas Kimani', duty_type: 'games', day: 'Wednesday', time_slot: '3:30 PM - 5:00 PM' },
  { id: 'td5', teacher_id: 't5', teacher_name: 'Caroline Achieng', duty_type: 'cleaning supervision', day: 'Thursday', time_slot: '4:00 PM - 5:00 PM' },
  { id: 'td6', teacher_id: 't6', teacher_name: 'Emmanuel Kipchoge', duty_type: 'games', day: 'Friday', time_slot: '3:30 PM - 5:00 PM' },
  { id: 'td7', teacher_id: 't7', teacher_name: 'Diana Wairimu', duty_type: 'gate', day: 'Tuesday', time_slot: '6:30 AM - 7:30 AM' },
  { id: 'td8', teacher_id: 't8', teacher_name: 'Samuel Kariuki', duty_type: 'dining', day: 'Friday', time_slot: '12:30 PM - 1:30 PM' },
];

const SEED_STUDENTS: HoiStudent[] = [
  { id: 'hs1', full_name: 'Kevin Odhiambo', admission_no: 'ADM-2025-001', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', gender: 'Male', date_of_birth: '2010-03-15', guardian_name: 'John Odhiambo', guardian_phone: '+254 700 111 222', guardian_email: 'john.o@email.com', status: 'active', enrolled_at: '2025-01-10' },
  { id: 'hs2', full_name: 'Faith Akinyi', admission_no: 'ADM-2025-002', class_id: 'c1', class_name: 'Form 1', stream_id: 'str2', stream_name: 'West', gender: 'Female', date_of_birth: '2010-07-22', guardian_name: 'Rose Akinyi', guardian_phone: '+254 700 222 333', guardian_email: 'rose.a@email.com', status: 'active', enrolled_at: '2025-01-10' },
  { id: 'hs3', full_name: 'Brian Kiprop', admission_no: 'ADM-2025-003', class_id: 'c2', class_name: 'Form 2', stream_id: 'str3', stream_name: 'East', gender: 'Male', date_of_birth: '2009-11-05', guardian_name: 'Daniel Kiprop', guardian_phone: '+254 700 333 444', guardian_email: 'daniel.k@email.com', status: 'active', enrolled_at: '2024-01-10' },
  { id: 'hs4', full_name: 'Mercy Njeri', admission_no: 'ADM-2025-004', class_id: 'c2', class_name: 'Form 2', stream_id: 'str4', stream_name: 'West', gender: 'Female', date_of_birth: '2009-09-18', guardian_name: 'Sarah Njeri', guardian_phone: '+254 700 444 555', guardian_email: 'sarah.n@email.com', status: 'active', enrolled_at: '2024-01-10' },
  { id: 'hs5', full_name: 'Victor Mwangi', admission_no: 'ADM-2025-005', class_id: 'c3', class_name: 'Form 3', stream_id: 'str5', stream_name: 'East', gender: 'Male', date_of_birth: '2008-01-30', guardian_name: 'Joseph Mwangi', guardian_phone: '+254 700 555 666', guardian_email: 'joseph.m@email.com', status: 'active', enrolled_at: '2023-01-10' },
  { id: 'hs6', full_name: 'Angela Wambui', admission_no: 'ADM-2025-006', class_id: 'c3', class_name: 'Form 3', stream_id: 'str6', stream_name: 'West', gender: 'Female', date_of_birth: '2008-06-12', guardian_name: 'Michael Wambui', guardian_phone: '+254 700 666 777', guardian_email: 'michael.w@email.com', status: 'active', enrolled_at: '2023-01-10' },
  { id: 'hs7', full_name: 'Dennis Otieno', admission_no: 'ADM-2025-007', class_id: 'c4', class_name: 'Form 4', stream_id: 'str7', stream_name: 'A', gender: 'Male', date_of_birth: '2007-04-25', guardian_name: 'Patrick Otieno', guardian_phone: '+254 700 777 888', guardian_email: 'patrick.o@email.com', status: 'active', enrolled_at: '2022-01-10' },
  { id: 'hs8', full_name: 'Lucy Chebet', admission_no: 'ADM-2025-008', class_id: 'c4', class_name: 'Form 4', stream_id: 'str7', stream_name: 'A', gender: 'Female', date_of_birth: '2007-12-08', guardian_name: 'Timothy Chebet', guardian_phone: '+254 700 888 999', guardian_email: 'timothy.c@email.com', status: 'active', enrolled_at: '2022-01-10' },
  { id: 'hs9', full_name: 'Grace Wanjiku', admission_no: 'ADM-2025-009', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', gender: 'Female', date_of_birth: '2010-05-14', guardian_name: 'Peter Wanjiku', guardian_phone: '+254 700 999 100', guardian_email: 'peter.w@email.com', status: 'active', enrolled_at: '2025-01-10' },
  { id: 'hs10', full_name: 'James Kamau', admission_no: 'ADM-2025-010', class_id: 'c2', class_name: 'Form 2', stream_id: 'str3', stream_name: 'East', gender: 'Male', date_of_birth: '2009-02-20', guardian_name: 'Mary Kamau', guardian_phone: '+254 701 100 200', guardian_email: 'mary.k@email.com', status: 'active', enrolled_at: '2024-01-10' },
];

const SEED_OFFICIALS: HoiOfficial[] = [
  { id: 'of1', full_name: 'Dr. Samuel Kariuki', role: 'Deputy Head', department: 'Administration', email: 's.kariuki@school.ac.ke', phone: '+254 711 100 001', status: 'active' },
  { id: 'of2', full_name: 'Thomas Kimani', role: 'HOD', department: 'Sciences', email: 't.kimani@school.ac.ke', phone: '+254 711 300 001', status: 'active' },
  { id: 'of3', full_name: 'Alice Njoroge', role: 'HOD', department: 'Languages', email: 'a.njoroge@school.ac.ke', phone: '+254 711 200 002', status: 'active' },
  { id: 'of4', full_name: 'Robert Ouma', role: 'Senior Teacher', department: 'Humanities', email: 'r.ouma@school.ac.ke', phone: '+254 711 200 001', status: 'active' },
  { id: 'of5', full_name: 'Dennis Otieno', role: 'Prefect', department: 'Student Leadership', status: 'active' },
  { id: 'of6', full_name: 'Angela Wambui', role: 'Prefect', department: 'Student Leadership', status: 'active' },
  { id: 'of7', full_name: 'Victor Mwangi', role: 'Games Captain', department: 'Sports', status: 'active' },
];

const SEED_TIMETABLE: HoiTimetableSlot[] = [
  { id: 'tt1', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', day: 'Monday', period: 1, time_start: '08:00', time_end: '08:40', subject_id: 'sub1', subject_name: 'Mathematics', teacher_id: 't1', teacher_name: 'Jane Muthoni', room: 'Room 1A' },
  { id: 'tt2', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', day: 'Monday', period: 2, time_start: '08:40', time_end: '09:20', subject_id: 'sub2', subject_name: 'English', teacher_id: 't2', teacher_name: 'Robert Ouma', room: 'Room 1A' },
  { id: 'tt3', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', day: 'Monday', period: 3, time_start: '09:20', time_end: '10:00', subject_id: 'sub3', subject_name: 'Kiswahili', teacher_id: 't5', teacher_name: 'Caroline Achieng', room: 'Room 1A' },
  { id: 'tt4', class_id: 'c2', class_name: 'Form 2', stream_id: 'str3', stream_name: 'East', day: 'Monday', period: 1, time_start: '08:00', time_end: '08:40', subject_id: 'sub2', subject_name: 'English', teacher_id: 't3', teacher_name: 'Alice Njoroge', room: 'Room 2A' },
  { id: 'tt5', class_id: 'c2', class_name: 'Form 2', stream_id: 'str3', stream_name: 'East', day: 'Monday', period: 2, time_start: '08:40', time_end: '09:20', subject_id: 'sub4', subject_name: 'Chemistry', teacher_id: 't4', teacher_name: 'Thomas Kimani', room: 'Lab 1' },
  { id: 'tt6', class_id: 'c3', class_name: 'Form 3', stream_id: 'str5', stream_name: 'East', day: 'Tuesday', period: 1, time_start: '08:00', time_end: '08:40', subject_id: 'sub6', subject_name: 'Physics', teacher_id: 't8', teacher_name: 'Samuel Kariuki', room: 'Lab 2' },
  { id: 'tt7', class_id: 'c3', class_name: 'Form 3', stream_id: 'str5', stream_name: 'East', day: 'Tuesday', period: 2, time_start: '08:40', time_end: '09:20', subject_id: 'sub5', subject_name: 'Biology', teacher_id: 't7', teacher_name: 'Diana Wairimu', room: 'Lab 3' },
  { id: 'tt8', class_id: 'c4', class_name: 'Form 4', stream_id: 'str7', stream_name: 'A', day: 'Wednesday', period: 1, time_start: '08:00', time_end: '08:40', subject_id: 'sub1', subject_name: 'Mathematics', teacher_id: 't1', teacher_name: 'Jane Muthoni', room: 'Room 4A' },
];

const SEED_ATTENDANCE: HoiAttendance[] = [
  { id: 'att1', student_id: 'hs1', student_name: 'Kevin Odhiambo', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', date: '2025-09-15', status: 'present', marked_by: 'Jane Muthoni' },
  { id: 'att2', student_id: 'hs2', student_name: 'Faith Akinyi', class_id: 'c1', class_name: 'Form 1', stream_id: 'str2', stream_name: 'West', date: '2025-09-15', status: 'present', marked_by: 'Robert Ouma' },
  { id: 'att3', student_id: 'hs3', student_name: 'Brian Kiprop', class_id: 'c2', class_name: 'Form 2', stream_id: 'str3', stream_name: 'East', date: '2025-09-15', status: 'absent', marked_by: 'Alice Njoroge' },
  { id: 'att4', student_id: 'hs4', student_name: 'Mercy Njeri', class_id: 'c2', class_name: 'Form 2', stream_id: 'str4', stream_name: 'West', date: '2025-09-15', status: 'present', marked_by: 'Thomas Kimani' },
  { id: 'att5', student_id: 'hs5', student_name: 'Victor Mwangi', class_id: 'c3', class_name: 'Form 3', stream_id: 'str5', stream_name: 'East', date: '2025-09-15', status: 'present', marked_by: 'Caroline Achieng' },
  { id: 'att6', student_id: 'hs7', student_name: 'Dennis Otieno', class_id: 'c4', class_name: 'Form 4', stream_id: 'str7', stream_name: 'A', date: '2025-09-15', status: 'present', marked_by: 'Diana Wairimu' },
  { id: 'att7', student_id: 'hs9', student_name: 'Grace Wanjiku', class_id: 'c1', class_name: 'Form 1', stream_id: 'str1', stream_name: 'East', date: '2025-09-15', status: 'absent', marked_by: 'Jane Muthoni' },
];

const SEED_FEES: HoiFeePayment[] = [
  { id: 'fee1', student_id: 'hs1', student_name: 'Kevin Odhiambo', admission_no: 'ADM-2025-001', amount: 35000, term: 'Term 1', year: 2025, date: '2025-01-15', payment_method: 'mpesa', receipt_no: 'RCP-001', recorded_by: 'Bursar' },
  { id: 'fee2', student_id: 'hs2', student_name: 'Faith Akinyi', admission_no: 'ADM-2025-002', amount: 35000, term: 'Term 1', year: 2025, date: '2025-01-18', payment_method: 'bank', receipt_no: 'RCP-002', recorded_by: 'Bursar' },
  { id: 'fee3', student_id: 'hs3', student_name: 'Brian Kiprop', admission_no: 'ADM-2025-003', amount: 20000, term: 'Term 1', year: 2025, date: '2025-01-20', payment_method: 'cash', receipt_no: 'RCP-003', recorded_by: 'Bursar' },
  { id: 'fee4', student_id: 'hs5', student_name: 'Victor Mwangi', admission_no: 'ADM-2025-005', amount: 35000, term: 'Term 2', year: 2025, date: '2025-05-10', payment_method: 'mpesa', receipt_no: 'RCP-004', recorded_by: 'Bursar' },
  { id: 'fee5', student_id: 'hs7', student_name: 'Dennis Otieno', admission_no: 'ADM-2025-007', amount: 40000, term: 'Term 1', year: 2025, date: '2025-01-12', payment_method: 'bank', receipt_no: 'RCP-005', recorded_by: 'Bursar' },
  { id: 'fee6', student_id: 'hs8', student_name: 'Lucy Chebet', admission_no: 'ADM-2025-008', amount: 40000, term: 'Term 1', year: 2025, date: '2025-01-14', payment_method: 'mpesa', receipt_no: 'RCP-006', recorded_by: 'Bursar' },
  { id: 'fee7', student_id: 'hs4', student_name: 'Mercy Njeri', admission_no: 'ADM-2025-004', amount: 15000, term: 'Term 2', year: 2025, date: '2025-05-15', payment_method: 'cash', receipt_no: 'RCP-007', recorded_by: 'Bursar' },
];

const SEED_EXPENSES: HoiExpense[] = [
  { id: 'exp1', item: 'Electricity Bill - September', amount: 45000, category: 'utilities', date: '2025-09-05', approved_by: 'Principal' },
  { id: 'exp2', item: 'Laboratory Equipment', amount: 120000, category: 'supplies', date: '2025-08-20', approved_by: 'Principal', notes: 'Chemistry lab restocking' },
  { id: 'exp3', item: 'Staff Salaries - September', amount: 850000, category: 'salaries', date: '2025-09-01', approved_by: 'Board Chair' },
  { id: 'exp4', item: 'School Bus Maintenance', amount: 75000, category: 'transport', date: '2025-08-15', approved_by: 'Principal' },
  { id: 'exp5', item: 'Classroom Repairs', amount: 60000, category: 'maintenance', date: '2025-07-10', approved_by: 'Deputy Head', notes: 'Form 3 classrooms roof repair' },
  { id: 'exp6', item: 'Stationery and Printing', amount: 25000, category: 'supplies', date: '2025-09-10', approved_by: 'Principal' },
  { id: 'exp7', item: 'Water Bill - August', amount: 18000, category: 'utilities', date: '2025-08-05', approved_by: 'Bursar' },
];

const SEED_BOOKS: HoiBook[] = [
  { id: 'bk1', title: 'KLB Mathematics Form 1', author: 'Kenya Literature Bureau', isbn: '978-9966-10-001', copies_available: 35, total_copies: 40, category: 'textbook' },
  { id: 'bk2', title: 'KLB English Form 2', author: 'Kenya Literature Bureau', isbn: '978-9966-10-002', copies_available: 28, total_copies: 35, category: 'textbook' },
  { id: 'bk3', title: 'A Doll\'s House', author: 'Henrik Ibsen', isbn: '978-0-486-27062', copies_available: 18, total_copies: 20, category: 'fiction' },
  { id: 'bk4', title: 'The River and the Source', author: 'Margaret Ogola', isbn: '978-9966-46-001', copies_available: 22, total_copies: 25, category: 'fiction' },
  { id: 'bk5', title: 'Encyclopaedia Britannica Vol. 1', author: 'Britannica', isbn: '978-1-59339-292', copies_available: 3, total_copies: 3, category: 'reference' },
  { id: 'bk6', title: 'KLB Chemistry Form 3', author: 'Kenya Literature Bureau', isbn: '978-9966-10-003', copies_available: 30, total_copies: 38, category: 'textbook' },
  { id: 'bk7', title: 'Daily Nation Education Digest', author: 'Nation Media Group', isbn: '978-9966-20-001', copies_available: 10, total_copies: 10, category: 'periodical' },
];

const SEED_BOOK_ISSUES: HoiBookIssue[] = [
  { id: 'bi1', book_id: 'bk1', book_title: 'KLB Mathematics Form 1', student_id: 'hs1', student_name: 'Kevin Odhiambo', date_issued: '2025-09-01', due_date: '2025-09-15', status: 'issued' },
  { id: 'bi2', book_id: 'bk3', book_title: 'A Doll\'s House', student_id: 'hs2', student_name: 'Faith Akinyi', date_issued: '2025-08-20', due_date: '2025-09-03', date_returned: '2025-09-02', status: 'returned' },
  { id: 'bi3', book_id: 'bk4', book_title: 'The River and the Source', student_id: 'hs5', student_name: 'Victor Mwangi', date_issued: '2025-08-25', due_date: '2025-09-08', status: 'overdue' },
  { id: 'bi4', book_id: 'bk2', book_title: 'KLB English Form 2', student_id: 'hs3', student_name: 'Brian Kiprop', date_issued: '2025-09-05', due_date: '2025-09-19', status: 'issued' },
  { id: 'bi5', book_id: 'bk6', book_title: 'KLB Chemistry Form 3', student_id: 'hs6', student_name: 'Angela Wambui', date_issued: '2025-09-10', due_date: '2025-09-24', status: 'issued' },
];

const SEED_SPORTS: HoiSport[] = [
  { id: 'sp1', name: 'Football', category: 'team', coach_name: 'Emmanuel Kipchoge' },
  { id: 'sp2', name: 'Netball', category: 'team', coach_name: 'Diana Wairimu' },
  { id: 'sp3', name: 'Athletics', category: 'individual', coach_name: 'Emmanuel Kipchoge' },
  { id: 'sp4', name: 'Rugby', category: 'team', coach_name: 'Robert Ouma' },
  { id: 'sp5', name: 'Volleyball', category: 'team' },
  { id: 'sp6', name: 'Swimming', category: 'individual' },
];

const SEED_SPORTS_TEAMS: HoiSportsTeam[] = [
  { id: 'spt1', sport_id: 'sp1', sport_name: 'Football', student_id: 'hs1', student_name: 'Kevin Odhiambo', position: 'Striker' },
  { id: 'spt2', sport_id: 'sp1', sport_name: 'Football', student_id: 'hs5', student_name: 'Victor Mwangi', position: 'Goalkeeper' },
  { id: 'spt3', sport_id: 'sp1', sport_name: 'Football', student_id: 'hs7', student_name: 'Dennis Otieno', position: 'Midfielder' },
  { id: 'spt4', sport_id: 'sp2', sport_name: 'Netball', student_id: 'hs2', student_name: 'Faith Akinyi', position: 'Goal Shooter' },
  { id: 'spt5', sport_id: 'sp2', sport_name: 'Netball', student_id: 'hs4', student_name: 'Mercy Njeri', position: 'Centre' },
  { id: 'spt6', sport_id: 'sp3', sport_name: 'Athletics', student_id: 'hs3', student_name: 'Brian Kiprop', position: '100m Sprint' },
  { id: 'spt7', sport_id: 'sp3', sport_name: 'Athletics', student_id: 'hs9', student_name: 'Grace Wanjiku', position: '800m' },
  { id: 'spt8', sport_id: 'sp4', sport_name: 'Rugby', student_id: 'hs10', student_name: 'James Kamau', position: 'Fly-half' },
];

const SEED_SPORTS_EVENTS: HoiSportsEvent[] = [
  { id: 'se1', name: 'Inter-House Football Tournament', sport_id: 'sp1', sport_name: 'Football', date: '2025-10-15', venue: 'School Grounds', teams_involved: 'Simba House vs Chui House', status: 'upcoming' },
  { id: 'se2', name: 'County Athletics Championship', sport_id: 'sp3', sport_name: 'Athletics', date: '2025-09-28', venue: 'Nyayo Stadium', teams_involved: 'County Schools', status: 'upcoming' },
  { id: 'se3', name: 'Friendly Netball Match', sport_id: 'sp2', sport_name: 'Netball', date: '2025-09-10', venue: 'School Grounds', teams_involved: 'vs Moi Girls Nairobi', status: 'completed', results: 'Won 25-18' },
  { id: 'se4', name: 'Regional Rugby Sevens', sport_id: 'sp4', sport_name: 'Rugby', date: '2025-11-05', venue: 'RFUEA Grounds', teams_involved: 'Regional Schools', status: 'upcoming' },
  { id: 'se5', name: 'Inter-Class Volleyball', sport_id: 'sp5', sport_name: 'Volleyball', date: '2025-08-20', venue: 'School Grounds', teams_involved: 'Form 3 vs Form 4', status: 'completed', results: 'Form 4 won 3-1' },
];

const SEED_ELECTIONS: HoiElection[] = [
  { id: 'el1', name: '2025 Student Council Elections', positions: ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl', 'Games Captain'], date: '2025-09-20', status: 'completed' },
  { id: 'el2', name: '2025 Class Representatives', positions: ['Form 1 Rep', 'Form 2 Rep', 'Form 3 Rep', 'Form 4 Rep'], date: '2025-09-22', status: 'completed' },
  { id: 'el3', name: '2026 Student Council Elections', positions: ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl'], date: '2026-02-15', status: 'upcoming' },
];

const SEED_CANDIDATES: HoiCandidate[] = [
  { id: 'cand1', election_id: 'el1', student_id: 'hs7', student_name: 'Dennis Otieno', class_name: 'Form 4', position: 'Head Boy', votes: 187 },
  { id: 'cand2', election_id: 'el1', student_id: 'hs8', student_name: 'Lucy Chebet', class_name: 'Form 4', position: 'Head Girl', votes: 203 },
  { id: 'cand3', election_id: 'el1', student_id: 'hs5', student_name: 'Victor Mwangi', class_name: 'Form 3', position: 'Games Captain', votes: 165 },
  { id: 'cand4', election_id: 'el1', student_id: 'hs6', student_name: 'Angela Wambui', class_name: 'Form 3', position: 'Deputy Head Girl', votes: 142 },
  { id: 'cand5', election_id: 'el2', student_id: 'hs1', student_name: 'Kevin Odhiambo', class_name: 'Form 1', position: 'Form 1 Rep', votes: 32 },
  { id: 'cand6', election_id: 'el2', student_id: 'hs3', student_name: 'Brian Kiprop', class_name: 'Form 2', position: 'Form 2 Rep', votes: 28 },
];

const SEED_ANNOUNCEMENTS: HoiAnnouncement[] = [
  { id: 'ann1', title: 'Term 3 Opening Day', content: 'All students are expected to report by 8:00 AM on Monday 1st September 2025. Full school uniform is mandatory.', priority: 'high', date: '2025-08-25', author: 'Principal' },
  { id: 'ann2', title: 'Parent-Teacher Meeting', content: 'Parents and guardians are invited for a general meeting on Saturday 20th September 2025 at 10:00 AM in the school hall.', priority: 'medium', date: '2025-09-10', author: 'Deputy Head' },
  { id: 'ann3', title: 'KCSE Mock Exams', content: 'Form 4 mock examinations will begin on Monday 6th October 2025. All candidates must clear fee balances before sitting exams.', priority: 'urgent', date: '2025-09-15', author: 'Principal' },
  { id: 'ann4', title: 'Sports Day', content: 'Annual sports day will be held on Friday 17th October 2025. Students should come in their house colours.', priority: 'medium', date: '2025-09-20', author: 'Games Master' },
  { id: 'ann5', title: 'Library Book Returns', content: 'All borrowed library books must be returned by end of week. Overdue fines will apply.', priority: 'low', date: '2025-09-12', author: 'Librarian' },
  { id: 'ann6', title: 'Water Shortage Notice', content: 'Due to county water rationing, students are advised to carry extra drinking water this week.', priority: 'high', date: '2025-09-14', author: 'Principal' },
];

const DEFAULT_SCHOOL_PROFILE: HoiSchoolProfile = {
  name: 'Greenwood Academy',
  address: 'P.O. Box 4521-00100, Nairobi',
  motto: 'Excellence Through Discipline',
  contact_email: 'admin@greenwood.ac.ke',
  contact_phone: '+254 712 345 678',
  county: 'Nairobi',
  sub_county: 'Westlands',
  school_code: 'GWA-001',
  academic_year: '2025',
  current_term: 'Term 3',
  term_start_date: '2025-09-01',
  term_end_date: '2025-11-28',
};

const SEED_CALENDAR_EVENTS: HoiCalendarEvent[] = [
  { id: 'cal1', title: 'Term 3 Opens', date: '2025-09-01', type: 'academic' },
  { id: 'cal2', title: 'Mashujaa Day', date: '2025-10-20', type: 'holiday', description: 'National public holiday' },
  { id: 'cal3', title: 'KCSE Mock Examinations', date: '2025-10-06', type: 'exam', description: 'Form 4 mock exams begin' },
  { id: 'cal4', title: 'Inter-House Sports Day', date: '2025-10-17', type: 'sports' },
  { id: 'cal5', title: 'Staff Meeting', date: '2025-09-08', type: 'meeting', description: 'Term 3 planning and welfare' },
  { id: 'cal6', title: 'Parent-Teacher Conference', date: '2025-09-20', type: 'meeting', description: 'General parents meeting' },
  { id: 'cal7', title: 'End of Term Exams', date: '2025-11-10', type: 'exam', description: 'Form 1-3 end of term examinations' },
  { id: 'cal8', title: 'Term 3 Closes', date: '2025-11-28', type: 'academic' },
  { id: 'cal9', title: 'Jamhuri Day', date: '2025-12-12', type: 'holiday', description: 'National independence day' },
];

export const hoiClassesStorage = {
  getAll: (): HoiClass[] => getSeeded<HoiClass>('zaroda_hoi_classes', SEED_CLASSES),
  add: (item: Omit<HoiClass, 'id'>) => addItem<HoiClass>('zaroda_hoi_classes', item),
  update: (id: string, updates: Partial<HoiClass>) => updateItem<HoiClass>('zaroda_hoi_classes', id, updates),
  remove: (id: string) => deleteItem<HoiClass>('zaroda_hoi_classes', id),
};

export const hoiStreamsStorage = {
  getAll: (): HoiStream[] => getSeeded<HoiStream>('zaroda_hoi_streams', SEED_STREAMS),
  add: (item: Omit<HoiStream, 'id'>) => addItem<HoiStream>('zaroda_hoi_streams', item),
  update: (id: string, updates: Partial<HoiStream>) => updateItem<HoiStream>('zaroda_hoi_streams', id, updates),
  remove: (id: string) => deleteItem<HoiStream>('zaroda_hoi_streams', id),
};

export const hoiTeachersStorage = {
  getAll: (): HoiTeacher[] => getSeeded<HoiTeacher>('zaroda_hoi_teachers', SEED_TEACHERS),
  add: (item: Omit<HoiTeacher, 'id'>) => addItem<HoiTeacher>('zaroda_hoi_teachers', item),
  update: (id: string, updates: Partial<HoiTeacher>) => updateItem<HoiTeacher>('zaroda_hoi_teachers', id, updates),
  remove: (id: string) => deleteItem<HoiTeacher>('zaroda_hoi_teachers', id),
};

export const hoiSubjectsStorage = {
  getAll: (): HoiSubject[] => getSeeded<HoiSubject>('zaroda_hoi_subjects', SEED_SUBJECTS),
  add: (item: Omit<HoiSubject, 'id'>) => addItem<HoiSubject>('zaroda_hoi_subjects', item),
  update: (id: string, updates: Partial<HoiSubject>) => updateItem<HoiSubject>('zaroda_hoi_subjects', id, updates),
  remove: (id: string) => deleteItem<HoiSubject>('zaroda_hoi_subjects', id),
};

export const hoiSubjectAssignmentsStorage = {
  getAll: (): HoiSubjectAssignment[] => getSeeded<HoiSubjectAssignment>('zaroda_hoi_subject_assignments', SEED_SUBJECT_ASSIGNMENTS),
  add: (item: Omit<HoiSubjectAssignment, 'id'>) => addItem<HoiSubjectAssignment>('zaroda_hoi_subject_assignments', item),
  update: (id: string, updates: Partial<HoiSubjectAssignment>) => updateItem<HoiSubjectAssignment>('zaroda_hoi_subject_assignments', id, updates),
  remove: (id: string) => deleteItem<HoiSubjectAssignment>('zaroda_hoi_subject_assignments', id),
};

export const hoiTeacherDutiesStorage = {
  getAll: (): HoiTeacherDuty[] => getSeeded<HoiTeacherDuty>('zaroda_hoi_teacher_duties', SEED_TEACHER_DUTIES),
  add: (item: Omit<HoiTeacherDuty, 'id'>) => addItem<HoiTeacherDuty>('zaroda_hoi_teacher_duties', item),
  update: (id: string, updates: Partial<HoiTeacherDuty>) => updateItem<HoiTeacherDuty>('zaroda_hoi_teacher_duties', id, updates),
  remove: (id: string) => deleteItem<HoiTeacherDuty>('zaroda_hoi_teacher_duties', id),
};

export const hoiStudentsStorage = {
  getAll: (): HoiStudent[] => getSeeded<HoiStudent>('zaroda_hoi_students', SEED_STUDENTS),
  add: (item: Omit<HoiStudent, 'id'>) => addItem<HoiStudent>('zaroda_hoi_students', item),
  update: (id: string, updates: Partial<HoiStudent>) => updateItem<HoiStudent>('zaroda_hoi_students', id, updates),
  remove: (id: string) => deleteItem<HoiStudent>('zaroda_hoi_students', id),
};

export const hoiOfficialsStorage = {
  getAll: (): HoiOfficial[] => getSeeded<HoiOfficial>('zaroda_hoi_officials', SEED_OFFICIALS),
  add: (item: Omit<HoiOfficial, 'id'>) => addItem<HoiOfficial>('zaroda_hoi_officials', item),
  update: (id: string, updates: Partial<HoiOfficial>) => updateItem<HoiOfficial>('zaroda_hoi_officials', id, updates),
  remove: (id: string) => deleteItem<HoiOfficial>('zaroda_hoi_officials', id),
};

export const hoiTimetableStorage = {
  getAll: (): HoiTimetableSlot[] => getSeeded<HoiTimetableSlot>('zaroda_hoi_timetable', SEED_TIMETABLE),
  add: (item: Omit<HoiTimetableSlot, 'id'>) => addItem<HoiTimetableSlot>('zaroda_hoi_timetable', item),
  update: (id: string, updates: Partial<HoiTimetableSlot>) => updateItem<HoiTimetableSlot>('zaroda_hoi_timetable', id, updates),
  remove: (id: string) => deleteItem<HoiTimetableSlot>('zaroda_hoi_timetable', id),
};

export const hoiAttendanceStorage = {
  getAll: (): HoiAttendance[] => getSeeded<HoiAttendance>('zaroda_hoi_attendance', SEED_ATTENDANCE),
  add: (item: Omit<HoiAttendance, 'id'>) => addItem<HoiAttendance>('zaroda_hoi_attendance', item),
  update: (id: string, updates: Partial<HoiAttendance>) => updateItem<HoiAttendance>('zaroda_hoi_attendance', id, updates),
  remove: (id: string) => deleteItem<HoiAttendance>('zaroda_hoi_attendance', id),
};

export const hoiFeesStorage = {
  getAll: (): HoiFeePayment[] => getSeeded<HoiFeePayment>('zaroda_hoi_fees', SEED_FEES),
  add: (item: Omit<HoiFeePayment, 'id'>) => addItem<HoiFeePayment>('zaroda_hoi_fees', item),
  update: (id: string, updates: Partial<HoiFeePayment>) => updateItem<HoiFeePayment>('zaroda_hoi_fees', id, updates),
  remove: (id: string) => deleteItem<HoiFeePayment>('zaroda_hoi_fees', id),
};

export const hoiExpensesStorage = {
  getAll: (): HoiExpense[] => getSeeded<HoiExpense>('zaroda_hoi_expenses', SEED_EXPENSES),
  add: (item: Omit<HoiExpense, 'id'>) => addItem<HoiExpense>('zaroda_hoi_expenses', item),
  update: (id: string, updates: Partial<HoiExpense>) => updateItem<HoiExpense>('zaroda_hoi_expenses', id, updates),
  remove: (id: string) => deleteItem<HoiExpense>('zaroda_hoi_expenses', id),
};

export const hoiBooksStorage = {
  getAll: (): HoiBook[] => getSeeded<HoiBook>('zaroda_hoi_books', SEED_BOOKS),
  add: (item: Omit<HoiBook, 'id'>) => addItem<HoiBook>('zaroda_hoi_books', item),
  update: (id: string, updates: Partial<HoiBook>) => updateItem<HoiBook>('zaroda_hoi_books', id, updates),
  remove: (id: string) => deleteItem<HoiBook>('zaroda_hoi_books', id),
};

export const hoiBookIssuesStorage = {
  getAll: (): HoiBookIssue[] => getSeeded<HoiBookIssue>('zaroda_hoi_book_issues', SEED_BOOK_ISSUES),
  add: (item: Omit<HoiBookIssue, 'id'>) => addItem<HoiBookIssue>('zaroda_hoi_book_issues', item),
  update: (id: string, updates: Partial<HoiBookIssue>) => updateItem<HoiBookIssue>('zaroda_hoi_book_issues', id, updates),
  remove: (id: string) => deleteItem<HoiBookIssue>('zaroda_hoi_book_issues', id),
};

export const hoiSportsStorage = {
  getAll: (): HoiSport[] => getSeeded<HoiSport>('zaroda_hoi_sports', SEED_SPORTS),
  add: (item: Omit<HoiSport, 'id'>) => addItem<HoiSport>('zaroda_hoi_sports', item),
  update: (id: string, updates: Partial<HoiSport>) => updateItem<HoiSport>('zaroda_hoi_sports', id, updates),
  remove: (id: string) => deleteItem<HoiSport>('zaroda_hoi_sports', id),
};

export const hoiSportsTeamsStorage = {
  getAll: (): HoiSportsTeam[] => getSeeded<HoiSportsTeam>('zaroda_hoi_sports_teams', SEED_SPORTS_TEAMS),
  add: (item: Omit<HoiSportsTeam, 'id'>) => addItem<HoiSportsTeam>('zaroda_hoi_sports_teams', item),
  update: (id: string, updates: Partial<HoiSportsTeam>) => updateItem<HoiSportsTeam>('zaroda_hoi_sports_teams', id, updates),
  remove: (id: string) => deleteItem<HoiSportsTeam>('zaroda_hoi_sports_teams', id),
};

export const hoiSportsEventsStorage = {
  getAll: (): HoiSportsEvent[] => getSeeded<HoiSportsEvent>('zaroda_hoi_sports_events', SEED_SPORTS_EVENTS),
  add: (item: Omit<HoiSportsEvent, 'id'>) => addItem<HoiSportsEvent>('zaroda_hoi_sports_events', item),
  update: (id: string, updates: Partial<HoiSportsEvent>) => updateItem<HoiSportsEvent>('zaroda_hoi_sports_events', id, updates),
  remove: (id: string) => deleteItem<HoiSportsEvent>('zaroda_hoi_sports_events', id),
};

export const hoiElectionsStorage = {
  getAll: (): HoiElection[] => getSeeded<HoiElection>('zaroda_hoi_elections', SEED_ELECTIONS),
  add: (item: Omit<HoiElection, 'id'>) => addItem<HoiElection>('zaroda_hoi_elections', item),
  update: (id: string, updates: Partial<HoiElection>) => updateItem<HoiElection>('zaroda_hoi_elections', id, updates),
  remove: (id: string) => deleteItem<HoiElection>('zaroda_hoi_elections', id),
};

export const hoiCandidatesStorage = {
  getAll: (): HoiCandidate[] => getSeeded<HoiCandidate>('zaroda_hoi_candidates', SEED_CANDIDATES),
  add: (item: Omit<HoiCandidate, 'id'>) => addItem<HoiCandidate>('zaroda_hoi_candidates', item),
  update: (id: string, updates: Partial<HoiCandidate>) => updateItem<HoiCandidate>('zaroda_hoi_candidates', id, updates),
  remove: (id: string) => deleteItem<HoiCandidate>('zaroda_hoi_candidates', id),
};

export const hoiAnnouncementsStorage = {
  getAll: (): HoiAnnouncement[] => getSeeded<HoiAnnouncement>('zaroda_hoi_announcements', SEED_ANNOUNCEMENTS),
  add: (item: Omit<HoiAnnouncement, 'id'>) => addItem<HoiAnnouncement>('zaroda_hoi_announcements', item),
  update: (id: string, updates: Partial<HoiAnnouncement>) => updateItem<HoiAnnouncement>('zaroda_hoi_announcements', id, updates),
  remove: (id: string) => deleteItem<HoiAnnouncement>('zaroda_hoi_announcements', id),
};

export const hoiSchoolProfileStorage = {
  get: (): HoiSchoolProfile => getObject<HoiSchoolProfile>('zaroda_hoi_school_profile', DEFAULT_SCHOOL_PROFILE),
  save: (profile: HoiSchoolProfile) => setObject<HoiSchoolProfile>('zaroda_hoi_school_profile', profile),
};

export const hoiCalendarEventsStorage = {
  getAll: (): HoiCalendarEvent[] => getSeeded<HoiCalendarEvent>('zaroda_hoi_calendar_events', SEED_CALENDAR_EVENTS),
  add: (item: Omit<HoiCalendarEvent, 'id'>) => addItem<HoiCalendarEvent>('zaroda_hoi_calendar_events', item),
  update: (id: string, updates: Partial<HoiCalendarEvent>) => updateItem<HoiCalendarEvent>('zaroda_hoi_calendar_events', id, updates),
  remove: (id: string) => deleteItem<HoiCalendarEvent>('zaroda_hoi_calendar_events', id),
};
