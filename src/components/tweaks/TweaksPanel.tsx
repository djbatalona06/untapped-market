import { useStore } from '../../store/useStore';
import { useTweaks, type TweakState } from './useTweaks';

const HERO_OPTIONS: Array<{ value: TweakState['heroImage']; label: string }> = [
  { value: 'macro', label: 'Macro bud (default)' },
  { value: 'product', label: 'Apothecary jar' },
  { value: 'hands', label: 'Hands & cabin' },
  { value: 'smoke', label: 'Smoke void' },
];

const ACCENT_CHIPS = ['#D9A55C', '#C9893D', '#E8C277', '#B97A4B', '#8FB85F'];

export function TweaksPanel() {
  const open = useStore((s) => s.tweaksOpen);
  const setOpen = useStore((s) => s.setTweaksOpen);
  const [tw, update] = useTweaks();

  if (!open) return null;
  return (
    <div className="tweaks-panel" role="dialog" aria-label="Tweaks">
      <div className="tweaks-head">
        <b>Tweaks</b>
        <button className="tweaks-x" onClick={() => setOpen(false)} aria-label="Close tweaks">
          ✕
        </button>
      </div>
      <div className="tweaks-body">
        <div className="tweaks-section">Hero</div>

        <div className="tweaks-row">
          <div className="tweaks-lbl">
            <span>Hero image</span>
          </div>
          <select
            className="tweaks-select"
            value={tw.heroImage}
            onChange={(e) => update({ heroImage: e.target.value as TweakState['heroImage'] })}
          >
            {HERO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="tweaks-row tweaks-row-h">
          <div className="tweaks-lbl">
            <span>Ken-burns motion</span>
          </div>
          <button
            className="tweaks-toggle"
            data-on={tw.heroMotion ? '1' : '0'}
            role="switch"
            aria-checked={tw.heroMotion}
            onClick={() => update({ heroMotion: !tw.heroMotion })}
          />
        </div>

        <div className="tweaks-section">Scroll motion</div>

        <div className="tweaks-row">
          <div className="tweaks-lbl">
            <span>Parallax intensity</span>
            <span className="tweaks-val">{tw.parallax.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            className="tweaks-slider"
            min={0}
            max={2}
            step={0.05}
            value={tw.parallax}
            onChange={(e) => update({ parallax: Number(e.target.value) })}
          />
        </div>

        <div className="tweaks-row">
          <div className="tweaks-lbl">
            <span>Marquee duration</span>
            <span className="tweaks-val">{tw.marqueeSpeed}s</span>
          </div>
          <input
            type="range"
            className="tweaks-slider"
            min={12}
            max={90}
            step={2}
            value={tw.marqueeSpeed}
            onChange={(e) => update({ marqueeSpeed: Number(e.target.value) })}
          />
        </div>

        <div className="tweaks-section">Accent</div>

        <div className="tweaks-row">
          <div className="tweaks-chips" role="radiogroup" aria-label="Accent color">
            {ACCENT_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className="tweaks-chip"
                role="radio"
                aria-checked={tw.accent.toLowerCase() === c.toLowerCase()}
                data-on={tw.accent.toLowerCase() === c.toLowerCase() ? '1' : '0'}
                style={{ background: c }}
                onClick={() => update({ accent: c })}
                aria-label={c}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
