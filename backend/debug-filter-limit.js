const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugFilterLimit() {
  try {
    console.log('🔍 Testando limite de IDs na query...\n');
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data de hoje: ${today}`);
    
    // 1. Buscar contratos com pagamentos atrasados (limitado)
    console.log('\n1️⃣ Buscando contratos com pagamentos atrasados (limitado)...');
    const { data: overduePayments, error: overdueError } = await supabase
      .from('payments')
      .select('contract_id')
      .lt('due_date', today)
      .eq('status', 'pending')
      .limit(50); // Limitando para testar
    
    if (overdueError) {
      console.error('Erro:', overdueError);
      return;
    }
    
    const uniqueContractIds = [...new Set(overduePayments.map(p => p.contract_id))];
    console.log(`Contratos com pagamentos atrasados: ${uniqueContractIds.length}`);
    
    // 2. Testar com poucos IDs primeiro
    console.log('\n2️⃣ Testando com primeiros 10 contratos...');
    const testContractIds = uniqueContractIds.slice(0, 10);
    
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('client_id')
      .in('id', testContractIds);
    
    if (contractsError) {
      console.error('Erro:', contractsError);
      return;
    }
    
    const uniqueClientIds = [...new Set(contracts.map(c => c.client_id))];
    console.log(`Clientes com pagamentos atrasados: ${uniqueClientIds.length}`);
    
    // 3. Buscar os clientes
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
    
    // 4. Mostrar exemplos
    if (clients.length > 0) {
      console.log('\n📋 Clientes com pagamentos atrasados:');
      clients.forEach((client, i) => {
        console.log(`${i + 1}. ${client.first_name} ${client.last_name || ''} (${client.email})`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

debugFilterLimit();
