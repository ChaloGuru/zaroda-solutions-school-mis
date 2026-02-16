import { useState, useEffect } from 'react';
import {
  hoiTimetableStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  hoiSubjectsStorage,
  hoiTeachersStorage,
  HoiTimetableSlot,
  HoiClass,
  HoiStream,
  HoiSubject,
  HoiTeacher,
} from '@/lib/hoiStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Printer,
  FileDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf } from '@/lib/pdfExport';

const DAYS: HoiTimetableSlot['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const PERIODS = [
  { period: 1, start: '08:00', end: '08:40' },
  { period: 2, start: '08:40', end: '09:20' },
  { period: 3, start: '09:20', end: '10:00' },
  { period: 4, start: '10:30', end: '11:10' },
  { period: 5, start: '11:10', end: '11:50' },
  { period: 6, start: '11:50', end: '12:30' },
  { period: 7, start: '14:00', end: '14:40' },
  { period: 8, start: '14:40', end: '15:20' },
];

const CELL_COLORS = [
  'bg-blue-500/15 border-blue-500/30 hover:bg-blue-500/25',
  'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25',
  'bg-violet-500/15 border-violet-500/30 hover:bg-violet-500/25',
  'bg-amber-500/15 border-amber-500/30 hover:bg-amber-500/25',
  'bg-rose-500/15 border-rose-500/30 hover:bg-rose-500/25',
  'bg-cyan-500/15 border-cyan-500/30 hover:bg-cyan-500/25',
  'bg-orange-500/15 border-orange-500/30 hover:bg-orange-500/25',
  'bg-pink-500/15 border-pink-500/30 hover:bg-pink-500/25',
  'bg-teal-500/15 border-teal-500/30 hover:bg-teal-500/25',
  'bg-indigo-500/15 border-indigo-500/30 hover:bg-indigo-500/25',
];

const emptyForm = {
  subject_id: '',
  teacher_id: '',
  room: '',
};

