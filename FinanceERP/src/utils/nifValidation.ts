/**
 * Utilitários para validação do NIF (Número de Identificação Fiscal) português
 */

/**
 * Valida se um NIF português é válido
 * @param nif - O número de identificação fiscal a ser validado
 * @returns true se o NIF for válido, false caso contrário
 */
export const validateNIF = (nif: string): boolean => {
  // Remove espaços e caracteres não numéricos
  const cleanNif = nif.replace(/\D/g, '');
  
  // Verifica se tem exatamente 9 dígitos
  if (cleanNif.length !== 9) {
    return false;
  }

  // Verifica se o primeiro dígito é válido (1, 2, 3, 5, 6, 7, 8, 9)
  const firstDigit = parseInt(cleanNif[0]);
  if (![1, 2, 3, 5, 6, 7, 8, 9].includes(firstDigit)) {
    return false;
  }

  // Calcula o dígito de controle
  const digits = cleanNif.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (9 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica se o dígito de controle está correto
  return checkDigit === digits[8];
};

/**
 * Formata um NIF para exibição (adiciona espaços para melhor legibilidade)
 * @param nif - O NIF a ser formatado
 * @returns O NIF formatado (XXX XXX XXX)
 */
export const formatNIF = (nif: string): string => {
  const cleanNif = nif.replace(/\D/g, '');
  
  if (cleanNif.length <= 3) {
    return cleanNif;
  } else if (cleanNif.length <= 6) {
    return `${cleanNif.slice(0, 3)} ${cleanNif.slice(3)}`;
  } else {
    return `${cleanNif.slice(0, 3)} ${cleanNif.slice(3, 6)} ${cleanNif.slice(6, 9)}`;
  }
};

/**
 * Remove formatação do NIF (remove espaços e caracteres especiais)
 * @param nif - O NIF formatado
 * @returns O NIF limpo (apenas números)
 */
export const cleanNIF = (nif: string): string => {
  return nif.replace(/\D/g, '');
};

/**
 * Verifica se uma string pode ser um NIF válido (formato básico)
 * @param nif - A string a ser verificada
 * @returns true se tem o formato básico de um NIF
 */
export const isNIFFormat = (nif: string): boolean => {
  const cleanNif = nif.replace(/\D/g, '');
  return cleanNif.length === 9 && /^\d{9}$/.test(cleanNif);
};