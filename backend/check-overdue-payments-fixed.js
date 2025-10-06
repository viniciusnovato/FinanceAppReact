const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOverduePayments() {
  try {
    console.log('🔍 Verificando pagamentos atrasados...\n');
    
    // Verificar total de pagamentos
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('*');
    
    if (allError) {
      console.error('Erro ao buscar pagamentos:', allError);
      return;
    }
    
    console.log(`📊 Total de pagamentos: ${allPayments.length}`);
    
    // Verificar pagamentos atrasados (due_date < hoje)
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data de hoje: ${today}`);
    
    const { data: overduePayments, error: overdueError } = await supabase
      .from('payments')
      .select(`
        *,
        contracts (
          client_id,
          clients (
            name
          )
        )
      `)
      .lt('due_date', today)
      .eq('status', 'pending');
    
    if (overdueError) {
      console.error('Erro ao buscar pagamentos atrasados:', overdueError);
      return;
    }
    
    console.log(`⏰ Pagamentos atrasados: ${overduePayments.length}`);
    
    if (overduePayments.length > 0) {
      console.log('\n📋 Detalhes dos pagamentos atrasados:');
      overduePayments.forEach((payment, index) => {
        console.log(`${index + 1}. Cliente: ${payment.contracts?.clients?.name || 'N/A'}`);
        console.log(`   Valor: R$ ${payment.amount}`);
        console.log(`   Vencimento: ${payment.due_date}`);
        console.log(`   Status: ${payment.status}`);
        console.log('');
      });
    } else {
      console.log('\n❌ Nenhum pagamento atrasado encontrado.');
      console.log('Vamos verificar alguns pagamentos recentes para análise:');
      
      const { data: recentPayments, error: recentError } = await supabase
        .from('payments')
        .select(`
          *,
          contracts (
            client_id,
            clients (
              name
            )
          )
        `)
        .order('due_date', { ascending: false })
        .limit(10);
      
      if (!recentError && recentPayments.length > 0) {
        console.log('\n📋 Últimos 10 pagamentos:');
        recentPayments.forEach((payment, index) => {
          const isOverdue = new Date(payment.due_date) < new Date(today);
          console.log(`${index + 1}. Cliente: ${payment.contracts?.clients?.name || 'N/A'}`);
          console.log(`   Valor: R$ ${payment.amount}`);
          console.log(`   Vencimento: ${payment.due_date} ${isOverdue ? '(ATRASADO)' : '(OK)'}`);
          console.log(`   Status: ${payment.status}`);
          console.log('');
        });
      }
    }
    
    // Verificar também pagamentos com status diferente de 'pending'
    console.log('\n🔍 Verificando todos os status de pagamentos:');
    const { data: statusCount, error: statusError } = await supabase
      .from('payments')
      .select('status');
    
    if (!statusError) {
      const statusMap = {};
      statusCount.forEach(p => {
        statusMap[p.status] = (statusMap[p.status] || 0) + 1;
      });
      
      console.log('Status dos pagamentos:');
      Object.entries(statusMap).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkOverduePayments();