export default function HoiTimetable() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<HoiTimetableSlot[]>([]);
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [subjects, setSubjects] = useState<HoiSubject[]>([]);
  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<HoiTimetableSlot | null>(null);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [clickedDay, setClickedDay] = useState<HoiTimetableSlot['day']>('Monday');
  const [clickedPeriod, setClickedPeriod] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reload = () => {
    const c = hoiClassesStorage.getAll();
    const s = hoiStreamsStorage.getAll();
    setClasses(c);
    setStreams(s);
    setSubjects(hoiSubjectsStorage.getAll());
    setTeachers(hoiTeachersStorage.getAll().filter((t) => t.status === 'active'));
    setSlots(hoiTimetableStorage.getAll());
    if (!selectedClassId && c.length > 0) setSelectedClassId(c[0].id);
  };

  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (selectedClassId) {
      const available = streams.filter((s) => s.class_id === selectedClassId);
      if (available.length > 0 && !available.find((s) => s.id === selectedStreamId)) {
        setSelectedStreamId(available[0].id);
      }
    }
  }, [selectedClassId, streams]);

  const filteredStreams = streams.filter((s) => s.class_id === selectedClassId);
  const filteredSlots = slots.filter((s) => s.class_id === selectedClassId && s.stream_id === selectedStreamId);

  const getSlot = (day: HoiTimetableSlot['day'], period: number) =>
    filteredSlots.find((s) => s.day === day && s.period === period);

  const subjectColorMap: Record<string, string> = {};
  let colorIdx = 0;
  filteredSlots.forEach((s) => {
    if (!subjectColorMap[s.subject_id]) {
      subjectColorMap[s.subject_id] = CELL_COLORS[colorIdx % CELL_COLORS.length];
      colorIdx++;
    }
  });

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedStream = streams.find((s) => s.id === selectedStreamId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.subject_id) e.subject_id = 'Subject is required';
    if (!form.teacher_id) e.teacher_id = 'Teacher is required';
    if (!form.room.trim()) e.room = 'Room is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAddSlot = (day: HoiTimetableSlot['day'], period: number) => {
    setEditingSlot(null);
    setClickedDay(day);
    setClickedPeriod(period);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditSlot = (slot: HoiTimetableSlot) => {
    setEditingSlot(slot);
    setClickedDay(slot.day);
    setClickedPeriod(slot.period);
    setForm({
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id,
      room: slot.room,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openDeleteSlot = (slotId: string) => {
    setDeleteSlotId(slotId);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    const subject = subjects.find((s) => s.id === form.subject_id);
    const teacher = teachers.find((t) => t.id === form.teacher_id);
    if (!subject || !teacher || !selectedClass || !selectedStream) return;

    const periodInfo = PERIODS.find((p) => p.period === clickedPeriod);
    if (!periodInfo) return;

    if (editingSlot) {
      hoiTimetableStorage.update(editingSlot.id, {
        subject_id: form.subject_id,
        subject_name: subject.name,
        teacher_id: form.teacher_id,
        teacher_name: teacher.full_name,
        room: form.room.trim(),
      });
      toast({ title: 'Slot Updated', description: `${clickedDay} Period ${clickedPeriod} updated.` });
    } else {
      hoiTimetableStorage.add({
        class_id: selectedClassId,
        class_name: selectedClass.name,
        stream_id: selectedStreamId,
        stream_name: selectedStream.name,
        day: clickedDay,
        period: clickedPeriod,
        time_start: periodInfo.start,
        time_end: periodInfo.end,
        subject_id: form.subject_id,
        subject_name: subject.name,
        teacher_id: form.teacher_id,
        teacher_name: teacher.full_name,
        room: form.room.trim(),
      });
      toast({ title: 'Slot Added', description: `${subject.name} added to ${clickedDay} Period ${clickedPeriod}.` });
    }
    setDialogOpen(false);
    reload();
  };

  const handleDelete = () => {
    if (deleteSlotId) {
      hoiTimetableStorage.remove(deleteSlotId);
      toast({ title: 'Slot Removed', description: 'Timetable slot has been removed.' });
      setDeleteDialogOpen(false);
      setDeleteSlotId(null);
      reload();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Timetable Management
          </h1>
          <p className="text-muted-foreground mt-1">Weekly class timetable and scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="default" className="gap-2" onClick={() => exportToPdf('hoi-timetable-grid', { title: 'Weekly Timetable', subtitle: `Class: ${classes.find(c => c.id === selectedClassId)?.name || ''} | Stream: ${streams.find(s => s.id === selectedStreamId)?.name || ''}`, filename: 'Timetable.pdf', orientation: 'landscape' })}>
            <FileDown className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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
              <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStreams.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClass && selectedStream && (
              <div className="ml-auto text-sm text-muted-foreground">
                Showing: <span className="font-medium text-foreground">{selectedClass.name} - {selectedStream.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 overflow-x-auto" id="hoi-timetable-grid">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm font-semibold text-muted-foreground border-b w-[120px]">Period</th>
                {DAYS.map((day, i) => (
                  <th key={day} className="p-2 text-center text-sm font-semibold text-foreground border-b">{DAY_SHORT[i]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p.period}>
                  <td className="p-2 border-b">
                    <div className="text-sm font-medium">Period {p.period}</div>
                    <div className="text-xs text-muted-foreground">{p.start} - {p.end}</div>
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, p.period);
                    return (
                      <td key={day} className="p-1 border-b">
                        {slot ? (
                          <div
                            className={`rounded-lg border p-2 cursor-pointer transition-colors ${subjectColorMap[slot.subject_id] || CELL_COLORS[0]}`}
                            onClick={() => openEditSlot(slot)}
                          >
                            <div className="text-xs font-semibold truncate">{slot.subject_name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{slot.teacher_name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{slot.room}</div>
                          </div>
                        ) : (
                          <div
                            className="rounded-lg border border-dashed border-muted-foreground/30 p-2 min-h-[60px] cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center"
                            onClick={() => openAddSlot(day, p.period)}
                          >
                            <Plus className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? 'Edit' : 'Add'} Timetable Slot — {clickedDay}, Period {clickedPeriod}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject_id && <p className="text-xs text-destructive">{errors.subject_id}</p>}
            </div>
            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Select value={form.teacher_id} onValueChange={(v) => setForm({ ...form, teacher_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacher_id && <p className="text-xs text-destructive">{errors.teacher_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room *</Label>
              <Input id="room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 1A, Lab 2" />
              {errors.room && <p className="text-xs text-destructive">{errors.room}</p>}
            </div>
          </div>
          <DialogFooter>
            {editingSlot && (
              <Button variant="destructive" className="mr-auto gap-1" onClick={() => { setDialogOpen(false); openDeleteSlot(editingSlot.id); }}>
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingSlot ? 'Update' : 'Add'} Slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this timetable slot? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
