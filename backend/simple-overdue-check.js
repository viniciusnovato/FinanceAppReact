const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickOverdueCheck() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', today);
    
    // Buscar pagamentos atrasados
    const { data: overduePayments, error } = await supabase
      .from('payments')
      .select('id, due_date, status, amount')
      .eq('status', 'pending')
      .lt('due_date', today)
      .limit(10);
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log('⚠️  Pagamentos atrasados encontrados:', overduePayments?.length || 0);
    
    if (overduePayments && overduePayments.length > 0) {
      console.log('\n📋 Exemplos:');
      overduePayments.slice(0, 5).forEach((payment, index) => {
        console.log(`${index + 1}. ID: ${payment.id}, Vencimento: ${payment.due_date}, Valor: R$ ${payment.amount}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

quickOverdueCheck();