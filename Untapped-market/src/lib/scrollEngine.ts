class ScrollEngine {
  private io: IntersectionObserver | null = null;
  private parallaxTargets: HTMLElement[] = [];
  private ticking = false;
  private bound = false;

  private ensureObserver() {
    if (this.io) return this.io;
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            if ((en.target as HTMLElement).dataset.revealOnce !== 'false') {
              this.io?.unobserve(en.target);
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    return this.io;
  }

  private onScroll = () => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const docH = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const pct = Math.min(100, Math.max(0, (y / docH) * 100));
      document.documentElement.style.setProperty('--progress', pct.toFixed(2) + '%');
      document.documentElement.style.setProperty('--scroll-y', y + 'px');

      for (const el of this.parallaxTargets) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
        const speed = parseFloat(el.dataset.parallax || '0.18');
        const center = r.top + r.height / 2;
        const offset = (center - window.innerHeight / 2) * speed * -1;
        el.style.transform = `translate3d(0, ${offset.toFixed(
          1
        )}px, 0) scale(${el.dataset.parallaxScale || 1.08})`;
      }
      this.ticking = false;
    });
  };

  public scan() {
    this.ensureObserver();
    // Observe reveals
    document
      .querySelectorAll(
        '.reveal:not(.is-visible), .reveal-left:not(.is-visible), .reveal-right:not(.is-visible), .reveal-card:not(.is-visible)'
      )
      .forEach((el) => {
        this.io?.observe(el);
      });

    // Sections
    document
      .querySelectorAll('.cine-stories:not(.is-visible), .cine-drop:not(.is-visible)')
      .forEach((el) => {
        this.io?.observe(el);
      });

    // Parallax targets
    this.parallaxTargets = Array.from(
      document.querySelectorAll('[data-parallax]')
    ) as HTMLElement[];

    // Set parallax base
    this.parallaxTargets.forEach((el) => {
      if (!el.dataset.parallaxBase) {
        el.dataset.parallaxBase = el.dataset.parallax;
      }
    });

    this.onScroll();
  }

  public init() {
    if (this.bound) return;
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.bound = true;
    this.scan();
  }

  public destroy() {
    if (!this.bound) return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.bound = false;
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
  }
}

export const scrollEngine = new ScrollEngine();
