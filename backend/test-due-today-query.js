const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDueTodayQuery() {
  console.log('🔍 Testando query de pagamentos vencendo hoje...\n');
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Data atual: ${today}\n`);

  try {
    // 1. Primeiro, vamos ver todos os pagamentos de hoje
    console.log('1️⃣ Verificando todos os pagamentos de hoje:');
    const { data: paymentsToday, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        due_date,
        status,
        contract_id,
        contracts(
          id,
          client_id,
          clients(
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq('due_date', today);

    if (paymentsError) {
      console.error('❌ Erro ao buscar pagamentos:', paymentsError);
      return;
    }

    console.log(`📊 Total de pagamentos para hoje: ${paymentsToday?.length || 0}`);
    paymentsToday?.forEach(payment => {
      console.log(`  - ID: ${payment.id}, Valor: R$ ${payment.amount}, Status: ${payment.status}`);
      console.log(`    Cliente: ${payment.contracts?.clients?.first_name} ${payment.contracts?.clients?.last_name}`);
    });

    console.log('\n2️⃣ Testando query atual do filtro (com inner joins):');
    
    // 2. Agora vamos testar a query atual do filtro
    const { data: clientsFiltered, error: clientsError } = await supabase
      .from('clients')
      .select(`
        *,
        contracts!inner(
          id,
          payments!inner(
            id,
            status,
            due_date
          )
        )
      `)
      .eq('contracts.payments.status', 'pending')
      .eq('contracts.payments.due_date', today);

    if (clientsError) {
      console.error('❌ Erro na query do filtro:', clientsError);
      return;
    }

    console.log(`📊 Clientes encontrados pelo filtro: ${clientsFiltered?.length || 0}`);
    clientsFiltered?.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (${client.email})`);
    });

    console.log('\n3️⃣ Testando query alternativa (mais específica):');
    
    // 3. Vamos testar uma query mais específica
    const { data: clientsAlternative, error: altError } = await supabase
      .from('clients')
      .select(`
        id,
        first_name,
        last_name,
        email,
        tax_id,
        phone,
        created_at,
        updated_at
      `)
      .in('id', 
        supabase
          .from('contracts')
          .select('client_id')
          .in('id',
            supabase
              .from('payments')
              .select('contract_id')
              .eq('due_date', today)
              .eq('status', 'pending')
          )
      );

    if (altError) {
      console.error('❌ Erro na query alternativa:', altError);
      return;
    }

    console.log(`📊 Clientes encontrados pela query alternativa: ${clientsAlternative?.length || 0}`);
    clientsAlternative?.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (${client.email})`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDueTodayQuery();