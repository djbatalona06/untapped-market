import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore, useToggleBookmark, useBookmarks } from '@/store';
import StrainCard from '@/components/StrainCard';
import { scrollEngine } from '@/lib/scrollEngine';

const HERO_IMAGES = {
  macro: '/img/hero-macro.jpg',
  hands: '/img/hero-hands.jpg',
  product: '/img/hero-product.jpg',
  smoke: '/img/hero-smoke.jpg',
};

const ACCENTS = ['#D9A55C', '#C9893D', '#E8C277', '#B97A4B', '#8FB85F'];

export default function HomePage() {
  const navigate = useNavigate();
  const strains = useStore((s) => s.strains);
  const toggleBookmark = useToggleBookmark();
  const bookmarks = useBookmarks();
  const [search, setSearch] = useState('');
  const [showTweaks, setShowTweaks] = useState(false);

  // --- Tweaks State ---
  const [heroImage, setHeroImage] = useState<'macro' | 'hands' | 'product' | 'smoke'>(() => {
    return (localStorage.getItem('ut-tweak-heroImage') as any) || 'macro';
  });
  const [heroMotion, setHeroMotion] = useState<boolean>(() => {
    const val = localStorage.getItem('ut-tweak-heroMotion');
    return val === null ? true : val === 'true';
  });
  const [parallax, setParallax] = useState<number>(() => {
    return Number(localStorage.getItem('ut-tweak-parallax') || '1.0');
  });
  const [marqueeSpeed, setMarqueeSpeed] = useState<number>(() => {
    return Number(localStorage.getItem('ut-tweak-marqueeSpeed') || '42');
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('ut-tweak-accentColor') || '#D9A55C';
  });

  // Calculate staff picks & trending
  const staffPicks = useMemo(() => strains.slice(0, 3), [strains]);
  const trending = useMemo(
    () => [...strains].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3),
    [strains]
  );

  const featuredDropStrain = useMemo(() => {
    return strains.find(s => s.id === 'cascadia-haze') || strains[0];
  }, [strains]);

  // Apply tweaks to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ember', accentColor);
    root.style.setProperty('--marquee-dur', `${marqueeSpeed}s`);

    // Handle parallax intensity update on data attributes
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const element = el as HTMLElement;
      if (!element.dataset.parallaxBase) {
        element.dataset.parallaxBase = element.dataset.parallax;
      }
      const base = parseFloat(element.dataset.parallaxBase || '0.18');
      element.dataset.parallax = (base * parallax).toString();
    });

    localStorage.setItem('ut-tweak-heroImage', heroImage);
    localStorage.setItem('ut-tweak-heroMotion', heroMotion.toString());
    localStorage.setItem('ut-tweak-parallax', parallax.toString());
    localStorage.setItem('ut-tweak-marqueeSpeed', marqueeSpeed.toString());
    localStorage.setItem('ut-tweak-accentColor', accentColor);

    scrollEngine.scan();
  }, [heroImage, heroMotion, parallax, marqueeSpeed, accentColor]);

  // Trigger scroll scan on mount
  useEffect(() => {
    scrollEngine.scan();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
  }

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {/* ==================== CINEMATIC HERO ==================== */}
      <section className="cine-hero" data-screen-label="01 Hero">
        <div
          className={`cine-hero-img ${heroMotion ? 'ambient' : ''}`}
          style={{
            backgroundImage: `url(${HERO_IMAGES[heroImage]})`,
            animationPlayState: heroMotion ? 'running' : 'paused',
          }}
          data-parallax="0.15"
          data-parallax-scale="1.12"
        />
        <div className="cine-hero-vignette" />
        <div className="cine-hero-grain" />

        <div className="cine-hero-meta">
          <span>Vol. 02 · Spring '26</span>
          <div className="cine-hero-meta-divider" />
          <span>WA · OR · 47.6062°N</span>
        </div>

        <div className="cine-hero-inner">
          <div className="cine-hero-eyebrow">The PNW Cannabis Almanac</div>
          <h1>
            <span className="line">
              <span>Know what's in your</span>
            </span>
            <span className="line l2">
              <span>
                next <em>session.</em>
              </span>
            </span>
          </h1>
          <p className="cine-hero-sub">
            DNA-level strain data, terpene science, and dispensary inventory — unified for Pacific
            Northwest cannabis consumers.
          </p>

          <form className="cine-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search strains, terpenes, effects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search ↗</button>
          </form>

          <div className="cine-hero-actions">
            <Link to="/catalog" className="btn-cine">
              Browse Catalog
            </Link>
            <Link to="/finder" className="btn-cine-ghost">
              Dispensary Finder
            </Link>
            <button
              onClick={() => setShowTweaks(!showTweaks)}
              className="btn-cine-ghost"
              style={{
                borderColor: showTweaks ? 'var(--ember)' : 'rgba(255,255,255,.18)',
                color: showTweaks ? 'var(--ember)' : 'inherit',
              }}
            >
              🛠️ Tweaks
            </button>
          </div>
        </div>

        <div className="cine-hero-scroll">Scroll</div>
      </section>

      {/* ==================== RUNNING MARQUEE ==================== */}
      <div className="cine-marquee">
        <div className="cine-marquee-track">
          <div className="cine-marquee-item">
            Cascadia Haze · Trichome density · Rainier Kush · Terpinolene · Hood River Haze · Pacific
            Northwest · Olympic Fog · Myrcene · Linalool · Lab-verified COAs · Limonene · Volume 02
          </div>
          <div className="cine-marquee-item">
            Cascadia Haze · Trichome density · Rainier Kush · Terpinolene · Hood River Haze · Pacific
            Northwest · Olympic Fog · Myrcene · Linalool · Lab-verified COAs · Limonene · Volume 02
          </div>
        </div>
      </div>

      {/* ==================== THE DROP ==================== */}
      <section className="cine-drop" data-screen-label="01b The Drop">
        <div className="cine-drop-img">
          <div
            className="cine-drop-img-inner"
            style={{ backgroundImage: `url('/img/hero-product.jpg')` }}
            data-parallax="0.08"
          />
          <span className="cine-drop-img-label">Drop №01 · Apothecary Series</span>
        </div>
        <div className="cine-drop-body">
          <div className="eyebrow-mono">The Drop · Featured Strain</div>
          <h3>
            Cascadia <em>Haze.</em>
          </h3>
          <p>
            Our current seasonal focus is a lowland sativa with a complex, terpinolene-heavy profile.
            Harvested in foggy riverbeds, it delivers pure creative flow without physical jitter.
          </p>
          <div className="cine-drop-meta-grid">
            <div>
              <span className="k">Type</span>
              <span className="v" style={{ color: 'var(--moss)' }}>Sativa</span>
            </div>
            <div>
              <span className="k">THC</span>
              <span className="v">23.4%</span>
            </div>
            <div>
              <span className="k">Terpene</span>
              <span className="v">Terpinolene</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link
              to={`/strain/${featuredDropStrain?.id || 'cascadia-haze'}`}
              className="btn-cine"
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Read full profile →
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== STAFF PICKS ==================== */}
      <section className="cine-section" data-screen-label="01c Staff Picks">
        <div className="cine-section-head reveal">
          <div>
            <div className="eyebrow-mono" style={{ marginBottom: '0.75rem' }}>
              Chapter I
            </div>
            <h2>
              The Cascadia <em>Almanac.</em>
            </h2>
          </div>
          <div className="cine-section-head-meta">
            Curated Strains
            <a onClick={() => navigate('/catalog')}>Browse full catalog →</a>
          </div>
        </div>
        <div className="strain-grid">
          {staffPicks.map((s) => (
            <StrainCard
              key={s.id}
              strain={s}
              onToggleBookmark={() => toggleBookmark(s.id)}
              isBookmarked={bookmarks.has(s.id)}
            />
          ))}
        </div>
      </section>

      {/* ==================== SMOKE BREAK ==================== */}
      <section className="cine-smoke" data-screen-label="01d Smoke Break">
        <div className="cine-smoke-bg" data-parallax="0.12" data-parallax-scale="1.18" />
        <div className="cine-smoke-bg-2" />
        <div className="cine-smoke-inner reveal">
          <blockquote>
            ”Cannabis is Cascadia's signature craft — a product of foggy lowlands, volcanic ridge
            soils, and decades of silent genetic preservation.”
          </blockquote>
          <cite>— Editor's Note, Vol. 02</cite>
        </div>
      </section>

      {/* ==================== FIELD REPORTS ==================== */}
      <section className="cine-stories" data-screen-label="01e Field Reports">
        <div className="cine-stories-body">
          <div className="eyebrow-mono">Field Reports</div>
          <h3>
            Living with <em>the land.</em>
          </h3>
          <p>
            We traveled to the foothills of Mt. Baker to meet the growers preserving old-school
            heirloom strains. Read about our journey into high-altitude soil chemistry and the
            resilient PNW microclimates.
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/explore" className="btn-cine-ghost">
              Browse Field Reports →
            </Link>
          </div>
        </div>
        <div className="cine-stories-img" aria-hidden="true">
          <div className="cine-stories-img-inner" data-parallax="0.06" />
          <span className="cine-stories-img-label">Cabin near Mt. Baker · 7:42pm</span>
        </div>
      </section>

      {/* ==================== TRENDING ==================== */}
      <section className="cine-section" data-screen-label="01f Trending">
        <div className="cine-section-head reveal">
          <div>
            <div className="eyebrow-mono" style={{ marginBottom: '0.75rem' }}>
              Chapter II
            </div>
            <h2>
              Trending <em>this week.</em>
            </h2>
          </div>
          <div className="cine-section-head-meta">
            Updated Mondays
            <a onClick={() => navigate('/catalog')}>See full chart →</a>
          </div>
        </div>
        <div className="strain-grid">
          {trending.map((s) => (
            <StrainCard
              key={s.id}
              strain={s}
              onToggleBookmark={() => toggleBookmark(s.id)}
              isBookmarked={bookmarks.has(s.id)}
            />
          ))}
        </div>
      </section>

      {/* ==================== PNW SPOTLIGHT ==================== */}
      <section className="spotlight" data-screen-label="01g PNW Spotlight">
        <div className="spotlight-inner">
          <div className="reveal-left">
            <div className="eyebrow-mono" style={{ marginBottom: '1rem' }}>
              The Region
            </div>
            <h2>
              Built for the <em>Pacific Northwest.</em>
            </h2>
            <p style={{ marginTop: '0.75rem' }}>
              We focus exclusively on WA and OR — the two most mature legal markets on the West Coast.
              Every strain, every dispensary, every lab cert comes from within the region.
            </p>
            <button className="btn-cine-ghost" onClick={() => navigate('/finder')} style={{ marginTop: '1rem' }}>
              Find dispensaries near you →
            </button>
          </div>
          <div className="stats-grid reveal-right">
            <div className="stat-block">
              <div className="num">200+</div>
              <div className="label">Strains</div>
            </div>
            <div className="stat-block">
              <div className="num">47</div>
              <div className="label">Dispensaries</div>
            </div>
            <div className="stat-block">
              <div className="num">12k+</div>
              <div className="label">Trip reports</div>
            </div>
            <div className="stat-block">
              <div className="num">02</div>
              <div className="label">States</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="cine-footer">
        <div className="cine-footer-inner reveal">
          <div className="cine-footer-wordmark">
            Untapped
            <br />
            <em>Market.</em>
          </div>
          <div className="cine-footer-meta">
            © 2026 · Vol. 02
            <br />
            WA · OR · CAN
            <br />
            21+ · Consume responsibly
            <br />
            <span style={{ color: 'var(--ember)' }}>Made in Cascadia</span>
          </div>
        </div>
      </footer>

      {/* ==================== TWEAKS PANEL (FLOATING DEV BAR) ==================== */}
      {showTweaks && (
        <div
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            zIndex: 99999,
            width: '280px',
            background: 'rgba(250, 249, 247, 0.95)',
            color: '#29261b',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            padding: '16px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: '12px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              justify-content: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              paddingBottom: '8px',
            }}
          >
            <b style={{ fontSize: '13px', fontWeight: 600 }}>Design Tweaks Panel</b>
            <button
              onClick={() => setShowTweaks(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'rgba(0,0,0,0.5)',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Hero Image Swapping */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                Hero Image
              </label>
              <select
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '26px',
                  borderRadius: '6px',
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: '#fff',
                  padding: '0 4px',
                  fontSize: '11px',
                }}
              >
                <option value="macro">Macro Frosty Bud</option>
                <option value="product">Apothecary Product</option>
                <option value="hands">Hands & Cabin</option>
                <option value="smoke">Smoke Void</option>
              </select>
            </div>

            {/* Ken-Burns Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>Ken-burns motion</span>
              <button
                type="button"
                onClick={() => setHeroMotion(!heroMotion)}
                style={{
                  width: '40px',
                  height: '20px',
                  borderRadius: '10px',
                  background: heroMotion ? '#34c759' : 'rgba(0,0,0,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: heroMotion ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>

            {/* Parallax Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Parallax intensity</span>
                <span>{parallax.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={parallax}
                onChange={(e) => setParallax(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D9A55C', cursor: 'pointer' }}
              />
            </div>

            {/* Marquee Speed Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Marquee duration</span>
                <span>{marqueeSpeed}s</span>
              </div>
              <input
                type="range"
                min="12"
                max="90"
                step="2"
                value={marqueeSpeed}
                onChange={(e) => setMarqueeSpeed(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D9A55C', cursor: 'pointer' }}
              />
            </div>

            {/* Curated Accent Color Swatches */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Accent Ember Color
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {ACCENTS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: color,
                      border: accentColor === color ? '2px solid #000' : '1px solid rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      boxShadow: accentColor === color ? '0 0 4px rgba(0,0,0,0.4)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
