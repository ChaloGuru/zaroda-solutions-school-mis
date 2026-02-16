import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { facultyStorage, schoolsStorage, Faculty } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Briefcase,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const emptyForm = {
  full_name: '',
  staff_no: '',
  school_id: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  qualification: '',
  gender: 'Male' as 'Male' | 'Female',
  status: 'active' as 'active' | 'on_leave' | 'terminated',
};

export default function FacultySection() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; member: Faculty | null }>({ open: false, member: null });
  const { toast } = useToast();

  const schools = schoolsStorage.getAll();

  const loadFaculty = () => setFaculty(facultyStorage.getAll());

  useEffect(() => { loadFaculty(); }, []);

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown';
  };

  const filtered = faculty.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || f.full_name.toLowerCase().includes(term) || f.staff_no.toLowerCase().includes(term) || f.email.toLowerCase().includes(term) || f.department.toLowerCase().includes(term) || getSchoolName(f.school_id).toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || f.school_id === schoolFilter;
    return matchesSearch && matchesStatus && matchesSchool;
  });

  const totalFaculty = faculty.length;
  const activeCount = faculty.filter(f => f.status === 'active').length;
  const onLeaveCount = faculty.filter(f => f.status === 'on_leave').length;
  const departmentsCount = new Set(faculty.map(f => f.department)).size;

  const openAddDialog = () => {
    setEditingFaculty(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (member: Faculty) => {
    setEditingFaculty(member);
    setForm({
      full_name: member.full_name,
      staff_no: member.staff_no,
      school_id: member.school_id,
      role: member.role,
      department: member.department,
      email: member.email,
      phone: member.phone,
      qualification: member.qualification,
      gender: member.gender,
      status: member.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name || !form.staff_no || !form.school_id) {
      toast({ title: 'Validation Error', description: 'Full name, staff number, and school are required.', variant: 'destructive' });
      return;
    }
    if (editingFaculty) {
      facultyStorage.update(editingFaculty.id, form);
      toast({ title: 'Faculty Updated', description: `${form.full_name} has been updated successfully.` });
    } else {
      facultyStorage.add(form);
      toast({ title: 'Faculty Added', description: `${form.full_name} has been added successfully.` });
    }
    setDialogOpen(false);
    loadFaculty();
  };

  const handleDelete = () => {
    if (!deleteDialog.member) return;
    facultyStorage.remove(deleteDialog.member.id);
    toast({ title: 'Faculty Deleted', description: `${deleteDialog.member.full_name} has been permanently removed.` });
    setDeleteDialog({ open: false, member: null });
    loadFaculty();
  };

  const handleStatusChange = (member: Faculty, newStatus: 'active' | 'on_leave' | 'terminated') => {
    facultyStorage.update(member.id, { status: newStatus });
    const statusLabels = { active: 'activated', on_leave: 'put on leave', terminated: 'terminated' };
    toast({ title: 'Status Updated', description: `${member.full_name} has been ${statusLabels[newStatus]}.` });
    loadFaculty();
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Faculty Management</h1>
          <p className="text-muted-foreground">Manage all teaching staff and administrative personnel</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Faculty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
              <ArrowUpRight className="w-3 h-3" />
              Total
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{totalFaculty}</p>
          <p className="text-sm text-muted-foreground">Total Faculty</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              Active
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active Faculty</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-600">
              {onLeaveCount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              On Leave
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{onLeaveCount}</p>
          <p className="text-sm text-muted-foreground">On Leave</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600">
              <ArrowUpRight className="w-3 h-3" />
              Depts
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{departmentsCount}</p>
          <p className="text-sm text-muted-foreground">Departments</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty by name, staff no, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 flex-wrap">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} size="sm">All</Button>
              <Button variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => setStatusFilter('active')} size="sm">Active</Button>
              <Button variant={statusFilter === 'on_leave' ? 'default' : 'outline'} onClick={() => setStatusFilter('on_leave')} size="sm">On Leave</Button>
              <Button variant={statusFilter === 'terminated' ? 'default' : 'outline'} onClick={() => setStatusFilter('terminated')} size="sm">Terminated</Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No faculty members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff No</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">School</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qualification</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          member.gender === 'Male' ? 'bg-blue-500/10' : 'bg-pink-500/10'
                        )}>
                          <span className={cn(
                            "font-semibold text-sm",
                            member.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'
                          )}>{member.full_name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{member.full_name}</span>
                          <div className="text-xs text-muted-foreground">{member.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{member.staff_no}</td>
                    <td className="py-4 px-6 text-sm">{getSchoolName(member.school_id)}</td>
                    <td className="py-4 px-6 text-sm">{member.role}</td>
                    <td className="py-4 px-6 text-sm">{member.department}</td>
                    <td className="py-4 px-6 text-sm">{member.qualification}</td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant="outline" className={cn(
                        "capitalize",
                        member.status === 'active' && 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
                        member.status === 'on_leave' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                        member.status === 'terminated' && 'bg-red-500/20 text-red-700 border-red-500/30'
                      )}>
                        {member.status === 'on_leave' ? 'On Leave' : member.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, member })} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.status !== 'active' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(member, 'active')}>
                                <CheckCircle size={16} className="mr-2 text-emerald-600" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {member.status !== 'on_leave' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(member, 'on_leave')}>
                                <Clock size={16} className="mr-2 text-yellow-600" />
                                Put on Leave
                              </DropdownMenuItem>
                            )}
                            {member.status !== 'terminated' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(member, 'terminated')} className="text-red-600">
                                <XCircle size={16} className="mr-2" />
                                Terminate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="e.g. Dr. Samuel Kariuki" />
            </div>
            <div className="space-y-2">
              <Label>Staff No</Label>
              <Input value={form.staff_no} onChange={(e) => updateField('staff_no', e.target.value)} placeholder="e.g. GWA-T-001" />
            </div>
            <div className="space-y-2">
              <Label>School</Label>
              <Select value={form.school_id} onValueChange={(v) => updateField('school_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={form.role} onChange={(e) => updateField('role', e.target.value)} placeholder="e.g. Teacher" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="e.g. name@school.ac.ke" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="e.g. +254 711 100 001" />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input value={form.qualification} onChange={(e) => updateField('qualification', e.target.value)} placeholder="e.g. B.Ed Mathematics" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingFaculty ? 'Save Changes' : 'Add Faculty'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.member?.full_name}</strong> and all associated records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
