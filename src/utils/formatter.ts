export function formatRupiah(
  amount: number | string | null | undefined,
  withPrefix = true
): string {
  const num = typeof amount === 'string' ? Number(amount) : (amount ?? 0);
  const safe = Number.isFinite(num) ? num : 0;

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safe);

  return withPrefix ? formatted : formatted.replace(/^Rp\s?/, '').trim();
}
