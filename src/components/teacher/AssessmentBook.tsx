import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  getSubjectsForGrade,
  getAssessmentForGradeSubjectTerm,
} from '@/lib/assessmentData';
import {
  assessmentStorage,
  type AssessmentScore,
  type AssessmentRecord,
} from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportCard from '@/components/teacher/ReportCard';
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
  Eye,
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

type ActivityType =
  | 'formative_assessment'
  | 'summative_assessment'
  | 'project'
  | 'practical'
  | 'observation'
  | 'oral_assessment'
  | 'portfolio';

const SCORE_LABELS: Record<ScoreLevel, string> = {
  EE: 'Exceeding Expectations',
  ME: 'Meeting Expectations',
  AE: 'Approaching Expectations',
  BE: 'Below Expectations',
};

const SCORE_COLORS: Record<ScoreLevel, string> = {
  EE: 'bg-green-100 text-green-800 border-green-300',
  ME: 'bg-blue-100 text-blue-800 border-blue-300',
  AE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  BE: 'bg-red-100 text-red-800 border-red-300',
};

const ACTIVITY_TYPES: Array<{ value: ActivityType; label: string }> = [
  { value: 'formative_assessment', label: 'Formative Assessment' },
  { value: 'summative_assessment', label: 'Summative Assessment' },
  { value: 'project', label: 'Project' },
  { value: 'practical', label: 'Practical' },
  { value: 'observation', label: 'Observation' },
  { value: 'oral_assessment', label: 'Oral Assessment' },
  { value: 'portfolio', label: 'Portfolio' },
];

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  formative_assessment: 'Formative Assessment',
  summative_assessment: 'Summative Assessment',
  project: 'Project',
  practical: 'Practical',
  observation: 'Observation',
  oral_assessment: 'Oral Assessment',
  portfolio: 'Portfolio',
};

const LEVELS: ScoreLevel[] = ['EE', 'ME', 'AE', 'BE'];

const normalizeLevel = (value?: string): ScoreLevel | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  return LEVELS.includes(upper as ScoreLevel) ? (upper as ScoreLevel) : undefined;
};

function getScoreLevel(score: AssessmentScore): ScoreLevel | undefined {
  const fromPerf = normalizeLevel(score.perfLevel);
  if (fromPerf) return fromPerf;
  if (score.ee) return 'EE';
  if (score.me) return 'ME';
  if (score.ae) return 'AE';
  if (score.be) return 'BE';
  return undefined;
}

function getOverallLevel(scores: AssessmentScore[]): ScoreLevel {
  if (scores.length === 0) return 'BE';
  const counts: Record<ScoreLevel, number> = { EE: 0, ME: 0, AE: 0, BE: 0 };
  scores.forEach((score) => {
    const level = getScoreLevel(score);
    if (level) counts[level] += 1;
  });
  const max = Math.max(counts.EE, counts.ME, counts.AE, counts.BE);
  if (max === 0) return 'BE';
  if (counts.EE === max) return 'EE';
  if (counts.ME === max) return 'ME';
  if (counts.AE === max) return 'AE';
  return 'BE';
}

type CompetencyChoice = 'yes' | 'not_yet';

const competencyChoiceToBoolean = (choice: CompetencyChoice): boolean => {
  return choice === 'yes';
};

const booleanToCompetencyChoice = (value?: boolean): CompetencyChoice => {
  if (value === true) return 'yes';
  return 'not_yet';
};

