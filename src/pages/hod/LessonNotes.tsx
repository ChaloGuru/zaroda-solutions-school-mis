import React, { useMemo, useState } from 'react';
import { lessonNotesStorage, type LessonNote } from '@/lib/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PAGE_SIZE = 10;

const LessonNotes = () => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const [all, setAll] = useState<LessonNote[]>([]);
  // filter by department via subject matching department name
  const notes = useMemo(() => all.filter(n => n.subject.includes(currentUser?.department || '')), [all, currentUser]);

  React.useEffect(() => {
    const loadNotes = async () => {
      setAll(await lessonNotesStorage.getAll());
    };
    void loadNotes();
  }, []);

  const [page, setPage] = useState(0);
  const pageItems = notes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(notes.length / PAGE_SIZE));

  const [activeNote, setActiveNote] = useState<LessonNote | null>(null);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  const openReview = (note: LessonNote) => { setActiveNote(note); setComment(note.hodComments || ''); setOpen(true); };
  const approve = async () => {
    if (!activeNote) return;
    await lessonNotesStorage.update(activeNote.id, { status: 'approved', hodComments: comment });
    setAll(await lessonNotesStorage.getAll());
    toast({ title: 'Approved', description: 'Lesson note approved.' });
    setOpen(false);
  };
  const sendBack = async () => {
    if (!activeNote) return;
    await lessonNotesStorage.update(activeNote.id, { status: 'returned', hodComments: comment });
    setAll(await lessonNotesStorage.getAll());
    toast({ title: 'Returned', description: 'Lesson note returned to teacher.' });
    setOpen(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Lesson Notes & Resources</h2>
      <div className="bg-card border border-border rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Learning Area</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map(n => (
              <TableRow key={n.id}>
                <TableCell>{n.title}</TableCell>
                <TableCell>{n.teacherName}</TableCell>
                <TableCell>{n.subject}</TableCell>
                <TableCell>{n.className}</TableCell>
                <TableCell>{n.week}</TableCell>
                <TableCell>{n.status}</TableCell>
                <TableCell><Button size="sm" onClick={() => openReview(n)}>Review</Button></TableCell>
              </TableRow>
            ))}
            {notes.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center py-6">No lesson notes submitted.</TableCell></TableRow>)}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4"><div>Page {page+1} of {pageCount}</div><div className="flex gap-2"><Button disabled={page===0} onClick={() => setPage(p => Math.max(0, p-1))}>Prev</Button><Button disabled={page>=pageCount-1} onClick={() => setPage(p => Math.min(pageCount-1, p+1))}>Next</Button></div></div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Lesson Note</DialogTitle></DialogHeader>
          {activeNote && (
            <div className="space-y-3 mt-2">
              <div><strong>{activeNote.title}</strong> by {activeNote.teacherName}</div>
              <div className="prose max-w-none">{activeNote.content}</div>
              <div><Label>HOD Comments</Label><Input value={comment} onChange={(e) => setComment(e.target.value)} /></div>
              <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpen(false)}>Close</Button><Button onClick={sendBack}>Send Back</Button><Button onClick={approve}>Approve</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonNotes;
