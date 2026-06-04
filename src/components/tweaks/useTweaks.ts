import { useCallback, useEffect, useState } from 'react';

export interface TweakState {
  heroImage: 'macro' | 'product' | 'hands' | 'smoke';
  heroMotion: boolean;
  parallax: number;
  marqueeSpeed: number;
  accent: string;
}

const STORAGE_KEY = 'um.tweaks.v1';

export const DEFAULT_TWEAKS: TweakState = {
  heroImage: 'macro',
  heroMotion: true,
  parallax: 1,
  marqueeSpeed: 42,
  accent: '#D9A55C',
};

const HERO_BG: Record<TweakState['heroImage'], string> = {
  macro: "url('/img/hero-macro.jpg') center 35% / cover no-repeat",
  product: "url('/img/hero-product.jpg') center 30% / cover no-repeat",
  hands: "url('/img/hero-hands.jpg') center 40% / cover no-repeat",
  smoke: "url('/img/hero-smoke.jpg') center 45% / cover no-repeat",
};

function load(): TweakState {
  if (typeof window === 'undefined') return DEFAULT_TWEAKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TWEAKS;
    return { ...DEFAULT_TWEAKS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TWEAKS;
  }
}

function applyTweaks(tw: TweakState) {
  const root = document.documentElement;
  root.style.setProperty('--ember', tw.accent);
  root.style.setProperty('--marquee-dur', tw.marqueeSpeed + 's');
  (window as unknown as { __tweakParallaxMultiplier?: number }).__tweakParallaxMultiplier = tw.parallax;
  const hero = document.querySelector<HTMLElement>('.cine-hero-img');
  if (hero) {
    hero.style.background = HERO_BG[tw.heroImage];
    hero.style.animationPlayState = tw.heroMotion ? 'running' : 'paused';
    hero.classList.toggle('ambient', tw.heroMotion);
  }
}

export function useTweaks(): [TweakState, (patch: Partial<TweakState>) => void] {
  const [tw, setTw] = useState<TweakState>(load);

  useEffect(() => {
    applyTweaks(tw);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tw));
    } catch {
      /* storage may be unavailable; tweaks still apply this session */
    }
  }, [tw]);

  const update = useCallback((patch: Partial<TweakState>) => {
    setTw((prev) => ({ ...prev, ...patch }));
  }, []);

  return [tw, update];
}
