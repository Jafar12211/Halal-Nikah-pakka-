import React from 'react';
import type { UserProfile } from '../types/database';

interface Props {
  profile: UserProfile;
}

const OMIT_KEYS = new Set([
  'documents',
  'photos',
  'photoUrl',
  'avatarBgColor',
  'avatarInitials',
]);

function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) {
    return value.length ? value.map((item) => displayValue(item)).join(', ') : 'None provided';
  }
  if (typeof value === 'object') {
    const timestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof timestamp.toDate === 'function') {
      try { return timestamp.toDate().toLocaleString(); } catch { /* fall through */ }
    }
    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${humanize(key)}: ${displayValue(item)}`)
      .join(' · ');
  }
  return String(value);
}

export const AdminCandidateFullDetails: React.FC<Props> = ({ profile }) => {
  const entries = Object.entries(profile as unknown as Record<string, unknown>)
    .filter(([key]) => !OMIT_KEYS.has(key))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <section className="rounded-xl border border-emerald-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
        <h4 className="text-sm font-bold text-emerald-950">Complete submitted candidate biodata</h4>
        <p className="text-[11px] text-emerald-800 mt-0.5">
          Administrator-only view of every saved registration field. Private identity files are shown separately in the protected document review section.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-stone-200">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0 bg-white px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-stone-500 mb-1">
              {humanize(key)}
            </div>
            <div className="text-xs text-stone-900 break-words whitespace-pre-wrap">
              {displayValue(value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
