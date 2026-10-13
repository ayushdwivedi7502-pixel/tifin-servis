/** Monetary amounts in Indian paise (1 INR = 100 paise). */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) throw new Error('Invalid rupee amount');
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function formatINR(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function calculateAdvancePaise(
  totalPaise: number,
  advanceFixedPaise: number | null,
  advancePercent: number | null
): number {
  if (advanceFixedPaise != null && advanceFixedPaise > 0) {
    return Math.min(advanceFixedPaise, totalPaise);
  }
  if (advancePercent != null && advancePercent > 0) {
    return Math.min(Math.round((totalPaise * advancePercent) / 100), totalPaise);
  }
  return totalPaise;
}
