import React, { useState, useMemo, useEffect } from 'react';
import { examsStorage, examResultsStorage, assessmentStorage, type Exam, type Student, type AssessmentRecord, type ExamResultEntry } from '@/lib/storage';
import { useAuthContext } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { studentsStorage } from '@/lib/storage';

const PAGE_SIZE = 10;

const Exams = () => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allAssessments, setAllAssessments] = useState<AssessmentRecord[]>([]);
  const [allResults, setAllResults] = useState<ExamResultEntry[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', type: '', date: '', subjects: '', classes: '' });

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [openEntry, setOpenEntry] = useState(false);
  const [subjectForEntry, setSubjectForEntry] = useState<string>('');
  const [classForEntry, setClassForEntry] = useState<string>('');
  const [assessmentBookForEntry, setAssessmentBookForEntry] = useState<string>('');
  const [marksMap, setMarksMap] = useState<Record<string, { marksScored: number | null; marksOutOf: number }>>({});

  const loadData = async () => {
    const [exams, students, assessments, results] = await Promise.all([
      examsStorage.getAll(),
      studentsStorage.getAll(),
      assessmentStorage.getAll(),
      examResultsStorage.getAll(),
    ]);

    setAllExams(exams.filter(e => e.schoolCode === currentUser?.schoolCode || !e.schoolCode));
    setAllStudents(students);
    setAllAssessments(assessments);
    setAllResults(results);
  };

  useEffect(() => {
    void loadData();
  }, [currentUser?.schoolCode]);

  const createExam = async () => {
    if (!createForm.name || !createForm.type) { toast({ title: 'Missing', description: 'Fill required fields', variant: 'destructive' }); return; }
    await examsStorage.add({ name: createForm.name, type: createForm.type, date: createForm.date, subjects: createForm.subjects.split(',').map(s => s.trim()), classes: createForm.classes.split(',').map(c => c.trim()), schoolCode: currentUser?.schoolCode });
    toast({ title: 'Exam created' });
    setOpenCreate(false);
    await loadData();
  };

  const openResults = (exam: Exam) => {
    setSelectedExam(exam);
    setSubjectForEntry('');
    setClassForEntry('');
    setAssessmentBookForEntry('');
    setMarksMap({});
    setOpenEntry(true);
  };

  const students = allStudents.filter(s => (selectedExam?.classes || []).includes(s.grade) || selectedExam?.classes.length === 0);

  const assessmentBookOptions = useMemo(() => {
    if (!classForEntry || !subjectForEntry) return [] as Array<{ id: string; label: string }>;
    const matched = allAssessments
      .filter((record) => record.grade === classForEntry && record.subject === subjectForEntry)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return matched.map((record) => ({
      id: record.id,
      label: `${record.teacherName} • Term ${record.term} • Updated ${new Date(record.updatedAt).toLocaleDateString()}`,
    }));
  }, [classForEntry, subjectForEntry, openEntry, allAssessments]);

  useEffect(() => {
    if (assessmentBookOptions.length === 0) {
      setAssessmentBookForEntry('');
      return;
    }
    if (!assessmentBookOptions.some((option) => option.id === assessmentBookForEntry)) {
      setAssessmentBookForEntry(assessmentBookOptions[0].id);
    }
  }, [assessmentBookOptions, assessmentBookForEntry]);

  const examLookup = useMemo(() => {
    const lookup = new Map<string, Exam>();
    allExams.forEach((exam) => lookup.set(exam.id, exam));
    return lookup;
  }, [allExams]);

  const savedResults = useMemo(() => {
    return allResults
      .filter((result) => examLookup.has(result.examId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [examLookup, openEntry, allResults]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Exams & Assessment</h2>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild><Button>Create Exam</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div><Label>Name</Label><Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} /></div>
              <div><Label>Type</Label><Input value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })} /></div>
              <div><Label>Date</Label><Input type="date" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })} /></div>
              <div><Label>Learning Areas (comma separated)</Label><Input value={createForm.subjects} onChange={(e) => setCreateForm({ ...createForm, subjects: e.target.value })} /></div>
              <div><Label>Classes (comma separated)</Label><Input value={createForm.classes} onChange={(e) => setCreateForm({ ...createForm, classes: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpenCreate(false)}>Cancel</Button><Button onClick={createExam}>Create</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Learning Areas</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allExams.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.type}</TableCell>
                <TableCell>{e.date}</TableCell>
                <TableCell>{e.subjects?.join(', ')}</TableCell>
                <TableCell>{e.classes?.join(', ')}</TableCell>
                <TableCell><Button size="sm" onClick={() => openResults(e)}>Enter Results</Button></TableCell>
              </TableRow>
            ))}
            {allExams.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-6">No exams created.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>

      <div className="bg-card border border-border rounded-md p-4 mt-4" id="hod-exam-results-report">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base">Saved Exam Results</h3>
          <Button variant="outline" size="sm" onClick={() => window.print()}>Print Results</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Learning Area</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Assessment Book</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {savedResults.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-6">No exam results saved yet.</TableCell></TableRow>
            ) : savedResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{examLookup.get(result.examId)?.name || '—'}</TableCell>
                <TableCell>{result.subject}</TableCell>
                <TableCell>{result.className}</TableCell>
                <TableCell>{result.studentName}</TableCell>
                <TableCell>{result.marksScored}/{result.marksOutOf}</TableCell>
                <TableCell>{result.grade}</TableCell>
                <TableCell>{result.assessmentBookLabel || '—'}</TableCell>
                <TableCell>{new Date(result.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openEntry} onOpenChange={setOpenEntry}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enter Results - {selectedExam?.name}</DialogTitle></DialogHeader>
          {selectedExam && (
            <div className="space-y-3 mt-2">
              <div className="flex gap-3 items-center">
                <div className="w-64">
                  <Label>Learning Area</Label>
                  <select className="w-full p-2 border rounded-md bg-card" value={subjectForEntry} onChange={(e) => setSubjectForEntry(e.target.value)}>
                    <option value="">Select learning area</option>
                    {(selectedExam.subjects || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="w-48">
                  <Label>Class</Label>
                  <select className="w-full p-2 border rounded-md bg-card" value={classForEntry} onChange={(e) => setClassForEntry(e.target.value)}>
                    <option value="">Select class</option>
                    {(selectedExam.classes || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>Assessment Book (optional)</Label>
                <select className="w-full p-2 border rounded-md bg-card" value={assessmentBookForEntry} onChange={(e) => setAssessmentBookForEntry(e.target.value)}>
                  <option value="">No assessment book</option>
                  {assessmentBookOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-80 overflow-auto border rounded-md">
                {students.map(s => {
                  const key = s.id;
                  const entry = marksMap[key] || { marksScored: null, marksOutOf: 100 };
                  return (
                    <div key={s.id} className="flex items-center gap-3 py-2 px-3 border-b">
                      <div className="w-48">{s.full_name} ({s.admission_no})</div>
                      <div className="flex gap-2 items-center">
                        <Label>Scored</Label>
                        <Input type="number" value={entry.marksScored ?? ''} onChange={(e) => setMarksMap(m => ({ ...m, [key]: { ...entry, marksScored: e.target.value === '' ? null : Number(e.target.value) } }))} />
                        <Label>Out Of</Label>
                        <Input type="number" value={entry.marksOutOf} onChange={(e) => setMarksMap(m => ({ ...m, [key]: { ...entry, marksOutOf: Number(e.target.value) || 100 } }))} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpenEntry(false)}>Close</Button>
                <Button onClick={async () => {
                  if (!subjectForEntry || !classForEntry) { toast({ title: 'Select learning area/class', description: 'Please select a learning area and class before saving.', variant: 'destructive' }); return; }
                  const selectedAssessmentBook = assessmentBookOptions.find((option) => option.id === assessmentBookForEntry);
                  const studentList = students;
                  for (const s of studentList) {
                    const key = s.id;
                    const ent = marksMap[key];
                    if (!ent || ent.marksScored === null) continue;
                    if (ent.marksScored > ent.marksOutOf) { toast({ title: 'Invalid marks', description: `Marks for ${s.full_name} exceed total`, variant: 'destructive' }); return; }
                    await examResultsStorage.add({
                      examId: selectedExam.id,
                      subject: subjectForEntry,
                      className: classForEntry,
                      assessmentBookId: selectedAssessmentBook?.id,
                      assessmentBookLabel: selectedAssessmentBook?.label,
                      studentId: s.id,
                      studentName: s.full_name,
                      admissionNo: s.admission_no,
                      marksScored: ent.marksScored,
                      marksOutOf: ent.marksOutOf,
                    });
                  }
                  toast({ title: 'Saved', description: 'Results saved.' });
                  setOpenEntry(false);
                  await loadData();
                }}>Save Results</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Exams;
