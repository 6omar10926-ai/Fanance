export const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
})

export const numberFormatter = new Intl.NumberFormat('ar-SA')

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value))
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${numberFormatter.format(Math.round(value * 10) / 10)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Arabic-friendly countdown label for the number of days until an event.
export function countdownLabel(days: number): string {
  if (days < 0) return 'مضى موعده'
  if (days === 0) return 'ينزل اليوم'
  if (days === 1) return 'غداً'
  if (days === 2) return 'بعد يومين'
  if (days <= 10) return `بعد ${formatNumber(days)} أيام`
  return `بعد ${formatNumber(days)} يوماً`
}
