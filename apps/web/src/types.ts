export type ProfileId =
  | 'it'
  | 'engineering'
  | 'economics'
  | 'medicine'
  | 'psychology'
  | 'law'
  | 'pedagogy'
  | 'design';

export type SubjectId =
  | 'russian'
  | 'math'
  | 'physics'
  | 'informatics'
  | 'social'
  | 'biology'
  | 'chemistry'
  | 'history'
  | 'literature';

export type CityId = 'any' | 'nalchik' | 'moscow' | 'spb' | 'regional';
export type SearchMode = 'profile' | 'score';

export interface ApplicantInput {
  profile: ProfileId;
  city: CityId;
  scores: Record<SubjectId, number>;
  achievements: number;
}

export interface ExamSetOption {
  id: string;
  subjects: [SubjectId, SubjectId, SubjectId];
}

export interface ScoreSearchInput {
  examSetId: string;
  examTotal: number;
  city: CityId;
}

export interface Program {
  id: string;
  code: string;
  university: string;
  title: string;
  city: Exclude<CityId, 'any'>;
  profile: ProfileId;
  subjects: [SubjectId, SubjectId, SubjectId];
  historicalThreshold: number;
  budgetPlaces: number;
  sourceLabel: string;
  sourceUrl: string;
  isDemo: boolean;
}

export type ChanceBand = 'safe' | 'realistic' | 'ambitious';

export interface ProgramMatch {
  program: Program;
  total: number;
  delta: number;
  index: number;
  band: ChanceBand;
  explanation: string;
}

export interface ChallengePayload {
  version: 1;
  profile: ProfileId;
  city: CityId;
  total: number;
  index: number;
  nonce: string;
}

export interface AnalyticsEvent {
  name: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
