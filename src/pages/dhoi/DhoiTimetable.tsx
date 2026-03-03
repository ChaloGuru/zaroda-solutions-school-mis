import { useState, useEffect, useCallback } from 'react';
import {
  hoiTeachersStorage,
  hoiSubjectsStorage,
  hoiSubjectAssignmentsStorage,
  hoiClassesStorage,
  hoiStreamsStorage,
  hoiSchoolProfileStorage,
  HoiClass,
  HoiStream,
  HoiSubject,
  HoiTeacher,
  HoiSubjectAssignment,
} from '../../lib/hoiStorage';
import {
  MasterTimetableSlot,
  TimetableConfig,
  LOWER_PRIMARY_CONFIG,
  UPPER_PRIMARY_CONFIG,
  JUNIOR_CONFIG,
  ECDE_CONFIG,
  generateTimetable,
} from './DhoiTimetableGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  Loader2,
  CheckCircle2,
  XCircle,
  Wand2,
  Printer,
  FileDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf } from '@/lib/pdfExport';
import { getCbcLevelForClassName } from '@/lib/cbcSubjects';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/context/AuthContext';

const DAYS: MasterTimetableSlot['day'][] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const DAY_LABELS: Record<string, string> = {
  MON: 'MONDAY',
  TUE: 'TUESDAY',
  WED: 'WEDNESDAY',
  THU: 'THURSDAY',
  FRI: 'FRIDAY',
};

const CONFIG_MAP: Record<string, TimetableConfig> = {
  lower_primary: LOWER_PRIMARY_CONFIG,
  upper_primary: UPPER_PRIMARY_CONFIG,
  junior: JUNIOR_CONFIG,
  ecde: ECDE_CONFIG,
};

const TYPE_LABELS: Record<string, string> = {
  lower_primary: 'Lower Primary',
  upper_primary: 'Upper Primary',
  junior: 'Junior School',
  ecde: 'ECDE',
};

function getVerticalLetters(label: string): string[] {
  return label.split('');
}

