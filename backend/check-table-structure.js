const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura das tabelas...\n');
    
    // Verificar estrutura da tabela clients
    console.log('📋 Estrutura da tabela CLIENTS:');
    const { data: clientSample, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientError) {
      console.error('Erro ao buscar clients:', clientError);
    } else if (clientSample && clientSample.length > 0) {
      console.log('Campos disponíveis:', Object.keys(clientSample[0]));
    }
    
    // Verificar estrutura da tabela contracts
    console.log('\n📋 Estrutura da tabela CONTRACTS:');
    const { data: contractSample, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .limit(1);
    
    if (contractError) {
      console.error('Erro ao buscar contracts:', contractError);
    } else if (contractSample && contractSample.length > 0) {
      console.log('Campos disponíveis:', Object.keys(contractSample[0]));
    }
    
    // Verificar estrutura da tabela payments
    console.log('\n📋 Estrutura da tabela PAYMENTS:');
    const { data: paymentSample, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .limit(1);
    
    if (paymentError) {
      console.error('Erro ao buscar payments:', paymentError);
    } else if (paymentSample && paymentSample.length > 0) {
      console.log('Campos disponíveis:', Object.keys(paymentSample[0]));
    }
    
    // Testar query simples de pagamentos atrasados
    console.log('\n🔍 Testando query simples de pagamentos atrasados:');
    const today = new Date().toISOString().split('T')[0];
    
    const { data: overduePayments, error: overdueError } = await supabase
      .from('payments')
      .select('id, contract_id, amount, due_date, status')
      .lt('due_date', today)
      .eq('status', 'pending');
    
    if (overdueError) {
      console.error('Erro ao buscar pagamentos atrasados:', overdueError);
    } else {
      console.log(`Pagamentos atrasados encontrados: ${overduePayments.length}`);
      if (overduePayments.length > 0) {
        console.log('Primeiros 3 pagamentos atrasados:');
        overduePayments.slice(0, 3).forEach((p, i) => {
          console.log(`${i + 1}. Contract: ${p.contract_id}, Valor: ${p.amount}, Vencimento: ${p.due_date}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkTableStructure();
