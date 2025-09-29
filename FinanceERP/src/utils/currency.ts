/**
 * Utilitário para formatação de moeda
 * Centraliza a formatação de valores monetários em Euro
 */

/**
 * Formata um valor numérico para moeda em Euro
 * @param value - Valor numérico a ser formatado
 * @returns String formatada em Euro (€)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

/**
 * Formata um valor numérico para moeda em Euro de forma compacta (K, M)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada em Euro compacta (ex: €57K)
 */
export const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
};

/**
 * Remove formatação de moeda e retorna o valor numérico
 * @param formattedValue - String formatada em moeda
 * @returns Valor numérico
 */
export const parseCurrency = (formattedValue: string): number => {
  const numericValue = formattedValue.replace(/[€\s.]/g, '').replace(',', '.');
  return parseFloat(numericValue) || 0;
};