const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugFilterLogic() {
  try {
    console.log('🔍 Debugando lógica do filtro hasOverduePayments...\n');
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data de hoje: ${today}`);
    
    // 1. Primeiro, vamos buscar os contract_ids que têm pagamentos atrasados
    console.log('\n1️⃣ Buscando contratos com pagamentos atrasados...');
    const { data: overduePayments, error: overdueError } = await supabase
      .from('payments')
      .select('contract_id')
      .lt('due_date', today)
      .eq('status', 'pending');
    
    if (overdueError) {
      console.error('Erro:', overdueError);
      return;
    }
    
    const uniqueContractIds = [...new Set(overduePayments.map(p => p.contract_id))];
    console.log(`Contratos com pagamentos atrasados: ${uniqueContractIds.length}`);
    
    // 2. Agora vamos buscar os client_ids desses contratos
    console.log('\n2️⃣ Buscando clientes desses contratos...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('client_id')
      .in('id', uniqueContractIds);
    
    if (contractsError) {
      console.error('Erro:', contractsError);
      return;
    }
    
    const uniqueClientIds = [...new Set(contracts.map(c => c.client_id))];
    console.log(`Clientes com pagamentos atrasados: ${uniqueClientIds.length}`);
    
    // 3. Buscar os clientes finais
    console.log('\n3️⃣ Buscando dados dos clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .in('id', uniqueClientIds);
    
    if (clientsError) {
      console.error('Erro:', clientsError);
      return;
    }
    
    console.log(`Clientes encontrados: ${clients.length}`);
    
    // 4. Testar a query atual do repositório
    console.log('\n4️⃣ Testando query atual do repositório...');
    const { data: currentQuery, error: currentError } = await supabase
      .from('clients')
      .select(`
        *,
        contracts (
          id,
          payments (
            id,
            status,
            due_date
          )
        )
      `)
      .or(
        `contracts.payments.status.eq.overdue,and(contracts.payments.status.eq.pending,contracts.payments.due_date.lt.${today})`,
        { foreignTable: 'contracts.payments' }
      );
    
    if (currentError) {
      console.error('Erro na query atual:', currentError);
    } else {
      console.log(`Resultado da query atual: ${currentQuery.length} clientes`);
    }
    
    // 5. Mostrar alguns exemplos
    if (clients.length > 0) {
      console.log('\n📋 Primeiros 3 clientes com pagamentos atrasados:');
      clients.slice(0, 3).forEach((client, i) => {
        console.log(`${i + 1}. ${client.first_name} ${client.last_name || ''} (${client.email})`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

debugFilterLogic();
