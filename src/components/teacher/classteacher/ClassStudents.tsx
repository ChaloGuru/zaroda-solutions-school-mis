import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GraduationCap, Plus, Search, Pencil, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { hoiStudentsStorage, HoiStudent } from '@/lib/hoiStorage';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

interface ClassStudentsProps {
  classId: string;
  className: string;
  streamId: string;
  streamName: string;
}

const emptyForm = {
  full_name: '',
  admission_no: '',
  gender: 'Male' as 'Male' | 'Female',
  date_of_birth: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
};

export default function ClassStudents({ classId, className, streamId, streamName }: ClassStudentsProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HoiStudent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; student: HoiStudent | null }>({ open: false, student: null });

  const loadData = () => {
    const all = hoiStudentsStorage.getAll().filter(s => s.class_id === classId && s.stream_id === streamId && s.status === 'active');
    setStudents(all);
  };

  useEffect(() => { loadData(); }, [classId, streamId]);

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: HoiStudent) => {
    setEditing(s);
    setForm({
      full_name: s.full_name,
      admission_no: s.admission_no,
      gender: s.gender,
      date_of_birth: s.date_of_birth,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone,
      guardian_email: s.guardian_email,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim() || !form.admission_no.trim()) {
      toast({ title: 'Validation Error', description: 'Full name and admission number are required.', variant: 'destructive' });
      return;
    }
    if (editing) {
      hoiStudentsStorage.update(editing.id, form);
      toast({ title: 'Student Updated', description: `${form.full_name} has been updated.` });
    } else {
      hoiStudentsStorage.add({
        ...form,
        class_id: classId,
        class_name: className,
        stream_id: streamId,
        stream_name: streamName,
        status: 'active',
        enrolled_at: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Student Added', description: `${form.full_name} has been added to ${className} ${streamName}.` });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleRemove = () => {
    if (!removeDialog.student) return;
    hoiStudentsStorage.update(removeDialog.student.id, { status: 'transferred' });
    toast({ title: 'Student Removed', description: `${removeDialog.student.full_name} has been removed from this class.` });
    setRemoveDialog({ open: false, student: null });
    loadData();
  };

  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            {className} - {streamName} | Total: {students.length} (Boys: {maleCount}, Girls: {femaleCount})
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Student</Button>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Students ({filtered.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search name or admission no..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>D.O.B</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">No students found.</TableCell></TableRow>
              ) : paged.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell className="text-gray-500 text-sm">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{s.admission_no}</TableCell>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={s.gender === 'Male' ? 'text-blue-600 border-blue-300' : 'text-pink-600 border-pink-300'}>{s.gender}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.date_of_birth}</TableCell>
                  <TableCell className="text-sm">{s.guardian_name}</TableCell>
                  <TableCell className="text-sm">{s.guardian_phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setRemoveDialog({ open: true, student: s })}><UserX className="w-4 h-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Admission No. *</Label>
                <Input value={form.admission_no} onChange={(e) => setForm({ ...form, admission_no: e.target.value })} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as 'Male' | 'Female' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <Label>Guardian Name</Label>
              <Input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Guardian Phone</Label>
                <Input value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
              </div>
              <div>
                <Label>Guardian Email</Label>
                <Input type="email" value={form.guardian_email} onChange={(e) => setForm({ ...form, guardian_email: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'} Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ ...removeDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeDialog.student?.full_name} from this class? Their status will be changed to "transferred".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
