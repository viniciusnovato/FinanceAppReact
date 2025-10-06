const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendFilter() {
  console.log('🔍 Testando filtro de pagamentos vencendo hoje...\n');

  try {
    // Simular a mesma query que o frontend faria
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data atual: ${today}\n`);

    // 1. Buscar pagamentos vencendo hoje
    const { data: dueTodayPayments, error: dueTodayError } = await supabase
      .from('payments')
      .select(`
        contract_id,
        amount,
        due_date,
        status,
        contracts(
          client_id
        )
      `)
      .eq('status', 'pending')
      .eq('due_date', today);

    if (dueTodayError) {
      console.error('❌ Erro ao buscar pagamentos:', dueTodayError);
      return;
    }

    console.log(`📊 Pagamentos vencendo hoje: ${dueTodayPayments?.length || 0}`);
    
    if (dueTodayPayments && dueTodayPayments.length > 0) {
      dueTodayPayments.forEach((payment, index) => {
        console.log(`${index + 1}. Contrato ID: ${payment.contract_id}`);
        console.log(`   Valor: R$ ${payment.amount}`);
        console.log(`   Data vencimento: ${payment.due_date}`);
        console.log(`   Cliente ID: ${payment.contracts?.client_id || 'N/A'}\n`);
      });

      // 2. Extrair IDs únicos dos clientes
      const clientIds = [...new Set(dueTodayPayments
        .map(p => p.contracts?.client_id)
        .filter(id => id))];

      console.log(`👥 IDs únicos de clientes: ${clientIds.length}`);
      console.log(`IDs: ${clientIds.join(', ')}\n`);

      // 3. Buscar dados completos dos clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .in('id', clientIds);

      if (clientsError) {
        console.error('❌ Erro ao buscar clientes:', clientsError);
        return;
      }

      console.log(`✅ Clientes encontrados: ${clients?.length || 0}`);
      
      if (clients && clients.length > 0) {
        clients.forEach((client, index) => {
          console.log(`${index + 1}. ${client.name} - ${client.email || 'Sem email'}`);
        });
      }

    } else {
      console.log('ℹ️ Nenhum pagamento vencendo hoje encontrado');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testFrontendFilter();