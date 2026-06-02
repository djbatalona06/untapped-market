import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import type { LabCertificate } from '@/store/types'

interface Props {
  cert: LabCertificate
}

export default function LabCertCard({ cert }: Props) {
  const handleCopy = async () => {
    const lines = [
      `Lab: ${cert.lab}`,
      `Date: ${cert.date}`,
      ...(cert.cannabinoids ?? []).map((c) => `${c.name}: ${c.value}`),
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      toast.success('Lab certificate copied to clipboard')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div className="section-card">
      <h2>Lab Certificate</h2>
      <div className="lab-meta">
        <div className="lab-meta-info">
          Tested by <strong>{cert.lab}</strong> on <strong>{cert.date}</strong>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleCopy}
          aria-label="Copy lab certificate to clipboard"
        >
          <Copy size={14} />
          Copy
        </button>
      </div>
      <div className="lab-grid">
        {(cert.cannabinoids ?? []).map((c) => (
          <div key={c.name} className="lab-cell">
            <div className="lab-cell-name">{c.name}</div>
            <div className="lab-cell-val">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
