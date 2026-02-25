import React, { useState, useMemo } from 'react';
import { schemeOfWorkStorage, type SchemeOfWork } from '@/lib/storage';
import { useAuthContext } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const SubjectsCurriculum = () => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ term: '', subject: '', className: '' });
  const [all, setAll] = useState<SchemeOfWork[]>([]);
  // filter by department — assume subject naming contains dept or HOD's department matches subject
  const items = useMemo(() => all.filter(s => s.subject.includes(currentUser?.department || '')), [all, currentUser]);
  const [page, setPage] = useState(0);

  React.useEffect(() => {
    const loadSchemes = async () => {
      setAll(await schemeOfWorkStorage.getAll());
    };
    void loadSchemes();
  }, []);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const createScheme = async () => {
    if (!form.term || !form.subject || !form.className) { toast({ title: 'Missing', description: 'Fill required fields', variant: 'destructive' }); return; }
    await schemeOfWorkStorage.add({ term: form.term, subject: form.subject, className: form.className, weeks: [], schoolCode: currentUser?.schoolCode });
    setAll(await schemeOfWorkStorage.getAll());
    toast({ title: 'Saved', description: 'Scheme of work created.' });
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Subjects & Curriculum</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Scheme of Work</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Scheme</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div><Label>Term</Label><Input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} /></div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Class</Label><Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={createScheme}>Create</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Term</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Weeks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.term}</TableCell>
                <TableCell>{s.subject}</TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.weeks?.length || 0}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-6">No schemes created.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4"><div>Page {page+1} of {pageCount}</div><div className="flex gap-2"><Button disabled={page===0} onClick={() => setPage(p => Math.max(0, p-1))}>Prev</Button><Button disabled={page>=pageCount-1} onClick={() => setPage(p => Math.min(pageCount-1, p+1))}>Next</Button></div></div>
      </div>
    </div>
  );
};

export default SubjectsCurriculum;
