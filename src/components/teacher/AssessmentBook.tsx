import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  getSubjectsForGrade,
  getAssessmentForGradeSubjectTerm,
  type SubjectAssessment,
} from '@/lib/assessmentData';
import {
  assessmentStorage,
  type AssessmentScore,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  UserPlus,
  Users,
  Save,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';

interface AssessmentBookProps {
  teacherId: string;
  teacherName: string;
  grade: string;
  subject: string;
  schoolCode: string;
}

interface LocalStudent {
  id: string;
  name: string;
  admissionNo: string;
}

type ScoreLevel = 'EE' | 'ME' | 'AE' | 'BE';

const SCORE_LABELS: Record<ScoreLevel, string> = {
  EE: 'Exceeding Expectation',
  ME: 'Meeting Expectation',
  AE: 'Approaching Expectation',
  BE: 'Below Expectation',
};

const SCORE_COLORS: Record<ScoreLevel, string> = {
  EE: 'bg-green-100 text-green-800 border-green-300',
  ME: 'bg-blue-100 text-blue-800 border-blue-300',
  AE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  BE: 'bg-red-100 text-red-800 border-red-300',
};

function calcPerfLevel(cat1: number | string, cat2: number | string, endTerm: number | string): ScoreLevel {
  const c1 = typeof cat1 === 'string' ? parseFloat(cat1) : cat1;
  const c2 = typeof cat2 === 'string' ? parseFloat(cat2) : cat2;
  const et = typeof endTerm === 'string' ? parseFloat(endTerm) : endTerm;
  if (isNaN(c1) || isNaN(c2) || isNaN(et)) return 'BE';
  const avg = (c1 + c2 + et) / 3;
  if (avg >= 75) return 'EE';
  if (avg >= 50) return 'ME';
  if (avg >= 25) return 'AE';
  return 'BE';
}

function getOverallLevel(scores: AssessmentScore[], scoringType: string): ScoreLevel {
  if (scores.length === 0) return 'BE';
  if (scoringType === 'cat_endterm') {
    const validScores = scores.filter(s => s.cat1 !== undefined && s.cat2 !== undefined && s.endTerm !== undefined);
    if (validScores.length === 0) return 'BE';
    const total = validScores.reduce((sum, s) => {
      const c1 = typeof s.cat1 === 'string' ? parseFloat(s.cat1) : (s.cat1 || 0);
      const c2 = typeof s.cat2 === 'string' ? parseFloat(s.cat2) : (s.cat2 || 0);
      const et = typeof s.endTerm === 'string' ? parseFloat(s.endTerm) : (s.endTerm || 0);
      return sum + (c1 + c2 + et) / 3;
    }, 0);
    const avg = total / validScores.length;
    if (avg >= 75) return 'EE';
    if (avg >= 50) return 'ME';
    if (avg >= 25) return 'AE';
    return 'BE';
  }
  const counts: Record<ScoreLevel, number> = { EE: 0, ME: 0, AE: 0, BE: 0 };
  scores.forEach(s => {
    if (s.ee) counts.EE++;
    else if (s.me) counts.ME++;
    else if (s.ae) counts.AE++;
    else if (s.be) counts.BE++;
  });
  const max = Math.max(counts.EE, counts.ME, counts.AE, counts.BE);
  if (max === 0) return 'BE';
  if (counts.EE === max) return 'EE';
  if (counts.ME === max) return 'ME';
  if (counts.AE === max) return 'AE';
  return 'BE';
}

const AssessmentBook = ({ teacherId, teacherName, grade, subject, schoolCode }: AssessmentBookProps) => {
  const { toast } = useToast();
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('assess');
  const [selectedStudent, setSelectedStudent] = useState<LocalStudent | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentAdmNo, setStudentAdmNo] = useState('');
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [scores, setScores] = useState<Record<string, AssessmentScore>>({});
  const [saving, setSaving] = useState(false);

  const assessment = useMemo(
    () => getAssessmentForGradeSubjectTerm(grade, subject, selectedTerm),
    [grade, subject, selectedTerm]
  );

  const availableSubjects = useMemo(() => getSubjectsForGrade(grade), [grade]);

  const subjectMatch = !!assessment;

  useEffect(() => {
    const assessed = assessmentStorage.getStudentsAssessed(teacherId, grade, subject, selectedTerm);
    const stored = localStorage.getItem(`zaroda_class_students_${teacherId}_${grade}`);
    const localStudents: LocalStudent[] = stored ? JSON.parse(stored) : [];
    const merged = new Map<string, LocalStudent>();
    localStudents.forEach(s => merged.set(s.id, s));
    assessed.forEach(s => merged.set(s.studentId, { id: s.studentId, name: s.studentName, admissionNo: s.admissionNo }));
    setStudents(Array.from(merged.values()));
  }, [teacherId, grade, subject, selectedTerm]);

  useEffect(() => {
    if (!selectedStudent || !assessment) return;
    const record = assessmentStorage.find(teacherId, selectedStudent.id, grade, subject, selectedTerm);
    if (record) {
      const scoreMap: Record<string, AssessmentScore> = {};
      record.scores.forEach(s => {
        scoreMap[`${s.strandNumber}-${s.subStrandName}`] = s;
      });
      setScores(scoreMap);
    } else {
      setScores({});
    }
  }, [selectedStudent, assessment, teacherId, grade, subject, selectedTerm]);

  const saveStudents = (list: LocalStudent[]) => {
    localStorage.setItem(`zaroda_class_students_${teacherId}_${grade}`, JSON.stringify(list));
    setStudents(list);
  };

  const addStudent = () => {
    const name = studentName.trim();
    const admNo = studentAdmNo.trim();
    if (!name || !admNo) {
      toast({ title: 'Missing Info', description: 'Please enter both student name and admission number.', variant: 'destructive' });
      return;
    }
    if (students.some(s => s.admissionNo === admNo)) {
      toast({ title: 'Duplicate', description: 'A student with this admission number already exists.', variant: 'destructive' });
      return;
    }
    const newStudent: LocalStudent = { id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, admissionNo: admNo };
    const updated = [...students, newStudent];
    saveStudents(updated);
    setStudentName('');
    setStudentAdmNo('');
    toast({ title: 'Student Added', description: `${name} has been added to your class list.` });
  };

  const selectStudent = (student: LocalStudent) => {
    setSelectedStudent(student);
    setActiveTab('assess');
  };

  const getScoreKey = (strandNumber: number, subStrandName: string) => `${strandNumber}-${subStrandName}`;

  const updateEEMEScore = (strandNumber: number, subStrandName: string, level: ScoreLevel) => {
    const key = getScoreKey(strandNumber, subStrandName);
    setScores(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        strandNumber,
        subStrandName,
        ee: level === 'EE',
        me: level === 'ME',
        ae: level === 'AE',
        be: level === 'BE',
      },
    }));
  };

  const updateCatScore = (strandNumber: number, subStrandName: string, field: 'cat1' | 'cat2' | 'endTerm', value: string) => {
    const key = getScoreKey(strandNumber, subStrandName);
    const numVal = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value) || 0));
    setScores(prev => {
      const existing = prev[key] || { strandNumber, subStrandName };
      const updated = { ...existing, [field]: numVal };
      if (updated.cat1 !== undefined && updated.cat2 !== undefined && updated.endTerm !== undefined) {
        updated.perfLevel = calcPerfLevel(updated.cat1, updated.cat2, updated.endTerm);
      }
      return { ...prev, [key]: updated };
    });
  };

  const updateComment = (strandNumber: number, subStrandName: string, comment: string) => {
    const key = getScoreKey(strandNumber, subStrandName);
    setScores(prev => ({
      ...prev,
      [key]: { ...prev[key], strandNumber, subStrandName, comment },
    }));
  };

  const saveAssessment = () => {
    if (!selectedStudent || !assessment) return;
    setSaving(true);
    try {
      const scoreList: AssessmentScore[] = Object.values(scores).filter(
        s => s.strandNumber !== undefined && s.subStrandName
      );
      assessmentStorage.upsert({
        teacherId,
        teacherName,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        admissionNo: selectedStudent.admissionNo,
        grade,
        subject,
        term: selectedTerm,
        schoolCode,
        scores: scoreList,
      });
      toast({ title: 'Saved!', description: `Assessment for ${selectedStudent.name} has been saved successfully.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to save assessment. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedScoreLevel = (strandNumber: number, subStrandName: string): ScoreLevel | '' => {
    const key = getScoreKey(strandNumber, subStrandName);
    const s = scores[key];
    if (!s) return '';
    if (s.ee) return 'EE';
    if (s.me) return 'ME';
    if (s.ae) return 'AE';
    if (s.be) return 'BE';
    return '';
  };

  const assessedStudents = useMemo(() => {
    return assessmentStorage.getStudentsAssessed(teacherId, grade, subject, selectedTerm);
  }, [teacherId, grade, subject, selectedTerm, saving]);

  const getSummaryData = () => {
    return assessedStudents.map(s => {
      const record = assessmentStorage.find(teacherId, s.studentId, grade, subject, selectedTerm);
      const level = record && assessment ? getOverallLevel(record.scores, assessment.scoringType) : 'BE';
      return { ...s, level };
    });
  };

  if (!subjectMatch) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="glass-card rounded-2xl border-yellow-300/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle size={24} />
              Subject Not Found
            </CardTitle>
            <CardDescription>
              No assessment framework found for <strong>{subject}</strong> in <strong>{grade}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The assessment framework may use a different subject name. Available subjects for {grade}:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map(s => (
                <Badge key={s} variant="outline" className="text-sm py-1 px-3">
                  {s}
                </Badge>
              ))}
            </div>
            {availableSubjects.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No subjects are configured for this grade yet.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="glass-card rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen size={22} className="text-primary" />
                Assessment Book
              </CardTitle>
              <CardDescription className="mt-1">
                <span className="font-medium">{grade}</span> &bull; <span className="font-medium">{subject}</span> &bull;{' '}
                <Badge variant="secondary" className="text-xs">{assessment?.scoringType === 'cat_endterm' ? 'CAT & End Term' : 'EE/ME/AE/BE'}</Badge>
              </CardDescription>
            </div>
            <Select value={String(selectedTerm)} onValueChange={v => { setSelectedTerm(Number(v)); setSelectedStudent(null); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Term 1</SelectItem>
                <SelectItem value="2">Term 2</SelectItem>
                <SelectItem value="3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="assess" className="flex-1 sm:flex-none">
            <ClipboardList size={16} className="mr-1.5" />
            Assess
          </TabsTrigger>
          <TabsTrigger value="students" className="flex-1 sm:flex-none">
            <Users size={16} className="mr-1.5" />
            Students
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex-1 sm:flex-none">
            <GraduationCap size={16} className="mr-1.5" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus size={20} />
                  Add Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Student Full Name"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Admission No."
                    value={studentAdmNo}
                    onChange={e => setStudentAdmNo(e.target.value)}
                    className="sm:w-48"
                  />
                  <Button onClick={addStudent} className="sm:w-auto">
                    <UserPlus size={16} className="mr-1.5" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Class List ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No students added yet. Add students above to begin assessments.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {students.map(student => {
                        const isAssessed = assessedStudents.some(a => a.studentId === student.id);
                        return (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedStudent?.id === student.id ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                            onClick={() => selectStudent(student)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAssessed && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle2 size={12} className="mr-1" />
                                  Assessed
                                </Badge>
                              )}
                              <ChevronRight size={16} className="text-muted-foreground" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="assess">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {!selectedStudent ? (
              <Card className="glass-card rounded-2xl">
                <CardContent className="py-12 text-center">
                  <Users size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">
                    Select a student from the <strong>Students</strong> tab to begin assessment.
                  </p>
                </CardContent>
              </Card>
            ) : !assessment || assessment.strands.length === 0 ? (
              <Card className="glass-card rounded-2xl">
                <CardContent className="py-12 text-center">
                  <AlertCircle size={48} className="mx-auto text-yellow-500/60 mb-4" />
                  <p className="text-muted-foreground">
                    No assessment strands defined for Term {selectedTerm}. Please select a different term or contact admin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Assessing: {selectedStudent.name}
                        </CardTitle>
                        <CardDescription>{selectedStudent.admissionNo} &bull; Term {selectedTerm}</CardDescription>
                      </div>
                      <Button onClick={saveAssessment} disabled={saving}>
                        <Save size={16} className="mr-1.5" />
                        {saving ? 'Saving...' : 'Save Assessment'}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {assessment.strands.map(strand => (
                  <Card key={strand.number} className="glass-card rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Strand {strand.number}: {strand.theme}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strand.subStrands.map((subStrand, idx) => {
                          const key = getScoreKey(strand.number, subStrand.name);
                          const currentScore = scores[key];
                          return (
                            <motion.div
                              key={`${strand.number}-${idx}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div>
                                <p className="font-medium text-sm">{subStrand.name}</p>
                                {subStrand.details && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {subStrand.details.join(' • ')}
                                  </p>
                                )}
                              </div>

                              {assessment.scoringType === 'ee_me_ae_be' ? (
                                <div className="flex flex-wrap gap-2">
                                  {(['EE', 'ME', 'AE', 'BE'] as ScoreLevel[]).map(level => {
                                    const selected = getSelectedScoreLevel(strand.number, subStrand.name) === level;
                                    return (
                                      <button
                                        key={level}
                                        onClick={() => updateEEMEScore(strand.number, subStrand.name, level)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                                          selected
                                            ? SCORE_COLORS[level]
                                            : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted'
                                        }`}
                                        title={SCORE_LABELS[level]}
                                      >
                                        {level}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">CAT 1</label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      placeholder="0-100"
                                      value={currentScore?.cat1 ?? ''}
                                      onChange={e => updateCatScore(strand.number, subStrand.name, 'cat1', e.target.value)}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">CAT 2</label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      placeholder="0-100"
                                      value={currentScore?.cat2 ?? ''}
                                      onChange={e => updateCatScore(strand.number, subStrand.name, 'cat2', e.target.value)}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">End Term</label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      placeholder="0-100"
                                      value={currentScore?.endTerm ?? ''}
                                      onChange={e => updateCatScore(strand.number, subStrand.name, 'endTerm', e.target.value)}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Performance</label>
                                    <div className={`h-9 flex items-center justify-center rounded-md text-xs font-semibold border ${
                                      currentScore?.perfLevel ? SCORE_COLORS[currentScore.perfLevel as ScoreLevel] : 'bg-muted/30 text-muted-foreground border-border'
                                    }`}>
                                      {currentScore?.perfLevel || '—'}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <Input
                                placeholder="Optional comment..."
                                value={currentScore?.comment ?? ''}
                                onChange={e => updateComment(strand.number, subStrand.name, e.target.value)}
                                className="h-8 text-xs"
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end">
                  <Button onClick={saveAssessment} disabled={saving} size="lg">
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Assessment'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="summary">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap size={20} />
                  Assessment Summary — Term {selectedTerm}
                </CardTitle>
                <CardDescription>
                  {assessedStudents.length} student{assessedStudents.length !== 1 ? 's' : ''} assessed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessedStudents.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No assessments recorded for Term {selectedTerm} yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold">#</th>
                          <th className="text-left py-3 px-2 font-semibold">Student Name</th>
                          <th className="text-left py-3 px-2 font-semibold">Admission No.</th>
                          <th className="text-center py-3 px-2 font-semibold">Overall Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSummaryData().map((student, index) => (
                          <motion.tr
                            key={student.studentId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                            onClick={() => {
                              const found = students.find(s => s.id === student.studentId);
                              if (found) selectStudent(found);
                            }}
                          >
                            <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                            <td className="py-3 px-2 font-medium">{student.studentName}</td>
                            <td className="py-3 px-2 text-muted-foreground">{student.admissionNo}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${SCORE_COLORS[student.level]}`}>
                                {student.level} — {SCORE_LABELS[student.level]}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AssessmentBook;
