const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPaymentsDueToday() {
  console.log('Verificando pagamentos vencendo hoje...');
  const today = new Date().toISOString().split('T')[0];
  console.log('Data atual:', today);
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id,
      due_date,
      status,
      amount,
      contracts!inner(
        id,
        clients!inner(
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq('status', 'pending')
    .eq('due_date', today);
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  console.log('Pagamentos encontrados:', data?.length || 0);
  if (data && data.length > 0) {
    data.forEach(payment => {
      console.log(`- Cliente: ${payment.contracts.clients.first_name} ${payment.contracts.clients.last_name}`);
      console.log(`  Pagamento: R$ ${payment.amount} - Vencimento: ${payment.due_date}`);
    });
  } else {
    console.log('Nenhum pagamento vencendo hoje encontrado.');
  }
}

checkPaymentsDueToday().catch(console.error);