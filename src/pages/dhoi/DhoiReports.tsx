import { useState, useEffect } from 'react';
import {
  hoiTimetableStorage,
  hoiTeachersStorage,
  hoiAttendanceStorage,
  hoiTeacherDutiesStorage,
  hoiStudentsStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  hoiSubjectAssignmentsStorage,
  HoiTimetableSlot,
  HoiTeacher,
  HoiAttendance,
  HoiTeacherDuty,
  HoiStudent,
  HoiClass,
  HoiStream,
  HoiSubjectAssignment,
} from '@/lib/hoiStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  ClipboardCheck,
  Users,
  GraduationCap,
  Printer,
  BookOpen,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DhoiReports() {
  const { toast } = useToast();

  const [timetable, setTimetable] = useState<HoiTimetableSlot[]>([]);
  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [attendance, setAttendance] = useState<HoiAttendance[]>([]);
  const [duties, setDuties] = useState<HoiTeacherDuty[]>([]);
  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);

  const [ttClassFilter, setTtClassFilter] = useState('all');
  const [ttDayFilter, setTtDayFilter] = useState('all');
  const [tsTeacherFilter, setTsTeacherFilter] = useState('all');
  const [attClassFilter, setAttClassFilter] = useState('all');
  const [slClassFilter, setSlClassFilter] = useState('all');
  const [slStreamFilter, setSlStreamFilter] = useState('all');

  useEffect(() => {
    setTimetable(hoiTimetableStorage.getAll());
    setTeachers(hoiTeachersStorage.getAll());
    setAttendance(hoiAttendanceStorage.getAll());
    setDuties(hoiTeacherDutiesStorage.getAll());
    setStudents(hoiStudentsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
    setAssignments(hoiSubjectAssignmentsStorage.getAll());
  }, []);

  const handlePrint = () => {
    window.print();
    toast({ title: 'Print', description: 'Print dialog opened' });
  };

  const filteredTimetable = timetable.filter(t => {
    const matchClass = ttClassFilter === 'all' || t.class_id === ttClassFilter;
    const matchDay = ttDayFilter === 'all' || t.day === ttDayFilter;
    return matchClass && matchDay;
  }).sort((a, b) => a.period - b.period);

  const filteredTeacherSchedule = (() => {
    if (tsTeacherFilter === 'all') return assignments;
    return assignments.filter(a => a.teacher_id === tsTeacherFilter);
  })();

  const filteredAttendance = attendance.filter(a => {
    return attClassFilter === 'all' || a.class_id === attClassFilter;
  });

  const attSummary = (() => {
    const map = new Map<string, { name: string; class_name: string; present: number; absent: number; total: number }>();
    filteredAttendance.forEach(a => {
      if (!map.has(a.student_id)) {
        map.set(a.student_id, { name: a.student_name, class_name: a.class_name, present: 0, absent: 0, total: 0 });
      }
      const entry = map.get(a.student_id)!;
      entry.total++;
      if (a.status === 'present') entry.present++;
      else entry.absent++;
    });
    return Array.from(map.values());
  })();

  const filteredStudents = students.filter(s => {
    const matchClass = slClassFilter === 'all' || s.class_id === slClassFilter;
    const matchStream = slStreamFilter === 'all' || s.stream_id === slStreamFilter;
    return matchClass && matchStream;
  });

  const availableStreams = slClassFilter === 'all'
    ? streams
    : streams.filter(s => s.class_id === slClassFilter);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="mb-6 no-print">
        <h1 className="text-3xl font-bold text-foreground mb-1">Reports</h1>
        <p className="text-muted-foreground">Generate and print school reports</p>
      </div>

      <Tabs defaultValue="timetable">
        <TabsList className="mb-4 no-print flex-wrap">
          <TabsTrigger value="timetable" className="gap-2"><Calendar className="w-4 h-4" />Timetable</TabsTrigger>
          <TabsTrigger value="teacher-schedule" className="gap-2"><BookOpen className="w-4 h-4" />Teacher Schedule</TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2"><ClipboardCheck className="w-4 h-4" />Attendance</TabsTrigger>
          <TabsTrigger value="duty" className="gap-2"><Users className="w-4 h-4" />Duty Roster</TabsTrigger>
          <TabsTrigger value="students" className="gap-2"><GraduationCap className="w-4 h-4" />Student List</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <CardTitle>Timetable Report</CardTitle>
                <div className="flex gap-2">
                  <Select value={ttClassFilter} onValueChange={setTtClassFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={ttDayFilter} onValueChange={setTtDayFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Day" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Days</SelectItem>
                      {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area">
              <h2 className="hidden print:block text-xl font-bold mb-4">Timetable Report</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Room</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimetable.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No timetable data</TableCell></TableRow>
                  ) : filteredTimetable.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.day}</TableCell>
                      <TableCell>{t.period}</TableCell>
                      <TableCell>{t.time_start} - {t.time_end}</TableCell>
                      <TableCell>{t.class_name}</TableCell>
                      <TableCell>{t.stream_name}</TableCell>
                      <TableCell className="font-medium">{t.subject_name}</TableCell>
                      <TableCell>{t.teacher_name}</TableCell>
                      <TableCell>{t.room}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher-schedule">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <CardTitle>Teacher Schedule Report</CardTitle>
                <div className="flex gap-2">
                  <Select value={tsTeacherFilter} onValueChange={setTsTeacherFilter}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Teacher" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teachers</SelectItem>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area">
              <h2 className="hidden print:block text-xl font-bold mb-4">Teacher Schedule Report</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeacherSchedule.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No schedule data</TableCell></TableRow>
                  ) : filteredTeacherSchedule.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.teacher_name}</TableCell>
                      <TableCell>{a.subject_name}</TableCell>
                      <TableCell>{a.class_name}</TableCell>
                      <TableCell>{a.stream_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <CardTitle>Attendance Report</CardTitle>
                <div className="flex gap-2">
                  <Select value={attClassFilter} onValueChange={setAttClassFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area">
              <h2 className="hidden print:block text-xl font-bold mb-4">Attendance Report</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Days Present</TableHead>
                    <TableHead>Days Absent</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attSummary.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No attendance data</TableCell></TableRow>
                  ) : attSummary.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.class_name}</TableCell>
                      <TableCell>{s.present}</TableCell>
                      <TableCell>{s.absent}</TableCell>
                      <TableCell>{s.total}</TableCell>
                      <TableCell>{s.total > 0 ? Math.round((s.present / s.total) * 100) : 0}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duty">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between no-print">
                <CardTitle>Teacher Duty Roster Report</CardTitle>
                <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
              </div>
            </CardHeader>
            <CardContent className="print-area">
              <h2 className="hidden print:block text-xl font-bold mb-4">Teacher Duty Roster</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Duty Type</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time Slot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duties.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No duty roster data</TableCell></TableRow>
                  ) : duties.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.teacher_name}</TableCell>
                      <TableCell className="capitalize">{d.duty_type}</TableCell>
                      <TableCell>{d.day}</TableCell>
                      <TableCell>{d.time_slot}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <CardTitle>Student List Report</CardTitle>
                <div className="flex gap-2">
                  <Select value={slClassFilter} onValueChange={v => { setSlClassFilter(v); setSlStreamFilter('all'); }}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={slStreamFilter} onValueChange={setSlStreamFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stream" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      {availableStreams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area">
              <h2 className="hidden print:block text-xl font-bold mb-4">Student List</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Adm No</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No students found</TableCell></TableRow>
                  ) : filteredStudents.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{s.admission_no}</TableCell>
                      <TableCell>{s.class_name}</TableCell>
                      <TableCell>{s.stream_name}</TableCell>
                      <TableCell>{s.gender}</TableCell>
                      <TableCell>{new Date(s.date_of_birth).toLocaleDateString()}</TableCell>
                      <TableCell>{s.guardian_name}</TableCell>
                      <TableCell>{s.guardian_phone}</TableCell>
                      <TableCell className="capitalize">{s.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
