import {
  FolderTree,
  Bell,
  LineChart,
  FileDown,
  Map,
  Dna,
} from 'lucide-react';

const FEATURES = [
  {
    Icon: FolderTree,
    title: 'Smart Folders',
    desc: 'Organize your strain library by mood, time of day, or any custom label. Drag and drop.',
  },
  {
    Icon: Bell,
    title: 'Strain Alerts',
    desc: 'Get notified when a saved strain comes back in stock at a nearby dispensary.',
  },
  {
    Icon: LineChart,
    title: 'Consumption Log',
    desc: 'Track your sessions over time. See patterns in what works best for you.',
  },
  {
    Icon: FileDown,
    title: 'Export Lab Data',
    desc: 'Download full COA PDFs for any strain in the catalog. Shareable, printable.',
  },
  {
    Icon: Map,
    title: 'Live Inventory Map',
    desc: 'See real-time stock across all PNW dispensaries on a live interactive map.',
  },
  {
    Icon: Dna,
    title: 'Genetic Deep Dives',
    desc: 'Access extended lineage reports and full terpene breakdowns for every strain.',
  },
] as const;

const COMPARE: [string, boolean, boolean][] = [
  ['Strain Catalog', true, true],
  ['Dispensary Finder', true, true],
  ['Basic Library (saves)', true, true],
  ['Trip Reports', true, true],
  ['Smart Folders', false, true],
  ['Strain Alerts', false, true],
  ['Consumption Log', false, true],
  ['COA PDF Export', false, true],
  ['Live Inventory Map', false, true],
  ['Genetic Deep Dives', false, true],
];

export default function PremiumPage() {
  return (
    <div className="page">
      <div className="premium-page">
        <div className="premium-hero">
          <div
            className="hero-eyebrow"
            style={{
              background: 'rgba(212,168,83,.1)',
              border: '1px solid rgba(212,168,83,.25)',
              color: 'var(--amber)',
            }}
          >
            Untapped Market Premium
          </div>
          <h1>
            The full picture,<br />
            <em>at your fingertips.</em>
          </h1>
          <p>
            Go deeper than any other cannabis platform. Premium unlocks the
            features that serious PNW consumers actually need.
          </p>
        </div>

        <div className="premium-layout">
          <div>
            <div className="feature-list">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="feature-item">
                  <div
                    className="feature-icon"
                    aria-hidden="true"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="feature-title">{title}</div>
                    <div className="feature-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-card" style={{ marginTop: '2rem' }}>
              <div
                style={{
                  fontFamily: 'DM Serif Display',
                  fontStyle: 'italic',
                  fontSize: '1.2rem',
                  color: 'var(--text)',
                  marginBottom: '1rem',
                }}
              >
                Free vs Premium
              </div>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th style={{ color: 'var(--amber)' }}>Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(([label, free, premium]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>
                        {free ? (
                          <span className="check">✓</span>
                        ) : (
                          <span className="cross">—</span>
                        )}
                      </td>
                      <td>
                        {premium ? (
                          <span className="check">✓</span>
                        ) : (
                          <span className="cross">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="pricing-card">
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--amber)',
                  marginBottom: '0.75rem',
                }}
              >
                Premium Plan
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.25rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span className="pricing-amount">$7</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="pricing-period" style={{ marginBottom: '1.25rem' }}>
                or $63/year — 2 months free
              </div>
              <button
                className="btn btn-amber w-full"
                style={{ marginBottom: '0.75rem' }}
              >
                Start 7-Day Free Trial
              </button>
              <button className="btn btn-ghost w-full btn-sm">
                Continue with Free
              </button>
              <hr className="pricing-divider" />
              <ul className="pricing-features">
                <li>All 6 premium features</li>
                <li>Cancel anytime</li>
                <li>Works on web + mobile (V2)</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
