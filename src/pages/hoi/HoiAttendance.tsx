import { useState, useEffect } from 'react';
import {
  hoiAttendanceStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  hoiStudentsStorage,
  type HoiAttendance as HoiAttendanceRecord,
  type HoiClass,
  type HoiStream,
  type HoiStudent,
} from '@/lib/hoiStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  CalendarDays,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PAGE_SIZE = 10;

export default function HoiAttendance() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [attendance, setAttendance] = useState<HoiAttendanceRecord[]>([]);
  const [students, setStudents] = useState<HoiStudent[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [summaryDate, setSummaryDate] = useState(today);
  const [summaryClassFilter, setSummaryClassFilter] = useState('all');
  const [summaryPage, setSummaryPage] = useState(1);

  const [markClassId, setMarkClassId] = useState('');
  const [markStreamId, setMarkStreamId] = useState('');
  const [markDate, setMarkDate] = useState(today);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});

  const reload = () => {
    const c = hoiClassesStorage.getAll();
    const s = hoiStreamsStorage.getAll();
    setClasses(c);
    setStreams(s);
    setAttendance(hoiAttendanceStorage.getAll());
    setStudents(hoiStudentsStorage.getAll().filter((st) => st.status === 'active'));
    if (!markClassId && c.length > 0) setMarkClassId(c[0].id);
  };

  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (markClassId) {
      const available = streams.filter((s) => s.class_id === markClassId);
      if (available.length > 0 && !available.find((s) => s.id === markStreamId)) {
        setMarkStreamId(available[0].id);
      }
    }
  }, [markClassId, streams]);

  useEffect(() => {
    if (markClassId && markStreamId) {
      const classStudents = students.filter(
        (s) => s.class_id === markClassId && s.stream_id === markStreamId
      );
      const existing = attendance.filter(
        (a) => a.class_id === markClassId && a.stream_id === markStreamId && a.date === markDate
      );
      const map: Record<string, boolean> = {};
      classStudents.forEach((s) => {
        const found = existing.find((a) => a.student_id === s.id);
        map[s.id] = found ? found.status === 'present' : true;
      });
      setAttendanceMap(map);
    }
  }, [markClassId, markStreamId, markDate, students, attendance]);

  const markStreams = streams.filter((s) => s.class_id === markClassId);
  const classStudentsForMark = students.filter(
    (s) => s.class_id === markClassId && s.stream_id === markStreamId
  );

  const handleToggle = (studentId: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSaveAttendance = () => {
    if (!markClassId || !markStreamId) {
      toast({ title: 'Error', description: 'Please select a class and stream.', variant: 'destructive' });
      return;
    }
    if (classStudentsForMark.length === 0) {
      toast({ title: 'No Students', description: 'No students found for the selected class/stream.', variant: 'destructive' });
      return;
    }

    const selectedClass = classes.find((c) => c.id === markClassId);
    const selectedStream = streams.find((s) => s.id === markStreamId);
    if (!selectedClass || !selectedStream) return;

    const existing = attendance.filter(
      (a) => a.class_id === markClassId && a.stream_id === markStreamId && a.date === markDate
    );
    existing.forEach((a) => hoiAttendanceStorage.remove(a.id));

    classStudentsForMark.forEach((student) => {
      hoiAttendanceStorage.add({
        student_id: student.id,
        student_name: student.full_name,
        class_id: markClassId,
        class_name: selectedClass.name,
        stream_id: markStreamId,
        stream_name: selectedStream.name,
        date: markDate,
        status: attendanceMap[student.id] ? 'present' : 'absent',
        marked_by: 'HOI',
      });
    });

    toast({ title: 'Attendance Saved', description: `Attendance for ${selectedClass.name} - ${selectedStream.name} on ${markDate} saved.` });
    reload();
  };

  const summaryData = (() => {
    const dateAttendance = attendance.filter((a) => a.date === summaryDate);
    const grouped: Record<string, { class_name: string; stream_name: string; present: number; absent: number }> = {};
    dateAttendance.forEach((a) => {
      const key = `${a.class_id}_${a.stream_id}`;
      if (!grouped[key]) {
        grouped[key] = { class_name: a.class_name, stream_name: a.stream_name, present: 0, absent: 0 };
      }
      if (a.status === 'present') grouped[key].present++;
      else grouped[key].absent++;
    });
    let rows = Object.values(grouped);
    if (summaryClassFilter !== 'all') {
      rows = rows.filter((r) => r.class_name === summaryClassFilter);
    }
    return rows;
  })();

  const summaryTotalPages = Math.max(1, Math.ceil(summaryData.length / PAGE_SIZE));
  const summaryPaginated = summaryData.slice((summaryPage - 1) * PAGE_SIZE, summaryPage * PAGE_SIZE);

  const chartData = (() => {
    const dateAttendance = attendance.filter((a) => a.date === summaryDate);
    const grouped: Record<string, { present: number; absent: number }> = {};
    dateAttendance.forEach((a) => {
      if (!grouped[a.class_name]) grouped[a.class_name] = { present: 0, absent: 0 };
      if (a.status === 'present') grouped[a.class_name].present++;
      else grouped[a.class_name].absent++;
    });
    return Object.entries(grouped).map(([name, data]) => ({
      name,
      present: data.present,
      absent: data.absent,
      percentage: data.present + data.absent > 0 ? Math.round((data.present / (data.present + data.absent)) * 100) : 0,
    }));
  })();

  const uniqueClassNames = [...new Set(attendance.map((a) => a.class_name))];

  const presentCount = Object.values(attendanceMap).filter(Boolean).length;
  const absentCount = Object.values(attendanceMap).filter((v) => !v).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            Attendance Management
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage student attendance</p>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={summaryDate}
                    onChange={(e) => { setSummaryDate(e.target.value); setSummaryPage(1); }}
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Filter by Class</Label>
                  <Select value={summaryClassFilter} onValueChange={(v) => { setSummaryClassFilter(v); setSummaryPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {uniqueClassNames.map((cn) => (
                        <SelectItem key={cn} value={cn}>{cn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Summary — {summaryDate}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryPaginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No attendance records for this date.
                        </TableCell>
                      </TableRow>
                    ) : (
                      summaryPaginated.map((row, i) => {
                        const total = row.present + row.absent;
                        const pct = total > 0 ? Math.round((row.present / total) * 100) : 0;
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.class_name}</TableCell>
                            <TableCell>{row.stream_name}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                                {row.present}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">
                                {row.absent}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={pct >= 80 ? 'default' : 'destructive'}>
                                {pct}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                {summaryTotalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <p className="text-sm text-muted-foreground">Page {summaryPage} of {summaryTotalPages}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={summaryPage === 1} onClick={() => setSummaryPage(summaryPage - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={summaryPage === summaryTotalPages} onClick={() => setSummaryPage(summaryPage + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Trends by Class</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                    No data available for the selected date.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mark">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Class</Label>
                  <Select value={markClassId} onValueChange={setMarkClassId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Stream</Label>
                  <Select value={markStreamId} onValueChange={setMarkStreamId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {markStreams.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">{presentCount}</span>
                    <UserX className="w-4 h-4 text-red-500 ml-2" />
                    <span className="text-red-500 font-medium">{absentCount}</span>
                  </div>
                  <Button className="gap-2" onClick={handleSaveAttendance}>
                    <Save className="w-4 h-4" /> Save Attendance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Present / Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudentsForMark.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No students found for the selected class and stream.
                      </TableCell>
                    </TableRow>
                  ) : (
                    classStudentsForMark.map((student, idx) => {
                      const isPresent = attendanceMap[student.id] ?? true;
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>
                            <code className="px-2 py-0.5 rounded bg-muted text-sm">{student.admission_no}</code>
                          </TableCell>
                          <TableCell>{student.gender}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={isPresent ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' : 'bg-red-500/10 text-red-700 border-red-500/30'}>
                              {isPresent ? 'Present' : 'Absent'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isPresent}
                              onCheckedChange={() => handleToggle(student.id)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
