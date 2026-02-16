export interface School {
  id: string;
  name: string;
  school_code: string;
  school_type: string;
  county: string;
  sub_county: string;
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

export interface Faculty {
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const SEED_SCHOOLS: School[] = [
  { id: 's1', name: 'Greenwood Academy', school_code: 'GWA-001', school_type: 'Secondary', county: 'Nairobi', sub_county: 'Westlands', contact_name: 'James Ochieng', contact_email: 'admin@greenwood.ac.ke', contact_phone: '+254 712 345 678', status: 'active', categories: ['Day', 'Boarding'], student_count: 450, faculty_count: 32, created_at: '2024-01-15' },
  { id: 's2', name: 'Sunrise Primary School', school_code: 'SPS-002', school_type: 'Primary', county: 'Mombasa', sub_county: 'Nyali', contact_name: 'Mary Wanjiku', contact_email: 'head@sunrise.ac.ke', contact_phone: '+254 723 456 789', status: 'active', categories: ['Day'], student_count: 680, faculty_count: 28, created_at: '2024-02-20' },
  { id: 's3', name: 'Heritage High School', school_code: 'HHS-003', school_type: 'Secondary', county: 'Kisumu', sub_county: 'Kisumu Central', contact_name: 'Peter Otieno', contact_email: 'info@heritage.ac.ke', contact_phone: '+254 734 567 890', status: 'active', categories: ['Boarding'], student_count: 520, faculty_count: 35, created_at: '2024-03-10' },
  { id: 's4', name: 'Victory Christian School', school_code: 'VCS-004', school_type: 'Primary', county: 'Nakuru', sub_county: 'Nakuru East', contact_name: 'Grace Kamau', contact_email: 'admin@victory.ac.ke', contact_phone: '+254 745 678 901', status: 'pending', categories: ['Day', 'Boarding'], student_count: 320, faculty_count: 22, created_at: '2024-04-05' },
  { id: 's5', name: 'Lakeside Academy', school_code: 'LSA-005', school_type: 'Secondary', county: 'Kisumu', sub_county: 'Kisumu West', contact_name: 'David Omondi', contact_email: 'head@lakeside.ac.ke', contact_phone: '+254 756 789 012', status: 'suspended', categories: ['Day'], student_count: 280, faculty_count: 18, created_at: '2024-05-12' },
  { id: 's6', name: 'Mt. Kenya Preparatory', school_code: 'MKP-006', school_type: 'Primary', county: 'Nyeri', sub_county: 'Nyeri Central', contact_name: 'Ann Muthoni', contact_email: 'admin@mtkenyaprep.ac.ke', contact_phone: '+254 767 890 123', status: 'active', categories: ['Day'], student_count: 410, faculty_count: 25, created_at: '2024-06-18' },
];

const SEED_STUDENTS: Student[] = [
  { id: 'st1', full_name: 'Kevin Odhiambo', admission_no: 'GWA-2024-001', school_id: 's1', grade: 'Form 3', stream: 'East', guardian_name: 'John Odhiambo', guardian_phone: '+254 700 111 222', guardian_email: 'john.o@email.com', gender: 'Male', date_of_birth: '2008-03-15', status: 'active', enrolled_at: '2024-01-10' },
  { id: 'st2', full_name: 'Faith Akinyi', admission_no: 'GWA-2024-002', school_id: 's1', grade: 'Form 2', stream: 'West', guardian_name: 'Rose Akinyi', guardian_phone: '+254 700 222 333', guardian_email: 'rose.a@email.com', gender: 'Female', date_of_birth: '2009-07-22', status: 'active', enrolled_at: '2024-01-10' },
  { id: 'st3', full_name: 'Brian Kiprop', admission_no: 'SPS-2024-001', school_id: 's2', grade: 'Class 7', stream: 'A', guardian_name: 'Daniel Kiprop', guardian_phone: '+254 700 333 444', guardian_email: 'daniel.k@email.com', gender: 'Male', date_of_birth: '2012-11-05', status: 'active', enrolled_at: '2024-02-15' },
  { id: 'st4', full_name: 'Mercy Njeri', admission_no: 'SPS-2024-002', school_id: 's2', grade: 'Class 8', stream: 'B', guardian_name: 'Sarah Njeri', guardian_phone: '+254 700 444 555', guardian_email: 'sarah.n@email.com', gender: 'Female', date_of_birth: '2011-09-18', status: 'active', enrolled_at: '2024-02-15' },
  { id: 'st5', full_name: 'Victor Mwangi', admission_no: 'HHS-2024-001', school_id: 's3', grade: 'Form 1', stream: 'Alpha', guardian_name: 'Joseph Mwangi', guardian_phone: '+254 700 555 666', guardian_email: 'joseph.m@email.com', gender: 'Male', date_of_birth: '2010-01-30', status: 'active', enrolled_at: '2024-03-01' },
  { id: 'st6', full_name: 'Angela Wambui', admission_no: 'HHS-2024-002', school_id: 's3', grade: 'Form 4', stream: 'Beta', guardian_name: 'Michael Wambui', guardian_phone: '+254 700 666 777', guardian_email: 'michael.w@email.com', gender: 'Female', date_of_birth: '2007-06-12', status: 'graduated', enrolled_at: '2021-01-10' },
  { id: 'st7', full_name: 'Dennis Otieno', admission_no: 'VCS-2024-001', school_id: 's4', grade: 'Class 5', stream: 'A', guardian_name: 'Patrick Otieno', guardian_phone: '+254 700 777 888', guardian_email: 'patrick.o@email.com', gender: 'Male', date_of_birth: '2014-04-25', status: 'active', enrolled_at: '2024-04-10' },
  { id: 'st8', full_name: 'Lucy Chebet', admission_no: 'MKP-2024-001', school_id: 's6', grade: 'Class 6', stream: 'B', guardian_name: 'Timothy Chebet', guardian_phone: '+254 700 888 999', guardian_email: 'timothy.c@email.com', gender: 'Female', date_of_birth: '2013-12-08', status: 'active', enrolled_at: '2024-06-20' },
];

const SEED_FACULTY: Faculty[] = [
  { id: 'f1', full_name: 'Dr. Samuel Kariuki', staff_no: 'GWA-T-001', school_id: 's1', role: 'Principal', department: 'Administration', email: 's.kariuki@greenwood.ac.ke', phone: '+254 711 100 001', qualification: 'PhD Education', gender: 'Male', status: 'active', hired_at: '2020-01-05' },
  { id: 'f2', full_name: 'Jane Muthoni', staff_no: 'GWA-T-002', school_id: 's1', role: 'Teacher', department: 'Mathematics', email: 'j.muthoni@greenwood.ac.ke', phone: '+254 711 100 002', qualification: 'B.Ed Mathematics', gender: 'Female', status: 'active', hired_at: '2021-03-10' },
  { id: 'f3', full_name: 'Robert Ouma', staff_no: 'SPS-T-001', school_id: 's2', role: 'Head Teacher', department: 'Administration', email: 'r.ouma@sunrise.ac.ke', phone: '+254 711 200 001', qualification: 'M.Ed Administration', gender: 'Male', status: 'active', hired_at: '2019-06-15' },
  { id: 'f4', full_name: 'Alice Njoroge', staff_no: 'SPS-T-002', school_id: 's2', role: 'Teacher', department: 'English', email: 'a.njoroge@sunrise.ac.ke', phone: '+254 711 200 002', qualification: 'B.Ed English', gender: 'Female', status: 'active', hired_at: '2022-01-20' },
  { id: 'f5', full_name: 'Thomas Kimani', staff_no: 'HHS-T-001', school_id: 's3', role: 'Deputy Principal', department: 'Sciences', email: 't.kimani@heritage.ac.ke', phone: '+254 711 300 001', qualification: 'M.Sc Chemistry', gender: 'Male', status: 'active', hired_at: '2020-09-01' },
  { id: 'f6', full_name: 'Caroline Achieng', staff_no: 'HHS-T-002', school_id: 's3', role: 'Teacher', department: 'Languages', email: 'c.achieng@heritage.ac.ke', phone: '+254 711 300 002', qualification: 'B.Ed Kiswahili', gender: 'Female', status: 'on_leave', hired_at: '2021-05-15' },
  { id: 'f7', full_name: 'Emmanuel Kipchoge', staff_no: 'VCS-T-001', school_id: 's4', role: 'Teacher', department: 'Physical Education', email: 'e.kipchoge@victory.ac.ke', phone: '+254 711 400 001', qualification: 'B.Ed PE', gender: 'Male', status: 'active', hired_at: '2023-02-01' },
  { id: 'f8', full_name: 'Diana Wairimu', staff_no: 'MKP-T-001', school_id: 's6', role: 'Head Teacher', department: 'Administration', email: 'd.wairimu@mtkenyaprep.ac.ke', phone: '+254 711 600 001', qualification: 'M.Ed Curriculum', gender: 'Female', status: 'active', hired_at: '2020-03-10' },
];

const SEED_INVOICES: Invoice[] = [
  { id: 'inv1', school_id: 's1', school_name: 'Greenwood Academy', description: 'Platform Subscription - Term 1', amount: 45000, period: '2024 Term 1', status: 'paid', due_date: '2024-01-31', paid_at: '2024-01-25', created_at: '2024-01-01' },
  { id: 'inv2', school_id: 's1', school_name: 'Greenwood Academy', description: 'Platform Subscription - Term 2', amount: 45000, period: '2024 Term 2', status: 'paid', due_date: '2024-05-31', paid_at: '2024-05-20', created_at: '2024-05-01' },
  { id: 'inv3', school_id: 's1', school_name: 'Greenwood Academy', description: 'Platform Subscription - Term 3', amount: 45000, period: '2024 Term 3', status: 'pending', due_date: '2025-01-31', paid_at: null, created_at: '2024-09-01' },
  { id: 'inv4', school_id: 's2', school_name: 'Sunrise Primary School', description: 'Platform Subscription - Term 1', amount: 35000, period: '2024 Term 1', status: 'paid', due_date: '2024-01-31', paid_at: '2024-01-28', created_at: '2024-01-01' },
  { id: 'inv5', school_id: 's2', school_name: 'Sunrise Primary School', description: 'Platform Subscription - Term 2', amount: 35000, period: '2024 Term 2', status: 'paid', due_date: '2024-05-31', paid_at: '2024-05-15', created_at: '2024-05-01' },
  { id: 'inv6', school_id: 's3', school_name: 'Heritage High School', description: 'Platform Subscription - Term 1', amount: 50000, period: '2024 Term 1', status: 'paid', due_date: '2024-01-31', paid_at: '2024-01-20', created_at: '2024-01-01' },
  { id: 'inv7', school_id: 's3', school_name: 'Heritage High School', description: 'Platform Subscription - Term 2', amount: 50000, period: '2024 Term 2', status: 'overdue', due_date: '2024-05-31', paid_at: null, created_at: '2024-05-01' },
  { id: 'inv8', school_id: 's4', school_name: 'Victory Christian School', description: 'Platform Subscription - Term 1', amount: 30000, period: '2024 Term 1', status: 'pending', due_date: '2024-06-30', paid_at: null, created_at: '2024-04-05' },
  { id: 'inv9', school_id: 's6', school_name: 'Mt. Kenya Preparatory', description: 'Platform Subscription - Term 1', amount: 40000, period: '2024 Term 1', status: 'paid', due_date: '2024-07-31', paid_at: '2024-07-10', created_at: '2024-06-18' },
];

const DEFAULT_SETTINGS: PlatformSettings = {
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

function getCollection<T>(key: string, seed: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function saveCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const schoolsStorage = {
  getAll: () => getCollection<School>('zaroda_schools', SEED_SCHOOLS),
  save: (schools: School[]) => saveCollection('zaroda_schools', schools),
  add: (school: Omit<School, 'id' | 'created_at'>) => {
    const schools = schoolsStorage.getAll();
    const newSchool: School = { ...school, id: generateId(), created_at: new Date().toISOString().split('T')[0] };
    schools.push(newSchool);
    schoolsStorage.save(schools);
    return newSchool;
  },
  update: (id: string, data: Partial<School>) => {
    const schools = schoolsStorage.getAll();
    const idx = schools.findIndex(s => s.id === id);
    if (idx !== -1) { schools[idx] = { ...schools[idx], ...data }; schoolsStorage.save(schools); }
    return schools[idx];
  },
  remove: (id: string) => {
    const schools = schoolsStorage.getAll().filter(s => s.id !== id);
    schoolsStorage.save(schools);
  },
  getById: (id: string) => schoolsStorage.getAll().find(s => s.id === id),
};

export const studentsStorage = {
  getAll: () => getCollection<Student>('zaroda_students', SEED_STUDENTS),
  save: (students: Student[]) => saveCollection('zaroda_students', students),
  add: (student: Omit<Student, 'id' | 'enrolled_at'>) => {
    const students = studentsStorage.getAll();
    const newStudent: Student = { ...student, id: generateId(), enrolled_at: new Date().toISOString().split('T')[0] };
    students.push(newStudent);
    studentsStorage.save(students);
    return newStudent;
  },
  update: (id: string, data: Partial<Student>) => {
    const students = studentsStorage.getAll();
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) { students[idx] = { ...students[idx], ...data }; studentsStorage.save(students); }
    return students[idx];
  },
  remove: (id: string) => {
    const students = studentsStorage.getAll().filter(s => s.id !== id);
    studentsStorage.save(students);
  },
};

export const facultyStorage = {
  getAll: () => getCollection<Faculty>('zaroda_faculty', SEED_FACULTY),
  save: (faculty: Faculty[]) => saveCollection('zaroda_faculty', faculty),
  add: (member: Omit<Faculty, 'id' | 'hired_at'>) => {
    const faculty = facultyStorage.getAll();
    const newMember: Faculty = { ...member, id: generateId(), hired_at: new Date().toISOString().split('T')[0] };
    faculty.push(newMember);
    facultyStorage.save(faculty);
    return newMember;
  },
  update: (id: string, data: Partial<Faculty>) => {
    const faculty = facultyStorage.getAll();
    const idx = faculty.findIndex(f => f.id === id);
    if (idx !== -1) { faculty[idx] = { ...faculty[idx], ...data }; facultyStorage.save(faculty); }
    return faculty[idx];
  },
  remove: (id: string) => {
    const faculty = facultyStorage.getAll().filter(f => f.id !== id);
    facultyStorage.save(faculty);
  },
};

export const invoicesStorage = {
  getAll: () => getCollection<Invoice>('zaroda_invoices', SEED_INVOICES),
  save: (invoices: Invoice[]) => saveCollection('zaroda_invoices', invoices),
  add: (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
    const invoices = invoicesStorage.getAll();
    const newInvoice: Invoice = { ...invoice, id: generateId(), created_at: new Date().toISOString().split('T')[0] };
    invoices.push(newInvoice);
    invoicesStorage.save(invoices);
    return newInvoice;
  },
  update: (id: string, data: Partial<Invoice>) => {
    const invoices = invoicesStorage.getAll();
    const idx = invoices.findIndex(i => i.id === id);
    if (idx !== -1) { invoices[idx] = { ...invoices[idx], ...data }; invoicesStorage.save(invoices); }
    return invoices[idx];
  },
  remove: (id: string) => {
    const invoices = invoicesStorage.getAll().filter(i => i.id !== id);
    invoicesStorage.save(invoices);
  },
};

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
  scores: AssessmentScore[];
  createdAt: string;
  updatedAt: string;
}

export const assessmentStorage = {
  getAll: (): AssessmentRecord[] => {
    const stored = localStorage.getItem('zaroda_assessments');
    return stored ? JSON.parse(stored) : [];
  },
  save: (records: AssessmentRecord[]) => {
    localStorage.setItem('zaroda_assessments', JSON.stringify(records));
  },
  getByTeacher: (teacherId: string): AssessmentRecord[] => {
    return assessmentStorage.getAll().filter(r => r.teacherId === teacherId);
  },
  getByStudent: (studentId: string): AssessmentRecord[] => {
    return assessmentStorage.getAll().filter(r => r.studentId === studentId);
  },
  find: (teacherId: string, studentId: string, grade: string, subject: string, term: number): AssessmentRecord | undefined => {
    return assessmentStorage.getAll().find(
      r => r.teacherId === teacherId && r.studentId === studentId && r.grade === grade && r.subject === subject && r.term === term
    );
  },
  upsert: (record: Omit<AssessmentRecord, 'id' | 'createdAt' | 'updatedAt'>): AssessmentRecord => {
    const records = assessmentStorage.getAll();
    const existingIdx = records.findIndex(
      r => r.teacherId === record.teacherId && r.studentId === record.studentId && r.grade === record.grade && r.subject === record.subject && r.term === record.term
    );
    const now = new Date().toISOString();
    if (existingIdx !== -1) {
      records[existingIdx] = { ...records[existingIdx], ...record, updatedAt: now };
      assessmentStorage.save(records);
      return records[existingIdx];
    }
    const newRecord: AssessmentRecord = { ...record, id: generateId(), createdAt: now, updatedAt: now };
    records.push(newRecord);
    assessmentStorage.save(records);
    return newRecord;
  },
  remove: (id: string) => {
    const records = assessmentStorage.getAll().filter(r => r.id !== id);
    assessmentStorage.save(records);
  },
  getStudentsAssessed: (teacherId: string, grade: string, subject: string, term: number): { studentId: string; studentName: string; admissionNo: string }[] => {
    const records = assessmentStorage.getAll().filter(
      r => r.teacherId === teacherId && r.grade === grade && r.subject === subject && r.term === term
    );
    return records.map(r => ({ studentId: r.studentId, studentName: r.studentName, admissionNo: r.admissionNo }));
  },
};

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
  action: 'login' | 'logout' | 'account_created' | 'account_updated' | 'account_suspended' | 'account_activated';
  timestamp: string;
  details?: string;
}

const SEED_PLATFORM_USERS: PlatformUser[] = [
  { id: 'pu1', email: 'hoi@greenwood.ac.ke', fullName: 'Dr. Samuel Kariuki', role: 'hoi', schoolCode: 'GWA-001', schoolName: 'Greenwood Academy', phone: '+254 711 100 001', status: 'active', createdAt: '2024-01-15', createdBy: 'SuperAdmin', lastLogin: '2026-02-15T08:30:00Z', loginCount: 45 },
  { id: 'pu2', email: 'hoi@sunrise.ac.ke', fullName: 'Mary Wanjiku', role: 'hoi', schoolCode: 'SPS-002', schoolName: 'Sunrise Primary School', phone: '+254 723 456 789', status: 'active', createdAt: '2024-02-20', createdBy: 'SuperAdmin', lastLogin: '2026-02-14T10:15:00Z', loginCount: 38 },
  { id: 'pu3', email: 'hoi@heritage.ac.ke', fullName: 'Peter Otieno', role: 'hoi', schoolCode: 'HHS-003', schoolName: 'Heritage High School', phone: '+254 734 567 890', status: 'active', createdAt: '2024-03-10', createdBy: 'SuperAdmin', lastLogin: '2026-02-13T14:20:00Z', loginCount: 32 },
  { id: 'pu4', email: 'hoi@victory.ac.ke', fullName: 'Grace Kamau', role: 'hoi', schoolCode: 'VCS-004', schoolName: 'Victory Christian School', phone: '+254 745 678 901', status: 'suspended', createdAt: '2024-04-05', createdBy: 'SuperAdmin', lastLogin: '2025-12-01T09:00:00Z', loginCount: 12 },
];

const SEED_ACTIVITY: LoginActivity[] = [
  { id: 'la1', userId: 'pu1', email: 'hoi@greenwood.ac.ke', fullName: 'Dr. Samuel Kariuki', role: 'hoi', action: 'login', timestamp: '2026-02-15T08:30:00Z' },
  { id: 'la2', userId: 'pu2', email: 'hoi@sunrise.ac.ke', fullName: 'Mary Wanjiku', role: 'hoi', action: 'login', timestamp: '2026-02-14T10:15:00Z' },
  { id: 'la3', userId: 'pu3', email: 'hoi@heritage.ac.ke', fullName: 'Peter Otieno', role: 'hoi', action: 'login', timestamp: '2026-02-13T14:20:00Z' },
  { id: 'la4', userId: 'pu1', email: 'hoi@greenwood.ac.ke', fullName: 'Dr. Samuel Kariuki', role: 'hoi', action: 'account_created', timestamp: '2024-01-15T09:00:00Z', details: 'Account created by SuperAdmin' },
  { id: 'la5', userId: 'pu4', email: 'hoi@victory.ac.ke', fullName: 'Grace Kamau', role: 'hoi', action: 'account_suspended', timestamp: '2025-12-15T11:00:00Z', details: 'Account suspended by SuperAdmin' },
];

export const platformUsersStorage = {
  getAll: () => getCollection<PlatformUser>('zaroda_platform_users', SEED_PLATFORM_USERS),
  save: (users: PlatformUser[]) => saveCollection('zaroda_platform_users', users),
  add: (user: Omit<PlatformUser, 'id' | 'createdAt' | 'lastLogin' | 'loginCount'>) => {
    const users = platformUsersStorage.getAll();
    const newUser: PlatformUser = { ...user, id: generateId(), createdAt: new Date().toISOString().split('T')[0], lastLogin: null, loginCount: 0 };
    users.push(newUser);
    platformUsersStorage.save(users);
    return newUser;
  },
  update: (id: string, data: Partial<PlatformUser>) => {
    const users = platformUsersStorage.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...data }; platformUsersStorage.save(users); }
    return users[idx];
  },
  remove: (id: string) => {
    const users = platformUsersStorage.getAll().filter(u => u.id !== id);
    platformUsersStorage.save(users);
  },
  findByEmail: (email: string) => {
    return platformUsersStorage.getAll().find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  getByRole: (role: string) => {
    return platformUsersStorage.getAll().filter(u => u.role === role);
  },
  getBySchool: (schoolCode: string) => {
    return platformUsersStorage.getAll().filter(u => u.schoolCode === schoolCode);
  },
  recordLogin: (id: string) => {
    const users = platformUsersStorage.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx].lastLogin = new Date().toISOString();
      users[idx].loginCount = (users[idx].loginCount || 0) + 1;
      platformUsersStorage.save(users);
    }
  },
};

