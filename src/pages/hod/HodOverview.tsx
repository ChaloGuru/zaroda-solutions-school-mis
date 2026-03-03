import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { staffEstablishmentStorage, schemeOfWorkStorage, studentsStorage, examResultsStorage, lessonNotesStorage, departmentAnnouncementsStorage, type StaffEstablishment, type SchemeOfWork, type LessonNote, type ExamResultEntry, type DepartmentAnnouncement } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const HodOverview = ({ onNavigate }: { onNavigate?: (s: string) => void }) => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const [allTeachers, setAllTeachers] = useState<StaffEstablishment[]>([]);
  const [allSchemes, setAllSchemes] = useState<SchemeOfWork[]>([]);
  const [allStudents, setAllStudents] = useState<Awaited<ReturnType<typeof studentsStorage.getAll>>>([]);
  const [allLessonNotes, setAllLessonNotes] = useState<LessonNote[]>([]);
  const [allExamResults, setAllExamResults] = useState<ExamResultEntry[]>([]);
  const [announcements, setAnnouncements] = useState<DepartmentAnnouncement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [teachers, schemes, students, lessonNotes, results, deptAnnouncements] = await Promise.all([
        staffEstablishmentStorage.getAll(),
        schemeOfWorkStorage.getAll(),
        studentsStorage.getAll(),
        lessonNotesStorage.getAll(),
        examResultsStorage.getAll(),
        departmentAnnouncementsStorage.getByDepartment(currentUser?.department || ''),
      ]);

      setAllTeachers(teachers);
      setAllSchemes(schemes);
      setAllStudents(students);
      setAllLessonNotes(lessonNotes);
      setAllExamResults(results);
      setAnnouncements(deptAnnouncements);
    };

    void loadData();
  }, [currentUser?.department]);

  const teachers = useMemo(() => allTeachers.filter(t => t.department === currentUser?.department), [allTeachers, currentUser]);
  const schemes = useMemo(() => allSchemes.filter(s => s.subject.includes(currentUser?.department || '')), [allSchemes, currentUser]);
  const lessonNotes = useMemo(() => allLessonNotes.filter(n => n.subject.includes(currentUser?.department || '')), [allLessonNotes, currentUser]);

  const studentsTaking = useMemo(() => {
    const results = allExamResults.filter(r => r.subject.includes(currentUser?.department || ''));
    const ids = new Set(results.map(r => r.studentId));
    return ids.size || lessonNotes.length;
  }, [allExamResults, lessonNotes, currentUser]);

  const avgPerformance = useMemo(() => {
    const results = allExamResults.filter(r => r.subject.includes(currentUser?.department || ''));
    if (results.length === 0) return 0;
    const avg = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);
    return avg;
  }, [allExamResults, currentUser]);

  const recentLessonNotes = lessonNotes.filter(n => {
    const d = new Date(n.createdAt);
    return (Date.now() - d.getTime()) <= (7 * 24 * 60 * 60 * 1000);
  });

  const chartData = useMemo(() => {
    const bySubject: Record<string, { total: number; count: number }> = {};
    const results = allExamResults.filter(r => r.subject.includes(currentUser?.department || ''));
    for (const r of results) {
      bySubject[r.subject] = bySubject[r.subject] || { total: 0, count: 0 };
      bySubject[r.subject].total += r.percentage;
      bySubject[r.subject].count += 1;
    }
    return Object.entries(bySubject).map(([k, v]) => ({ subject: k, avg: Math.round(v.total / v.count) }));
  }, [allExamResults, currentUser]);

  // announcements
  const [annOpen, setAnnOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', body: '' });

  const postAnnouncement = async () => {
    if (!annForm.title.trim() || !annForm.body.trim()) { toast({ title: 'Missing', description: 'Title and body required', variant: 'destructive' }); return; }
    await departmentAnnouncementsStorage.add({ department: currentUser?.department || '', title: annForm.title.trim(), body: annForm.body.trim(), author: currentUser?.fullName || '' });
    setAnnouncements(await departmentAnnouncementsStorage.getByDepartment(currentUser?.department || ''));
    setAnnForm({ title: '', body: '' });
    setAnnOpen(false);
    toast({ title: 'Posted', description: 'Announcement posted to your department.' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">Teachers<br/><div className="text-2xl font-bold">{teachers.length}</div></Card>
        <Card className="p-4">Learning Areas<br/><div className="text-2xl font-bold">{schemes.length}</div></Card>
        <Card className="p-4">Students<br/><div className="text-2xl font-bold">{studentsTaking}</div></Card>
        <Card className="p-4">Average Performance<br/><div className="text-2xl font-bold">{avgPerformance}%</div></Card>
        <Card className="p-4">Lessons (7d)<br/><div className="text-2xl font-bold">{recentLessonNotes.length}</div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-md p-4">
          <h3 className="font-semibold mb-2">Performance by Learning Area</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Announcements</h3>
            <Dialog open={annOpen} onOpenChange={setAnnOpen}>
              <DialogTrigger asChild><Button size="sm">Post</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <div><Label>Title</Label><Input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} /></div>
                  <div><Label>Body</Label><Input value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} /></div>
                  <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setAnnOpen(false)}>Cancel</Button><Button onClick={postAnnouncement}>Post</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 && <div className="text-sm text-muted-foreground">No announcements yet.</div>}
            {announcements.map(a => (
              <div key={a.id} className="border-b pb-2">
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-muted-foreground">{a.body}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => onNavigate?.('lessons')}>Add Lesson Note</Button>
        <Button onClick={() => onNavigate?.('exams')}>Record Exam Results</Button>
        <Button onClick={() => onNavigate?.('timetable')}>View Timetable</Button>
        <Button onClick={() => onNavigate?.('teachers')}>View Teachers</Button>
      </div>
    </div>
  );
};

export default HodOverview;
