import { PROGRAMS, PROFILE_SUBJECTS, SUBJECT_MINIMUMS } from '../data/programs';
import type { ApplicantInput, ChanceBand, CityId, ProgramMatch, SubjectId } from '../types';

export function getApplicantTotal(input: ApplicantInput): number {
  const subjects = PROFILE_SUBJECTS[input.profile];
  const examTotal = subjects.reduce((sum, subject) => sum + clamp(input.scores[subject], 0, 100), 0);
  return examTotal + clamp(input.achievements, 0, 10);
}

export function getMinimumExamTotal(subjects: [SubjectId, SubjectId, SubjectId]): number {
  return subjects.reduce((sum, subject) => sum + SUBJECT_MINIMUMS[subject], 0);
}

export function classifyDelta(delta: number): ChanceBand {
  if (delta >= 10) return 'safe';
  if (delta >= -8) return 'realistic';
  return 'ambitious';
}

export function chanceIndex(delta: number, budgetPlaces: number): number {
  const placeBonus = Math.min(8, Math.round(budgetPlaces / 15));
  return clamp(Math.round(55 + delta * 1.7 + placeBonus), 8, 96);
}

export function calculateMatches(input: ApplicantInput): ProgramMatch[] {
  const total = getApplicantTotal(input);

  return PROGRAMS
    .filter((program) => program.profile === input.profile)
    .filter((program) => input.city === 'any' || program.city === input.city)
    .map((program) => createMatch(program, total, false))
    .sort(sortMatches);
}

export function calculateMatchesByTotal(
  subjects: [SubjectId, SubjectId, SubjectId],
  examTotal: number,
  city: CityId = 'any'
): ProgramMatch[] {
  const total = clamp(examTotal, 0, 300);

  return PROGRAMS
    .filter((program) => sameSubjects(program.subjects, subjects))
    .filter((program) => city === 'any' || program.city === city)
    .map((program) => createMatch(program, total, true))
    .sort(sortMatches);
}

export function selectShowcase(matches: ProgramMatch[]): ProgramMatch[] {
  const preferredOrder: ChanceBand[] = ['safe', 'realistic', 'ambitious'];
  const selected: ProgramMatch[] = [];

  for (const band of preferredOrder) {
    const found = matches.find((match) => match.band === band && !selected.includes(match));
    if (found) selected.push(found);
  }

  for (const match of matches) {
    if (selected.length >= 3) break;
    if (!selected.includes(match)) selected.push(match);
  }

  return selected.slice(0, 3);
}

function createMatch(program: (typeof PROGRAMS)[number], total: number, totalSearch: boolean): ProgramMatch {
  const delta = total - program.historicalThreshold;
  const band = classifyDelta(delta);
  const index = chanceIndex(delta, program.budgetPlaces);
  const explanation = totalSearch
    ? buildTotalSearchExplanation(delta, band)
    : buildExplanation(delta, band);

  return { program, total, delta, band, index, explanation };
}

function buildExplanation(delta: number, band: ChanceBand): string {
  if (band === 'safe') return `Ваш результат выше проходного балла 2025 года на ${delta} баллов.`;
  if (band === 'realistic') {
    return delta >= 0
      ? `Ваш результат выше проходного балла 2025 года на ${delta} баллов, но конкурс может измениться.`
      : `До проходного балла 2025 года ${Math.abs(delta)} баллов — вариант остаётся в зоне борьбы.`;
  }
  return `До проходного балла 2025 года ${Math.abs(delta)} баллов. Рассматривайте как амбициозный вариант.`;
}

function buildTotalSearchExplanation(delta: number, band: ChanceBand): string {
  const possibleDelta = delta + 10;

  if (band === 'safe') {
    return `Даже без индивидуальных достижений сумма выше ориентира 2025 года на ${delta} баллов.`;
  }

  if (possibleDelta >= 0) {
    return delta >= 0
      ? `Сумма ЕГЭ выше ориентира на ${delta} баллов. Индивидуальные достижения могут добавить ещё до 10 баллов по правилам вуза.`
      : `Без ИД не хватает ${Math.abs(delta)} баллов, но достижения могут поднять конкурсную сумму до +${possibleDelta} относительно ориентира.`;
  }

  return `Даже при максимальных 10 баллах за ИД до ориентира останется ${Math.abs(possibleDelta)} баллов.`;
}

function sameSubjects(a: [SubjectId, SubjectId, SubjectId], b: [SubjectId, SubjectId, SubjectId]): boolean {
  return [...a].sort().join('|') === [...b].sort().join('|');
}

function sortMatches(a: ProgramMatch, b: ProgramMatch): number {
  const bandWeight: Record<ChanceBand, number> = { safe: 0, realistic: 1, ambitious: 2 };
  const bandDifference = bandWeight[a.band] - bandWeight[b.band];
  if (bandDifference !== 0) return bandDifference;
  return Math.abs(a.delta) - Math.abs(b.delta);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
