import type { ReactNode } from 'react'

interface Props {
  icon: string
  title: string
  body: string
  cta?: ReactNode
}

export default function EmptyState({ icon, title, body, cta }: Props) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{body}</p>
      {cta}
    </div>
  )
}
