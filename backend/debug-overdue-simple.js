const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOverdueSimple() {
  try {
    console.log('🔍 Verificando pagamentos atrasados (versão simples)...\n');
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data de hoje: ${today}`);
    
    // 1. Verificar total de pagamentos
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('id, amount, due_date, status');
    
    if (allError) {
      console.error('Erro ao buscar todos os pagamentos:', allError);
      return;
    }
    
    console.log(`📊 Total de pagamentos: ${allPayments.length}`);
    
    // 2. Verificar status únicos
    const statusMap = {};
    allPayments.forEach(p => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    
    console.log('\n📋 Status dos pagamentos:');
    Object.entries(statusMap).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // 3. Verificar pagamentos com due_date < hoje
    const overdueByDate = allPayments.filter(p => {
      const dueDate = new Date(p.due_date);
      const todayDate = new Date(today);
      return dueDate < todayDate;
    });
    
    console.log(`\n⏰ Pagamentos com data de vencimento passada: ${overdueByDate.length}`);
    
    // 4. Verificar pagamentos pendentes com data passada
    const overduePending = overdueByDate.filter(p => p.status === 'pending');
    console.log(`⏰ Pagamentos pendentes com data passada: ${overduePending.length}`);
    
    // 5. Verificar pagamentos não pagos com data passada
    const overdueNotPaid = overdueByDate.filter(p => p.status !== 'paid');
    console.log(`⏰ Pagamentos não pagos com data passada: ${overdueNotPaid.length}`);
    
    // 6. Mostrar alguns exemplos
    if (overdueNotPaid.length > 0) {
      console.log('\n📋 Primeiros 5 pagamentos atrasados:');
      overdueNotPaid.slice(0, 5).forEach((payment, index) => {
        console.log(`${index + 1}. ID: ${payment.id}`);
        console.log(`   Valor: R$ ${payment.amount}`);
        console.log(`   Vencimento: ${payment.due_date}`);
        console.log(`   Status: ${payment.status}`);
        console.log('');
      });
    }
    
    // 7. Testar query do Supabase para pagamentos atrasados
    console.log('\n🔍 Testando query do Supabase...');
    const { data: overdueQuery, error: overdueError } = await supabase
      .from('payments')
      .select('id, amount, due_date, status')
      .lt('due_date', today)
      .neq('status', 'paid');
    
    if (overdueError) {
      console.error('Erro na query do Supabase:', overdueError);
    } else {
      console.log(`Query Supabase encontrou: ${overdueQuery.length} pagamentos atrasados`);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

debugOverdueSimple();