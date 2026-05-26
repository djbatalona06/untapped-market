import { useState } from 'react';
import { useStore } from '../store/useStore';
import { recommend } from '../lib/recommender';
import type { FormFactor, QuizState } from '../types';
import { StrainCard } from '../components/StrainCard';

interface Question {
  key: keyof QuizState;
  eyebrow: string;
  question: string;
  options: Array<{ value: string; emoji: string; label: string; hint: string }>;
}

const QUESTIONS: Question[] = [
  {
    key: 'vibe',
    eyebrow: 'Step 1 of 4',
    question: 'What is your primary vibe right now?',
    options: [
      { value: 'sleep', emoji: '🌙', label: 'Sleep & chill', hint: 'Body release, quiet mind, restful night.' },
      { value: 'focus', emoji: '🌲', label: 'Focus & create', hint: 'Clear-headed, alert, sustained attention.' },
      { value: 'uplift', emoji: '🌞', label: 'Uplift & energize', hint: 'Social, talkative, bright euphoria.' },
      { value: 'relief', emoji: '🌿', label: 'Pain & anxiety relief', hint: 'Calm, anti-inflammatory, physical ease.' },
    ],
  },
  {
    key: 'flavor',
    eyebrow: 'Step 2 of 4',
    question: 'Which flavor palette draws you in?',
    options: [
      { value: 'sweet-citrus', emoji: '🍋', label: 'Sweet & citrusy', hint: 'Limonene-forward — lemon, orange, sweet pine.' },
      { value: 'earthen-musky', emoji: '🌰', label: 'Earthen & musky', hint: 'Myrcene & humulene — deep, hashy, woody.' },
      { value: 'pine-herbal', emoji: '🌲', label: 'Pine & herbal', hint: 'Pinene-forward — fresh, foresty, sharp.' },
      { value: 'skunk-diesel', emoji: '⛽', label: 'Skunk & diesel', hint: 'Caryophyllene-loaded — funky, pungent, classic.' },
    ],
  },
  {
    key: 'tolerance',
    eyebrow: 'Step 3 of 4',
    question: 'How experienced are you?',
    options: [
      { value: 'low', emoji: '🌱', label: 'Low / microdose', hint: 'New or sensitive — high-CBD or low-THC preferred.' },
      { value: 'moderate', emoji: '🌿', label: 'Moderate', hint: 'Regular consumer — mid-strength delivers reliably.' },
      { value: 'expert', emoji: '🌳', label: 'Expert / high tolerance', hint: 'Seasoned — 25%+ THC and concentrates welcome.' },
    ],
  },
  {
    key: 'form',
    eyebrow: 'Step 4 of 4',
    question: 'How do you prefer to consume?',
    options: [
      { value: 'flower', emoji: '🌸', label: 'Flower', hint: 'Traditional, fastest terpene expression.' },
      { value: 'vape', emoji: '💨', label: 'Vape', hint: 'Discreet, controllable, faster onset than edibles.' },
      { value: 'edibles', emoji: '🍪', label: 'Edibles', hint: 'Long-lasting body effect, no inhalation.' },
      { value: 'concentrates', emoji: '🍯', label: 'Concentrates', hint: 'Potent, terpene-rich — for experienced consumers.' },
    ],
  },
];

export function QuizPage() {
  const quiz = useStore((s) => s.quiz);
  const setQuiz = useStore((s) => s.setQuiz);
  const resetQuiz = useStore((s) => s.resetQuiz);
  const updatePreferences = useStore((s) => s.updatePreferences);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  function answer(q: Question, value: string) {
    setQuiz({ [q.key]: value } as Partial<QuizState>);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const finalQuiz: QuizState = { ...quiz, [q.key]: value as never };
      updatePreferences({
        vibe: finalQuiz.vibe ? [finalQuiz.vibe] : undefined,
        flavor: finalQuiz.flavor ? [finalQuiz.flavor] : undefined,
        tolerance: finalQuiz.tolerance,
        form: finalQuiz.form ? [finalQuiz.form as FormFactor] : undefined,
      });
      setDone(true);
    }
  }

  function reset() {
    resetQuiz();
    setStep(0);
    setDone(false);
  }

  if (done) {
    const matches = recommend(quiz, 5);
    return (
      <div className="page">
        <div className="quiz-shell">
          <div className="hero-eyebrow" style={{ marginBottom: 8 }}>Your matches</div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', marginBottom: 8 }}>
            Built for the way <em style={{ color: 'var(--accent)' }}>you</em> want to feel
          </h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            Five recommendations, scored against the terpene chemistry, chemotype, and
            availability that line up with your answers.
          </p>
          {matches.map((m, i) => (
            <div key={m.strain.id} className="match-card">
              <span className="match-rank">Rank #{i + 1}</span>
              <StrainCard strain={m.strain} />
              <div className="match-explanation">{m.explanation}</div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 16 }}>
            ↻ Retake the quiz
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="page">
      <div className="quiz-shell">
        <div className="quiz-timeline">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`quiz-step${i < step ? ' done' : i === step ? ' current' : ''}`}
            />
          ))}
        </div>
        <div className="quiz-q-eyebrow">{q.eyebrow}</div>
        <h2 className="quiz-q">{q.question}</h2>
        <div className="quiz-options">
          {q.options.map((opt) => (
            <button key={opt.value} className="quiz-option" onClick={() => answer(q, opt.value)}>
              <span className="quiz-option-emoji">{opt.emoji}</span>
              <span className="quiz-option-label">{opt.label}</span>
              <span className="quiz-option-hint">{opt.hint}</span>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            className="btn btn-ghost"
            style={{ marginTop: 24 }}
            onClick={() => setStep(step - 1)}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
