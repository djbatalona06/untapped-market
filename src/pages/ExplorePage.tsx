import { useStore } from '../store/useStore';
import { SocialFeed } from '../components/social/SocialFeed';

export function ExplorePage() {
  const navigate = useStore((s) => s.navigate);

  return (
    <div className="page">
      <header className="page-header">
        <h1>
          The <em>feed</em>
        </h1>
        <p>New drops, weekend deals, and honest reviews from the PNW cannabis community.</p>
      </header>

      <SocialFeed />

      <section style={{ paddingTop: '1rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <button className="btn" onClick={() => navigate({ page: 'quiz' })}>
          Try the AI Match quiz →
        </button>
      </section>
    </div>
  );
}
