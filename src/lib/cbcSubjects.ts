export type CbcSubjectLevel = 'ECDE' | 'Lower Primary' | 'Upper Primary' | 'Junior School';

export type CbcSubjectGroup = {
  value: CbcSubjectLevel;
  label: string;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
};

export const CBC_SUBJECT_GROUPS: CbcSubjectGroup[] = [
  {
    value: 'ECDE',
    label: 'ECDE (PP1-PP2)',
    subjects: [
      { id: 'ecde-language-activities', name: 'Language Activities', code: 'EC-LANG' },
      { id: 'ecde-mathematical-activities', name: 'Mathematical Activities', code: 'EC-MATH' },
      { id: 'ecde-environmental-activities', name: 'Environmental Activities', code: 'EC-ENV' },
      { id: 'ecde-psychomotor-creative-activities', name: 'Psychomotor & Creative Activities', code: 'EC-PCA' },
      { id: 'ecde-religious-education', name: 'Religious Education (CRE/IRE)', code: 'EC-RE' },
    ],
  },
  {
    value: 'Lower Primary',
    label: 'Lower Primary (Grade 1-3)',
    subjects: [
      { id: 'lp-english', name: 'English', code: 'LP-ENG' },
      { id: 'lp-kiswahili-ksl', name: 'Kiswahili / KSL', code: 'LP-KIS' },
      { id: 'lp-indigenous-language', name: 'Indigenous Language', code: 'LP-IND' },
      { id: 'lp-mathematics', name: 'Mathematics', code: 'LP-MATH' },
      { id: 'lp-environmental-activities', name: 'Environmental Activities', code: 'LP-ENV' },
      { id: 'lp-religious-education', name: 'Religious Education (CRE/IRE)', code: 'LP-RE' },
      { id: 'lp-creative-arts', name: 'Creative Arts', code: 'LP-CA' },
      { id: 'lp-physical-health-education', name: 'Physical & Health Education', code: 'LP-PHE' },
    ],
  },
  {
    value: 'Upper Primary',
    label: 'Upper Primary (Grade 4-6)',
    subjects: [
      { id: 'up-english', name: 'English', code: 'UP-ENG' },
      { id: 'up-kiswahili-ksl', name: 'Kiswahili / KSL', code: 'UP-KIS' },
      { id: 'up-mathematics', name: 'Mathematics', code: 'UP-MATH' },
      { id: 'up-science-technology', name: 'Science & Technology', code: 'UP-ST' },
      { id: 'up-social-studies', name: 'Social Studies', code: 'UP-SS' },
      { id: 'up-agriculture', name: 'Agriculture', code: 'UP-AGR' },
      { id: 'up-creative-arts', name: 'Creative Arts', code: 'UP-CA' },
      { id: 'up-religious-education', name: 'Religious Education (CRE/IRE)', code: 'UP-RE' },
    ],
  },
  {
    value: 'Junior School',
    label: 'Junior School (Grade 7-9)',
    subjects: [
      { id: 'js-english', name: 'English', code: 'JS-ENG' },
      { id: 'js-kiswahili-ksl', name: 'Kiswahili / KSL', code: 'JS-KIS' },
      { id: 'js-mathematics', name: 'Mathematics', code: 'JS-MATH' },
      { id: 'js-integrated-science', name: 'Integrated Science', code: 'JS-IS' },
      { id: 'js-social-studies', name: 'Social Studies', code: 'JS-SS' },
      { id: 'js-religious-education', name: 'Religious Education (CRE/IRE)', code: 'JS-RE' },
      { id: 'js-pre-technical-studies', name: 'Pre-Technical Studies', code: 'JS-PTS' },
      { id: 'js-agriculture', name: 'Agriculture', code: 'JS-AGR' },
      { id: 'js-creative-arts-sports', name: 'Creative Arts & Sports', code: 'JS-CAS' },
    ],
  },
];

export const CBC_SUBJECT_LEVEL_LABELS: Record<CbcSubjectLevel, string> = {
  ECDE: 'ECDE (PP1-PP2)',
  'Lower Primary': 'Lower Primary (Grade 1-3)',
  'Upper Primary': 'Upper Primary (Grade 4-6)',
  'Junior School': 'Junior School (Grade 7-9)',
};

export const CBC_SUBJECT_NAME_TO_LEVEL = new Map(
  CBC_SUBJECT_GROUPS.flatMap((group) => group.subjects.map((subject) => [subject.name.toLowerCase(), group.value] as const))
);

export const CBC_HOI_SUBJECTS = CBC_SUBJECT_GROUPS.flatMap((group) =>
  group.subjects.map((subject) => ({
    ...subject,
    category: group.value,
  }))
);

export const getCbcLevelForClassName = (className: string): CbcSubjectLevel | null => {
  const normalized = className.trim().toLowerCase();

  if (normalized === 'pp1' || normalized === 'pp2') return 'ECDE';

  const gradeMatch = normalized.match(/grade\s*(\d+)/i);
  if (!gradeMatch) return null;

  const grade = Number(gradeMatch[1]);
  if (grade >= 1 && grade <= 3) return 'Lower Primary';
  if (grade >= 4 && grade <= 6) return 'Upper Primary';
  if (grade >= 7 && grade <= 9) return 'Junior School';

  return null;
};
