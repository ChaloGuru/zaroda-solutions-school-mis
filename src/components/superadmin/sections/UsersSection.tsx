import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Plus, Edit2, Ban, CheckCircle, Eye, ChevronLeft, ChevronRight, Users,
  Shield, GraduationCap, Clock, Activity, UserPlus, Filter, X
} from 'lucide-react';
import { platformUsersStorage, activityStorage, schoolsStorage } from '@/lib/storage';
import type { PlatformUser, LoginActivity } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const ROLE_OPTIONS = [
  { value: 'hoi', label: 'HOI (Head of Institution)', loginEnabled: true },
  { value: 'teacher', label: 'Teacher', loginEnabled: true },
  { value: 'dhoi', label: 'DHOI (Deputy Head)', loginEnabled: true },
  { value: 'student', label: 'Student', loginEnabled: false },
  { value: 'parent', label: 'Parent', loginEnabled: false },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const ROLE_COLORS: Record<string, string> = {
  hoi: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
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
};

const ACTION_COLORS: Record<string, string> = {
  login: 'text-emerald-600',
  logout: 'text-gray-500',
  account_created: 'text-blue-600',
  account_updated: 'text-orange-600',
  account_suspended: 'text-red-600',
  account_activated: 'text-emerald-600',
};

type TabId = 'all_users' | 'create_user' | 'activity_log';

const getStoredPasswords = (): Record<string, string> => {
  try {
    const data = localStorage.getItem('zaroda_passwords');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const savePassword = (email: string, password: string) => {
  const passwords = getStoredPasswords();
  passwords[email.toLowerCase()] = password;
  localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
};

export default function UsersSection() {
  const [activeTab, setActiveTab] = useState<TabId>('all_users');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [userActivities, setUserActivities] = useState<LoginActivity[]>([]);
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
    subject: '',
    grade: '',
  });

  const loadData = () => {
    setUsers(platformUsersStorage.getAll());
    setActivities(activityStorage.getRecent(200));
  };

  useEffect(() => { loadData(); }, []);

  const schools = schoolsStorage.getAll();

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.schoolName.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
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
    setFormData({ fullName: '', email: '', password: '', role: 'hoi', schoolCode: '', schoolName: '', phone: '', subject: '', grade: '' });
  };

  const handleSchoolSelect = (schoolCode: string) => {
    const school = schools.find(s => s.school_code === schoolCode);
    setFormData(prev => ({ ...prev, schoolCode, schoolName: school?.name || '' }));
  };

  const handleCreateUser = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.schoolCode.trim() || !formData.phone.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const existing = platformUsersStorage.findByEmail(formData.email.trim());
    if (existing) {
      toast({ title: 'Email exists', description: 'A user with this email already exists.', variant: 'destructive' });
      return;
    }

    const newUser = platformUsersStorage.add({
      email: formData.email.trim().toLowerCase(),
      fullName: formData.fullName.trim(),
      role: formData.role as PlatformUser['role'],
      schoolCode: formData.schoolCode.trim(),
      schoolName: formData.schoolName.trim() || formData.schoolCode.trim(),
      phone: formData.phone.trim(),
      status: 'active',
      subject: formData.subject.trim() || undefined,
      grade: formData.grade.trim() || undefined,
      createdBy: 'SuperAdmin',
    });

    savePassword(formData.email.trim().toLowerCase(), formData.password);

    if (formData.role === 'dhoi') {
      try {
        const existing = JSON.parse(localStorage.getItem('zaroda_dhoi_account') || '[]');
        const accounts = Array.isArray(existing) ? existing : existing ? [existing] : [];
        accounts.push({
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          password: formData.password,
          schoolCode: formData.schoolCode.trim(),
          phone: formData.phone.trim(),
          status: 'active',
          createdBy: 'SuperAdmin',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('zaroda_dhoi_account', JSON.stringify(accounts));
      } catch {}
    }

    activityStorage.add({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      action: 'account_created',
      details: `Account created by SuperAdmin with role: ${newUser.role.toUpperCase()}`,
    });

    toast({ title: 'User created', description: `${newUser.fullName} (${newUser.role.toUpperCase()}) account has been created successfully. They can now log in with the assigned credentials.` });
    resetForm();
    setShowCreateModal(false);
    loadData();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const oldEmail = selectedUser.email.toLowerCase();
    const newEmail = formData.email.trim().toLowerCase();

    platformUsersStorage.update(selectedUser.id, {
      fullName: formData.fullName.trim(),
      email: newEmail,
      phone: formData.phone.trim(),
      schoolCode: formData.schoolCode.trim(),
      schoolName: formData.schoolName.trim() || formData.schoolCode.trim(),
      subject: formData.subject.trim() || undefined,
      grade: formData.grade.trim() || undefined,
    });

    if (formData.password.trim()) {
      savePassword(newEmail, formData.password.trim());
    } else if (oldEmail !== newEmail) {
      const passwords = getStoredPasswords();
      if (passwords[oldEmail]) {
        passwords[newEmail] = passwords[oldEmail];
        delete passwords[oldEmail];
        localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
      }
    }

    activityStorage.add({
      userId: selectedUser.id,
      email: formData.email.trim().toLowerCase(),
      fullName: formData.fullName.trim(),
      role: selectedUser.role,
      action: 'account_updated',
      details: `Account updated by SuperAdmin${formData.password.trim() ? ' (password changed)' : ''}`,
    });

    toast({ title: 'User updated', description: `${formData.fullName.trim()}'s account has been updated.` });
    setShowEditModal(false);
    setSelectedUser(null);
    loadData();
  };

  const handleToggleStatus = (user: PlatformUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    platformUsersStorage.update(user.id, { status: newStatus });

    activityStorage.add({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      action: newStatus === 'suspended' ? 'account_suspended' : 'account_activated',
      details: `Account ${newStatus} by SuperAdmin`,
    });

    toast({ title: newStatus === 'suspended' ? 'User suspended' : 'User activated', description: `${user.fullName}'s account has been ${newStatus}.` });
    loadData();
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
      subject: user.subject || '',
      grade: user.grade || '',
    });
    setShowEditModal(true);
  };

  const openView = (user: PlatformUser) => {
    setSelectedUser(user);
    setUserActivities(activityStorage.getByUser(user.id));
    setShowViewModal(true);
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
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                            <Button variant="ghost" size="sm" onClick={() => openView(user)} title="View details">
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(user)} title="Edit user">
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                              className={user.status === 'active' ? 'text-red-500 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'}
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
                    {ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
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
                  <Label>Phone Number *</Label>
                  <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Assign to School *</Label>
                <Select value={formData.schoolCode} onValueChange={handleSchoolSelect}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a school..." /></SelectTrigger>
                  <SelectContent>
                    {schools.map(s => (
                      <SelectItem key={s.school_code} value={s.school_code}>{s.name} ({s.school_code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(formData.role === 'teacher') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Input value={formData.subject} onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g., Mathematics" className="mt-1" />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Input value={formData.grade} onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))} placeholder="e.g., Grade 5" className="mt-1" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleCreateUser} className="gap-2">
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
                        <td className="p-3 text-sm text-muted-foreground">{formatDate(act.timestamp)}</td>
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
                  {ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
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
              <Label>Phone *</Label>
              <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" className="mt-1" />
            </div>
            <div>
              <Label>School *</Label>
              <Select value={formData.schoolCode} onValueChange={handleSchoolSelect}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select school..." /></SelectTrigger>
                <SelectContent>
                  {schools.map(s => <SelectItem key={s.school_code} value={s.school_code}>{s.name} ({s.school_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreateUser} className="flex-1">Create User</Button>
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
              <Button onClick={handleEditUser} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
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
                  <p className="text-xs text-muted-foreground">School Code</p>
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
                    <p className="text-xs text-muted-foreground">Subject</p>
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
                    {userActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20).map(act => (
                      <div key={act.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div>
                          <span className={`text-sm font-medium ${ACTION_COLORS[act.action]}`}>
                            {ACTION_LABELS[act.action]}
                          </span>
                          {act.details && <p className="text-xs text-muted-foreground">{act.details}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(act.timestamp)}</span>
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
                  onClick={() => { handleToggleStatus(selectedUser); setShowViewModal(false); }}
                  className={selectedUser.status === 'active' ? 'text-red-500' : 'text-emerald-500'}
                >
                  {selectedUser.status === 'active' ? <><Ban size={14} className="mr-2" /> Suspend</> : <><CheckCircle size={14} className="mr-2" /> Activate</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
