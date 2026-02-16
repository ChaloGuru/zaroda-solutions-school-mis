import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Save, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';
import { hoiStudentsStorage, hoiAttendanceStorage, HoiStudent, HoiAttendance } from '@/lib/hoiStorage';
import { useToast } from '@/hooks/use-toast';

interface ClassAttendanceProps {
  classId: string;
  className: string;
  streamId: string;
  streamName: string;
  teacherName: string;
}

export default function ClassAttendance({ classId, className, streamId, streamName, teacherName }: ClassAttendanceProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [attendance, setAttendance] = useState<HoiAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const s = hoiStudentsStorage.getAll().filter(s => s.class_id === classId && s.stream_id === streamId && s.status === 'active');
    setStudents(s);
    const att = hoiAttendanceStorage.getAll().filter(a => a.class_id === classId && a.stream_id === streamId);
    setAttendance(att);

    const dayAttendance = att.filter(a => a.date === selectedDate);
    const map: Record<string, 'present' | 'absent'> = {};
    s.forEach(st => {
      const rec = dayAttendance.find(a => a.student_id === st.id);
      map[st.id] = rec ? rec.status : 'present';
    });
    setAttendanceMap(map);
  };

  useEffect(() => { loadData(); }, [classId, streamId, selectedDate]);

  const toggleAttendance = (studentId: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const map: Record<string, 'present' | 'absent'> = {};
    filteredStudents.forEach(s => { map[s.id] = status; });
    setAttendanceMap(prev => ({ ...prev, ...map }));
  };

  const saveAttendance = () => {
    const allAtt = hoiAttendanceStorage.getAll();
    const filtered = allAtt.filter(a => !(a.class_id === classId && a.stream_id === streamId && a.date === selectedDate));

    const newRecords = students.map(s => ({
      student_id: s.id,
      student_name: s.full_name,
      class_id: classId,
      class_name: className,
      stream_id: streamId,
      stream_name: streamName,
      date: selectedDate,
      status: attendanceMap[s.id] || 'present' as 'present' | 'absent',
      marked_by: teacherName,
    }));

    newRecords.forEach(r => {
      filtered.push({ ...r, id: crypto.randomUUID() } as HoiAttendance);
    });
    localStorage.setItem('zaroda_hoi_attendance', JSON.stringify(filtered));

    toast({ title: 'Attendance Saved', description: `Attendance for ${selectedDate} has been saved for ${className} ${streamName}.` });
    loadData();
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(attendanceMap).filter(v => v === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'absent').length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">{className} - {streamName}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-xs text-gray-500">Date</Label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-sm border-green-200">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
              <p className="text-xs text-green-600">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 shadow-sm border-red-200">
          <CardContent className="pt-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-4 flex flex-col gap-2">
            <Button size="sm" className="w-full" onClick={saveAttendance}>
              <Save className="w-4 h-4 mr-2" />Save Attendance
            </Button>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => markAll('present')}>All Present</Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => markAll('absent')}>All Absent</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              Mark Attendance ({filteredStudents.length} students)
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No students found in this class.</TableCell></TableRow>
              ) : filteredStudents.map((s, idx) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-gray-50" onClick={() => toggleAttendance(s.id)}>
                  <TableCell className="text-gray-500 text-sm">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{s.admission_no}</TableCell>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={s.gender === 'Male' ? 'text-blue-600 border-blue-300' : 'text-pink-600 border-pink-300'}>{s.gender}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant={attendanceMap[s.id] === 'present' ? 'default' : 'destructive'}
                      className="min-w-20"
                      onClick={(e) => { e.stopPropagation(); toggleAttendance(s.id); }}
                    >
                      {attendanceMap[s.id] === 'present' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Present</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" />Absent</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance Summary (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.reverse().map(date => {
              const dayAtt = attendance.filter(a => a.date === date);
              const present = dayAtt.filter(a => a.status === 'present').length;
              const total = dayAtt.length;
              const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={date} className={`text-center p-3 rounded-lg border ${date === selectedDate ? 'border-primary bg-primary/5' : 'bg-gray-50'}`}>
                  <p className="text-[10px] text-gray-500 uppercase">{dayName}</p>
                  <p className="text-xs font-mono text-gray-600">{date.slice(5)}</p>
                  {total > 0 ? (
                    <p className="text-lg font-bold text-green-600 mt-1">{present}/{total}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
