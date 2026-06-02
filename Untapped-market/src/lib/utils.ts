export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`
}
