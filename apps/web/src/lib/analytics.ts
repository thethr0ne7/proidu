import type { AnalyticsEvent } from '../types';

const STORAGE_KEY = 'proidu_analytics_v1';

export function track(name: string, payload?: Record<string, unknown>): void {
  const event: AnalyticsEvent = { name, payload, timestamp: new Date().toISOString() };
  try {
    const events = getEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-200)));
  } catch {
    // Analytics must never block the core product flow.
  }
}

export function getEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function countEvent(name: string): number {
  return getEvents().filter((event) => event.name === name).length;
}
