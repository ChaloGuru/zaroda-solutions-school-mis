import { useState, useEffect } from 'react';
import {
  hoiClassesStorage,
  hoiStreamsStorage,
  hoiTeachersStorage,
  HoiClass,
  HoiStream,
  HoiTeacher,
} from '../../lib/hoiStorage';
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
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/context/AuthContext';

const LEVEL_LABELS: Record<HoiClass['level'], string> = {
  ecde: 'ECDE',
  primary: 'Primary',
  junior_secondary: 'JS',
};

const emptyClassForm = {
  name: '',
  level: 'primary' as HoiClass['level'],
};

const emptyStreamForm = {
  name: '',
  class_id: '',
  class_teacher_id: '',
  class_teacher_name: '',
  student_count: 0,
};

const PAGE_SIZE = 10;

export default function DhoiClasses() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<HoiClass | null>(null);
  const [classForm, setClassForm] = useState(emptyClassForm);

  const [streamDialogOpen, setStreamDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<HoiStream | null>(null);
  const [streamForm, setStreamForm] = useState(emptyStreamForm);
  const [streamParentClassId, setStreamParentClassId] = useState('');

  const [deleteClassDialog, setDeleteClassDialog] = useState<{ open: boolean; cls: HoiClass | null }>({ open: false, cls: null });
  const [deleteStreamDialog, setDeleteStreamDialog] = useState<{ open: boolean; stream: HoiStream | null }>({ open: false, stream: null });

  const loadData = async () => {
    try {
      if (!currentUser?.schoolId) {
        setClasses([]);
        setStreams([]);
        setTeachers([]);
        return;
      }

      const [{ data: classRows }, { data: streamRows }, { data: teacherRows }] = await Promise.all([
        supabase.from('hoi_classes').select('*').eq('school_id', currentUser.schoolId).order('name', { ascending: true }),
        supabase.from('hoi_streams').select('*').eq('school_id', currentUser.schoolId).order('name', { ascending: true }),
        supabase.from('hoi_teachers').select('*').eq('school_id', currentUser.schoolId).order('full_name', { ascending: true }),
      ]);

      const loadedClasses: HoiClass[] = (classRows || []).map((row: any) => ({
        id: row.id,
        name: row.name || '',
        level: row.level || 'primary',
        created_at: row.created_at || '',
      }));

      const loadedTeachers: HoiTeacher[] = (teacherRows || []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name || '',
        email: row.email || '',
        phone: row.phone || '',
        employee_id: row.employee_id || '',
        subject_specialization: row.subject_specialization || '',
        gender: row.gender === 'Female' ? 'Female' : 'Male',
        qualification: row.qualification || '',
        status: row.status || 'active',
        hired_at: row.hired_at || '',
        is_class_teacher: Boolean(row.is_class_teacher),
        class_teacher_class_id: row.class_teacher_class_id || undefined,
        class_teacher_class_name: row.class_teacher_class_name || undefined,
        class_teacher_stream_id: row.class_teacher_stream_id || undefined,
        class_teacher_stream_name: row.class_teacher_stream_name || undefined,
      }));

      const teachersById = new Map(loadedTeachers.map((teacher) => [teacher.id, teacher]));
      const teacherByClassStream = new Map(
        loadedTeachers
          .filter((teacher) => teacher.is_class_teacher && teacher.class_teacher_class_id && teacher.class_teacher_stream_id)
          .map((teacher) => [`${teacher.class_teacher_class_id}::${teacher.class_teacher_stream_id}`, teacher])
      );

      const loadedStreams: HoiStream[] = (streamRows || []).map((row: any) => {
        const streamId = row.id;
        const classId = row.class_id || '';
        const explicitTeacherId = row.class_teacher_id || '';
        const explicitTeacher = explicitTeacherId ? teachersById.get(explicitTeacherId) : undefined;
        const fallbackTeacher = teacherByClassStream.get(`${classId}::${streamId}`);
        const resolvedTeacher = explicitTeacher || fallbackTeacher;

        return {
          id: streamId,
          class_id: classId,
          name: row.name || '',
          class_teacher_id: explicitTeacherId || resolvedTeacher?.id || '',
          class_teacher_name: row.class_teacher_name || resolvedTeacher?.full_name || '',
          student_count: Number(row.student_count || 0),
        };
      });

      setClasses(loadedClasses);
      setTeachers(loadedTeachers);
      setStreams(loadedStreams);
    } catch {
      setClasses(hoiClassesStorage.getAll());
      setStreams(hoiStreamsStorage.getAll());
      setTeachers(hoiTeachersStorage.getAll());
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentUser?.schoolId]);

  const toggleExpand = (id: string) => {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredClasses = classes.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || c.name.toLowerCase().includes(term);
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
  const paginatedClasses = filteredClasses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [searchTerm, levelFilter]);

  const getStreamsForClass = (classId: string) => streams.filter((s) => s.class_id === classId);
  const getTotalStudentsForClass = (classId: string) => getStreamsForClass(classId).reduce((sum, s) => sum + s.student_count, 0);

  const openAddClass = () => {
    setEditingClass(null);
    setClassForm(emptyClassForm);
    setClassDialogOpen(true);
  };

  const openEditClass = (cls: HoiClass) => {
    setEditingClass(cls);
    setClassForm({ name: cls.name, level: cls.level });
    setClassDialogOpen(true);
  };

  const handleSaveClass = () => {
    if (!classForm.name) {
      toast({ title: 'Validation Error', description: 'Class name is required.', variant: 'destructive' });
      return;
    }
    if (editingClass) {
      hoiClassesStorage.update(editingClass.id, { ...classForm, created_at: editingClass.created_at });
      toast({ title: 'Class Updated', description: `${classForm.name} has been updated.` });
    } else {
      hoiClassesStorage.add({ ...classForm, created_at: new Date().toISOString().split('T')[0] });
      toast({ title: 'Class Added', description: `${classForm.name} has been created.` });
    }
    setClassDialogOpen(false);
    loadData();
  };

  const handleDeleteClass = () => {
    if (!deleteClassDialog.cls) return;
    const classStreams = getStreamsForClass(deleteClassDialog.cls.id);
    classStreams.forEach((s) => hoiStreamsStorage.remove(s.id));
    hoiClassesStorage.remove(deleteClassDialog.cls.id);
    toast({ title: 'Class Deleted', description: `${deleteClassDialog.cls.name} and its streams have been removed.` });
    setDeleteClassDialog({ open: false, cls: null });
    loadData();
  };

  const openAddStream = (classId: string) => {
    setEditingStream(null);
    setStreamParentClassId(classId);
    setStreamForm({ ...emptyStreamForm, class_id: classId });
    setStreamDialogOpen(true);
  };

  const openEditStream = (stream: HoiStream) => {
    setEditingStream(stream);
    setStreamParentClassId(stream.class_id);
    setStreamForm({
      name: stream.name,
      class_id: stream.class_id,
      class_teacher_id: stream.class_teacher_id || '',
      class_teacher_name: stream.class_teacher_name || '',
      student_count: stream.student_count,
    });
    setStreamDialogOpen(true);
  };

  const handleSaveStream = async () => {
    if (!streamForm.name) {
      toast({ title: 'Validation Error', description: 'Stream name is required.', variant: 'destructive' });
      return;
    }

    const parentClass = classes.find((cls) => cls.id === streamParentClassId);
    if (!parentClass) {
      toast({ title: 'Validation Error', description: 'Parent class not found.', variant: 'destructive' });
      return;
    }

    const payload = {
      name: streamForm.name,
      class_id: streamParentClassId,
      class_teacher_id: streamForm.class_teacher_id || null,
      class_teacher_name: streamForm.class_teacher_name || null,
      student_count: streamForm.student_count,
    };

    let savedStreamId = editingStream?.id || '';

    if (editingStream) {
      const { error } = await supabase
        .from('hoi_streams')
        .update(payload)
        .eq('school_id', currentUser?.schoolId || '')
        .eq('id', editingStream.id);
      if (error) {
        toast({ title: 'Stream Save Error', description: error.message, variant: 'destructive' });
        return;
      }
      savedStreamId = editingStream.id;
      toast({ title: 'Stream Updated', description: `${streamForm.name} has been updated.` });
    } else {
      const { data, error } = await supabase
        .from('hoi_streams')
        .insert({
          ...payload,
          school_id: currentUser?.schoolId || null,
          school_code: currentUser?.schoolCode || null,
        })
        .select('id')
        .single();
      if (error) {
        toast({ title: 'Stream Save Error', description: error.message, variant: 'destructive' });
        return;
      }
      savedStreamId = data?.id || '';
      toast({ title: 'Stream Added', description: `${streamForm.name} has been created.` });
    }

    if (savedStreamId) {
      await supabase
        .from('hoi_teachers')
        .update({
          is_class_teacher: false,
          class_teacher_class_id: null,
          class_teacher_class_name: null,
          class_teacher_stream_id: null,
          class_teacher_stream_name: null,
        })
        .eq('school_id', currentUser?.schoolId || '')
        .eq('class_teacher_stream_id', savedStreamId);

      if (streamForm.class_teacher_id) {
        await supabase
          .from('hoi_teachers')
          .update({
            is_class_teacher: true,
            class_teacher_class_id: parentClass.id,
            class_teacher_class_name: parentClass.name,
            class_teacher_stream_id: savedStreamId,
            class_teacher_stream_name: streamForm.name,
          })
          .eq('school_id', currentUser?.schoolId || '')
          .eq('id', streamForm.class_teacher_id);
      }
    }

    setStreamDialogOpen(false);
    await loadData();
  };

  const handleDeleteStream = () => {
    if (!deleteStreamDialog.stream) return;
    hoiStreamsStorage.remove(deleteStreamDialog.stream.id);
    toast({ title: 'Stream Deleted', description: `${deleteStreamDialog.stream.name} has been removed.` });
    setDeleteStreamDialog({ open: false, stream: null });
    loadData();
  };

  const handleTeacherChange = (teacherId: string) => {
    if (teacherId === '_none') {
      setStreamForm((prev) => ({ ...prev, class_teacher_id: '', class_teacher_name: '' }));
      return;
    }
    const teacher = teachers.find((t) => t.id === teacherId);
    setStreamForm((prev) => ({
      ...prev,
      class_teacher_id: teacherId,
      class_teacher_name: teacher?.full_name || '',
    }));
  };

  const totalStudents = streams.reduce((sum, s) => sum + s.student_count, 0);
  const totalStreamCount = streams.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Classes & Streams</h1>
          <p className="text-muted-foreground">Manage classes, streams, and teacher assignments</p>
        </div>
        <Button onClick={openAddClass} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Classes', value: classes.length, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Streams', value: totalStreamCount, icon: Users, color: 'text-violet-600', bg: 'bg-violet-500/10' },
          { label: 'Total Students', value: totalStudents, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={levelFilter === 'all' ? 'default' : 'outline'} onClick={() => setLevelFilter('all')} size="sm">All</Button>
              <Button variant={levelFilter === 'ecde' ? 'default' : 'outline'} onClick={() => setLevelFilter('ecde')} size="sm">ECDE</Button>
              <Button variant={levelFilter === 'primary' ? 'default' : 'outline'} onClick={() => setLevelFilter('primary')} size="sm">Primary</Button>
              <Button variant={levelFilter === 'junior_secondary' ? 'default' : 'outline'} onClick={() => setLevelFilter('junior_secondary')} size="sm">JS</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedClasses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No classes found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedClasses.map((cls) => {
                const classStreams = getStreamsForClass(cls.id);
                const isExpanded = expandedClasses.has(cls.id);
                const studentCount = getTotalStudentsForClass(cls.id);

                return (
                  <div key={cls.id} className="border border-border/50 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(cls.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{cls.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline">{LEVEL_LABELS[cls.level]}</Badge>
                            <span>{classStreams.length} stream{classStreams.length !== 1 ? 's' : ''}</span>
                            <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditClass(cls); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteClassDialog({ open: true, cls }); }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-muted-foreground">Streams</h4>
                          <Button variant="outline" size="sm" onClick={() => openAddStream(cls.id)} className="gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            Add Stream
                          </Button>
                        </div>
                        {classStreams.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No streams yet. Add one to get started.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {classStreams.map((stream) => (
                              <div key={stream.id} className="p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-secondary/20 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium text-foreground">{cls.name} — {stream.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{stream.student_count} students</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditStream(stream)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteStreamDialog({ open: true, stream })}>
                                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                                {stream.class_teacher_name ? (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{stream.class_teacher_name}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No class teacher assigned</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({filteredClasses.length} classes)
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Class Name</Label>
              <Input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. PP1, Grade 7" />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={classForm.level} onValueChange={(v: HoiClass['level']) => setClassForm({ ...classForm, level: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecde">ECDE</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="junior_secondary">JS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClass}>{editingClass ? 'Save Changes' : 'Add Class'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={streamDialogOpen} onOpenChange={setStreamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStream ? 'Edit Stream' : 'Add New Stream'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stream Name</Label>
              <Input value={streamForm.name} onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })} placeholder="e.g. East, West, A, B" />
            </div>
            <div className="space-y-2">
              <Label>Class Teacher</Label>
              <Select value={streamForm.class_teacher_id || '_none'} onValueChange={handleTeacherChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">No teacher assigned</SelectItem>
                  {teachers.filter((t) => t.status === 'active').map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student Count</Label>
              <Input
                type="number"
                min="0"
                value={streamForm.student_count}
                onChange={(e) => setStreamForm({ ...streamForm, student_count: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStreamDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStream}>{editingStream ? 'Save Changes' : 'Add Stream'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteClassDialog.open} onOpenChange={(open) => setDeleteClassDialog({ ...deleteClassDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteClassDialog.cls?.name}</strong> and all its streams. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteStreamDialog.open} onOpenChange={(open) => setDeleteStreamDialog({ ...deleteStreamDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stream?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteStreamDialog.stream?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStream} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
