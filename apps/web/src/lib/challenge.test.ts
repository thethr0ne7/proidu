import { describe, expect, it } from 'vitest';
import { decodeChallenge, encodeChallenge } from './challenge';
import type { ChallengePayload } from '../types';

const payload: ChallengePayload = {
  version: 1,
  profile: 'medicine',
  city: 'nalchik',
  total: 267,
  index: 78,
  nonce: 'abc123'
};

describe('challenge token', () => {
  it('round-trips compact payloads', () => {
    const encoded = encodeChallenge(payload);
    expect(decodeChallenge(encoded)).toEqual(payload);
  });

  it('rejects malformed payloads', () => {
    expect(decodeChallenge('bad')).toBeNull();
    expect(decodeChallenge('c1_x_n_1_2_abc')).toBeNull();
  });
});