export const activityStorage = {
  getAll: () => getCollection<LoginActivity>('zaroda_activity_log', SEED_ACTIVITY),
  save: (logs: LoginActivity[]) => saveCollection('zaroda_activity_log', logs),
  add: (log: Omit<LoginActivity, 'id' | 'timestamp'>) => {
    const logs = activityStorage.getAll();
    const newLog: LoginActivity = { ...log, id: generateId(), timestamp: new Date().toISOString() };
    logs.push(newLog);
    activityStorage.save(logs);
    return newLog;
  },
  getByUser: (userId: string) => {
    return activityStorage.getAll().filter(l => l.userId === userId);
  },
  getRecent: (limit = 50) => {
    return activityStorage.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },
};

export const initSeedPasswords = () => {
  const key = 'zaroda_passwords';
  const existing = localStorage.getItem(key);
  const passwords: Record<string, string> = existing ? JSON.parse(existing) : {};
  let changed = false;
  const seedPasswords: Record<string, string> = {
    'hoi@greenwood.ac.ke': 'greenwood2024',
    'hoi@sunrise.ac.ke': 'sunrise2024',
    'hoi@heritage.ac.ke': 'heritage2024',
    'hoi@victory.ac.ke': 'victory2024',
  };
  for (const [email, pwd] of Object.entries(seedPasswords)) {
    if (!passwords[email]) {
      passwords[email] = pwd;
      changed = true;
    }
  }
  if (changed) {
    localStorage.setItem(key, JSON.stringify(passwords));
  }
};

export const settingsStorage = {
  get: (): PlatformSettings => {
    const stored = localStorage.getItem('zaroda_settings');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('zaroda_settings', JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  },
  save: (settings: PlatformSettings) => {
    localStorage.setItem('zaroda_settings', JSON.stringify(settings));
  },
};
