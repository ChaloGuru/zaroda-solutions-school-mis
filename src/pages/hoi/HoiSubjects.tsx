import { useState, useEffect } from 'react';
import {
  hoiSubjectsStorage,
  hoiSubjectAssignmentsStorage,
  HoiSubject,
  HoiSubjectAssignment,
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
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
  Layers,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const emptyForm = {
  name: '',
  code: '',
  category: 'core' as HoiSubject['category'],
  description: '',
};

export default function HoiSubjects() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<HoiSubject[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reload = () => {
    setSubjects(hoiSubjectsStorage.getAll());
    setAssignments(hoiSubjectAssignmentsStorage.getAll());
  };

  useEffect(() => { reload(); }, []);

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getTeachersForSubject = (subjectId: string) => {
    const teacherNames = [...new Set(assignments.filter((a) => a.subject_id === subjectId).map((a) => a.teacher_name))];
    return teacherNames;
  };

  const getClassesForSubject = (subjectId: string) => {
    const classInfo = assignments
      .filter((a) => a.subject_id === subjectId)
      .map((a) => `${a.class_name} ${a.stream_name}`);
    return [...new Set(classInfo)];
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Subject name is required';
    if (!form.code.trim()) e.code = 'Subject code is required';
    if (!form.category) e.category = 'Category is required';
    const duplicate = subjects.find(
      (s) => s.code.toLowerCase() === form.code.trim().toLowerCase() && s.id !== editingId
    );
    if (duplicate) e.code = 'Subject code already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (subject: HoiSubject) => {
    setEditingId(subject.id);
    setForm({
      name: subject.name,
      code: subject.code,
      category: subject.category,
      description: subject.description || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      hoiSubjectsStorage.update(editingId, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category,
        description: form.description.trim() || undefined,
      });
      toast({ title: 'Subject Updated', description: `${form.name} has been updated.` });
    } else {
      hoiSubjectsStorage.add({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category,
        description: form.description.trim() || undefined,
      });
      toast({ title: 'Subject Added', description: `${form.name} has been added.` });
    }
    setDialogOpen(false);
    reload();
  };

  const handleDelete = () => {
    if (deleteId) {
      const subj = subjects.find((s) => s.id === deleteId);
      hoiSubjectsStorage.remove(deleteId);
      toast({ title: 'Subject Deleted', description: `${subj?.name || 'Subject'} has been removed.` });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      reload();
      if (paginated.length === 1 && page > 1) setPage(page - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Subjects Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage school subjects and curriculum</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects by name, code or category..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filtered.length} subject{filtered.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No subjects found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((subject) => {
                  const teachers = getTeachersForSubject(subject.id);
                  const classes = getClassesForSubject(subject.id);
                  return (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <code className="px-2 py-0.5 rounded bg-muted text-sm">{subject.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={subject.category === 'core' ? 'bg-blue-500/10 text-blue-700 border-blue-500/30' : 'bg-purple-500/10 text-purple-700 border-purple-500/30'}>
                          {subject.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {teachers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teachers.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs gap-1">
                                <Users className="w-3 h-3" /> {t}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {classes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {classes.map((c) => (
                              <Badge key={c} variant="outline" className="text-xs gap-1">
                                <Layers className="w-3 h-3" /> {c}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No classes</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {subject.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(subject)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDelete(subject.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code *</Label>
              <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH" />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as HoiSubject['category'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Update' : 'Add'} Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