const AssessmentBook = ({ teacherId, teacherName, grade, subject, schoolCode }: AssessmentBookProps) => {
  const { toast } = useToast();
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('assess');
  const [selectedStudent, setSelectedStudent] = useState<LocalStudent | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentAdmNo, setStudentAdmNo] = useState('');
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [scores, setScores] = useState<Record<string, AssessmentScore>>({});
  const [activityType, setActivityType] = useState<ActivityType>('formative_assessment');
  const [teacherComment, setTeacherComment] = useState('');
  const [competencyChoice, setCompetencyChoice] = useState<CompetencyChoice>('not_yet');
  const [assessmentRecords, setAssessmentRecords] = useState<AssessmentRecord[]>([]);
  const [assessedStudents, setAssessedStudents] = useState<{ studentId: string; studentName: string; admissionNo: string }[]>([]);
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const assessment = useMemo(
    () => getAssessmentForGradeSubjectTerm(grade, subject, selectedTerm),
    [grade, subject, selectedTerm]
  );

  const availableSubjects = useMemo(() => getSubjectsForGrade(grade), [grade]);
  const subjectMatch = !!assessment;
  const classStudentsMetaKey = useMemo(() => `class_students_${teacherId}_${grade}`, [teacherId, grade]);

  const loadData = useCallback(async () => {
    const [records, userRes] = await Promise.all([
      assessmentStorage.getByTeacher(teacherId),
      supabase.auth.getUser(),
    ]);

    const filteredRecords = records.filter(
      (record) => record.grade === grade && record.subject === subject && record.term === selectedTerm
    );

    const recordStudents = filteredRecords.map((record) => ({
      studentId: record.studentId,
      studentName: record.studentName,
      admissionNo: record.admissionNo,
    }));

    const uniqueAssessed = Array.from(
      new Map(recordStudents.map((student) => [student.studentId, student])).values()
    );

    let metadataStudents: LocalStudent[] = [];
    try {
      const raw = userRes.data.user?.user_metadata?.[classStudentsMetaKey];
      if (Array.isArray(raw)) {
        metadataStudents = raw as LocalStudent[];
      }
    } catch {
      metadataStudents = [];
    }

    const merged = new Map<string, LocalStudent>();
    metadataStudents.forEach((student) => merged.set(student.id, student));
    uniqueAssessed.forEach((student) => {
      merged.set(student.studentId, {
        id: student.studentId,
        name: student.studentName,
        admissionNo: student.admissionNo,
      });
    });

    setAssessmentRecords(filteredRecords);
    setAssessedStudents(uniqueAssessed);
    setStudents(Array.from(merged.values()));
  }, [teacherId, grade, subject, selectedTerm, classStudentsMetaKey]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  useEffect(() => {
    if (!selectedStudent) return;
    const record = assessmentRecords.find((item) => item.studentId === selectedStudent.id);
    if (!record) {
      setScores({});
      setActivityType('formative_assessment');
      setTeacherComment('');
      setCompetencyChoice('not_yet');
      return;
    }

    const scoreMap: Record<string, AssessmentScore> = {};
    record.scores.forEach((score) => {
      scoreMap[`${score.strandNumber}-${score.subStrandName}`] = score;
    });
    setScores(scoreMap);

    const normalizedActivity = (record.activityType || 'formative_assessment') as ActivityType;
    setActivityType(normalizedActivity);
    setTeacherComment(record.teacherComment || '');
    setCompetencyChoice(booleanToCompetencyChoice(record.competencyAchieved));
  }, [selectedStudent, assessmentRecords]);

  const saveStudents = async (list: LocalStudent[]) => {
    try {
      const { data } = await supabase.auth.getUser();
      const metadata = data.user?.user_metadata || {};
      const { error } = await supabase.auth.updateUser({
        data: {
          ...metadata,
          [classStudentsMetaKey]: list,
        },
      });
      if (error) {
        toast({ title: 'Error', description: error.message || 'Failed to persist class list', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to persist class list', variant: 'destructive' });
    }
    setStudents(list);
  };

  const addStudent = () => {
    const name = studentName.trim();
    const admNo = studentAdmNo.trim();
    if (!name || !admNo) {
      toast({ title: 'Missing Info', description: 'Please enter both student name and admission number.', variant: 'destructive' });
      return;
    }
    if (students.some((student) => student.admissionNo === admNo)) {
      toast({ title: 'Duplicate', description: 'A student with this admission number already exists.', variant: 'destructive' });
      return;
    }
    const newStudent: LocalStudent = {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      admissionNo: admNo,
    };
    const updated = [...students, newStudent];
    void saveStudents(updated);
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
    setScores((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        strandNumber,
        subStrandName,
        perfLevel: level,
        ee: level === 'EE',
        me: level === 'ME',
        ae: level === 'AE',
        be: level === 'BE',
      },
    }));
  };

  const updateComment = (strandNumber: number, subStrandName: string, comment: string) => {
    const key = getScoreKey(strandNumber, subStrandName);
    setScores((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        strandNumber,
        subStrandName,
        comment,
      },
    }));
  };

  const saveAssessment = async () => {
    if (!selectedStudent || !assessment) return;
    setSaving(true);
    try {
      const scoreList: AssessmentScore[] = Object.values(scores).filter(
        (score) => score.strandNumber !== undefined && score.subStrandName
      );

      const overallLevel = getOverallLevel(scoreList);

      await assessmentStorage.upsert({
        teacherId,
        teacherName,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        admissionNo: selectedStudent.admissionNo,
        grade,
        subject,
        term: selectedTerm,
        schoolCode,
        activityType,
        performanceLevel: overallLevel,
        competencyAchieved: competencyChoiceToBoolean(competencyChoice),
        teacherComment: teacherComment.trim() || undefined,
        scores: scoreList,
      });

      toast({ title: 'Saved!', description: `Assessment for ${selectedStudent.name} has been saved successfully.` });
      setRefreshKey((prev) => prev + 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to save assessment. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedScoreLevel = (strandNumber: number, subStrandName: string): ScoreLevel | '' => {
    const key = getScoreKey(strandNumber, subStrandName);
    const score = scores[key];
    if (!score) return '';
    return getScoreLevel(score) || '';
  };

  const summaryData = useMemo(() => {
    return assessedStudents.map((student) => {
      const record = assessmentRecords.find((item) => item.studentId === student.studentId);
      const level = (record?.performanceLevel as ScoreLevel) || getOverallLevel(record?.scores || []);
      const activityLabel = record?.activityType
        ? ACTIVITY_TYPE_LABELS[record.activityType as ActivityType] || '—'
        : '—';
      return {
        ...student,
        level,
        activityLabel,
      };
    });
  }, [assessedStudents, assessmentRecords]);

  if (!subjectMatch) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="glass-card rounded-2xl border-yellow-300/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle size={24} />
              Learning Area Not Found
            </CardTitle>
            <CardDescription>
              No assessment framework found for <strong>{subject}</strong> in <strong>{grade}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The assessment framework may use a different learning area name. Available learning areas for {grade}:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map((subjectName) => (
                <Badge key={subjectName} variant="outline" className="text-sm py-1 px-3">
                  {subjectName}
                </Badge>
              ))}
            </div>
            {availableSubjects.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No learning areas are configured for this grade yet.</p>
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
                <Badge variant="secondary" className="text-xs">CBC Performance Levels (EE/ME/AE/BE)</Badge>
              </CardDescription>
            </div>
            <Select value={String(selectedTerm)} onValueChange={(value) => { setSelectedTerm(Number(value)); setSelectedStudent(null); }}>
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
                    onChange={(event) => setStudentName(event.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Admission No."
                    value={studentAdmNo}
                    onChange={(event) => setStudentAdmNo(event.target.value)}
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
                      {students.map((student) => {
                        const isAssessed = assessedStudents.some((item) => item.studentId === student.id);
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
                        <CardTitle className="text-lg">Assessing: {selectedStudent.name}</CardTitle>
                        <CardDescription>{selectedStudent.admissionNo} &bull; Term {selectedTerm}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReportCardStudentId(selectedStudent.id);
                            setReportCardOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Eye size={14} />
                          View Report Card
                        </Button>
                        <Button onClick={() => void saveAssessment()} disabled={saving}>
                          <Save size={16} className="mr-1.5" />
                          {saving ? 'Saving...' : 'Save Assessment'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Activity Type</label>
                        <Select value={activityType} onValueChange={(value) => setActivityType(value as ActivityType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIVITY_TYPES.map((item) => (
                              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Competency Status</label>
                        <Select value={competencyChoice} onValueChange={(value) => setCompetencyChoice(value as CompetencyChoice)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select competency status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">✅ Yes - Competency Achieved</SelectItem>
                            <SelectItem value="not_yet">❌ Not Yet - Still Developing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium">Teacher Comment</label>
                      <Textarea
                        rows={3}
                        placeholder="Enter teacher comment"
                        value={teacherComment}
                        onChange={(event) => setTeacherComment(event.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {assessment.strands.map((strand) => (
                  <Card key={strand.number} className="glass-card rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Strand {strand.number}: {strand.theme}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strand.subStrands.map((subStrand, index) => {
                          const key = getScoreKey(strand.number, subStrand.name);
                          const currentScore = scores[key];
                          const selectedLevel = getSelectedScoreLevel(strand.number, subStrand.name);

                          return (
                            <motion.div
                              key={`${strand.number}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div>
                                <p className="font-medium text-sm">{subStrand.name}</p>
                                {subStrand.details && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{subStrand.details.join(' • ')}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-3 items-center">
                                <Select
                                  value={selectedLevel}
                                  onValueChange={(value) => updateEEMEScore(strand.number, subStrand.name, value as ScoreLevel)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select Performance Level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {LEVELS.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {level} — {SCORE_LABELS[level]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <div>
                                  {selectedLevel ? (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${SCORE_COLORS[selectedLevel]}`}>
                                      {selectedLevel} — {SCORE_LABELS[selectedLevel]}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No level selected</span>
                                  )}
                                </div>
                              </div>

                              <Input
                                placeholder="Optional strand comment..."
                                value={currentScore?.comment ?? ''}
                                onChange={(event) => updateComment(strand.number, subStrand.name, event.target.value)}
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
                  <Button onClick={() => void saveAssessment()} disabled={saving} size="lg">
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
                  <p className="text-muted-foreground text-sm text-center py-8">No assessments recorded for Term {selectedTerm} yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold">#</th>
                          <th className="text-left py-3 px-2 font-semibold">Student Name</th>
                          <th className="text-left py-3 px-2 font-semibold">Admission No.</th>
                          <th className="text-left py-3 px-2 font-semibold">Activity Type</th>
                          <th className="text-center py-3 px-2 font-semibold">Overall Level</th>
                          <th className="text-center py-3 px-2 font-semibold">Report Card</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryData.map((student, index) => (
                          <motion.tr
                            key={student.studentId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                            onClick={() => {
                              const found = students.find((item) => item.id === student.studentId);
                              if (found) selectStudent(found);
                            }}
                          >
                            <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                            <td className="py-3 px-2 font-medium">{student.studentName}</td>
                            <td className="py-3 px-2 text-muted-foreground">{student.admissionNo}</td>
                            <td className="py-3 px-2 text-muted-foreground">{student.activityLabel}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${SCORE_COLORS[student.level]}`}>
                                {student.level} — {SCORE_LABELS[student.level]}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setReportCardStudentId(student.studentId);
                                  setReportCardOpen(true);
                                }}
                              >
                                <Eye size={14} />
                                View Report Card
                              </Button>
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

      <Dialog open={reportCardOpen} onOpenChange={setReportCardOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Report Card</DialogTitle>
          </DialogHeader>
          {reportCardStudentId && <ReportCard studentId={reportCardStudentId} term={selectedTerm} />}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AssessmentBook;