import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Plus, Edit2, Ban, CheckCircle, Eye, ChevronLeft, ChevronRight, Users,
  Shield, GraduationCap, Clock, Activity, UserPlus, Filter, X, Trash2
} from 'lucide-react';
import { platformUsersStorage, activityStorage, schoolsStorage } from '@/lib/storage';
import { sendWelcomeEmail } from '@/lib/email';
import type { PlatformUser, LoginActivity } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'SuperAdmin', loginEnabled: true },
  { value: 'hoi', label: 'HOI (Head of Institution)', loginEnabled: true },
  { value: 'hod', label: 'HOD (Head of Department)', loginEnabled: true },
  { value: 'teacher', label: 'Teacher', loginEnabled: true },
  { value: 'dhoi', label: 'DHOI (Deputy Head)', loginEnabled: true },
  { value: 'student', label: 'Student', loginEnabled: false },
  { value: 'parent', label: 'Parent', loginEnabled: false },
];

const CREATE_ROLE_OPTIONS = ROLE_OPTIONS.filter((role) => ['hoi', 'dhoi', 'hod', 'teacher'].includes(role.value));

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  deactivated: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  hoi: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hod: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  teacher: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  dhoi: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  student: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  parent: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

const ACTION_LABELS: Record<string, string> = {
  login: 'Logged in',
  logout: 'Logged out',
  account_created: 'Account created',
  account_updated: 'Account updated',
  account_suspended: 'Account suspended',
  account_activated: 'Account activated',
  account_deleted: 'Account deactivated',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'text-emerald-600',
  logout: 'text-gray-500',
  account_created: 'text-blue-600',
  account_updated: 'text-orange-600',
  account_suspended: 'text-red-600',
  account_activated: 'text-emerald-600',
  account_deleted: 'text-red-700 font-semibold',
};

type TabId = 'all_users' | 'create_user' | 'activity_log';
type LoginActivityWithCreatedAt = LoginActivity & { created_at: string };

