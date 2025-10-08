import { Client, Contract, Payment } from '../types';

// Função para converter dados de clientes em CSV
export const exportClientsToCSV = (clients: Client[]): void => {
  if (!clients || clients.length === 0) {
    throw new Error('Nenhum dado de cliente disponível para exportação');
  }

  // Cabeçalhos do CSV
  const headers = [
    'ID',
    'Nome',
    'Sobrenome',
    'Email',
    'Telefone',
    'Celular',
    'CPF/CNPJ',
    'Data de Nascimento',
    'Endereço',
    'Cidade',
    'CEP',
    'País',
    'Observações',
    'Status',
    'ID Externo',
    'Data de Criação',
    'Data de Atualização'
  ];

  // Converter dados para CSV
  const csvContent = [
    headers.join(','),
    ...clients.map(client => [
      `"${client.id || ''}"`,
      `"${client.first_name || ''}"`,
      `"${client.last_name || ''}"`,
      `"${client.email || ''}"`,
      `"${client.phone || ''}"`,
      `"${client.mobile || ''}"`,
      `"${client.tax_id || ''}"`,
      `"${client.birth_date || ''}"`,
      `"${client.address || ''}"`,
      `"${client.city || ''}"`,
      `"${client.postal_code || ''}"`,
      `"${client.country || ''}"`,
      `"${(client.notes || '').replace(/"/g, '""')}"`,
      `"${client.status || ''}"`,
      `"${client.external_id || ''}"`,
      `"${client.created_at || ''}"`,
      `"${client.updated_at || ''}"`
    ].join(','))
  ].join('\n');

  // Fazer download do arquivo
  downloadCSV(csvContent, 'clientes');
};

// Função para converter dados de contratos em CSV
export const exportContractsToCSV = (contracts: Contract[]): void => {
  if (!contracts || contracts.length === 0) {
    throw new Error('Nenhum dado de contrato disponível para exportação');
  }

  // Cabeçalhos do CSV
  const headers = [
    'ID',
    'Número do Contrato',
    'Local',
    'Área',
    'Gestor(a)',
    'Médico(a)',
    'Cliente',
    'Valor',
    'Número de Parcelas',
    'Status',
    'Data de Início',
    'Data de Fim',
    'Frequência de Pagamento',
    'Entrada',
    'Saldo Positivo',
    'Saldo Negativo',
    'Observações',
    'Data de Criação',
    'Data de Atualização'
  ];

  // Converter dados para CSV
  const csvContent = [
    headers.join(','),
    ...contracts.map(contract => [
      `"${contract.id || ''}"`,
      `"${contract.contract_number || ''}"`,
      `"${contract.local || ''}"`,
      `"${contract.area || ''}"`,
      `"${contract.gestora || ''}"`,
      `"${contract.medico || ''}"`,
      `"${contract.client ? contract.client.first_name : ''}"`,
      `"${contract.value || 0}"`,
      `"${contract.number_of_payments || 0}"`,
      `"${contract.status || ''}"`,
      `"${contract.start_date || ''}"`,
      `"${contract.end_date || ''}"`,
      `"${contract.payment_frequency || ''}"`,
      `"${contract.down_payment || 0}"`,
      `"${contract.positive_balance || 0}"`,
      `"${contract.negative_balance || 0}"`,
      `"${(contract.notes || '').replace(/"/g, '""')}"`,
      `"${contract.created_at || ''}"`,
      `"${contract.updated_at || ''}"`
    ].join(','))
  ].join('\n');

  // Fazer download do arquivo
  downloadCSV(csvContent, 'contratos');
};

// Função para converter dados de pagamentos em CSV
export const exportPaymentsToCSV = (payments: Payment[]): void => {
  if (!payments || payments.length === 0) {
    throw new Error('Nenhum dado de pagamento disponível para exportação');
  }

  // Cabeçalhos do CSV
  const headers = [
    'ID',
    'Contrato ID',
    'Número do Contrato',
    'Cliente',
    'Valor',
    'Data de Vencimento',
    'Data de Pagamento',
    'Status',
    'Método de Pagamento',
    'Tipo de Pagamento',
    'Valor Pago',
    'Observações',
    'ID Externo',
    'Data de Criação',
    'Data de Atualização'
  ];

  // Converter dados para CSV
  const csvContent = [
    headers.join(','),
    ...payments.map(payment => [
      `"${payment.id || ''}"`,
      `"${payment.contract_id || ''}"`,
      `"${payment.contract?.contract_number || ''}"`,
      `"${payment.contract?.client ? `${payment.contract.client.first_name} ${payment.contract.client.last_name}` : ''}"`,
      `"${payment.amount || 0}"`,
      `"${payment.due_date || ''}"`,
      `"${payment.paid_date || ''}"`,
      `"${payment.status || ''}"`,
      `"${payment.payment_method || ''}"`,
      `"${payment.payment_type || ''}"`,
      `"${payment.paid_amount || 0}"`,
      `"${(payment.notes || '').replace(/"/g, '""')}"`,
      `"${payment.external_id || ''}"`,
      `"${payment.created_at || ''}"`,
      `"${payment.updated_at || ''}"`
    ].join(','))
  ].join('\n');

  // Fazer download do arquivo
  downloadCSV(csvContent, 'pagamentos');
};

// Função para fazer download do CSV
const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Formatar data para exibição no CSV
 * @param date Data a ser formatada
 * @returns Data formatada ou string vazia
 */
export const formatDateForCSV = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-PT');
  } catch (error) {
    return '';
  }
};