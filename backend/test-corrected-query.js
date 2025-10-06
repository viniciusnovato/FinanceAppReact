const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCorrectedQuery() {
  console.log('🔍 Testando nova abordagem de query corrigida...\n');
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Data atual: ${today}\n`);

  try {
    console.log('1️⃣ Buscando pagamentos vencendo hoje com contratos:');
    
    const { data: dueTodayPayments, error: dueTodayError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        due_date,
        contract_id,
        contracts(
          id,
          client_id,
          clients(
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('status', 'pending')
      .eq('due_date', today);

    if (dueTodayError) {
      console.error('❌ Erro ao buscar pagamentos:', dueTodayError);
      return;
    }

    console.log(`📊 Pagamentos encontrados: ${dueTodayPayments?.length || 0}`);
    
    const clientIds = [];
    dueTodayPayments?.forEach(payment => {
      console.log(`  - Pagamento ID: ${payment.id}, Valor: R$ ${payment.amount}`);
      console.log(`    Contrato ID: ${payment.contract_id}`);
      console.log(`    Cliente: ${payment.contracts?.clients?.first_name} ${payment.contracts?.clients?.last_name}`);
      console.log(`    Cliente ID: ${payment.contracts?.client_id}`);
      
      if (payment.contracts?.client_id) {
        clientIds.push(payment.contracts.client_id);
      }
    });

    console.log(`\n2️⃣ IDs de clientes extraídos: ${clientIds.length}`);
    clientIds.forEach(id => console.log(`  - ${id}`));

    const uniqueClientIds = [...new Set(clientIds)];
    console.log(`\n3️⃣ IDs únicos de clientes: ${uniqueClientIds.length}`);
    uniqueClientIds.forEach(id => console.log(`  - ${id}`));

    if (uniqueClientIds.length > 0) {
      console.log('\n4️⃣ Buscando dados completos dos clientes:');
      
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .in('id', uniqueClientIds)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('❌ Erro ao buscar clientes:', clientsError);
        return;
      }

      console.log(`📊 Clientes encontrados: ${clients?.length || 0}`);
      clients?.forEach(client => {
        console.log(`  - ${client.first_name} ${client.last_name} (${client.email})`);
        console.log(`    ID: ${client.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testCorrectedQuery();