import { useState, useEffect } from 'react';
import {
  hoiAttendanceStorage,
  hoiFeesStorage,
  hoiExpensesStorage,
  hoiTeacherDutiesStorage,
  hoiStudentsStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  HoiAttendance,
  HoiFeePayment,
  HoiExpense,
  HoiTeacherDuty,
  HoiStudent,
  HoiClass,
  HoiStream,
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
  ClipboardCheck,
  DollarSign,
  Users,
  GraduationCap,
  Printer,
  FileDown,
} from 'lucide-react';
import { exportToPdf } from '@/lib/pdfExport';

export default function HoiReports() {
  const [attendance, setAttendance] = useState<HoiAttendance[]>([]);
  const [fees, setFees] = useState<HoiFeePayment[]>([]);
  const [expenses, setExpenses] = useState<HoiExpense[]>([]);
  const [duties, setDuties] = useState<HoiTeacherDuty[]>([]);
  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);

  const [attClassFilter, setAttClassFilter] = useState('all');
  const [attTermFilter, setAttTermFilter] = useState('all');
  const [finTermFilter, setFinTermFilter] = useState('all');
  const [slClassFilter, setSlClassFilter] = useState('all');
  const [slStreamFilter, setSlStreamFilter] = useState('all');

  useEffect(() => {
    setAttendance(hoiAttendanceStorage.getAll());
    setFees(hoiFeesStorage.getAll());
    setExpenses(hoiExpensesStorage.getAll());
    setDuties(hoiTeacherDutiesStorage.getAll());
    setStudents(hoiStudentsStorage.getAll());
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
  }, []);

  const handlePrint = () => window.print();

  const filteredAttendance = attendance.filter(a => {
    const matchClass = attClassFilter === 'all' || a.class_id === attClassFilter;
    return matchClass;
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

  const filteredFees = fees.filter(f => finTermFilter === 'all' || f.term === finTermFilter);
  const filteredExpenses = expenses.filter(() => true);
  const totalRevenue = filteredFees.reduce((s, f) => s + f.amount, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const filteredStudents = students.filter(s => {
    const matchClass = slClassFilter === 'all' || s.class_id === slClassFilter;
    const matchStream = slStreamFilter === 'all' || s.stream_id === slStreamFilter;
    return matchClass && matchStream;
  });

  const availableStreams = slClassFilter === 'all'
    ? streams
    : streams.filter(s => s.class_id === slClassFilter);

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

      <Tabs defaultValue="attendance">
        <TabsList className="mb-4 no-print">
          <TabsTrigger value="attendance" className="gap-2"><ClipboardCheck className="w-4 h-4" />Attendance</TabsTrigger>
          <TabsTrigger value="financial" className="gap-2"><DollarSign className="w-4 h-4" />Financial</TabsTrigger>
          <TabsTrigger value="duty" className="gap-2"><Users className="w-4 h-4" />Teacher Duty</TabsTrigger>
          <TabsTrigger value="students" className="gap-2"><GraduationCap className="w-4 h-4" />Student List</TabsTrigger>
        </TabsList>

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
                  <Button variant="default" onClick={() => exportToPdf('hoi-attendance-report', { title: 'Attendance Report', filename: 'Attendance_Report.pdf' })}><FileDown className="w-4 h-4 mr-1" />PDF</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area" id="hoi-attendance-report">
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

        <TabsContent value="financial">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <CardTitle>Financial Report</CardTitle>
                <div className="flex gap-2">
                  <Select value={finTermFilter} onValueChange={setFinTermFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Term" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
                  <Button variant="default" onClick={() => exportToPdf('hoi-financial-report', { title: 'Financial Report', filename: 'Financial_Report.pdf' })}><FileDown className="w-4 h-4 mr-1" />PDF</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area" id="hoi-financial-report">
              <h2 className="hidden print:block text-xl font-bold mb-4">Financial Report</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Revenue (Fee Payments)</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission No</TableHead>
                        <TableHead>Amount (KES)</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-4">No fee payments</TableCell></TableRow>
                      ) : filteredFees.map(f => (
                        <TableRow key={f.id}>
                          <TableCell>{f.student_name}</TableCell>
                          <TableCell>{f.admission_no}</TableCell>
                          <TableCell className="font-medium">{f.amount.toLocaleString()}</TableCell>
                          <TableCell>{f.term}</TableCell>
                          <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{f.payment_method}</TableCell>
                          <TableCell>{f.receipt_no}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Amount (KES)</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Approved By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No expenses</TableCell></TableRow>
                      ) : filteredExpenses.map(e => (
                        <TableRow key={e.id}>
                          <TableCell>{e.item}</TableCell>
                          <TableCell className="font-medium">{e.amount.toLocaleString()}</TableCell>
                          <TableCell className="capitalize">{e.category}</TableCell>
                          <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                          <TableCell>{e.approved_by}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">KES {totalRevenue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">KES {totalExpenses.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Net Balance</p>
                      <p className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        KES {(totalRevenue - totalExpenses).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duty">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between no-print">
                <CardTitle>Teacher Duty Roster</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
                  <Button variant="default" onClick={() => exportToPdf('hoi-duty-report', { title: 'Teacher Duty Roster', filename: 'Duty_Roster.pdf' })}><FileDown className="w-4 h-4 mr-1" />PDF</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area" id="hoi-duty-report">
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
                <CardTitle>Student List</CardTitle>
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
                  <Button variant="default" onClick={() => exportToPdf('hoi-student-report', { title: 'Student List Report', filename: 'Student_List.pdf', orientation: 'landscape' })}><FileDown className="w-4 h-4 mr-1" />PDF</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="print-area" id="hoi-student-report">
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
