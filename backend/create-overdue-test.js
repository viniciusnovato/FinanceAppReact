const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggqfqjqjqjqjqjqjqjqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncWZxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzE4NzEsImV4cCI6MjA1MTE0Nzg3MX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
);

async function createTestOverduePayments() {
  try {
    // Primeiro, vamos buscar um contrato existente
    const { data: contracts, error: contractError } = await supabase
      .from('contracts')
      .select('id')
      .limit(1);
      
    if (contractError) {
      console.error('Erro ao buscar contratos:', contractError);
      return;
    }
      
    if (!contracts || contracts.length === 0) {
      console.log('Nenhum contrato encontrado. Criando dados de teste...');
      return;
    }
    
    const contractId = contracts[0].id;
    console.log('Usando contrato:', contractId);
    
    // Criar pagamentos com datas vencidas
    const overduePayments = [
      {
        contract_id: contractId,
        amount: 500.00,
        due_date: '2024-11-15', // Data no passado
        status: 'pending',
        payment_type: 'installment',
        description: 'Pagamento teste atrasado 1'
      },
      {
        contract_id: contractId,
        amount: 750.00,
        due_date: '2024-12-01', // Data no passado
        status: 'pending',
        payment_type: 'installment',
        description: 'Pagamento teste atrasado 2'
      },
      {
        contract_id: contractId,
        amount: 300.00,
        due_date: '2024-12-10', // Data no passado
        status: 'overdue',
        payment_type: 'installment',
        description: 'Pagamento teste com status overdue'
      }
    ];
    
    for (const payment of overduePayments) {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select();
        
      if (error) {
        console.error('Erro ao criar pagamento:', error);
      } else {
        console.log('Pagamento criado:', data[0].id, '- Vencimento:', payment.due_date, '- Status:', payment.status);
      }
    }
    
    console.log('Pagamentos de teste criados com sucesso!');
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

createTestOverduePayments();