export default function UsersSection() {
  const [activeTab, setActiveTab] = useState<TabId>('all_users');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [activities, setActivities] = useState<LoginActivityWithCreatedAt[]>([]);
  const [schools, setSchools] = useState<Array<{ id: string; school_code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [userActivities, setUserActivities] = useState<LoginActivityWithCreatedAt[]>([]);
  const { toast } = useToast();
  const perPage = 10;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'hoi' as string,
    schoolCode: '',
    schoolName: '',
    phone: '',
    employeeId: '',
    teacherCode: '',
    subject: '',
    gender: 'Male',
    qualification: '',
    grade: '',
  });

  const loadData = async () => {
    try {
      const [profileRes, activitiesData, schoolsData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        activityStorage.getRecent(200),
        schoolsStorage.getAll(),
      ]);

      if (profileRes.error) throw profileRes.error;

      const usersData: PlatformUser[] = (profileRes.data || []).map((row: any) => ({
        id: row.id,
        email: row.email || '',
        fullName: row.full_name || '',
        role: row.role,
        schoolCode: row.school_code || '',
        schoolName: row.school_name || '',
        phone: row.phone || '',
        status: row.status || 'inactive',
        subject: row.subject || undefined,
        grade: row.grade || undefined,
        createdAt: row.created_at || new Date().toISOString(),
        createdBy: row.created_by || 'System',
        lastLogin: row.last_login || null,
        loginCount: Number(row.login_count || 0),
      }));

      setUsers(usersData);
      setActivities(activitiesData.map((activity) => ({
        ...activity,
        created_at: (activity as LoginActivityWithCreatedAt).created_at || activity.timestamp,
      })));
      setSchools(schoolsData);
    } catch (error) {
      toast({
        title: 'Failed to load users',
        description: error instanceof Error ? error.message : 'Could not load user management data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.schoolName.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchSchool = schoolFilter === 'all' || u.schoolCode === schoolFilter;
    return matchSearch && matchRole && matchStatus && matchSchool;
  });

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

  const filteredActivities = activities;
  const totalActivityPages = Math.ceil(filteredActivities.length / perPage);
  const paginatedActivities = filteredActivities.slice((activityPage - 1) * perPage, activityPage * perPage);

  const roleDistribution = ROLE_OPTIONS.map(r => ({
    name: r.label.split(' (')[0],
    value: users.filter(u => u.role === r.value).length,
    role: r.value,
  })).filter(r => r.value > 0);

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;
  const hoiCount = users.filter(u => u.role === 'hoi').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;

  const resetForm = () => {
    setFormData({ fullName: '', email: '', password: '', role: 'hoi', schoolCode: '', schoolName: '', phone: '', employeeId: '', teacherCode: '', subject: '', gender: 'Male', qualification: '', grade: '' });
  };

  const handleSchoolSelect = (schoolCode: string) => {
    const school = schools.find(s => s.school_code === schoolCode);
    setFormData(prev => ({ ...prev, schoolCode, schoolName: school?.name || '' }));
  };

  const handleCreateUser = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.schoolCode.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const email = formData.email.trim().toLowerCase();
      const fullName = formData.fullName.trim();
      const role = formData.role as PlatformUser['role'];
      const schoolCode = formData.schoolCode.trim();
      const phone = formData.phone.trim();
      const status: PlatformUser['status'] = 'active';
      const isTeacherLike = role === 'teacher' || role === 'hod';

      if (isTeacherLike && (!formData.employeeId.trim() || !formData.teacherCode.trim())) {
        toast({ title: 'Missing fields', description: 'Employee ID and Teacher Code are required for Teacher/HOD.', variant: 'destructive' });
        return;
      }

      if (!['hoi', 'dhoi', 'hod', 'teacher'].includes(role)) {
        toast({ title: 'Invalid role', description: 'Only HOI, DHOI, HOD, or Teacher can be created here.', variant: 'destructive' });
        return;
      }

      const existing = await platformUsersStorage.findByEmail(email);
      if (existing) {
        toast({ title: 'Email exists', description: 'A user with this email already exists.', variant: 'destructive' });
        return;
      }

      const { data: schoolRow, error: schoolLookupError } = await supabase
        .from('schools')
        .select('id, name, school_code')
        .eq('school_code', schoolCode)
        .maybeSingle();

      if (schoolLookupError) throw schoolLookupError;

      if (!schoolRow) {
        toast({
          title: 'Invalid School',
          description: 'Selected school code was not found. Please select a valid school.',
          variant: 'destructive',
        });
        return;
      }

      if (role === 'hoi' || role === 'dhoi') {
        const { data: existingLeadership, error: existingLeadershipError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('school_code', schoolCode)
          .eq('role', role)
          .eq('status', 'active')
          .maybeSingle();

        if (existingLeadershipError) throw existingLeadershipError;

        if (existingLeadership) {
          toast({
            title: 'Role already assigned',
            description: `This school already has an active ${role.toUpperCase()}. Deactivate the current one first.`,
            variant: 'destructive',
          });
          return;
        }
      }

      const schoolName = schoolRow.name || schoolCode;

      const { data: authData, error: createAuthError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            role,
            school_code: schoolCode,
          },
        },
      });
      if (createAuthError) throw createAuthError;

      const authUser = authData.user;
      if (!authUser) throw new Error('Auth user was not created.');

      const { error: profileInsertError } = await supabase.from('profiles').insert({
        id: authUser.id,
        email,
        full_name: fullName,
        role,
        school_id: schoolRow.id,
        school_code: schoolRow.school_code,
        school_name: schoolName,
        phone: phone || null,
        status,
        subject: formData.subject.trim() || null,
        grade: formData.grade.trim() || null,
        created_by: 'SuperAdmin',
      });
      if (profileInsertError) throw profileInsertError;

      if (isTeacherLike) {
        const teacherCode = formData.teacherCode.trim().toUpperCase();
        const { data: teacherRow, error: teacherInsertError } = await supabase
          .from('hoi_teachers')
          .insert({
            full_name: fullName,
            email,
            phone: phone || null,
            employee_id: formData.employeeId.trim(),
            subject_specialization: formData.subject.trim() || null,
            gender: formData.gender === 'Female' ? 'Female' : 'Male',
            qualification: formData.qualification.trim() || null,
            status: 'active',
            hired_at: new Date().toISOString().split('T')[0],
            school_id: schoolRow.id,
            school_code: schoolRow.school_code,
            school_name: schoolName,
            profile_id: authUser.id,
          })
          .select('id')
          .maybeSingle();

        if (teacherInsertError || !teacherRow?.id) {
          throw new Error(teacherInsertError?.message || 'Teacher record could not be created.');
        }

        const { error: teacherCodeError } = await supabase
          .from('teacher_codes')
          .upsert({
            teacher_id: teacherRow.id,
            code: teacherCode,
            school_id: schoolRow.id,
            school_code: schoolRow.school_code,
          }, { onConflict: 'teacher_id' });

        if (teacherCodeError) throw teacherCodeError;
      }

      const newUser: PlatformUser = {
        id: authUser.id,
        email,
        fullName,
        role,
        schoolCode,
        schoolName,
        phone,
        status,
        subject: formData.subject.trim() || undefined,
        grade: formData.grade.trim() || undefined,
        createdBy: 'SuperAdmin',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        loginCount: 0,
      };

      await activityStorage.add({
        userId: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        action: 'account_created',
        details: `Account created by SuperAdmin with role: ${newUser.role.toUpperCase()}`,
      });

      try {
        await sendWelcomeEmail({
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          schoolName: newUser.schoolName,
          schoolCode: newUser.schoolCode,
          createdBy: 'SuperAdmin',
        });
      } catch {}

      toast({ title: 'User created', description: `${newUser.fullName} (${newUser.role.toUpperCase()}) account has been created successfully.` });
      resetForm();
      setShowCreateModal(false);
      await loadData();
    } catch (error) {
      toast({
        title: 'Failed to create user',
        description: error instanceof Error ? error.message : 'Could not create user account.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newEmail = formData.email.trim().toLowerCase();

      await platformUsersStorage.update(selectedUser.id, {
        fullName: formData.fullName.trim(),
        email: newEmail,
        phone: formData.phone.trim(),
        schoolCode: formData.schoolCode.trim(),
        schoolName: formData.schoolName.trim() || formData.schoolCode.trim(),
        subject: formData.subject.trim() || undefined,
        grade: formData.grade.trim() || undefined,
      });

      const { data: selectedSchool, error: selectedSchoolError } = await supabase
        .from('schools')
        .select('id, school_code, name')
        .eq('school_code', formData.schoolCode.trim())
        .maybeSingle();
      if (selectedSchoolError) throw selectedSchoolError;
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName.trim(),
          email: newEmail,
          phone: formData.phone.trim(),
          school_id: selectedSchool?.id || null,
          school_code: selectedSchool?.school_code || formData.schoolCode.trim(),
          school_name: selectedSchool?.name || formData.schoolName.trim() || formData.schoolCode.trim(),
          subject: formData.subject.trim() || null,
          grade: formData.grade.trim() || null,
        })
        .eq('id', selectedUser.id);
      if (profileUpdateError) throw profileUpdateError;

      await activityStorage.add({
        userId: selectedUser.id,
        email: formData.email.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        role: selectedUser.role,
        action: 'account_updated',
        details: 'Account updated by SuperAdmin',
      });

      toast({ title: 'User updated', description: `${formData.fullName.trim()}'s account has been updated.` });
      setShowEditModal(false);
      setSelectedUser(null);
      await loadData();
    } catch (error) {
      toast({
        title: 'Failed to update user',
        description: error instanceof Error ? error.message : 'Could not update user account.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: PlatformUser) => {
    try {
      setIsSubmitting(true);
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await platformUsersStorage.update(user.id, { status: newStatus });

      const { error: profileStatusError } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', user.id);
      if (profileStatusError) throw profileStatusError;

      await activityStorage.add({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        action: newStatus === 'suspended' ? 'account_suspended' : 'account_activated',
        details: `Account ${newStatus} by SuperAdmin`,
      });

      toast({ title: newStatus === 'suspended' ? 'User suspended' : 'User activated', description: `${user.fullName}'s account has been ${newStatus}.` });
      await loadData();
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Could not update account status.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      const { error: deactivateProfileError } = await supabase
        .from('profiles')
        .update({ status: 'deactivated' })
        .eq('id', selectedUser.id);
      if (deactivateProfileError) throw deactivateProfileError;

      await activityStorage.add({
        userId: selectedUser.id,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        role: selectedUser.role,
        action: 'account_deleted',
        details: 'Account deactivated by SuperAdmin',
      });

      toast({ title: 'User deactivated', description: `${selectedUser.fullName}'s account has been deactivated.` });
      setShowDeleteConfirm(false);
      setShowEditModal(false);
      setSelectedUser(null);
      await loadData();
    } catch (error) {
      toast({
        title: 'Failed to delete user',
        description: error instanceof Error ? error.message : 'Could not delete user account.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (user: PlatformUser) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      schoolCode: user.schoolCode,
      schoolName: user.schoolName,
      phone: user.phone,
      employeeId: '',
      teacherCode: '',
      subject: user.subject || '',
      gender: 'Male',
      qualification: '',
      grade: user.grade || '',
    });
    setShowEditModal(true);
  };

  const openView = async (user: PlatformUser) => {
    try {
      setIsSubmitting(true);
      setSelectedUser(user);
      const logs = await activityStorage.getByUser(user.id);
      setUserActivities(logs.map((activity) => ({
        ...activity,
        created_at: (activity as LoginActivityWithCreatedAt).created_at || activity.timestamp,
      })));
      setShowViewModal(true);
    } catch (error) {
      toast({
        title: 'Failed to load user activity',
        description: error instanceof Error ? error.message : 'Could not load selected user activity.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: 'all_users', label: 'All Users', icon: Users },
    { id: 'create_user', label: 'Create User', icon: UserPlus },
    { id: 'activity_log', label: 'Activity Log', icon: Activity },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage all platform user accounts</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateModal(true); }} className="gap-2">
          <Plus size={18} />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Ban size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{suspendedCount}</p>
              <p className="text-xs text-muted-foreground">Suspended</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{hoiCount}</p>
              <p className="text-xs text-muted-foreground">HOI Users</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <GraduationCap size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teacherCount}</p>
              <p className="text-xs text-muted-foreground">Teachers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'all_users' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search by name, email, or school..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <Filter size={14} className="mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label.split(' (')[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={schoolFilter} onValueChange={v => { setSchoolFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.school_code} value={school.school_code}>
                    {school.name} ({school.school_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">School</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Last Login</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Logins</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">No users found</td></tr>
                  ) : (
                    paginatedUsers.map(user => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-sm">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-sm">{user.schoolName}</p>
                            <p className="text-xs text-muted-foreground">{user.schoolCode}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[user.status]}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{formatDate(user.lastLogin)}</td>
                        <td className="p-3 text-sm font-medium">{user.loginCount}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { void openView(user); }} title="View details" disabled={isSubmitting}>
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(user)} title="Edit user" disabled={isSubmitting}>
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { void handleToggleStatus(user); }}
                              title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                              className={user.status === 'active' ? 'text-red-500 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'}
                              disabled={isSubmitting}
                            >
                              {user.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {roleDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Account Status Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: 'Active', count: activeCount }, { name: 'Suspended', count: suspendedCount }, { name: 'Inactive', count: inactiveCount }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create_user' && (
        <div className="max-w-2xl">
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-1">Create New User Account</h3>
            <p className="text-sm text-muted-foreground mb-6">Fill in the details below to create a new user account. The user will log in with the email and password you assign.</p>

            <div className="space-y-4">
              <div>
                <Label>Role *</Label>
                <Select value={formData.role} onValueChange={v => setFormData(prev => ({ ...prev, role: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CREATE_ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Enter full name" className="mt-1" />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="user@school.ac.ke" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Password *</Label>
                  <Input type="text" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Assign a password" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">The user will use this password to log in</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" className="mt-1" />
                </div>
              </div>
              {(formData.role === 'teacher' || formData.role === 'hod') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Employee ID *</Label>
                    <Input value={formData.employeeId} onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))} placeholder="e.g. EMP001" className="mt-1" />
                  </div>
                  <div>
                    <Label>Teacher Code *</Label>
                    <Input value={formData.teacherCode} onChange={e => setFormData(prev => ({ ...prev, teacherCode: e.target.value }))} placeholder="e.g. TCH001" className="mt-1" />
                  </div>
                </div>
              )}
              <div>
                <Label>School KNEC Code *</Label>
                <Select value={formData.schoolCode} onValueChange={handleSchoolSelect}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a school..." /></SelectTrigger>
                  <SelectContent>
                    {schools.map(s => (
                      <SelectItem key={s.school_code} value={s.school_code}>{s.name} ({s.school_code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>School Name</Label>
                <Input value={formData.schoolName} readOnly className="mt-1 bg-muted/40" placeholder="Auto-filled from KNEC code" />
              </div>
              {(formData.role === 'teacher' || formData.role === 'hod') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Learning Area</Label>
                    <Input value={formData.subject} onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g., Mathematics" className="mt-1" />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={v => setFormData(prev => ({ ...prev, gender: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Qualification</Label>
                    <Input value={formData.qualification} onChange={e => setFormData(prev => ({ ...prev, qualification: e.target.value }))} placeholder="e.g., B.Ed" className="mt-1" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => { void handleCreateUser(); }} className="gap-2" disabled={isSubmitting}>
                  <UserPlus size={16} />
                  Create User Account
                </Button>
                <Button variant="outline" onClick={resetForm}>Clear Form</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity_log' && (
        <div>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Track all user login/logout and account management activity</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Details</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No activity recorded yet</td></tr>
                  ) : (
                    paginatedActivities.map(act => (
                      <tr key={act.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          <div>
                            <p className="text-sm font-medium">{act.fullName}</p>
                            <p className="text-xs text-muted-foreground">{act.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[act.role] || 'bg-gray-100 text-gray-700'}`}>
                            {act.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-sm font-medium ${ACTION_COLORS[act.action] || 'text-foreground'}`}>
                            {ACTION_LABELS[act.action] || act.action}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{act.details || '-'}</td>
                        <td className="p-3 text-sm text-muted-foreground">{formatDate(act.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalActivityPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Showing {((activityPage - 1) * perPage) + 1}-{Math.min(activityPage * perPage, filteredActivities.length)} of {filteredActivities.length}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={activityPage === 1} onClick={() => setActivityPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </Button>
                  <Button variant="outline" size="sm" disabled={activityPage === totalActivityPages} onClick={() => setActivityPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role *</Label>
              <Select value={formData.role} onValueChange={v => setFormData(prev => ({ ...prev, role: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CREATE_ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Full name" className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="user@school.ac.ke" className="mt-1" />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="text" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Assign password" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" className="mt-1" />
            </div>
            {(formData.role === 'teacher' || formData.role === 'hod') && (
              <>
                <div>
                  <Label>Employee ID *</Label>
                  <Input value={formData.employeeId} onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))} placeholder="e.g. EMP001" className="mt-1" />
                </div>
                <div>
                  <Label>Teacher Code *</Label>
                  <Input value={formData.teacherCode} onChange={e => setFormData(prev => ({ ...prev, teacherCode: e.target.value }))} placeholder="e.g. TCH001" className="mt-1" />
                </div>
              </>
            )}
            <div>
              <Label>School KNEC Code *</Label>
              <Select value={formData.schoolCode} onValueChange={handleSchoolSelect}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select school..." /></SelectTrigger>
                <SelectContent>
                  {schools.map(s => <SelectItem key={s.school_code} value={s.school_code}>{s.name} ({s.school_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>School Name</Label>
              <Input value={formData.schoolName} readOnly className="mt-1 bg-muted/40" placeholder="Auto-filled from KNEC code" />
            </div>
            {(formData.role === 'teacher' || formData.role === 'hod') && (
              <>
                <div>
                  <Label>Learning Area</Label>
                  <Input value={formData.subject} onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g., Mathematics" className="mt-1" />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={v => setFormData(prev => ({ ...prev, gender: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Qualification</Label>
                  <Input value={formData.qualification} onChange={e => setFormData(prev => ({ ...prev, qualification: e.target.value }))} placeholder="e.g., B.Ed" className="mt-1" />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={() => { void handleCreateUser(); }} className="flex-1" disabled={isSubmitting}>Create User</Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User - {selectedUser?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="text" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Leave empty to keep current" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Only fill this if you want to change the password</p>
            </div>
            <div>
              <Label>Phone *</Label>
              <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>School</Label>
              <Select value={formData.schoolCode} onValueChange={handleSchoolSelect}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {schools.map(s => <SelectItem key={s.school_code} value={s.school_code}>{s.name} ({s.school_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => { void handleEditUser(); }} className="flex-1" disabled={isSubmitting}>Save Changes</Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isSubmitting}>
                <Trash2 size={14} className="mr-2" /> Deactivate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{selectedUser.fullName.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[selectedUser.role]}`}>
                      {selectedUser.role.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[selectedUser.status]}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">School</p>
                  <p className="text-sm font-medium">{selectedUser.schoolName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SCHOOL KNEC CODE</p>
                  <p className="text-sm font-medium">{selectedUser.schoolCode}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Logins</p>
                  <p className="text-sm font-medium">{selectedUser.loginCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">{selectedUser.createdBy}</p>
                </div>
                {selectedUser.subject && (
                  <div>
                    <p className="text-xs text-muted-foreground">Learning Area</p>
                    <p className="text-sm font-medium">{selectedUser.subject}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  Recent Activity
                </h4>
                {userActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity recorded</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {userActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 20).map(act => (
                      <div key={act.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div>
                          <span className={`text-sm font-medium ${ACTION_COLORS[act.action]}`}>
                            {ACTION_LABELS[act.action]}
                          </span>
                          {act.details && <p className="text-xs text-muted-foreground">{act.details}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(act.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => { setShowViewModal(false); openEdit(selectedUser); }}>
                  <Edit2 size={14} className="mr-2" /> Edit User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void handleToggleStatus(selectedUser); setShowViewModal(false); }}
                  className={selectedUser.status === 'active' ? 'text-red-500' : 'text-emerald-500'}
                  disabled={isSubmitting}
                >
                  {selectedUser.status === 'active' ? <><Ban size={14} className="mr-2" /> Suspend</> : <><CheckCircle size={14} className="mr-2" /> Activate</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{selectedUser?.fullName}</strong>'s account? The user will no longer access the system, and this can be reversed later by updating status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { void handleDeleteUser(); }} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              Deactivate Account
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
