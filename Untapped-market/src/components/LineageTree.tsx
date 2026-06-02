interface Props {
  mother: string | null
  father: string | null
  offspring: string
  offspringColor?: string
}

export default function LineageTree({
  mother,
  father,
  offspring,
  offspringColor = 'var(--accent)',
}: Props) {
  return (
    <div className="lineage-tree" role="group" aria-label="Genetic lineage">
      <div className="lineage-parents">
        <div className={`lineage-node${mother ? '' : ' unknown'}`}>
          <div className="sidebar-label" style={{ marginBottom: 4 }}>Mother</div>
          {mother ?? 'Unknown'}
        </div>
        <div className={`lineage-node${father ? '' : ' unknown'}`}>
          <div className="sidebar-label" style={{ marginBottom: 4 }}>Father</div>
          {father ?? 'Unknown'}
        </div>
      </div>
      <div className="lineage-connector" aria-hidden="true">→</div>
      <div
        className="lineage-node offspring"
        style={{ borderColor: offspringColor, color: 'var(--text)' }}
      >
        {offspring}
      </div>
    </div>
  )
}
