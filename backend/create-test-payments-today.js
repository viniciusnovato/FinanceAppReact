const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTestPaymentsToday() {
  console.log('Criando dados de teste com pagamentos vencendo hoje...');
  const today = new Date().toISOString().split('T')[0];
  console.log('Data atual:', today);
  
  try {
    // Primeiro, vamos buscar alguns contratos existentes
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        clients!inner(
          id,
          first_name,
          last_name
        )
      `)
      .limit(3);
      
    if (contractsError) {
      console.error('Erro ao buscar contratos:', contractsError);
      return;
    }
    
    if (!contracts || contracts.length === 0) {
      console.log('Nenhum contrato encontrado para criar pagamentos de teste.');
      return;
    }
    
    console.log(`Encontrados ${contracts.length} contratos. Criando pagamentos...`);
    
    // Criar pagamentos vencendo hoje para cada contrato
    const paymentsToCreate = contracts.map((contract, index) => ({
      contract_id: contract.id,
      amount: (index + 1) * 100, // R$ 100, R$ 200, R$ 300
      due_date: today,
      status: 'pending',
      payment_method: 'credit_card',
      notes: `Pagamento de teste vencendo hoje - ${contract.clients.first_name} ${contract.clients.last_name}`,
      payment_type: 'normalPayment'
    }));
    
    const { data: createdPayments, error: paymentsError } = await supabase
      .from('payments')
      .insert(paymentsToCreate)
      .select();
      
    if (paymentsError) {
      console.error('Erro ao criar pagamentos:', paymentsError);
      return;
    }
    
    console.log(`✅ Criados ${createdPayments.length} pagamentos vencendo hoje:`);
    createdPayments.forEach((payment, index) => {
      const contract = contracts[index];
      console.log(`- Cliente: ${contract.clients.first_name} ${contract.clients.last_name}`);
      console.log(`  Pagamento: R$ ${payment.amount} - Vencimento: ${payment.due_date}`);
    });
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

createTestPaymentsToday().catch(console.error);