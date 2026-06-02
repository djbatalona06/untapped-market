import { useState } from 'react';
import EmptyState from '@/components/EmptyState';

type AdminTab =
  | 'strains'
  | 'media'
  | 'reports'
  | 'dispensaries'
  | 'staffPicks';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'strains', label: 'Strain Management' },
  { id: 'media', label: 'Media Approval Queue' },
  { id: 'reports', label: 'Trip Report Moderation' },
  { id: 'dispensaries', label: 'Dispensary Management' },
  { id: 'staffPicks', label: 'Staff Picks' },
];

/**
 * V1 spec #9.5 — admin shell. Each tab is a stub for V2 wiring to
 * Supabase. Route is role-gated in App.tsx via <RequireAdmin>.
 */
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('strains');

  return (
    <div className="page">
      <div className="admin-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontFamily: 'DM Serif Display',
              fontStyle: 'italic',
              fontSize: '2rem',
              color: 'var(--text)',
              marginBottom: '0.3rem',
            }}
          >
            Admin Console
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            Internal tooling — content moderation, catalog management, featured
            strain toggles.
          </p>
        </div>

        <div
          className="type-tabs"
          role="tablist"
          aria-label="Admin sections"
          style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`type-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="section-card">
          {tab === 'strains' && (
            <EmptyState
              icon="🧪"
              title="Strain Management"
              description="Add, edit, or remove strains in the catalog. Wired to Supabase in V2."
            />
          )}
          {tab === 'media' && (
            <EmptyState
              icon="🎞️"
              title="Media Approval Queue"
              description="Pending media submissions will appear here for review."
            />
          )}
          {tab === 'reports' && (
            <EmptyState
              icon="🚩"
              title="Trip Report Moderation"
              description="Flagged or pending trip reports for moderator review."
            />
          )}
          {tab === 'dispensaries' && (
            <EmptyState
              icon="📍"
              title="Dispensary Management"
              description="Manage dispensary listings, hours, inventory links."
            />
          )}
          {tab === 'staffPicks' && (
            <EmptyState
              icon="⭐"
              title="Staff Pick toggles"
              description="Toggle which strains appear in the homepage Staff Picks rail."
            />
          )}
        </div>
      </div>
    </div>
  );
}
