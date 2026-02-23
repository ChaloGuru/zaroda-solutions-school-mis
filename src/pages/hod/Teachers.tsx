import React, { useState, useMemo } from 'react';
import { facultyStorage, hodObservationsStorage, type Faculty } from '@/lib/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const TeachersInDept = () => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const allTeachers = facultyStorage.getAll();
  const teachers = useMemo(() => allTeachers.filter(t => t.department === currentUser?.department), [allTeachers, currentUser]);

  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(teachers.length / PAGE_SIZE);

  const [selectedTeacher, setSelectedTeacher] = useState<Faculty | null>(null);
  const [obsOpen, setObsOpen] = useState(false);
  const [obsForm, setObsForm] = useState({ lessonDate: '', classObserved: '', topic: '', strengths: '', areasToImprove: '', rating: 3, recommendations: '' });

  const start = page * PAGE_SIZE;
  const pageItems = teachers.slice(start, start + PAGE_SIZE);

  const openObservation = (teacher: Faculty) => { setSelectedTeacher(teacher); setObsOpen(true); };

  const submitObservation = () => {
    if (!selectedTeacher) return;
    if (!obsForm.lessonDate || !obsForm.classObserved || !obsForm.topic) {
      toast({ title: 'Validation', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    hodObservationsStorage.add({ hodId: currentUser?.id, teacherId: selectedTeacher.id, teacherEmail: selectedTeacher.email, teacherName: selectedTeacher.full_name, lessonDate: obsForm.lessonDate, classObserved: obsForm.classObserved, topic: obsForm.topic, strengths: obsForm.strengths, areasToImprove: obsForm.areasToImprove, rating: obsForm.rating, recommendations: obsForm.recommendations });
    toast({ title: 'Saved', description: 'Observation saved.' });
    setObsOpen(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Teachers in {currentUser?.department}</h2>
      <div className="bg-card border border-border rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.staff_no}</TableCell>
                <TableCell>{t.full_name}</TableCell>
                <TableCell>{t.department}</TableCell>
                <TableCell>{t.department}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openObservation(t)}>Observe</Button>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">No teachers in your department.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4">
          <div>Page {page + 1} of {pageCount || 1}</div>
          <div className="flex gap-2">
            <Button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</Button>
            <Button disabled={page >= pageCount - 1} onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={obsOpen} onOpenChange={setObsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teacher Observation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label>Lesson Date</Label><Input type="date" value={obsForm.lessonDate} onChange={(e) => setObsForm({ ...obsForm, lessonDate: e.target.value })} /></div>
            <div><Label>Class Observed</Label><Input value={obsForm.classObserved} onChange={(e) => setObsForm({ ...obsForm, classObserved: e.target.value })} /></div>
            <div><Label>Topic</Label><Input value={obsForm.topic} onChange={(e) => setObsForm({ ...obsForm, topic: e.target.value })} /></div>
            <div><Label>Strengths</Label><Input value={obsForm.strengths} onChange={(e) => setObsForm({ ...obsForm, strengths: e.target.value })} /></div>
            <div><Label>Areas to improve</Label><Input value={obsForm.areasToImprove} onChange={(e) => setObsForm({ ...obsForm, areasToImprove: e.target.value })} /></div>
            <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={obsForm.rating} onChange={(e) => setObsForm({ ...obsForm, rating: Number(e.target.value) })} /></div>
            <div><Label>Recommendations</Label><Input value={obsForm.recommendations} onChange={(e) => setObsForm({ ...obsForm, recommendations: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setObsOpen(false)}>Cancel</Button><Button onClick={submitObservation}>Save Observation</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeachersInDept;
