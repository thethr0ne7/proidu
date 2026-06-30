import type { ChallengePayload, CityId, ProfileId } from '../types';

const PROFILE_CODES: Record<ProfileId, string> = {
  it: 'i', engineering: 'e', economics: 'o', medicine: 'm',
  psychology: 'p', law: 'l', pedagogy: 'g', design: 'd'
};
const PROFILE_FROM_CODE = Object.fromEntries(Object.entries(PROFILE_CODES).map(([key, value]) => [value, key])) as Record<string, ProfileId>;

const CITY_CODES: Record<CityId, string> = {
  any: 'a', nalchik: 'n', moscow: 'm', spb: 's', regional: 'r'
};
const CITY_FROM_CODE = Object.fromEntries(Object.entries(CITY_CODES).map(([key, value]) => [value, key])) as Record<string, CityId>;

export function encodeChallenge(payload: ChallengePayload): string {
  return [
    'c1',
    PROFILE_CODES[payload.profile],
    CITY_CODES[payload.city],
    Math.round(payload.total).toString(36),
    Math.round(payload.index).toString(36),
    payload.nonce.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 8)
  ].join('_');
}

export function decodeChallenge(raw?: string | null): ChallengePayload | null {
  if (!raw) return null;
  const parts = raw.split('_');
  if (parts.length !== 6 || parts[0] !== 'c1') return null;

  const profile = PROFILE_FROM_CODE[parts[1]];
  const city = CITY_FROM_CODE[parts[2]];
  const total = Number.parseInt(parts[3], 36);
  const index = Number.parseInt(parts[4], 36);
  const nonce = parts[5];

  if (!profile || !city || !Number.isFinite(total) || !Number.isFinite(index) || !nonce) return null;
  if (total < 0 || total > 310 || index < 0 || index > 100) return null;

  return { version: 1, profile, city, total, index, nonce };
}

export function getIncomingStartParam(): string | null {
  const query = new URLSearchParams(window.location.search);
  const queryValue = query.get('tgWebAppStartParam') ?? query.get('startapp') ?? query.get('challenge');
  if (queryValue) return queryValue;

  const telegram = window.Telegram?.WebApp;
  return telegram?.initDataUnsafe?.start_param ?? null;
}
