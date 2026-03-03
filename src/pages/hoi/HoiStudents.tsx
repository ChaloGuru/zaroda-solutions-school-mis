import { useState, useEffect, useRef } from 'react';
import {
  HoiStudent,
  HoiClass,
  HoiStream,
} from '../../lib/hoiStorage';
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
import { useAuthContext } from '@/context/AuthContext';

const PAGE_SIZE = 10;

const emptyStudentForm = {
  full_name: '',
  admission_no: '',
  upi: '',
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
  const { currentUser } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [allStreams, setAllStreams] = useState<HoiStream[]>([]);

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
  const [studentCsvRows, setStudentCsvRows] = useState<Array<Record<string, string>>>([]);

  const loadClasses = async () => {
    if (!currentUser?.schoolId) {
      setClasses([]);
      return;
    }

    const { data: classRows, error } = await supabase
      .from('hoi_classes')
      .select('*')
      .eq('school_id', currentUser.schoolId)
      .order('name', { ascending: true });

    if (error) {
      toast({
        title: 'Load Error',
        description: error.message,
        variant: 'destructive',
      });
      setClasses([]);
      return;
    }

    const mappedClasses: HoiClass[] = (classRows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      level: row.level,
      created_at: row.created_at || new Date().toISOString(),
    }));

    setClasses(mappedClasses);
  };

  const loadStreamsForClass = async (selectedClassId: string) => {
    if (!selectedClassId || !currentUser?.schoolId) {
      setStreams([]);
      return;
    }

    const { data: streamRows, error } = await supabase
      .from('hoi_streams')
      .select('*')
      .eq('school_id', currentUser.schoolId)
      .eq('class_id', selectedClassId)
      .order('name', { ascending: true });

    if (error) {
      toast({
        title: 'Load Error',
        description: error.message,
        variant: 'destructive',
      });
      setStreams([]);
      return;
    }

    const mappedStreams: HoiStream[] = (streamRows || []).map((row: any) => ({
      id: row.id,
      class_id: row.class_id,
      name: row.name,
      class_teacher_id: row.class_teacher_id || undefined,
      class_teacher_name: row.class_teacher_name || undefined,
      student_count: row.student_count || 0,
    }));

    setStreams(mappedStreams);
  };

  const loadData = async () => {
    if (!currentUser?.schoolId) {
      setStudents([]);
      setClasses([]);
      setStreams([]);
      setAllStreams([]);
      return;
    }

    const [studentsRes, streamsRes] = await Promise.all([
      supabase
        .from('hoi_students')
        .select('*')
        .eq('school_id', currentUser.schoolId)
        .order('created_at', { ascending: false }),
      supabase
        .from('hoi_streams')
        .select('*')
        .eq('school_id', currentUser.schoolId)
        .order('name', { ascending: true }),
    ]);

    if (studentsRes.error || streamsRes.error) {
      toast({
        title: 'Load Error',
        description: 'Failed to load student records from Supabase.',
        variant: 'destructive',
      });
      setStudents([]);
      setClasses([]);
      setStreams([]);
      setAllStreams([]);
      return;
    }

    const mappedStudents: HoiStudent[] = (studentsRes.data || []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name || '',
      admission_no: row.admission_no || '',
      upi: row.upi || '',
      class_id: row.class_id || '',
      class_name: row.class_name || '',
      stream_id: row.stream_id || '',
      stream_name: row.stream_name || '',
      gender: row.gender === 'Female' ? 'Female' : 'Male',
      date_of_birth: row.date_of_birth || '',
      guardian_name: row.guardian_name || '',
      guardian_phone: row.guardian_phone || '',
      guardian_email: row.guardian_email || '',
      status: row.status || 'active',
      enrolled_at: row.enrolled_at || row.created_at || '',
    }));

    const mappedStreams: HoiStream[] = (streamsRes.data || []).map((row: any) => ({
      id: row.id,
      class_id: row.class_id,
      name: row.name,
      class_teacher_id: row.class_teacher_id || undefined,
      class_teacher_name: row.class_teacher_name || undefined,
      student_count: row.student_count || 0,
    }));

    setStudents(mappedStudents);
    setAllStreams(mappedStreams);

    await loadClasses();
  };

  useEffect(() => { void loadData(); }, [currentUser?.schoolId]);

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
    setStreams([]);
    void loadClasses();
    setStudentDialogOpen(true);
  };

  const openEditStudent = (s: HoiStudent) => {
    setEditingStudent(s);
    setStudentForm({
      full_name: s.full_name,
      admission_no: s.admission_no,
      upi: s.upi || '',
      class_id: s.class_id,
      stream_id: s.stream_id,
      gender: s.gender,
      date_of_birth: s.date_of_birth,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone,
      guardian_email: s.guardian_email,
    });
    void loadClasses();
    void loadStreamsForClass(s.class_id);
    setStudentDialogOpen(true);
  };

  const saveStudent = async () => {
    if (!studentForm.full_name.trim() || !studentForm.admission_no.trim() || !studentForm.class_id || !studentForm.stream_id) {
      toast({ title: 'Validation Error', description: 'Full name, admission number, class, and stream are required.', variant: 'destructive' });
      return;
    }

    const cls = classes.find((c) => c.id === studentForm.class_id);
    const stream = streams.find((s) => s.id === studentForm.stream_id);
    if (!cls || !stream) return;

    const payload = {
      full_name: studentForm.full_name.trim(),
      admission_no: studentForm.admission_no.trim(),
      upi: studentForm.upi.trim(),
      class_id: studentForm.class_id,
      class_name: cls.name,
      stream_id: studentForm.stream_id,
      stream_name: stream.name,
      gender: studentForm.gender,
      date_of_birth: studentForm.date_of_birth,
      guardian_name: studentForm.guardian_name,
      guardian_phone: studentForm.guardian_phone,
      guardian_email: studentForm.guardian_email,
    };

    if (editingStudent) {
      const { error } = await supabase
        .from('hoi_students')
        .update(payload)
        .eq('school_id', currentUser?.schoolId || '')
        .eq('id', editingStudent.id);

      if (error) {
        toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Student Updated', description: `${studentForm.full_name} has been updated.` });
    } else {
      const { error } = await supabase
        .from('hoi_students')
        .insert({
          ...payload,
          school_id: currentUser?.schoolId || null,
          school_code: currentUser?.schoolCode || null,
          status: 'active',
          enrolled_at: new Date().toISOString().split('T')[0],
        });

      if (error) {
        toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Student Added', description: `${studentForm.full_name} has been enrolled.` });
    }

    setStudentDialogOpen(false);
    await loadData();
  };

  const openTransfer = (s: HoiStudent) => {
    setTransferStudent(s);
    setTransferClassId(s.class_id);
    setTransferStreamId(s.stream_id);
    setTransferDialogOpen(true);
  };

  const executeTransfer = async () => {
    if (!transferStudent || !transferClassId || !transferStreamId) return;
    const cls = classes.find((c) => c.id === transferClassId);
    const stream = streams.find((s) => s.id === transferStreamId);
    if (!cls || !stream) return;

    const { error } = await supabase
      .from('hoi_students')
      .update({
        class_id: transferClassId,
        class_name: cls.name,
        stream_id: transferStreamId,
        stream_name: stream.name,
        status: 'transferred',
      })
      .eq('school_id', currentUser?.schoolId || '')
      .eq('id', transferStudent.id);

    if (error) {
      toast({ title: 'Transfer Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Student Transferred', description: `${transferStudent.full_name} transferred to ${cls.name} - ${stream.name}` });
    setTransferDialogOpen(false);
    await loadData();
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
      if (rows.length < 2) {
        setCsvPreview([]);
        setStudentCsvRows([]);
        return;
      }

      const headers = rows[0].map((header) => header.toLowerCase());
      const parsedRows = rows.slice(1).map((row) => {
        const mapped: Record<string, string> = {};
        headers.forEach((header, idx) => {
          mapped[header] = row[idx] || '';
        });
        return mapped;
      });

      setStudentCsvRows(parsedRows);
      setCsvPreview(rows.slice(0, 11));
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!currentUser?.schoolId) {
      toast({ title: 'Import Failed', description: 'Missing school context.', variant: 'destructive' });
      return;
    }

    if (studentCsvRows.length === 0) {
      toast({ title: 'Import Failed', description: 'No CSV rows found to import.', variant: 'destructive' });
      return;
    }

    const failures: string[] = [];
    const payload: any[] = [];

    studentCsvRows.forEach((row, idx) => {
      const rowNumber = idx + 2;
      const fullName = (row.full_name || '').trim();
      const admissionNo = (row.admission_no || '').trim();
      const upi = (row.upi || '').trim();
      const className = (row.class_name || '').trim();
      const streamName = (row.stream_name || '').trim();
      const genderRaw = (row.gender || '').trim();
      const dateOfBirth = (row.date_of_birth || '').trim();
      const guardianName = (row.guardian_name || '').trim();
      const guardianPhone = (row.guardian_phone || '').trim();
      const guardianEmail = (row.guardian_email || '').trim();

      if (!fullName || !admissionNo || !className || !streamName) {
        failures.push(`Row ${rowNumber}: Missing required fields.`);
        return;
      }

      const cls = classes.find((c) => c.name.toLowerCase() === className.toLowerCase());
      if (!cls) {
        failures.push(`Row ${rowNumber}: Class "${className}" not found.`);
        return;
      }

      const stream = allStreams.find(
        (s) => s.class_id === cls.id && s.name.toLowerCase() === streamName.toLowerCase()
      );
      if (!stream) {
        failures.push(`Row ${rowNumber}: Stream "${streamName}" not found for class "${className}".`);
        return;
      }

      let gender: 'Male' | 'Female' = 'Male';
      if (genderRaw) {
        if (genderRaw.toLowerCase() === 'male') gender = 'Male';
        else if (genderRaw.toLowerCase() === 'female') gender = 'Female';
        else {
          failures.push(`Row ${rowNumber}: Invalid gender "${genderRaw}".`);
          return;
        }
      }

      payload.push({
        full_name: fullName,
        admission_no: admissionNo,
        upi,
        class_id: cls.id,
        class_name: cls.name,
        stream_id: stream.id,
        stream_name: stream.name,
        gender,
        date_of_birth: dateOfBirth,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        guardian_email: guardianEmail,
        status: 'active',
        enrolled_at: new Date().toISOString().split('T')[0],
        school_id: currentUser.schoolId,
        school_code: currentUser.schoolCode || null,
      });
    });

    let importedCount = 0;

    if (payload.length > 0) {
      const { error } = await supabase.from('hoi_students').insert(payload);
      if (error) {
        failures.push(`Database insert failed: ${error.message}`);
      } else {
        importedCount = payload.length;
      }
    }

    if (importedCount > 0) {
      toast({ title: 'Import Successful', description: `Imported ${importedCount} student record(s).` });
    }

    if (failures.length > 0) {
      toast({
        title: 'Import Errors',
        description: failures.slice(0, 5).join(' | '),
        variant: 'destructive',
      });
    }

    setBulkImportOpen(false);
    setCsvPreview([]);
    setStudentCsvRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await loadData();
  };

  const downloadStudentTemplate = () => {
    const csvContent = [
      'full_name,admission_no,upi,class_name,stream_name,gender,date_of_birth,guardian_name,guardian_phone,guardian_email',
      'John Doe,ADM001,1234567890,Grade 7,East,Male,2012-01-15,Jane Doe,0712345678,jane@email.com',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredStreams = streamFilter !== 'all'
    ? allStreams
    : classFilter !== 'all'
      ? allStreams.filter((s) => s.class_id === classFilter)
      : allStreams;

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
                  {(classFilter !== 'all' ? allStreams.filter((s) => s.class_id === classFilter) : allStreams).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={downloadStudentTemplate} className="gap-2">Download Template</Button>
              <Button variant="outline" onClick={() => setBulkImportOpen(true)} className="gap-2"><Upload className="w-4 h-4" />Import CSV</Button>
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
                <TableHead>UPI</TableHead>
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
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No students found.</TableCell></TableRow>
              ) : pagedStudents.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openProfile(s)}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.admission_no}</TableCell>
                  <TableCell>{s.upi || '—'}</TableCell>
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
            <div>
              <Label>UPI (Optional)</Label>
              <Input value={studentForm.upi} onChange={(e) => setStudentForm({ ...studentForm, upi: e.target.value })} placeholder="e.g. 1234567890" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class *</Label>
                <Select
                  value={studentForm.class_id}
                  onValueChange={(v) => {
                    setStudentForm({ ...studentForm, class_id: v, stream_id: '' });
                    void loadStreamsForClass(v);
                  }}
                >
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
                    {streams.map((s) => (
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
                  {allStreams.filter((s) => s.class_id === transferClassId).map((s) => (
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
                  <p className="text-muted-foreground">UPI</p>
                  <p className="font-medium">{viewingStudent.upi || '—'}</p>
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

      <Dialog open={bulkImportOpen} onOpenChange={(open) => { setBulkImportOpen(open); if (!open) { setCsvPreview([]); setStudentCsvRows([]); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Bulk Import Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Upload a CSV file with student data</p>
              <p className="text-xs text-muted-foreground mb-4">Columns: full_name, admission_no, upi, class, stream, gender, date_of_birth, guardian_name, guardian_phone, guardian_email</p>
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
