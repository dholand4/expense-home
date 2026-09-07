/**
 * Utilitários para formatação e máscara de moedas seguindo estritamente o padrão brasileiro (BRL):
 * - Vírgula (,) para separar decimais
 * - Ponto (.) para separar milhares APENAS quando necessário (a partir de 1.000)
 */

export function formatCurrencyInput(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';

  if (typeof value === 'number') {
    if (isNaN(value)) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const digitsOnly = String(value).replace(/\D/g, '');
  if (!digitsOnly) return '';

  const numericValue = parseInt(digitsOnly, 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function parseCurrencyInput(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  const str = String(value).trim();
  if (!str.includes(',') && str.includes('.')) {
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  }

  const clean = str.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
