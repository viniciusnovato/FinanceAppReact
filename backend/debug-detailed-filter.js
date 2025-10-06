const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugDetailedFilter() {
  console.log('=== DEBUG DETALHADO DO FILTRO ===\n');
  
  try {
    // 1. Verificar pagamentos atrasados
    const today = new Date().toISOString().split('T')[0];
    console.log(`1. Data de hoje: ${today}`);
    
    const { data: overduePayments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, contract_id, amount, due_date, status')
      .lt('due_date', today)
      .neq('status', 'paid');
    
    if (paymentsError) {
      console.error('Erro ao buscar pagamentos atrasados:', paymentsError);
      return;
    }
    
    console.log(`2. Pagamentos atrasados encontrados: ${overduePayments.length}`);
    console.log('Primeiros 3 pagamentos atrasados:');
    overduePayments.slice(0, 3).forEach((payment, index) => {
      console.log(`   ${index + 1}. Contract ID: ${payment.contract_id}, Amount: ${payment.amount}, Due: ${payment.due_date}, Status: ${payment.status}`);
    });
    
    // 2. Obter IDs únicos dos contratos
    const contractIds = [...new Set(overduePayments.map(p => p.contract_id))];
    console.log(`\n3. Contratos únicos com pagamentos atrasados: ${contractIds.length}`);
    console.log('Primeiros 5 contract IDs:', contractIds.slice(0, 5));
    
    // 3. Buscar contratos e seus clientes
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, client_id')
      .in('id', contractIds.slice(0, 50)); // Limitando para evitar erro
    
    if (contractsError) {
      console.error('Erro ao buscar contratos:', contractsError);
      return;
    }
    
    console.log(`\n4. Contratos encontrados: ${contracts.length}`);
    console.log('Primeiros 3 contratos:');
    contracts.slice(0, 3).forEach((contract, index) => {
      console.log(`   ${index + 1}. Contract ID: ${contract.id}, Client ID: ${contract.client_id}`);
    });
    
    // 4. Obter IDs únicos dos clientes
    const clientIds = [...new Set(contracts.map(c => c.client_id))];
    console.log(`\n5. Clientes únicos com contratos atrasados: ${clientIds.length}`);
    console.log('Primeiros 5 client IDs:', clientIds.slice(0, 5));
    
    // 5. Buscar clientes
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .in('id', clientIds);
    
    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError);
      return;
    }
    
    console.log(`\n6. Clientes encontrados: ${clients.length}`);
    console.log('Primeiros 3 clientes:');
    clients.slice(0, 3).forEach((client, index) => {
      console.log(`   ${index + 1}. ID: ${client.id}, Nome: ${client.first_name} ${client.last_name}, Email: ${client.email}`);
    });
    
    // 6. Testar a lógica exata do repository
    console.log('\n=== TESTANDO LÓGICA DO REPOSITORY ===');
    
    // Simular a lógica do findAllWithFilters
    let query = supabase
      .from('clients')
      .select('*');
    
    // Aplicar filtro hasOverduePayments
    if (clientIds.length > 0) {
      query = query.in('id', clientIds);
      console.log(`7. Aplicando filtro IN com ${clientIds.length} IDs`);
    } else {
      console.log('7. Nenhum cliente ID para filtrar - retornando array vazio');
      return;
    }
    
    const { data: filteredClients, error: filterError } = await query;
    
    if (filterError) {
      console.error('Erro no filtro final:', filterError);
      return;
    }
    
    console.log(`\n8. RESULTADO FINAL: ${filteredClients.length} clientes`);
    if (filteredClients.length > 0) {
      console.log('Primeiros 3 clientes filtrados:');
      filteredClients.slice(0, 3).forEach((client, index) => {
        console.log(`   ${index + 1}. ID: ${client.id}, Nome: ${client.first_name} ${client.last_name}`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

debugDetailedFilter();