export default function DhoiTimetable() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

  const [timetableType, setTimetableType] = useState<'ecde' | 'lower_primary' | 'upper_primary' | 'junior'>('upper_primary');
  const [classes, setClasses] = useState<HoiClass[]>([]);
  const [streams, setStreams] = useState<HoiStream[]>([]);
  const [subjects, setSubjects] = useState<HoiSubject[]>([]);
  const [teachers, setTeachers] = useState<HoiTeacher[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [teacherCodes, setTeacherCodes] = useState<Record<string, string>>({});
  const [schoolName, setSchoolName] = useState('School');

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState('');

  const [allSlots, setAllSlots] = useState<MasterTimetableSlot[]>([]);
  const [generating, setGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  const [grade, setGrade] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [classTeacher, setClassTeacher] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDay, setEditDay] = useState<MasterTimetableSlot['day']>('MON');
  const [editPeriodIdx, setEditPeriodIdx] = useState(0);
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');

  const loadTeacherCodes = useCallback(async () => {
    if (!currentUser?.schoolId) return {} as Record<string, string>;
    const { data, error } = await supabase
      .from('teacher_codes')
      .select('teacher_id,code')
      .eq('school_id', currentUser.schoolId);
    if (error || !data) return {} as Record<string, string>;
    return data.reduce((acc: Record<string, string>, row: any) => {
      if (row.teacher_id && row.code) {
        acc[row.teacher_id] = String(row.code);
      }
      return acc;
    }, {});
  }, [currentUser?.schoolId]);

  const loadMasterSlots = useCallback(async () => {
    if (!currentUser?.schoolId) return [] as MasterTimetableSlot[];
    const { data, error } = await supabase
      .from('hoi_master_timetable')
      .select('*')
      .eq('school_id', currentUser.schoolId);
    if (error || !data) return [] as MasterTimetableSlot[];
    return (data as any[]).map((row) => ({
      id: row.id,
      timetableType: row.timetable_type ?? row.timetableType,
      classId: row.class_id ?? row.classId,
      className: row.class_name ?? row.className,
      streamId: row.stream_id ?? row.streamId,
      streamName: row.stream_name ?? row.streamName,
      day: row.day,
      periodIndex: Number(row.period_index ?? row.periodIndex ?? 0),
      timeStart: row.time_start ?? row.timeStart,
      timeEnd: row.time_end ?? row.timeEnd,
      subjectId: row.subject_id ?? row.subjectId,
      subjectName: row.subject_name ?? row.subjectName,
      teacherId: row.teacher_id ?? row.teacherId,
      teacherName: row.teacher_name ?? row.teacherName,
      teacherCode: row.teacher_code ?? row.teacherCode,
      isLocked: Boolean(row.is_locked ?? row.isLocked),
      lockedLabel: row.locked_label ?? row.lockedLabel,
    })) as MasterTimetableSlot[];
  }, [currentUser?.schoolId]);

  const saveMasterSlots = useCallback(async (slots: MasterTimetableSlot[]) => {
    const payload = slots.map((slot) => ({
      id: slot.id,
      timetable_type: slot.timetableType,
      class_id: slot.classId,
      class_name: slot.className,
      stream_id: slot.streamId,
      stream_name: slot.streamName,
      day: slot.day,
      period_index: slot.periodIndex,
      time_start: slot.timeStart,
      time_end: slot.timeEnd,
      subject_id: slot.subjectId,
      subject_name: slot.subjectName,
      teacher_id: slot.teacherId,
      teacher_name: slot.teacherName,
      teacher_code: slot.teacherCode,
      school_id: currentUser?.schoolId || null,
      school_code: currentUser?.schoolCode || null,
      is_locked: slot.isLocked,
      locked_label: slot.lockedLabel ?? null,
    }));

    const { error: deleteError } = await supabase
      .from('hoi_master_timetable')
      .delete()
      .eq('school_id', currentUser?.schoolId || '');
    if (deleteError) return;
    if (payload.length === 0) return;
    await supabase.from('hoi_master_timetable').upsert(payload, { onConflict: 'id' });
  }, [currentUser?.schoolCode, currentUser?.schoolId]);

  const loadData = useCallback(async () => {
    setClasses(hoiClassesStorage.getAll());
    setStreams(hoiStreamsStorage.getAll());
    setSubjects(hoiSubjectsStorage.getAll());
    setTeachers(hoiTeachersStorage.getAll().filter((t) => t.status === 'active'));
    setAssignments(hoiSubjectAssignmentsStorage.getAll());
    setSchoolName(hoiSchoolProfileStorage.get().name || 'School');

    const [loadedTeacherCodes, loadedSlots] = await Promise.all([loadTeacherCodes(), loadMasterSlots()]);
    setTeacherCodes(loadedTeacherCodes);
    setAllSlots(loadedSlots);

    setDataReady(true);
  }, [loadMasterSlots, loadTeacherCodes]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedClassId) {
      const available = streams.filter((s) => s.class_id === selectedClassId);
      if (available.length > 0 && !available.find((s) => s.id === selectedStreamId)) {
        setSelectedStreamId(available[0].id);
      }
    }
  }, [selectedClassId, streams, selectedStreamId]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    const cls = classes.find((c) => c.id === selectedClassId);
    if (cls) setGrade(cls.name);
    const stream = streams.find((s) => s.id === selectedStreamId);
    if (stream && stream.class_teacher_name) {
      setClassTeacher(stream.class_teacher_name);
    } else {
      setClassTeacher('');
    }
  }, [selectedClassId, selectedStreamId, classes, streams]);

  const config = CONFIG_MAP[timetableType];
  const filteredStreams = streams.filter((s) => s.class_id === selectedClassId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedClassLevel = selectedClass ? getCbcLevelForClassName(selectedClass.name) : null;
  const filteredSubjects = selectedClassLevel
    ? subjects.filter((subject) => subject.category === selectedClassLevel)
    : subjects;

  const filteredSlots = allSlots.filter(
    (s) =>
      s.timetableType === timetableType &&
      s.classId === selectedClassId &&
      s.streamId === selectedStreamId
  );

  const getSlot = (day: MasterTimetableSlot['day'], periodIdx: number) =>
    filteredSlots.find((s) => s.day === day && s.periodIndex === periodIdx);

  const saveSlots = (slots: MasterTimetableSlot[]) => {
    setAllSlots(slots);
    void saveMasterSlots(slots);
  };

  const generateForType = useCallback((type: 'ecde' | 'lower_primary' | 'upper_primary' | 'junior', showToast = false) => {
    const configForType = CONFIG_MAP[type];
    const relevantAssignments = assignments.filter(() => true);

    if (relevantAssignments.length === 0) {
      if (showToast) {
        toast({
          title: 'Generation Skipped',
          description: 'No learning area assignments found. Add assignments to auto-generate timetable slots.',
          variant: 'destructive',
        });
      }
      return;
    }

    const generated = generateTimetable(configForType, relevantAssignments, teacherCodes);

    const otherSlots = allSlots.filter((s) => s.timetableType !== type);
    const newAll = [...otherSlots, ...generated];

    saveSlots(newAll);

    if (showToast) {
      toast({
        title: 'Timetable Regenerated',
        description: `${TYPE_LABELS[type]} master timetable has been regenerated successfully.`,
      });
    }
  }, [allSlots, assignments, teacherCodes, toast]);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      generateForType(timetableType, true);
    } catch (e) {
      toast({ title: 'Generation Failed', description: 'An error occurred while generating the timetable.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!dataReady) return;
    generateForType(timetableType, false);
  }, [dataReady, timetableType, assignments, teacherCodes, generateForType]);

  useEffect(() => {
    setIsGenerated(allSlots.some((slot) => slot.timetableType === timetableType));
  }, [allSlots, timetableType]);

  const openCellEdit = (day: MasterTimetableSlot['day'], periodIdx: number) => {
    const existing = getSlot(day, periodIdx);
    setEditDay(day);
    setEditPeriodIdx(periodIdx);
    setEditSubjectId(existing?.subjectId || '');
    setEditTeacherId(existing?.teacherId || '');
    setEditDialogOpen(true);
  };

  const getFilteredTeachersForEdit = () => {
    if (!editSubjectId || !selectedClassId) return teachers;
    const relevantAssignments = assignments.filter(
      (a) => a.subject_id === editSubjectId && a.class_id === selectedClassId
    );
    if (relevantAssignments.length === 0) return teachers;
    const teacherIds = new Set(relevantAssignments.map((a) => a.teacher_id));
    return teachers.filter((t) => teacherIds.has(t.id));
  };

  const handleCellSave = () => {
    if (!editSubjectId || !editTeacherId) {
      toast({ title: 'Missing Info', description: 'Please select both learning area and teacher.', variant: 'destructive' });
      return;
    }

    const subject = subjects.find((s) => s.id === editSubjectId);
    const teacher = teachers.find((t) => t.id === editTeacherId);
    const cls = classes.find((c) => c.id === selectedClassId);
    const stream = streams.find((s) => s.id === selectedStreamId);
    if (!subject || !teacher || !cls || !stream) return;
    if (selectedClassLevel && subject.category !== selectedClassLevel) {
      toast({
        title: 'Validation Error',
        description: `Only ${selectedClassLevel} learning areas can be scheduled for ${cls.name}.`,
        variant: 'destructive',
      });
      return;
    }

    const period = config.periods[editPeriodIdx];
    const slotId = `manual-${timetableType}-${selectedClassId}-${selectedStreamId}-${editDay}-${editPeriodIdx}`;

    const newSlot: MasterTimetableSlot = {
      id: slotId,
      timetableType,
      classId: selectedClassId,
      className: cls.name,
      streamId: selectedStreamId,
      streamName: stream.name,
      day: editDay,
      periodIndex: editPeriodIdx,
      timeStart: period.start,
      timeEnd: period.end,
      subjectId: editSubjectId,
      subjectName: subject.name,
      teacherId: editTeacherId,
      teacherName: teacher.full_name,
      teacherCode: teacherCodes[editTeacherId] || '',
      isLocked: false,
    };

    const updated = allSlots.filter(
      (s) =>
        !(
          s.timetableType === timetableType &&
          s.classId === selectedClassId &&
          s.streamId === selectedStreamId &&
          s.day === editDay &&
          s.periodIndex === editPeriodIdx
        )
    );
    updated.push(newSlot);
    saveSlots(updated);
    setEditDialogOpen(false);
    toast({ title: 'Slot Updated', description: `${editDay} period updated with ${subject.name}.` });
  };

  const handleClearCell = () => {
    const updated = allSlots.filter(
      (s) =>
        !(
          s.timetableType === timetableType &&
          s.classId === selectedClassId &&
          s.streamId === selectedStreamId &&
          s.day === editDay &&
          s.periodIndex === editPeriodIdx
        )
    );
    saveSlots(updated);
    setEditDialogOpen(false);
    toast({ title: 'Slot Cleared' });
  };

  const renderLockedCell = (period: { start: string; end: string; locked?: boolean; label?: string }, periodIdx: number) => {
    const label = period.label || '';
    const isBreak = label === 'BREAK';
    const isLunch = label === 'LUNCH';
    const isAssembly = label.includes('ASSEMBLY') || label.includes('HEALTH CHECK') || label === 'FREE CHOICE';

    if (isBreak || isLunch) {
      const letters = getVerticalLetters(isBreak ? 'BREAK' : 'LUNCH');
      return (
        <td
          key={periodIdx}
          className="border border-gray-300 text-center align-middle"
          style={{ backgroundColor: '#F5C842', minWidth: 60 }}
          rowSpan={1}
        >
          <div className="flex flex-col items-center justify-center py-1">
            {DAYS.map((_, dayIdx) => {
              const letter = letters[dayIdx] || '';
              return (
                <span key={dayIdx} className="text-xs font-bold text-gray-800 leading-tight">
                  {letter}
                </span>
              );
            })}
          </div>
        </td>
      );
    }

    if (isAssembly) {
      return (
        <td
          key={periodIdx}
          className="border border-gray-300 text-center align-middle"
          style={{ backgroundColor: '#B2DFDB', minWidth: 60 }}
        >
          <span className="text-[10px] font-semibold text-gray-700">{label}</span>
        </td>
      );
    }

    return (
      <td
        key={periodIdx}
        className="border border-gray-300 text-center align-middle bg-gray-100"
        style={{ minWidth: 60 }}
      >
        <span className="text-[10px] text-gray-500">{label}</span>
      </td>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Master Timetable
          </h1>
          <p className="text-muted-foreground mt-1">DHOI Master Timetable Builder</p>
        </div>
        <div className="flex items-center gap-3">
          {isGenerated ? (
            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Generated
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="w-3.5 h-3.5" /> Not Generated
            </Badge>
          )}
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generating ? 'Regenerating...' : 'Regenerate Timetable'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="default" className="gap-2" onClick={() => exportToPdf('dhoi-timetable-grid', { title: schoolName, subtitle: `Master Timetable | ${TYPE_LABELS[timetableType]} | ${classes.find(c => c.id === selectedClassId)?.name || ''} - ${streams.find(s => s.id === selectedStreamId)?.name || ''} | ${term} ${year}`, filename: 'Master_Timetable.pdf', orientation: 'landscape', fitToOnePage: true })}>
            <FileDown className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Timetable Type</Label>
              <Select value={timetableType} onValueChange={(v) => setTimetableType(v as 'ecde' | 'lower_primary' | 'upper_primary' | 'junior')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecde">ECDE</SelectItem>
                  <SelectItem value="lower_primary">Lower Primary</SelectItem>
                  <SelectItem value="upper_primary">Upper Primary</SelectItem>
                  <SelectItem value="junior">Junior School</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-[10px] font-medium border">
              LOGO
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Grade</Label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} className="w-[140px] h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Term</Label>
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. Term 1" className="w-[120px] h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} className="w-[100px] h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Class Teacher</Label>
              <Input value={classTeacher} onChange={(e) => setClassTeacher(e.target.value)} className="w-[200px] h-8 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2 overflow-x-auto" id="dhoi-timetable-grid">
          <table className="w-full border-collapse min-w-[800px]" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th
                  className="border border-gray-300 p-2 text-sm font-bold text-white"
                  style={{ backgroundColor: '#1E3A5F', width: 90 }}
                >
                  DAY / TIME
                </th>
                {config.periods.map((period, idx) => (
                  <th
                    key={idx}
                    className="border border-gray-300 p-1 text-center"
                    style={{ backgroundColor: '#0D9488', color: 'white', minWidth: 70 }}
                  >
                    <div className="text-[10px] font-semibold leading-tight">{period.start}</div>
                    <div className="text-[9px] opacity-80">-</div>
                    <div className="text-[10px] font-semibold leading-tight">{period.end}</div>
                    {period.locked && (
                      <div className="text-[8px] mt-0.5 opacity-90">{period.label}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td
                    className="border border-gray-300 p-2 text-center font-bold text-white text-sm"
                    style={{ backgroundColor: '#1E3A5F' }}
                  >
                    {DAY_LABELS[day]}
                  </td>
                  {config.periods.map((period, periodIdx) => {
                    if (period.locked) {
                      return renderLockedCell(period, periodIdx);
                    }

                    const slot = getSlot(day, periodIdx);
                    if (slot && slot.subjectId) {
                      return (
                        <td
                          key={periodIdx}
                          className="border border-gray-300 p-1 bg-white cursor-pointer hover:bg-blue-50 transition-colors"
                          style={{ minWidth: 70 }}
                          onClick={() => openCellEdit(day, periodIdx)}
                        >
                          <div className="text-xs font-bold text-gray-800 truncate leading-tight">{slot.subjectName}</div>
                          <div className="text-[10px] text-gray-500 truncate">{slot.teacherCode || slot.teacherName}</div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={periodIdx}
                        className="border border-gray-300 p-1 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{ minWidth: 70 }}
                        onClick={() => openCellEdit(day, periodIdx)}
                      >
                        <div className="min-h-[40px] flex items-center justify-center">
                          <span className="text-[10px] text-gray-300">+</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Slot — {DAY_LABELS[editDay]}, {config.periods[editPeriodIdx]?.start} - {config.periods[editPeriodIdx]?.end}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Learning Area</Label>
              <Select value={editSubjectId} onValueChange={(v) => { setEditSubjectId(v); setEditTeacherId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select learning area" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredTeachersForEdit().map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name} {teacherCodes[t.id] ? `(${teacherCodes[t.id]})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearCell} className="mr-auto">Clear</Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCellSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
