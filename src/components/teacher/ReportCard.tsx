import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Printer } from 'lucide-react';

type PerformanceLevel = 'EE' | 'ME' | 'AE' | 'BE';

interface HoiStudentRow {
  id: string;
  full_name: string;
  admission_no: string;
  class_name: string;
  stream_name: string;
  gender: string;
}

interface AssessmentRow {
  id: string;
  subject: string;
  activity_type?: string | null;
  performance_level?: PerformanceLevel | null;
  teacher_comment?: string | null;
  competency_achieved?: boolean | null;
  school_code?: string | null;
  term: number;
  created_at: string;
}

interface ReportCardProps {
  studentId: string;
  term: number;
}

const LEVEL_META: Record<PerformanceLevel, { label: string; className: string }> = {
  EE: { label: 'Exceeding Expectations', className: 'bg-green-100 text-green-800 border-green-300' },
  ME: { label: 'Meeting Expectations', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  AE: { label: 'Approaching Expectations', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  BE: { label: 'Below Expectations', className: 'bg-red-100 text-red-800 border-red-300' },
};

const formatActivityType = (value?: string | null) => {
  if (!value) return '—';
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getOverallLevel = (counts: Record<PerformanceLevel, number>): PerformanceLevel => {
  const max = Math.max(counts.EE, counts.ME, counts.AE, counts.BE);
  if (max === counts.EE) return 'EE';
  if (max === counts.ME) return 'ME';
  if (max === counts.AE) return 'AE';
  return 'BE';
};

export default function ReportCard({ studentId, term }: ReportCardProps) {
  const [student, setStudent] = useState<HoiStudentRow | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [daysPresent, setDaysPresent] = useState<number>(0);
  const [daysAbsent, setDaysAbsent] = useState<number>(0);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      const [studentRes, assessmentsRes] = await Promise.all([
        supabase.from('hoi_students').select('id, full_name, admission_no, class_name, stream_name, gender').eq('id', studentId).maybeSingle(),
        supabase
          .from('assessments')
          .select('id, subject, activity_type, performance_level, teacher_comment, competency_achieved, school_code, term, created_at')
          .eq('student_id', studentId)
          .eq('term', term)
          .order('subject', { ascending: true }),
      ]);

      if (studentRes.data) {
        setStudent(studentRes.data as HoiStudentRow);
      } else {
        setStudent(null);
      }

      const rows = (assessmentsRes.data || []) as AssessmentRow[];
      setAssessments(rows);
      setTeacherRemarks(rows[0]?.teacher_comment || '');
      setLoading(false);
    };

    void loadReportData();
  }, [studentId, term]);

  const levelCounts = useMemo(() => {
    const counts: Record<PerformanceLevel, number> = { EE: 0, ME: 0, AE: 0, BE: 0 };
    assessments.forEach((item) => {
      const level = item.performance_level;
      if (level && counts[level] !== undefined) {
        counts[level] += 1;
      }
    });
    return counts;
  }, [assessments]);

  const overallLevel = useMemo(() => getOverallLevel(levelCounts), [levelCounts]);
  const reportDate = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
  const academicYear = new Date().getFullYear().toString();
  const schoolName = assessments[0]?.school_code ? `School (${assessments[0].school_code})` : 'School Name';

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading report card...</p>
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Student not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="report-card-wrapper bg-white rounded-lg border border-border p-4 md:p-6 print:p-0 print:border-0 print:rounded-none">
      <style>{`
        @media print {
          .report-card-wrapper {
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
          }
          .report-card-table th,
          .report-card-table td {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="print:hidden flex justify-end mb-4">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          🖨️ Print Report Card
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold">{schoolName}</h2>
              <p className="text-xs md:text-sm opacity-90">COMPETENCY BASED CURRICULUM REPORT CARD</p>
            </div>
            <div className="w-16 h-16 border border-primary-foreground/60 rounded bg-primary-foreground/10 flex items-center justify-center text-[10px] text-center leading-tight px-1">
              School Logo
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm border-b">
          <p><span className="font-semibold">Student:</span> {student.full_name}</p>
          <p><span className="font-semibold">Admission No:</span> {student.admission_no}</p>
          <p><span className="font-semibold">Class:</span> {student.class_name}</p>
          <p><span className="font-semibold">Stream:</span> {student.stream_name}</p>
          <p><span className="font-semibold">Gender:</span> {student.gender}</p>
          <p><span className="font-semibold">Academic Year:</span> {academicYear}</p>
          <p><span className="font-semibold">Term:</span> {term}</p>
          <p><span className="font-semibold">Date of Report:</span> {reportDate}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="report-card-table w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b">
                <th className="text-left p-3 font-semibold">Subject/Learning Area</th>
                <th className="text-left p-3 font-semibold">Activity Type</th>
                <th className="text-left p-3 font-semibold">Performance Level</th>
                <th className="text-left p-3 font-semibold">Teacher Comment</th>
                <th className="text-left p-3 font-semibold">Competency Achieved</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={5}>No assessments found</td>
                </tr>
              ) : (
                assessments.map((item) => {
                  const level = item.performance_level || 'BE';
                  return (
                    <tr key={item.id} className="border-b align-top">
                      <td className="p-3">{item.subject}</td>
                      <td className="p-3">{formatActivityType(item.activity_type)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={LEVEL_META[level].className}>
                          {level} = {LEVEL_META[level].label}
                        </Badge>
                      </td>
                      <td className="p-3">{item.teacher_comment || '—'}</td>
                      <td className="p-3">{item.competency_achieved ? '✅ Yes' : '❌ Not Yet'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="border rounded p-2"><span className="font-semibold">EE:</span> {levelCounts.EE}</div>
            <div className="border rounded p-2"><span className="font-semibold">ME:</span> {levelCounts.ME}</div>
            <div className="border rounded p-2"><span className="font-semibold">AE:</span> {levelCounts.AE}</div>
            <div className="border rounded p-2"><span className="font-semibold">BE:</span> {levelCounts.BE}</div>
            <div className="border rounded p-2 md:col-span-1 col-span-2">
              <span className="font-semibold">Overall:</span>{' '}
              <span>{overallLevel} ({LEVEL_META[overallLevel].label})</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Class Teacher Remarks</p>
            <Textarea
              value={teacherRemarks}
              onChange={(event) => setTeacherRemarks(event.target.value)}
              rows={3}
              placeholder="Enter class teacher remarks"
              className="print:border-0 print:p-0 print:min-h-[56px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="border rounded p-2">
              <span className="font-semibold">Days Present:</span>{' '}
              <input
                type="number"
                min={0}
                className="w-20 ml-2 border rounded px-1 py-0.5 print:border-0"
                value={daysPresent}
                onChange={(event) => setDaysPresent(Number(event.target.value) || 0)}
              />
            </div>
            <div className="border rounded p-2">
              <span className="font-semibold">Days Absent:</span>{' '}
              <input
                type="number"
                min={0}
                className="w-20 ml-2 border rounded px-1 py-0.5 print:border-0"
                value={daysAbsent}
                onChange={(event) => setDaysAbsent(Number(event.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-6">Class Teacher Signature</p>
              <div className="border-b border-foreground/40" />
            </div>
            <div>
              <p className="font-semibold mb-6">HOI Signature</p>
              <div className="border-b border-foreground/40" />
            </div>
            <div>
              <p className="font-semibold mb-6">Parent Signature</p>
              <div className="border-b border-foreground/40" />
            </div>
            <div>
              <p className="font-semibold mb-2">School Stamp</p>
              <div className="h-16 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">Stamp Area</div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">This report is generated by Zaroda School MIS</p>
        </div>
      </div>
    </div>
  );
}
