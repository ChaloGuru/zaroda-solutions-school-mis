import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentsStorage, schoolsStorage, Student } from '@/lib/storage';
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
  Users,
  CheckCircle,
  GraduationCap,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const emptyForm = {
  full_name: '',
  admission_no: '',
  school_id: '',
  grade: '',
  stream: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
  gender: 'Male' as 'Male' | 'Female',
  date_of_birth: '',
  status: 'active' as 'active' | 'inactive' | 'transferred' | 'graduated',
};

export default function StudentsSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const { toast } = useToast();

  const schools = schoolsStorage.getAll();

  const loadStudents = () => setStudents(studentsStorage.getAll());

  useEffect(() => { loadStudents(); }, []);

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown';
  };

  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || s.full_name.toLowerCase().includes(term) || s.admission_no.toLowerCase().includes(term) || s.guardian_name.toLowerCase().includes(term) || getSchoolName(s.school_id).toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || s.school_id === schoolFilter;
    return matchesSearch && matchesStatus && matchesSchool;
  });

  const totalStudents = students.length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const graduatedCount = students.filter(s => s.status === 'graduated').length;
  const transferredCount = students.filter(s => s.status === 'transferred').length;

  const openAddDialog = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setForm({
      full_name: student.full_name,
      admission_no: student.admission_no,
      school_id: student.school_id,
      grade: student.grade,
      stream: student.stream,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
      guardian_email: student.guardian_email,
      gender: student.gender,
      date_of_birth: student.date_of_birth,
      status: student.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name || !form.admission_no || !form.school_id) {
      toast({ title: 'Validation Error', description: 'Full name, admission number, and school are required.', variant: 'destructive' });
      return;
    }
    if (editingStudent) {
      studentsStorage.update(editingStudent.id, form);
      toast({ title: 'Student Updated', description: `${form.full_name} has been updated successfully.` });
    } else {
      studentsStorage.add(form);
      toast({ title: 'Student Added', description: `${form.full_name} has been added successfully.` });
    }
    setDialogOpen(false);
    loadStudents();
  };

  const handleDelete = () => {
    if (!deleteDialog.student) return;
    studentsStorage.remove(deleteDialog.student.id);
    toast({ title: 'Student Deleted', description: `${deleteDialog.student.full_name} has been permanently removed.` });
    setDeleteDialog({ open: false, student: null });
    loadStudents();
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Student Registry</h1>
          <p className="text-muted-foreground">Centralized student records across all schools</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Student
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
          <p className="text-3xl font-bold text-foreground mb-1">{totalStudents}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
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
          <p className="text-sm text-muted-foreground">Active Students</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600">
              {graduatedCount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              Graduated
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{graduatedCount}</p>
          <p className="text-sm text-muted-foreground">Graduated</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/10">
              <ArrowRightLeft className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-600">
              {transferredCount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              Transferred
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{transferredCount}</p>
          <p className="text-sm text-muted-foreground">Transferred</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, admission no, guardian..."
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
              <Button variant={statusFilter === 'graduated' ? 'default' : 'outline'} onClick={() => setStatusFilter('graduated')} size="sm">Graduated</Button>
              <Button variant={statusFilter === 'transferred' ? 'default' : 'outline'} onClick={() => setStatusFilter('transferred')} size="sm">Transferred</Button>
              <Button variant={statusFilter === 'inactive' ? 'default' : 'outline'} onClick={() => setStatusFilter('inactive')} size="sm">Inactive</Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admission No</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">School</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade/Stream</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guardian</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          student.gender === 'Male' ? 'bg-blue-500/10' : 'bg-pink-500/10'
                        )}>
                          <span className={cn(
                            "font-semibold text-sm",
                            student.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'
                          )}>{student.full_name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{student.full_name}</span>
                          <div className="text-xs text-muted-foreground">{student.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{student.admission_no}</td>
                    <td className="py-4 px-6 text-sm">{getSchoolName(student.school_id)}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium">{student.grade}</div>
                      <div className="text-xs text-muted-foreground">{student.stream}</div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="text-foreground">{student.guardian_name}</div>
                      <div className="text-xs text-muted-foreground">{student.guardian_phone}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant="outline" className={cn(
                        "capitalize",
                        student.status === 'active' && 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
                        student.status === 'inactive' && 'bg-gray-500/20 text-gray-700 border-gray-500/30',
                        student.status === 'graduated' && 'bg-blue-500/20 text-blue-700 border-blue-500/30',
                        student.status === 'transferred' && 'bg-orange-500/20 text-orange-700 border-orange-500/30'
                      )}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(student)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, student })} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="e.g. Kevin Odhiambo" />
            </div>
            <div className="space-y-2">
              <Label>Admission No</Label>
              <Input value={form.admission_no} onChange={(e) => updateField('admission_no', e.target.value)} placeholder="e.g. GWA-2024-001" />
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
              <Label>Grade</Label>
              <Input value={form.grade} onChange={(e) => updateField('grade', e.target.value)} placeholder="e.g. Form 3" />
            </div>
            <div className="space-y-2">
              <Label>Stream</Label>
              <Input value={form.stream} onChange={(e) => updateField('stream', e.target.value)} placeholder="e.g. East" />
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
              <Label>Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Guardian Name</Label>
              <Input value={form.guardian_name} onChange={(e) => updateField('guardian_name', e.target.value)} placeholder="e.g. John Odhiambo" />
            </div>
            <div className="space-y-2">
              <Label>Guardian Phone</Label>
              <Input value={form.guardian_phone} onChange={(e) => updateField('guardian_phone', e.target.value)} placeholder="e.g. +254 700 111 222" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Guardian Email</Label>
              <Input type="email" value={form.guardian_email} onChange={(e) => updateField('guardian_email', e.target.value)} placeholder="e.g. guardian@email.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingStudent ? 'Save Changes' : 'Add Student'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.student?.full_name}</strong> and all associated records. This action cannot be undone.
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
