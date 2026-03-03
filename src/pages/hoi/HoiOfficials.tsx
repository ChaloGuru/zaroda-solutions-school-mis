import { useState, useEffect } from 'react';
import {
  hoiOfficialsStorage,
  HoiOfficial,
} from '../../lib/hoiStorage';
import { useAuthContext } from '@/context/AuthContext';
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
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  Award,
  Users,
  Trophy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const ROLES: HoiOfficial['role'][] = ['Deputy Head', 'HOD', 'Senior Teacher', 'Prefect', 'Games Captain'];
const TEACHER_ADMIN_ROLES: HoiOfficial['role'][] = ['Deputy Head', 'HOD', 'Senior Teacher'];
const STUDENT_OFFICIAL_ROLES: HoiOfficial['role'][] = ['Prefect', 'Games Captain'];

const ROLE_COLORS: Record<string, string> = {
  'Deputy Head': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  'HOD': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  'Senior Teacher': 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  'Prefect': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  'Games Captain': 'bg-rose-500/20 text-rose-700 border-rose-500/30',
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  'Deputy Head': Crown,
  'HOD': Star,
  'Senior Teacher': Award,
  'Prefect': Users,
  'Games Captain': Trophy,
};

const emptyOfficialForm = {
  full_name: '',
  role: 'Senior Teacher' as HoiOfficial['role'],
  department: '',
  email: '',
  phone: '',
  status: 'active' as HoiOfficial['status'],
};

export default function HoiOfficials() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

  const [officials, setOfficials] = useState<HoiOfficial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<HoiOfficial | null>(null);
  const [form, setForm] = useState(emptyOfficialForm);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; official: HoiOfficial | null }>({ open: false, official: null });

  const loadData = async () => {
    if (!currentUser?.schoolId) {
      setOfficials([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', currentUser.schoolId)
      .in('role', ['hoi', 'dhoi', 'hod'])
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) {
      toast({
        title: 'Load Error',
        description: error.message,
        variant: 'destructive',
      });
      setOfficials([]);
      return;
    }

    const mappedOfficials: HoiOfficial[] = (data || []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name || '',
      role: row.role === 'hod' ? 'HOD' : 'Deputy Head',
      department: row.department || undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      status: 'active',
    }));

    setOfficials(mappedOfficials);
  };

  useEffect(() => { void loadData(); }, [currentUser?.schoolId]);

  const filteredOfficials = officials.filter((o) =>
    o.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeacherAdmins = filteredOfficials.filter((o) => TEACHER_ADMIN_ROLES.includes(o.role));
  const filteredStudentOfficials = filteredOfficials.filter((o) => STUDENT_OFFICIAL_ROLES.includes(o.role));

  const adminTotalPages = Math.max(1, Math.ceil(filteredTeacherAdmins.length / PAGE_SIZE));
  const studentTotalPages = Math.max(1, Math.ceil(filteredStudentOfficials.length / PAGE_SIZE));

  const pagedTeacherAdmins = filteredTeacherAdmins.slice((adminPage - 1) * PAGE_SIZE, adminPage * PAGE_SIZE);
  const pagedStudentOfficials = filteredStudentOfficials.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE);

  useEffect(() => {
    setAdminPage(1);
    setStudentPage(1);
  }, [searchTerm]);

  const statusBadge = (status: HoiOfficial['status']) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-700 border-green-500/30',
      on_leave: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      deactivated: 'bg-red-500/20 text-red-700 border-red-500/30',
    };
    return <Badge variant="outline" className={colors[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const openAdd = () => {
    setEditingOfficial(null);
    setForm(emptyOfficialForm);
    setDialogOpen(true);
  };

  const openEdit = (o: HoiOfficial) => {
    setEditingOfficial(o);
    setForm({
      full_name: o.full_name,
      role: o.role,
      department: o.department || '',
      email: o.email || '',
      phone: o.phone || '',
      status: o.status,
    });
    setDialogOpen(true);
  };

  const saveOfficial = () => {
    if (!form.full_name.trim()) {
      toast({ title: 'Validation Error', description: 'Full name is required.', variant: 'destructive' });
      return;
    }
    if (editingOfficial) {
      hoiOfficialsStorage.update(editingOfficial.id, {
        full_name: form.full_name,
        role: form.role,
        department: form.department || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: form.status,
      });
      toast({ title: 'Official Updated', description: `${form.full_name} has been updated.` });
    } else {
      hoiOfficialsStorage.add({
        full_name: form.full_name,
        role: form.role,
        department: form.department || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: form.status,
      });
      toast({ title: 'Official Added', description: `${form.full_name} has been added as ${form.role}.` });
    }
    setDialogOpen(false);
    loadData();
  };

  const confirmDelete = () => {
    if (deleteDialog.official) {
      hoiOfficialsStorage.remove(deleteDialog.official.id);
      toast({ title: 'Official Removed', description: `${deleteDialog.official.full_name} has been removed.` });
      setDeleteDialog({ open: false, official: null });
      loadData();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Officials Management</h1>
        <p className="text-muted-foreground">Manage teacher administrators and student body officials separately</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTeacherAdmins.length}</p>
                <p className="text-xs text-muted-foreground">Teacher Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredStudentOfficials.length}</p>
                <p className="text-xs text-muted-foreground">Student Officials</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Officials ({filteredOfficials.length})
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search officials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-60" />
              </div>
              <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Official</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Teacher Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedTeacherAdmins.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No teacher administrators found.</TableCell></TableRow>
              ) : pagedTeacherAdmins.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.full_name}</TableCell>
                  <TableCell><Badge variant="outline" className={ROLE_COLORS[o.role]}>{o.role}</Badge></TableCell>
                  <TableCell>{o.department || '—'}</TableCell>
                  <TableCell>{o.email || '—'}</TableCell>
                  <TableCell>{o.phone || '—'}</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ open: true, official: o })}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Page {adminPage} of {adminTotalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={adminPage <= 1} onClick={() => setAdminPage(adminPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" disabled={adminPage >= adminTotalPages} onClick={() => setAdminPage(adminPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Student Officials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedStudentOfficials.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No student officials found.</TableCell></TableRow>
              ) : pagedStudentOfficials.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.full_name}</TableCell>
                  <TableCell><Badge variant="outline" className={ROLE_COLORS[o.role]}>{o.role}</Badge></TableCell>
                  <TableCell>{o.department || '—'}</TableCell>
                  <TableCell>{o.email || '—'}</TableCell>
                  <TableCell>{o.phone || '—'}</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ open: true, official: o })}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Page {studentPage} of {studentTotalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={studentPage <= 1} onClick={() => setStudentPage(studentPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" disabled={studentPage >= studentTotalPages} onClick={() => setStudentPage(studentPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOfficial ? 'Edit Official' : 'Add Official'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as HoiOfficial['role'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as HoiOfficial['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveOfficial}>{editingOfficial ? 'Update' : 'Add'} Official</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Official?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteDialog.official?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
