export interface MasterTimetableSlot {
  id: string;
  timetableType: 'upper_primary' | 'junior' | 'ecde';
  classId: string;
  className: string;
  streamId: string;
  streamName: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  periodIndex: number;
  timeStart: string;
  timeEnd: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  isLocked: boolean;
  lockedLabel?: string;
}

export interface TimetableConfig {
  type: 'upper_primary' | 'junior' | 'ecde';
  periods: { start: string; end: string; locked?: boolean; label?: string }[];
}

export const UPPER_PRIMARY_CONFIG: TimetableConfig = {
  type: 'upper_primary',
  periods: [
    { start: '8:00', end: '8:20', locked: true, label: 'ASSEMBLY/HEALTH CHECK' },
    { start: '8:20', end: '8:55' },
    { start: '8:55', end: '9:30' },
    { start: '9:30', end: '9:50', locked: true, label: 'BREAK' },
    { start: '10:25', end: '11:00' },
    { start: '11:00', end: '11:30', locked: true, label: 'BREAK' },
    { start: '11:30', end: '12:05' },
    { start: '12:05', end: '12:40' },
    { start: '12:40', end: '2:00', locked: true, label: 'LUNCH' },
    { start: '2:00', end: '2:35' },
    { start: '2:35', end: '4:00' },
  ],
};

export const JUNIOR_CONFIG: TimetableConfig = {
  type: 'junior',
  periods: [
    { start: '8:20', end: '9:00' },
    { start: '9:00', end: '9:40' },
    { start: '9:40', end: '9:50', locked: true, label: 'BREAK' },
    { start: '9:50', end: '10:30' },
    { start: '10:30', end: '11:10' },
    { start: '11:10', end: '11:40', locked: true, label: 'BREAK' },
    { start: '11:40', end: '12:20' },
    { start: '12:20', end: '1:00' },
    { start: '1:00', end: '2:00', locked: true, label: 'LUNCH' },
    { start: '2:00', end: '2:40' },
    { start: '2:40', end: '3:20' },
    { start: '3:20', end: '4:45' },
  ],
};

export const ECDE_CONFIG: TimetableConfig = {
  type: 'ecde',
  periods: [
    { start: '8:00', end: '8:30', locked: true, label: 'FREE CHOICE' },
    { start: '8:30', end: '9:00', locked: true, label: 'HEALTH CHECK' },
    { start: '9:00', end: '9:30' },
    { start: '9:30', end: '10:00' },
    { start: '10:00', end: '10:10', locked: true, label: 'BREAK' },
    { start: '10:10', end: '10:40' },
    { start: '10:40', end: '11:00', locked: true, label: 'BREAK' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '12:00', end: '1:00', locked: true, label: 'LUNCH' },
  ],
};

const DAYS: MasterTimetableSlot['day'][] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

interface AssignmentInput {
  id: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  stream_id: string;
  stream_name: string;
}

