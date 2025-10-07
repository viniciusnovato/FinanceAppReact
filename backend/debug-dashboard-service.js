const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugDashboardService() {
  console.log('=== DEBUG DO DASHBOARD SERVICE ===\n');

  try {
    // Testar consulta de contratos ativos exatamente como no DashboardService
    console.log('🔍 Testando consulta de contratos ativos...');
    const activeContractsResult = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo');

    console.log('Resultado da consulta:', {
      count: activeContractsResult.count,
      error: activeContractsResult.error,
      status: activeContractsResult.status
    });

    // Testar consulta sem head para ver os dados
    console.log('\n🔍 Testando consulta sem head para ver dados...');
    const activeContractsData = await supabase
      .from('contracts')
      .select('id, status')
      .eq('status', 'ativo')
      .limit(5);

    console.log('Primeiros 5 contratos ativos:', activeContractsData.data);

    // Verificar todos os status únicos
    console.log('\n🔍 Verificando todos os status únicos...');
    const allStatuses = await supabase
      .from('contracts')
      .select('status')
      .limit(1000);

    const uniqueStatuses = [...new Set(allStatuses.data?.map(c => c.status))];
    console.log('Status únicos encontrados:', uniqueStatuses);

    // Contar por cada status
    for (const status of uniqueStatuses) {
      const count = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      console.log(`Status "${status}": ${count.count} contratos`);
    }

  } catch (error) {
    console.error('Erro no debug:', error);
  }
}

debugDashboardService();