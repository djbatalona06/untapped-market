// V2.2 scroll motion engine — IntersectionObserver reveals + rAF parallax.
// Runs outside React; consumers read .is-visible class state and --progress / --scroll-y CSS vars.

interface ScrollState {
  io: IntersectionObserver | null;
  parallaxTargets: HTMLElement[];
  ticking: boolean;
  bound: boolean;
}

const state: ScrollState = {
  io: null,
  parallaxTargets: [],
  ticking: false,
  bound: false,
};

function ensureObserver(): IntersectionObserver {
  if (state.io) return state.io;
  state.io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          if ((en.target as HTMLElement).dataset.revealOnce !== 'false') {
            state.io!.unobserve(en.target);
          }
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  return state.io;
}

function onScroll() {
  if (state.ticking) return;
  state.ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (y / docH) * 100));
    document.documentElement.style.setProperty('--progress', pct.toFixed(2) + '%');
    document.documentElement.style.setProperty('--scroll-y', y + 'px');
    const multiplier = (window as unknown as { __tweakParallaxMultiplier?: number }).__tweakParallaxMultiplier ?? 1;
    for (const el of state.parallaxTargets) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
      const baseAttr = el.dataset.parallaxBase ?? el.dataset.parallax ?? '0.18';
      const base = parseFloat(baseAttr) || 0.18;
      const speed = base * multiplier;
      const center = r.top + r.height / 2;
      const offset = (center - window.innerHeight / 2) * speed * -1;
      const scale = el.dataset.parallaxScale || '1.08';
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(${scale})`;
    }
    state.ticking = false;
  });
}

export function scan() {
  const io = ensureObserver();
  document
    .querySelectorAll<HTMLElement>(
      '.reveal:not(.is-visible), .reveal-left:not(.is-visible), .reveal-right:not(.is-visible), .reveal-card:not(.is-visible)'
    )
    .forEach((el) => io.observe(el));
  document
    .querySelectorAll<HTMLElement>('.cine-stories:not(.is-visible), .cine-drop:not(.is-visible)')
    .forEach((el) => io.observe(el));
  state.parallaxTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  // Capture original parallax value once, so the Tweaks multiplier can scale relative to it.
  state.parallaxTargets.forEach((el) => {
    if (!el.dataset.parallaxBase) el.dataset.parallaxBase = el.dataset.parallax || '0.18';
  });
  onScroll();
}

export function init() {
  if (state.bound) return;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  state.bound = true;
  scan();
}
