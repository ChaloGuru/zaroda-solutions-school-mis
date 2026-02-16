import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Printer, Download, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { hoiStudentsStorage, hoiSubjectAssignmentsStorage, HoiStudent, HoiSubjectAssignment } from '@/lib/hoiStorage';
import { assessmentStorage, AssessmentRecord } from '@/lib/storage';
import { exportToPdf } from '@/lib/pdfExport';

interface ClassReportsProps {
  classId: string;
  className: string;
  streamId: string;
  streamName: string;
}

interface StudentSubjectScore {
  studentId: string;
  studentName: string;
  admissionNo: string;
  subjects: Record<string, { total: number; count: number; avg: number }>;
  overallAvg: number;
  rank: number;
}

export default function ClassReports({ classId, className, streamId, streamName }: ClassReportsProps) {
  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const subjectReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = hoiStudentsStorage.getAll().filter(s => s.class_id === classId && s.stream_id === streamId && s.status === 'active');
    setStudents(s);
    setAssignments(hoiSubjectAssignmentsStorage.getAll().filter(a => a.class_id === classId && a.stream_id === streamId));
    setAssessments(assessmentStorage.getAll());
  }, [classId, streamId]);

  const subjectNames = [...new Set(assignments.map(a => a.subject_name))];

  const getScoreValue = (scores: any[]): number => {
    if (!scores || scores.length === 0) return 0;
    const numericScores = scores.filter(s => typeof s.score === 'number');
    if (numericScores.length > 0) {
      return numericScores.reduce((sum, s) => sum + s.score, 0) / numericScores.length;
    }
    const gradeMap: Record<string, number> = { 'EE': 4, 'ME': 3, 'AE': 2, 'BE': 1 };
    const gradedScores = scores.filter(s => typeof s.score === 'string' && gradeMap[s.score]);
    if (gradedScores.length > 0) {
      return (gradedScores.reduce((sum, s) => sum + (gradeMap[s.score] || 0), 0) / gradedScores.length) * 25;
    }
    return 0;
  };

  const studentScores: StudentSubjectScore[] = students.map(student => {
    const subjects: Record<string, { total: number; count: number; avg: number }> = {};
    let totalScore = 0;
    let totalSubjects = 0;

    subjectNames.forEach(subj => {
      const records = assessments.filter(r =>
        (r.studentId === student.id || r.admissionNo === student.admission_no) &&
        r.subject === subj &&
        r.term === parseInt(selectedTerm)
      );
      if (records.length > 0) {
        const scores = records.flatMap(r => r.scores || []);
        const avg = getScoreValue(scores);
        subjects[subj] = { total: avg, count: records.length, avg };
        totalScore += avg;
        totalSubjects++;
      } else {
        subjects[subj] = { total: 0, count: 0, avg: 0 };
      }
    });

    return {
      studentId: student.id,
      studentName: student.full_name,
      admissionNo: student.admission_no,
      subjects,
      overallAvg: totalSubjects > 0 ? totalScore / totalSubjects : 0,
      rank: 0,
    };
  });

  const ranked = [...studentScores]
    .sort((a, b) => b.overallAvg - a.overallAvg)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  const filteredRanked = ranked.filter(s =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subjectAverages = subjectNames.map(subj => {
    const scores = ranked.map(s => s.subjects[subj]?.avg || 0).filter(v => v > 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;
    return { subject: subj, average: avg, highest, lowest, assessed: scores.length, total: students.length };
  });

  const classAverage = ranked.length > 0 ? ranked.reduce((sum, s) => sum + s.overallAvg, 0) / ranked.length : 0;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Reports</h1>
          <p className="text-gray-500 text-sm mt-1">{className} - {streamName} | Class Average: <span className="font-bold text-primary">{classAverage.toFixed(1)}%</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Term 1</SelectItem>
              <SelectItem value="2">Term 2</SelectItem>
              <SelectItem value="3">Term 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overall">
        <TabsList className="mb-6">
          <TabsTrigger value="overall" className="gap-2"><BarChart3 className="w-4 h-4" />Overall Results</TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2"><FileText className="w-4 h-4" />Subject Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Student Results - Term {selectedTerm}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-40" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-1" />Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => reportRef.current && exportToPdf(reportRef.current, `${className}_${streamName}_Term${selectedTerm}_Results`)}>
                    <Download className="w-4 h-4 mr-1" />PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={reportRef}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-gray-100 font-bold w-12">Rank</TableHead>
                        <TableHead className="bg-gray-100 font-bold">Adm No.</TableHead>
                        <TableHead className="bg-gray-100 font-bold">Student Name</TableHead>
                        {subjectNames.map(subj => (
                          <TableHead key={subj} className="bg-gray-100 font-bold text-center text-xs min-w-[60px]">{subj.length > 8 ? subj.slice(0, 8) + '.' : subj}</TableHead>
                        ))}
                        <TableHead className="bg-primary/10 font-bold text-center">Avg</TableHead>
                        <TableHead className="bg-primary/10 font-bold text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRanked.length === 0 ? (
                        <TableRow><TableCell colSpan={subjectNames.length + 5} className="text-center text-gray-500 py-8">No assessment data available for Term {selectedTerm}.</TableCell></TableRow>
                      ) : filteredRanked.map(s => (
                        <TableRow key={s.studentId}>
                          <TableCell className="font-bold text-center">
                            {s.rank <= 3 ? (
                              <Badge className={s.rank === 1 ? 'bg-yellow-500' : s.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'}>{s.rank}</Badge>
                            ) : s.rank}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                          <TableCell className="font-medium text-sm">{s.studentName}</TableCell>
                          {subjectNames.map(subj => {
                            const score = s.subjects[subj]?.avg || 0;
                            return (
                              <TableCell key={subj} className={`text-center text-sm ${score === 0 ? 'text-gray-300' : score >= 70 ? 'text-green-700 font-semibold' : score >= 50 ? 'text-blue-700' : score >= 30 ? 'text-amber-700' : 'text-red-700'}`}>
                                {score === 0 ? '—' : score.toFixed(0)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-bold text-primary">{s.overallAvg > 0 ? s.overallAvg.toFixed(1) : '—'}</TableCell>
                          <TableCell className="text-center">
                            {s.overallAvg >= 80 ? <Badge className="bg-green-600">A</Badge> :
                             s.overallAvg >= 60 ? <Badge className="bg-blue-600">B</Badge> :
                             s.overallAvg >= 40 ? <Badge className="bg-amber-600">C</Badge> :
                             s.overallAvg > 0 ? <Badge className="bg-red-600">D</Badge> :
                             <span className="text-gray-300">—</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Subject Performance Analysis - Term {selectedTerm}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => subjectReportRef.current && exportToPdf(subjectReportRef.current, `${className}_${streamName}_Subject_Analysis`)}>
                  <Download className="w-4 h-4 mr-1" />PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={subjectReportRef}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Subject</TableHead>
                      <TableHead className="text-center font-bold">Assessed</TableHead>
                      <TableHead className="text-center font-bold">Average</TableHead>
                      <TableHead className="text-center font-bold">Highest</TableHead>
                      <TableHead className="text-center font-bold">Lowest</TableHead>
                      <TableHead className="text-center font-bold">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectAverages.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No subjects assigned to this class.</TableCell></TableRow>
                    ) : subjectAverages.map(s => (
                      <TableRow key={s.subject}>
                        <TableCell className="font-medium">{s.subject}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{s.assessed}/{s.total}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${s.average >= 70 ? 'text-green-700' : s.average >= 50 ? 'text-blue-700' : s.average >= 30 ? 'text-amber-700' : s.average > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                            {s.average > 0 ? s.average.toFixed(1) + '%' : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-green-600 font-semibold">{s.highest > 0 ? s.highest.toFixed(0) : '—'}</TableCell>
                        <TableCell className="text-center text-red-600 font-semibold">{s.lowest > 0 ? s.lowest.toFixed(0) : '—'}</TableCell>
                        <TableCell className="text-center">
                          {s.average >= 60 ? <TrendingUp className="w-4 h-4 text-green-600 mx-auto" /> :
                           s.average >= 40 ? <Minus className="w-4 h-4 text-amber-600 mx-auto" /> :
                           s.average > 0 ? <TrendingDown className="w-4 h-4 text-red-600 mx-auto" /> :
                           <Minus className="w-4 h-4 text-gray-300 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
