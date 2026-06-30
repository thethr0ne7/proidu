import type { Program, ProfileId, SubjectId } from '../types';

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  russian: 'Русский язык',
  math: 'Профильная математика',
  physics: 'Физика',
  informatics: 'Информатика',
  social: 'Обществознание',
  biology: 'Биология',
  chemistry: 'Химия',
  history: 'История',
  literature: 'Литература'
};

export const SUBJECT_MINIMUMS: Record<SubjectId, number> = {
  russian: 40,
  math: 40,
  physics: 41,
  informatics: 46,
  social: 45,
  biology: 40,
  chemistry: 40,
  history: 40,
  literature: 40
};

export const PROFILE_LABELS: Record<ProfileId, string> = {
  it: 'IT и данные',
  engineering: 'Инженерия',
  economics: 'Управление',
  medicine: 'Медицина',
  psychology: 'Психология',
  law: 'Право',
  pedagogy: 'Социальная сфера',
  design: 'Туризм и сервис'
};

export const AVAILABLE_PROFILES: ProfileId[] = [
  'it', 'engineering', 'economics', 'medicine', 'psychology', 'pedagogy'
];

export const PROFILE_SUBJECTS: Record<ProfileId, [SubjectId, SubjectId, SubjectId]> = {
  it: ['russian', 'math', 'informatics'],
  engineering: ['russian', 'math', 'physics'],
  economics: ['russian', 'math', 'social'],
  medicine: ['russian', 'biology', 'chemistry'],
  psychology: ['russian', 'biology', 'social'],
  law: ['russian', 'social', 'history'],
  pedagogy: ['russian', 'social', 'history'],
  design: ['russian', 'social', 'history']
};

const SOURCE_URL = 'https://pk.kbsu.ru/bakalavriat-specialitet-magistratura-2/';
const SOURCE_LABEL = 'КБГУ: проходной балл 2025 · основные бюджетные места 2026';

// Проверенный пилотный набор КБГУ. Проходные баллы — бюджет 2025,
// количество мест — основные бюджетные места очной формы на 2026/27.
export const PROGRAMS: Program[] = [
  { id: 'kbsu-010302', code: '01.03.02', university: 'КБГУ', title: 'Прикладная математика и информатика', city: 'nalchik', profile: 'it', subjects: ['russian','math','informatics'], historicalThreshold: 193, budgetPlaces: 13, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-090301-ai', code: '09.03.01', university: 'КБГУ', title: 'Интеллектуальные системы обработки информации и управления', city: 'nalchik', profile: 'it', subjects: ['russian','math','informatics'], historicalThreshold: 206, budgetPlaces: 11, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-090301-dev', code: '09.03.01', university: 'КБГУ', title: 'Программирование интеллектуальных и автоматизированных систем', city: 'nalchik', profile: 'it', subjects: ['russian','math','informatics'], historicalThreshold: 215, budgetPlaces: 11, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-090303', code: '09.03.03', university: 'КБГУ', title: 'Прикладная информатика в цифровой экономике', city: 'nalchik', profile: 'it', subjects: ['russian','math','informatics'], historicalThreshold: 196, budgetPlaces: 10, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-100301', code: '10.03.01', university: 'КБГУ', title: 'Организация и технология защиты информации', city: 'nalchik', profile: 'it', subjects: ['russian','math','informatics'], historicalThreshold: 231, budgetPlaces: 16, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },

  { id: 'kbsu-080301', code: '08.03.01', university: 'КБГУ', title: 'Промышленное и гражданское строительство', city: 'nalchik', profile: 'engineering', subjects: ['russian','math','physics'], historicalThreshold: 196, budgetPlaces: 21, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-110301', code: '11.03.01', university: 'КБГУ', title: 'Интегрированные системы безопасности', city: 'nalchik', profile: 'engineering', subjects: ['russian','math','physics'], historicalThreshold: 162, budgetPlaces: 10, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-110303', code: '11.03.03', university: 'КБГУ', title: 'Конструирование и технология радиоэлектронных средств', city: 'nalchik', profile: 'engineering', subjects: ['russian','math','physics'], historicalThreshold: 138, budgetPlaces: 10, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-150306', code: '15.03.06', university: 'КБГУ', title: 'Промышленная робототехника и робототехнические системы', city: 'nalchik', profile: 'engineering', subjects: ['russian','math','physics'], historicalThreshold: 158, budgetPlaces: 15, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-270304', code: '27.03.04', university: 'КБГУ', title: 'Информационные технологии в управлении техническими системами', city: 'nalchik', profile: 'engineering', subjects: ['russian','math','physics'], historicalThreshold: 151, budgetPlaces: 11, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },

  { id: 'kbsu-380302', code: '38.03.02', university: 'КБГУ', title: 'Управление бизнесом', city: 'nalchik', profile: 'economics', subjects: ['russian','math','social'], historicalThreshold: 230, budgetPlaces: 6, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },

  { id: 'kbsu-310501', code: '31.05.01', university: 'КБГУ', title: 'Лечебное дело', city: 'nalchik', profile: 'medicine', subjects: ['russian','biology','chemistry'], historicalThreshold: 259, budgetPlaces: 19, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-320501', code: '32.05.01', university: 'КБГУ', title: 'Медико-профилактическое дело', city: 'nalchik', profile: 'medicine', subjects: ['russian','biology','chemistry'], historicalThreshold: 205, budgetPlaces: 11, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-330501', code: '33.05.01', university: 'КБГУ', title: 'Фармация', city: 'nalchik', profile: 'medicine', subjects: ['russian','biology','chemistry'], historicalThreshold: 204, budgetPlaces: 12, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },

  { id: 'kbsu-370501', code: '37.05.01', university: 'КБГУ', title: 'Клиническая психология', city: 'nalchik', profile: 'psychology', subjects: ['russian','biology','social'], historicalThreshold: 206, budgetPlaces: 9, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },

  { id: 'kbsu-390301', code: '39.03.01', university: 'КБГУ', title: 'Социология', city: 'nalchik', profile: 'pedagogy', subjects: ['russian','social','history'], historicalThreshold: 213, budgetPlaces: 10, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-390302', code: '39.03.02', university: 'КБГУ', title: 'Социальная работа в системе социальных служб', city: 'nalchik', profile: 'pedagogy', subjects: ['russian','social','history'], historicalThreshold: 202, budgetPlaces: 8, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false },
  { id: 'kbsu-390303', code: '39.03.03', university: 'КБГУ', title: 'Технологии конфликтменеджмента в молодёжной сфере', city: 'nalchik', profile: 'pedagogy', subjects: ['russian','social','history'], historicalThreshold: 192, budgetPlaces: 7, sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL, isDemo: false }
];

export const EXAM_SETS = [
  { id: 'russian-math-informatics', subjects: ['russian', 'math', 'informatics'] },
  { id: 'russian-math-physics', subjects: ['russian', 'math', 'physics'] },
  { id: 'russian-math-social', subjects: ['russian', 'math', 'social'] },
  { id: 'russian-biology-chemistry', subjects: ['russian', 'biology', 'chemistry'] },
  { id: 'russian-biology-social', subjects: ['russian', 'biology', 'social'] },
  { id: 'russian-social-history', subjects: ['russian', 'social', 'history'] }
] satisfies import('../types').ExamSetOption[];
