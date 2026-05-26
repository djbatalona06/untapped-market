import { useStore } from '../store/useStore';
import type { Tier } from '../types';

const COMPARE: Array<[string, boolean, boolean, boolean]> = [
  ['Full strain library + lab data', true, true, true],
  ['Map & dispensary finder', true, true, true],
  ['Bookmarks', true, true, true],
  ['AI Match quiz', true, true, true],
  ['Restock & price-drop alerts', false, true, true],
  ['Smart folders + custom tags', false, true, true],
  ['COA PDF export', false, true, true],
  ['Concierge growers list', false, false, true],
  ['Wholesale API keys', false, false, true],
  ['White-label embed', false, false, true],
];

interface TierDef {
  id: Tier;
  name: string;
  price: string;
  blurb: string;
  features: string[];
  cls: string;
}

const TIERS: TierDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    blurb: 'Everything a curious consumer needs.',
    features: ['Full strain library', 'Map of 100+ shops', 'AI Match quiz', 'Bookmarks & trip reports'],
    cls: '',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$7',
    blurb: 'For the deliberate consumer who tracks their consumption.',
    features: [
      'All Free features',
      'Restock & price-drop alerts',
      'Smart folders + tags',
      'COA PDF export',
      'Consumption log + insights',
    ],
    cls: 'featured',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    blurb: 'For growers, retailers, and serious researchers.',
    features: [
      'All Premium features',
      'Wholesale API keys',
      'Concierge growers list',
      'White-label embed',
      'Priority Untapped Market support',
    ],
    cls: 'pro',
  },
];

export function PremiumPage() {
  const user = useStore((s) => s.user);
  const upgradeTier = useStore((s) => s.upgradeTier);
  const addToast = useStore((s) => s.addToast);

  function select(t: Tier) {
    upgradeTier(t);
    addToast(t === 'free' ? 'Switched to Free' : `Welcome to ${t === 'pro' ? 'Pro' : 'Premium'}`);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>
          Choose your <em>tier</em>
        </h1>
        <p>
          Currently on <strong>{user.tier}</strong>. Cancel anytime — simulated billing for the
          v2.0 demo, but all gating is live.
        </p>
      </header>
      <section>
        <div className="tier-grid">
          {TIERS.map((t) => (
            <div key={t.id} className={`tier-card ${t.cls}`.trim()}>
              <div className="tier-name">{t.name}</div>
              <div className="tier-price">
                {t.price} <small>{t.id === 'free' ? 'forever' : '/ month'}</small>
              </div>
              <p className="muted" style={{ fontSize: '0.88rem' }}>{t.blurb}</p>
              <ul className="tier-features">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                className={`tier-cta${user.tier === t.id ? ' active' : ''}`}
                onClick={() => select(t.id)}
                disabled={user.tier === t.id}
              >
                {user.tier === t.id ? 'Current tier' : t.id === 'free' ? 'Downgrade' : `Subscribe to ${t.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Feature <em>matrix</em>
        </h2>
        <div className="section-card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text2)', fontSize: '0.78rem' }}>
                <th style={{ padding: '0.5rem' }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '0.5rem' }}>Free</th>
                <th style={{ color: 'var(--amber)', textAlign: 'center', padding: '0.5rem' }}>Premium</th>
                <th style={{ color: 'var(--purple)', textAlign: 'center', padding: '0.5rem' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([label, free, premium, pro]) => (
                <tr
                  key={label as string}
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '0.6rem' }}>{label}</td>
                  <td style={{ textAlign: 'center', padding: '0.6rem' }}>
                    {free ? '✓' : '—'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.6rem', color: 'var(--amber)' }}>
                    {premium ? '✓' : '—'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.6rem', color: 'var(--purple)' }}>
                    {pro ? '✓' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
