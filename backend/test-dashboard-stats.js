const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboardStats() {
  try {
    console.log('=== TESTE DAS ESTATÍSTICAS DO DASHBOARD ===');
    
    // Testar contagem de clientes ativos
    console.log('\n📊 Testando clientes ativos...');
    const { count: activeClientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo');
    
    if (clientsError) {
      console.error('❌ Erro ao contar clientes ativos:', clientsError);
    } else {
      console.log(`✅ Clientes ativos: ${activeClientsCount}`);
    }
    
    // Testar contagem de contratos ativos
    console.log('\n📋 Testando contratos ativos...');
    const { count: activeContractsCount, error: contractsError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Ativo');
    
    if (contractsError) {
      console.error('❌ Erro ao contar contratos ativos:', contractsError);
    } else {
      console.log(`✅ Contratos ativos: ${activeContractsCount}`);
    }
    
    // Testar contagem total de contratos
    console.log('\n📋 Testando total de contratos...');
    const { count: totalContractsCount, error: totalContractsError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });
    
    if (totalContractsError) {
      console.error('❌ Erro ao contar total de contratos:', totalContractsError);
    } else {
      console.log(`✅ Total de contratos: ${totalContractsCount}`);
    }
    
    // Testar contagem total de clientes
    console.log('\n👥 Testando total de clientes...');
    const { count: totalClientsCount, error: totalClientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (totalClientsError) {
      console.error('❌ Erro ao contar total de clientes:', totalClientsError);
    } else {
      console.log(`✅ Total de clientes: ${totalClientsCount}`);
    }
    
    // Testar contagem de pagamentos
    console.log('\n💰 Testando pagamentos...');
    const { count: totalPaymentsCount, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    
    if (paymentsError) {
      console.error('❌ Erro ao contar pagamentos:', paymentsError);
    } else {
      console.log(`✅ Total de pagamentos: ${totalPaymentsCount}`);
    }
    
    console.log('\n🎯 RESUMO:');
    console.log(`   Clientes ativos: ${activeClientsCount || 0}`);
    console.log(`   Total de clientes: ${totalClientsCount || 0}`);
    console.log(`   Contratos ativos: ${activeContractsCount || 0}`);
    console.log(`   Total de contratos: ${totalContractsCount || 0}`);
    console.log(`   Total de pagamentos: ${totalPaymentsCount || 0}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDashboardStats();