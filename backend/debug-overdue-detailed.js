const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOverdueDetailed() {
  try {
    console.log('🔍 Investigação detalhada dos pagamentos atrasados...\n');
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data de hoje: ${today}`);
    
    // 1. Verificar todos os status únicos com mais detalhes
    console.log('\n1️⃣ Verificando todos os status únicos...');
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('id, amount, due_date, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (allError) {
      console.error('Erro:', allError);
      return;
    }
    
    console.log(`Total de pagamentos: ${allPayments.length}`);
    
    // Contar status únicos
    const statusMap = {};
    allPayments.forEach(p => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    
    console.log('Status encontrados:');
    Object.entries(statusMap).forEach(([status, count]) => {
      console.log(`  "${status}": ${count}`);
    });
    
    // 2. Verificar query específica que o DashboardService usa
    console.log('\n2️⃣ Testando query específica do DashboardService...');
    const { data: overdueFromDashboard, error: dashboardError } = await supabase
      .from('payments')
      .select('id, amount, due_date, status')
      .eq('status', 'pending')
      .lt('due_date', today);
    
    if (dashboardError) {
      console.error('Erro na query do dashboard:', dashboardError);
    } else {
      console.log(`Query do dashboard (status='pending' AND due_date < hoje): ${overdueFromDashboard.length}`);
    }
    
    // 3. Verificar query que o repositório usa
    console.log('\n3️⃣ Testando query do repositório...');
    const { data: overdueFromRepo, error: repoError } = await supabase
      .from('payments')
      .select('id, amount, due_date, status')
      .neq('status', 'paid')
      .lt('due_date', today);
    
    if (repoError) {
      console.error('Erro na query do repositório:', repoError);
    } else {
      console.log(`Query do repositório (status != 'paid' AND due_date < hoje): ${overdueFromRepo.length}`);
      
      if (overdueFromRepo.length > 0) {
        console.log('\nPrimeiros 5 pagamentos encontrados pelo repositório:');
        overdueFromRepo.slice(0, 5).forEach((p, i) => {
          console.log(`${i + 1}. ID: ${p.id}, Status: "${p.status}", Vencimento: ${p.due_date}, Valor: ${p.amount}`);
        });
        
        // Verificar status únicos dos pagamentos atrasados
        const overdueStatusMap = {};
        overdueFromRepo.forEach(p => {
          overdueStatusMap[p.status] = (overdueStatusMap[p.status] || 0) + 1;
        });
        
        console.log('\nStatus dos pagamentos atrasados:');
        Object.entries(overdueStatusMap).forEach(([status, count]) => {
          console.log(`  "${status}": ${count}`);
        });
      }
    }
    
    // 4. Verificar se há pagamentos com status diferente de 'paid'
    console.log('\n4️⃣ Verificando pagamentos não pagos...');
    const { data: notPaid, error: notPaidError } = await supabase
      .from('payments')
      .select('id, amount, due_date, status')
      .neq('status', 'paid')
      .limit(10);
    
    if (notPaidError) {
      console.error('Erro:', notPaidError);
    } else {
      console.log(`Pagamentos não pagos: ${notPaid.length}`);
      if (notPaid.length > 0) {
        console.log('Exemplos:');
        notPaid.forEach((p, i) => {
          console.log(`${i + 1}. Status: "${p.status}", Vencimento: ${p.due_date}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

debugOverdueDetailed();