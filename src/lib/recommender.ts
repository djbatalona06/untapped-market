import type { QuizState, Strain } from '../types';
import { STRAINS } from '../data/strains';

export interface Match {
  strain: Strain;
  score: number;
  explanation: string;
}

const VIBE_TERPENE_BOOST: Record<NonNullable<QuizState['vibe']>, Record<string, number>> = {
  sleep: { Myrcene: 3, Linalool: 2.5, Caryophyllene: 1, Humulene: 0.5 },
  focus: { Pinene: 3, Terpinolene: 2, Limonene: 1.5, Ocimene: 1 },
  uplift: { Limonene: 3, Terpinolene: 2.5, Ocimene: 1.5, Pinene: 1 },
  relief: { Caryophyllene: 3, Linalool: 2, Myrcene: 1.5, Bisabolol: 1.5 },
};

const VIBE_TYPE: Record<NonNullable<QuizState['vibe']>, Record<Strain['type'], number>> = {
  sleep: { indica: 3, hybrid: 1, sativa: -2 },
  focus: { sativa: 3, hybrid: 1, indica: -1 },
  uplift: { sativa: 3, hybrid: 1, indica: -1 },
  relief: { hybrid: 2, indica: 2, sativa: 0 },
};

const VIBE_LABEL: Record<NonNullable<QuizState['vibe']>, string> = {
  sleep: 'restful, sleep-leaning sedation',
  focus: 'clear-headed concentration',
  uplift: 'bright, social euphoria',
  relief: 'physical relief and calm',
};

const FLAVOR_LABEL: Record<NonNullable<QuizState['flavor']>, string> = {
  'sweet-citrus': 'sweet citrus brightness',
  'earthen-musky': 'deep earthen musk',
  'pine-herbal': 'crisp pine and herbal notes',
  'skunk-diesel': 'pungent skunk-diesel funk',
};

export function recommend(quiz: QuizState, limit = 6): Match[] {
  const matches: Match[] = STRAINS.map((strain) => {
    let score = 0;
    const reasons: string[] = [];

    if (quiz.vibe) {
      const vibeMatch = strain.vibe?.includes(quiz.vibe) ?? false;
      if (vibeMatch) {
        score += 8;
        reasons.push(`built for ${VIBE_LABEL[quiz.vibe]}`);
      }
      score += VIBE_TYPE[quiz.vibe][strain.type] ?? 0;

      const boosts = VIBE_TERPENE_BOOST[quiz.vibe];
      const topTerps = [...strain.terpenes].sort((a, b) => b.pct - a.pct).slice(0, 3);
      const matchedTerps: string[] = [];
      for (const t of topTerps) {
        const boost = boosts[t.name] ?? 0;
        if (boost > 0) {
          score += boost * t.pct;
          matchedTerps.push(`${t.name} (${t.pct}%, ${t.effect.toLowerCase()})`);
        }
      }
      if (matchedTerps.length) {
        reasons.push(`terpene stack matches: ${matchedTerps.join(', ')}`);
      }
    }

    if (quiz.flavor) {
      const flavorMatch = strain.flavorProfile?.includes(quiz.flavor) ?? false;
      if (flavorMatch) {
        score += 5;
        reasons.push(`flavor profile leans into ${FLAVOR_LABEL[quiz.flavor]}`);
      }
    }

    if (quiz.tolerance) {
      const t = strain.tolerance ?? 'moderate';
      if (t === quiz.tolerance) {
        score += 4;
      } else if (
        (quiz.tolerance === 'low' && t === 'expert') ||
        (quiz.tolerance === 'expert' && t === 'low')
      ) {
        score -= 5;
      }
      if (quiz.tolerance === 'low' && strain.cbd >= 5) {
        score += 6;
        reasons.push(`high CBD (${strain.cbd}%) keeps the experience gentle`);
      }
      if (quiz.tolerance === 'expert' && strain.thc >= 25) {
        score += 4;
        reasons.push(`THC at ${strain.thc}% rewards a developed tolerance`);
      }
    }

    if (quiz.form) {
      if (strain.forms?.includes(quiz.form)) {
        score += 3;
        reasons.push(`available as ${quiz.form}`);
      } else {
        score -= 1;
      }
    }

    score += strain.likeCount / 600;

    const explanation = reasons.length
      ? `Why: ${reasons.join(' · ')}.`
      : 'A solid baseline pick — community favorite with a balanced profile.';

    return { strain, score, explanation };
  });

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
