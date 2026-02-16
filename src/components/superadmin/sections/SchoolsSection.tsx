import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { schoolsStorage, School } from '@/lib/storage';
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
  School as SchoolIcon,
  CheckCircle,
  XCircle,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const emptyForm = {
  name: '',
  school_code: '',
  school_type: '',
  county: '',
  sub_county: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  status: 'pending' as 'active' | 'pending' | 'suspended',
  categories: [] as string[],
  student_count: 0,
  faculty_count: 0,
};

export default function SchoolsSection() {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; school: School | null }>({ open: false, school: null });
  const [categoriesInput, setCategoriesInput] = useState('');
  const { toast } = useToast();

  const loadSchools = () => setSchools(schoolsStorage.getAll());

  useEffect(() => { loadSchools(); }, []);

  const filtered = schools.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.school_code.toLowerCase().includes(term) || s.contact_email.toLowerCase().includes(term) || s.county.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSchools = schools.length;
  const activeCount = schools.filter(s => s.status === 'active').length;
  const pendingCount = schools.filter(s => s.status === 'pending').length;
  const suspendedCount = schools.filter(s => s.status === 'suspended').length;

  const openAddDialog = () => {
    setEditingSchool(null);
    setForm(emptyForm);
    setCategoriesInput('');
    setDialogOpen(true);
  };

  const openEditDialog = (school: School) => {
    setEditingSchool(school);
    setForm({
      name: school.name,
      school_code: school.school_code,
      school_type: school.school_type,
      county: school.county,
      sub_county: school.sub_county,
      contact_name: school.contact_name,
      contact_email: school.contact_email,
      contact_phone: school.contact_phone,
      status: school.status,
      categories: school.categories,
      student_count: school.student_count,
      faculty_count: school.faculty_count,
    });
    setCategoriesInput(school.categories.join(', '));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.school_code) {
      toast({ title: 'Validation Error', description: 'School name and code are required.', variant: 'destructive' });
      return;
    }
    const cats = categoriesInput.split(',').map(c => c.trim()).filter(Boolean);
    if (editingSchool) {
      schoolsStorage.update(editingSchool.id, { ...form, categories: cats });
      toast({ title: 'School Updated', description: `${form.name} has been updated successfully.` });
    } else {
      schoolsStorage.add({ ...form, categories: cats });
      toast({ title: 'School Added', description: `${form.name} has been added successfully.` });
    }
    setDialogOpen(false);
    loadSchools();
  };

  const handleDelete = () => {
    if (!deleteDialog.school) return;
    schoolsStorage.remove(deleteDialog.school.id);
    toast({ title: 'School Deleted', description: `${deleteDialog.school.name} has been permanently removed.` });
    setDeleteDialog({ open: false, school: null });
    loadSchools();
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'suspended') => {
    schoolsStorage.update(id, { status: newStatus });
    toast({ title: 'Status Updated', description: `School has been ${newStatus === 'active' ? 'activated' : 'suspended'}.` });
    loadSchools();
  };

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Schools Management</h1>
          <p className="text-muted-foreground">View, add, edit, and manage all registered schools</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
              <SchoolIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
              <ArrowUpRight className="w-3 h-3" />
              Total
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{totalSchools}</p>
          <p className="text-sm text-muted-foreground">Total Schools</p>
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
          <p className="text-sm text-muted-foreground">Active Schools</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
              <Pause className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-600">
              {pendingCount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              Pending
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-600">
              {suspendedCount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              Suspended
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{suspendedCount}</p>
          <p className="text-sm text-muted-foreground">Suspended Schools</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schools by name, code, email, county..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} size="sm">All</Button>
              <Button variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => setStatusFilter('active')} size="sm">Active</Button>
              <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')} size="sm">Pending</Button>
              <Button variant={statusFilter === 'suspended' ? 'default' : 'outline'} onClick={() => setStatusFilter('suspended')} size="sm">Suspended</Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No schools found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">School Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Faculty</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((school, index) => (
                  <motion.tr
                    key={school.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">{school.name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{school.name}</span>
                          <div className="text-xs text-muted-foreground">{school.categories.join(', ') || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{school.school_code}</td>
                    <td className="py-4 px-6 capitalize text-sm">{school.school_type}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="capitalize font-medium">{school.county}</div>
                      <div className="text-xs text-muted-foreground capitalize">{school.sub_county}</div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="text-foreground">{school.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{school.contact_email}</div>
                      <div className="text-xs text-muted-foreground">{school.contact_phone}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{school.student_count}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{school.faculty_count}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant="outline" className={cn(
                        "capitalize",
                        school.status === 'active' && 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
                        school.status === 'pending' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                        school.status === 'suspended' && 'bg-red-500/20 text-red-700 border-red-500/30'
                      )}>
                        {school.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(school)}>
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {school.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(school.id, 'active')}>
                              <CheckCircle size={16} className="mr-2 text-emerald-600" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {school.status !== 'suspended' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(school.id, 'suspended')}>
                              <Pause size={16} className="mr-2 text-yellow-600" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, school })} className="text-red-600">
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Greenwood Academy" />
            </div>
            <div className="space-y-2">
              <Label>School Code</Label>
              <Input value={form.school_code} onChange={(e) => updateField('school_code', e.target.value)} placeholder="e.g. GWA-001" />
            </div>
            <div className="space-y-2">
              <Label>School Type</Label>
              <Select value={form.school_type} onValueChange={(v) => updateField('school_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="TVET">TVET</SelectItem>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Input value={form.county} onChange={(e) => updateField('county', e.target.value)} placeholder="e.g. Nairobi" />
            </div>
            <div className="space-y-2">
              <Label>Sub-County</Label>
              <Input value={form.sub_county} onChange={(e) => updateField('sub_county', e.target.value)} placeholder="e.g. Westlands" />
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input value={form.contact_name} onChange={(e) => updateField('contact_name', e.target.value)} placeholder="e.g. James Ochieng" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} placeholder="e.g. admin@school.ac.ke" />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={form.contact_phone} onChange={(e) => updateField('contact_phone', e.target.value)} placeholder="e.g. +254 712 345 678" />
            </div>
            <div className="space-y-2">
              <Label>Categories</Label>
              <Input value={categoriesInput} onChange={(e) => setCategoriesInput(e.target.value)} placeholder="e.g. Day, Boarding" />
            </div>
            <div className="space-y-2">
              <Label>Student Count</Label>
              <Input type="number" value={form.student_count} onChange={(e) => updateField('student_count', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Faculty Count</Label>
              <Input type="number" value={form.faculty_count} onChange={(e) => updateField('faculty_count', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingSchool ? 'Save Changes' : 'Add School'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.school?.name}</strong> and all associated data. This action cannot be undone.
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