export function getLockedSlots(config: TimetableConfig): MasterTimetableSlot[] {
  const slots: MasterTimetableSlot[] = [];
  for (const day of DAYS) {
    config.periods.forEach((period, idx) => {
      if (period.locked) {
        slots.push({
          id: `locked-${config.type}-${day}-${idx}`,
          timetableType: config.type,
          classId: '',
          className: '',
          streamId: '',
          streamName: '',
          day,
          periodIndex: idx,
          timeStart: period.start,
          timeEnd: period.end,
          subjectId: '',
          subjectName: period.label || '',
          teacherId: '',
          teacherName: '',
          teacherCode: '',
          isLocked: true,
          lockedLabel: period.label,
        });
      }
    });
  }
  return slots;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTimetable(
  config: TimetableConfig,
  assignments: AssignmentInput[],
  teacherCodes: Record<string, string>
): MasterTimetableSlot[] {
  const slots: MasterTimetableSlot[] = [];

  const teachableIndices: number[] = [];
  config.periods.forEach((p, idx) => {
    if (!p.locked) teachableIndices.push(idx);
  });

  const streamMap = new Map<string, AssignmentInput[]>();
  for (const a of assignments) {
    const key = `${a.class_id}::${a.stream_id}`;
    if (!streamMap.has(key)) streamMap.set(key, []);
    streamMap.get(key)!.push(a);
  }

  const teacherSchedule = new Map<string, Set<string>>();
  const getTeacherKey = (teacherId: string, day: string, periodIdx: number) =>
    `${teacherId}-${day}-${periodIdx}`;
  const isTeacherFree = (teacherId: string, day: string, periodIdx: number) => {
    const key = getTeacherKey(teacherId, day, periodIdx);
    return !teacherSchedule.has(key);
  };
  const bookTeacher = (teacherId: string, day: string, periodIdx: number, slotId: string) => {
    const key = getTeacherKey(teacherId, day, periodIdx);
    if (!teacherSchedule.has(key)) teacherSchedule.set(key, new Set());
    teacherSchedule.get(key)!.add(slotId);
  };

  for (const [streamKey, streamAssignments] of streamMap.entries()) {
    const [classId, streamId] = streamKey.split('::');
    const firstAssignment = streamAssignments[0];
    const className = firstAssignment.class_name;
    const streamName = firstAssignment.stream_name;

    for (const day of DAYS) {
      for (const periodIdx of teachableIndices) {
        const period = config.periods[periodIdx];
        if (period.locked) continue;

        slots.push({
          id: `locked-${config.type}-${classId}-${streamId}-${day}-${periodIdx}`,
          timetableType: config.type,
          classId,
          className,
          streamId,
          streamName,
          day,
          periodIndex: periodIdx,
          timeStart: period.start,
          timeEnd: period.end,
          subjectId: '',
          subjectName: '',
          teacherId: '',
          teacherName: '',
          teacherCode: '',
          isLocked: false,
        });
      }
    }

    const totalTeachableSlots = DAYS.length * teachableIndices.length;
    const subjectCount = streamAssignments.length;
    if (subjectCount === 0) continue;

    const slotsPerSubject = Math.floor(totalTeachableSlots / subjectCount);
    const remainder = totalTeachableSlots % subjectCount;

    const subjectSlotCounts: { assignment: AssignmentInput; count: number }[] = [];
    streamAssignments.forEach((a, i) => {
      subjectSlotCounts.push({
        assignment: a,
        count: slotsPerSubject + (i < remainder ? 1 : 0),
      });
    });

    const subjectQueue: AssignmentInput[] = [];
    for (const { assignment, count } of subjectSlotCounts) {
      for (let i = 0; i < count; i++) {
        subjectQueue.push(assignment);
      }
    }

    const daySubjectCount = new Map<string, Map<string, number>>();
    for (const day of DAYS) {
      daySubjectCount.set(day, new Map());
    }

    const shuffledQueue = shuffleArray(subjectQueue);

    const orderedSlots: { day: MasterTimetableSlot['day']; periodIdx: number }[] = [];
    for (const day of DAYS) {
      for (const periodIdx of teachableIndices) {
        orderedSlots.push({ day, periodIdx });
      }
    }

    let queueIdx = 0;
    for (const { day, periodIdx } of orderedSlots) {
      if (queueIdx >= shuffledQueue.length) break;

      const slotIndex = slots.findIndex(
        (s) =>
          s.classId === classId &&
          s.streamId === streamId &&
          s.day === day &&
          s.periodIndex === periodIdx &&
          !s.isLocked
      );
      if (slotIndex === -1) continue;

      let assigned = false;
      for (let attempt = 0; attempt < shuffledQueue.length; attempt++) {
        const candidateIdx = (queueIdx + attempt) % shuffledQueue.length;
        const candidate = shuffledQueue[candidateIdx];

        if (!isTeacherFree(candidate.teacher_id, day, periodIdx)) continue;

        const dayMap = daySubjectCount.get(day)!;
        const currentCount = dayMap.get(candidate.subject_id) || 0;
        if (currentCount >= 2) continue;

        const slotId = `gen-${config.type}-${classId}-${streamId}-${day}-${periodIdx}`;
        slots[slotIndex] = {
          id: slotId,
          timetableType: config.type,
          classId,
          className,
          streamId,
          streamName,
          day,
          periodIndex: periodIdx,
          timeStart: config.periods[periodIdx].start,
          timeEnd: config.periods[periodIdx].end,
          subjectId: candidate.subject_id,
          subjectName: candidate.subject_name,
          teacherId: candidate.teacher_id,
          teacherName: candidate.teacher_name,
          teacherCode: teacherCodes[candidate.teacher_id] || '',
          isLocked: false,
        };

        bookTeacher(candidate.teacher_id, day, periodIdx, slotId);
        dayMap.set(candidate.subject_id, currentCount + 1);

        shuffledQueue.splice(candidateIdx, 1);
        if (candidateIdx < queueIdx) queueIdx--;
        assigned = true;
        break;
      }

      if (!assigned) {
        const candidate = shuffledQueue[queueIdx % shuffledQueue.length];
        if (candidate) {
          const slotId = `gen-${config.type}-${classId}-${streamId}-${day}-${periodIdx}`;
          slots[slotIndex] = {
            id: slotId,
            timetableType: config.type,
            classId,
            className,
            streamId,
            streamName,
            day,
            periodIndex: periodIdx,
            timeStart: config.periods[periodIdx].start,
            timeEnd: config.periods[periodIdx].end,
            subjectId: candidate.subject_id,
            subjectName: candidate.subject_name,
            teacherId: candidate.teacher_id,
            teacherName: candidate.teacher_name,
            teacherCode: teacherCodes[candidate.teacher_id] || '',
            isLocked: false,
          };
          bookTeacher(candidate.teacher_id, day, periodIdx, slotId);
          shuffledQueue.splice(queueIdx % shuffledQueue.length, 1);
        }
      }
    }
  }

  const lockedSlots = getLockedSlots(config);
  for (const [streamKey] of streamMap.entries()) {
    const [classId, streamId] = streamKey.split('::');
    const firstAssignment = streamMap.get(streamKey)![0];
    for (const ls of lockedSlots) {
      slots.push({
        ...ls,
        id: `locked-${config.type}-${classId}-${streamId}-${ls.day}-${ls.periodIndex}`,
        classId,
        className: firstAssignment.class_name,
        streamId,
        streamName: firstAssignment.stream_name,
      });
    }
  }

  return slots;
}
