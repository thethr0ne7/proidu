import { describe, expect, it } from 'vitest';
import {
  calculateMatches,
  calculateMatchesByTotal,
  classifyDelta,
  getApplicantTotal,
  getMinimumExamTotal,
  selectShowcase
} from './scoring';
import type { ApplicantInput } from '../types';

const input: ApplicantInput = {
  profile: 'it',
  city: 'any',
  achievements: 0,
  scores: {
    russian: 80, math: 78, informatics: 85,
    physics: 0, social: 0, biology: 0, chemistry: 0,
    history: 0, literature: 0
  }
};

describe('scoring', () => {
  it('sums profile subjects', () => {
    expect(getApplicantTotal(input)).toBe(243);
  });

  it('classifies deltas into three bands', () => {
    expect(classifyDelta(10)).toBe('safe');
    expect(classifyDelta(-8)).toBe('realistic');
    expect(classifyDelta(-9)).toBe('ambitious');
  });

  it('returns profile matches and showcase', () => {
    const matches = calculateMatches(input);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.program.profile === 'it')).toBe(true);
    expect(selectShowcase(matches).length).toBeLessThanOrEqual(3);
  });

  it('searches by total only inside a compatible exam set', () => {
    const matches = calculateMatchesByTotal(['russian', 'biology', 'chemistry'], 250, 'nalchik');
    expect(matches.length).toBe(3);
    expect(matches.every((match) => match.program.profile === 'medicine')).toBe(true);
    expect(matches.every((match) => match.total === 250)).toBe(true);
  });

  it('calculates the official minimum sum for an exam set', () => {
    expect(getMinimumExamTotal(['russian', 'math', 'informatics'])).toBe(126);
  });
});
