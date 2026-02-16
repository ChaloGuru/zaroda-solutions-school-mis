import { useState, useEffect, useRef } from 'react';
import {
  hoiStudentsStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  HoiStudent,
  HoiClass,
  HoiStream,
} from '@/lib/hoiStorage';
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
  GraduationCap,
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  Upload,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const emptyStudentForm = {
  full_name: '',
  admission_no: '',
  class_id: '',
  stream_id: '',
  gender: 'Male' as HoiStudent['gender'],
  date_of_birth: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
};

export default function HoiStudents() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [streamFilter, setStreamFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<HoiStudent | null>(null);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferStudent, setTransferStudent] = useState<HoiStudent | null>(null);
  const [transferClassId, setTransferClassId] = useState('');
  const [transferStreamId, setTransferStreamId] = useState('');

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<HoiStudent | null>(null);

  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);

  const loadData = () => {
    setStudents(hoiStudentsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
  };

  useEffect(() => { loadData(); }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || s.class_id === classFilter;
    const matchesStream = streamFilter === 'all' || s.stream_id === streamFilter;
    return matchesSearch && matchesClass && matchesStream;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusBadge = (status: HoiStudent['status']) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-700 border-green-500/30',
      transferred: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      graduated: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    };
    return <Badge variant="outline" className={colors[status]}>{status}</Badge>;
  };

  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm(emptyStudentForm);
    setStudentDialogOpen(true);
  };

  const openEditStudent = (s: HoiStudent) => {
    setEditingStudent(s);
    setStudentForm({
      full_name: s.full_name,
      admission_no: s.admission_no,
      class_id: s.class_id,
      stream_id: s.stream_id,
      gender: s.gender,
      date_of_birth: s.date_of_birth,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone,
      guardian_email: s.guardian_email,
    });
    setStudentDialogOpen(true);
  };

  const saveStudent = () => {
    if (!studentForm.full_name.trim() || !studentForm.admission_no.trim() || !studentForm.class_id || !studentForm.stream_id) {
      toast({ title: 'Validation Error', description: 'Full name, admission number, class, and stream are required.', variant: 'destructive' });
      return;
    }
    const cls = classes.find((c) => c.id === studentForm.class_id);
    const stream = streams.find((s) => s.id === studentForm.stream_id);
    if (!cls || !stream) return;

    if (editingStudent) {
      hoiStudentsStorage.update(editingStudent.id, {
        ...studentForm,
        class_name: cls.name,
        stream_name: stream.name,
      });
      toast({ title: 'Student Updated', description: `${studentForm.full_name} has been updated.` });
    } else {
      hoiStudentsStorage.add({
        ...studentForm,
        class_name: cls.name,
        stream_name: stream.name,
        status: 'active',
        enrolled_at: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Student Added', description: `${studentForm.full_name} has been enrolled.` });
    }
    setStudentDialogOpen(false);
    loadData();
  };

  const openTransfer = (s: HoiStudent) => {
    setTransferStudent(s);
    setTransferClassId(s.class_id);
    setTransferStreamId(s.stream_id);
    setTransferDialogOpen(true);
  };

  const executeTransfer = () => {
    if (!transferStudent || !transferClassId || !transferStreamId) return;
    const cls = classes.find((c) => c.id === transferClassId);
    const stream = streams.find((s) => s.id === transferStreamId);
    if (!cls || !stream) return;
    hoiStudentsStorage.update(transferStudent.id, {
      class_id: transferClassId,
      class_name: cls.name,
      stream_id: transferStreamId,
      stream_name: stream.name,
      status: 'transferred' as HoiStudent['status'],
    });
    toast({ title: 'Student Transferred', description: `${transferStudent.full_name} transferred to ${cls.name} - ${stream.name}` });
    setTransferDialogOpen(false);
    loadData();
  };

  const openProfile = (s: HoiStudent) => {
    setViewingStudent(s);
    setProfileDialogOpen(true);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split('\n').filter((r) => r.trim()).map((r) => r.split(',').map((c) => c.trim()));
      setCsvPreview(rows.slice(0, 11));
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    toast({ title: 'Coming Soon', description: 'Bulk import functionality will be available in a future update.' });
    setBulkImportOpen(false);
    setCsvPreview([]);
  };

  const filteredStreams = streamFilter !== 'all' ? streams : classFilter !== 'all' ? streams.filter((s) => s.class_id === classFilter) : streams;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Student Management</h1>
        <p className="text-muted-foreground">Manage student enrollment, transfers, and records</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              All Students ({filteredStudents.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search name or admission no..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9 w-60" />
              </div>
              <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setStreamFilter('all'); setPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={streamFilter} onValueChange={(v) => { setStreamFilter(v); setPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Stream" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streams</SelectItem>
                  {(classFilter !== 'all' ? streams.filter((s) => s.class_id === classFilter) : streams).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setBulkImportOpen(true)} className="gap-2"><Upload className="w-4 h-4" />Import</Button>
              <Button onClick={openAddStudent} className="gap-2"><Plus className="w-4 h-4" />Add Student</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Admission No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedStudents.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No students found.</TableCell></TableRow>
              ) : pagedStudents.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openProfile(s)}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.admission_no}</TableCell>
                  <TableCell>{s.class_name}</TableCell>
                  <TableCell>{s.stream_name}</TableCell>
                  <TableCell>{s.gender}</TableCell>
                  <TableCell>{s.guardian_name}</TableCell>
                  <TableCell>{statusBadge(s.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => openProfile(s)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditStudent(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openTransfer(s)}><ArrowRightLeft className="w-4 h-4 text-blue-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={studentForm.full_name} onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Admission No *</Label>
                <Input value={studentForm.admission_no} onChange={(e) => setStudentForm({ ...studentForm, admission_no: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class *</Label>
                <Select value={studentForm.class_id} onValueChange={(v) => setStudentForm({ ...studentForm, class_id: v, stream_id: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stream *</Label>
                <Select value={studentForm.stream_id} onValueChange={(v) => setStudentForm({ ...studentForm, stream_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                  <SelectContent>
                    {streams.filter((s) => s.class_id === studentForm.class_id).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v as HoiStudent['gender'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={studentForm.date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Guardian Name</Label>
              <Input value={studentForm.guardian_name} onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Guardian Phone</Label>
                <Input value={studentForm.guardian_phone} onChange={(e) => setStudentForm({ ...studentForm, guardian_phone: e.target.value })} />
              </div>
              <div>
                <Label>Guardian Email</Label>
                <Input type="email" value={studentForm.guardian_email} onChange={(e) => setStudentForm({ ...studentForm, guardian_email: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveStudent}>{editingStudent ? 'Update' : 'Enroll'} Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transfer <span className="font-semibold text-foreground">{transferStudent?.full_name}</span> from {transferStudent?.class_name} - {transferStudent?.stream_name}
            </p>
            <div>
              <Label>New Class *</Label>
              <Select value={transferClassId} onValueChange={(v) => { setTransferClassId(v); setTransferStreamId(''); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Stream *</Label>
              <Select value={transferStreamId} onValueChange={setTransferStreamId}>
                <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent>
                  {streams.filter((s) => s.class_id === transferClassId).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={executeTransfer}>Transfer Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{viewingStudent.full_name}</h3>
                  <p className="text-muted-foreground">{viewingStudent.admission_no}</p>
                  {statusBadge(viewingStudent.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Class</p>
                  <p className="font-medium">{viewingStudent.class_name} - {viewingStudent.stream_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{viewingStudent.gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{viewingStudent.date_of_birth || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Enrolled</p>
                  <p className="font-medium">{viewingStudent.enrolled_at}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Guardian Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{viewingStudent.guardian_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{viewingStudent.guardian_phone || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{viewingStudent.guardian_email || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkImportOpen} onOpenChange={(open) => { setBulkImportOpen(open); if (!open) setCsvPreview([]); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Bulk Import Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Upload a CSV file with student data</p>
              <p className="text-xs text-muted-foreground mb-4">Columns: full_name, admission_no, class, stream, gender, date_of_birth, guardian_name, guardian_phone, guardian_email</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            {csvPreview.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Preview (first {csvPreview.length} rows)</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {csvPreview[0]?.map((h, i) => <TableHead key={i}>{h}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreview.slice(1).map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => <TableCell key={ci}>{cell}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkImportOpen(false); setCsvPreview([]); }}>Cancel</Button>
            <Button onClick={handleBulkImport} disabled={csvPreview.length === 0}>Import Students</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
