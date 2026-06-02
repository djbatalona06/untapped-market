import type { Terpene } from '@/store/types'
import { formatPct } from '@/lib/utils'

interface Props {
  terpene: Terpene
  accentColor?: string
  /** Optional max value to normalize against (defaults to 2% as a reasonable upper bound) */
  max?: number
}

export default function TerpeneBar({ terpene, accentColor = 'var(--accent)', max = 2 }: Props) {
  const pct = typeof terpene.pct === 'number' ? terpene.pct : 0
  const width = Math.max(2, Math.min(100, (pct / max) * 100))

  return (
    <div className="terpene-row">
      <div>
        <div className="terpene-name">{terpene.name}</div>
        {terpene.effect && <div className="terpene-effect">{terpene.effect}</div>}
      </div>
      <div className="terpene-bar-bg" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={max}>
        <div
          className="terpene-bar-fill"
          style={{ width: `${width}%`, background: accentColor }}
        />
      </div>
      <div className="terpene-pct">{formatPct(pct)}</div>
    </div>
  )
}
