const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkContractStatus() {
  try {
    console.log('=== VERIFICAÇÃO DOS STATUS DE CONTRATOS ===');
    
    // Buscar todos os status únicos de contratos
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('status');
    
    if (error) {
      console.error('Erro ao buscar contratos:', error);
      return;
    }
    
    // Contar cada status
    const statusCounts = {};
    contracts.forEach(contract => {
      const status = contract.status || 'null';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log(`📊 Total de contratos: ${contracts.length}`);
    console.log('\n📋 Status encontrados:');
    
    Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count], index) => {
        console.log(`  ${index + 1}. "${status}": ${count} contratos`);
      });
    
    // Mostrar alguns exemplos de cada status
    console.log('\n🔍 Exemplos de contratos por status:');
    
    for (const [status] of Object.entries(statusCounts)) {
      const { data: examples, error: exampleError } = await supabase
        .from('contracts')
        .select('id, contract_number, description, status')
        .eq('status', status)
        .limit(3);
      
      if (!exampleError && examples.length > 0) {
        console.log(`\n  Status "${status}":`);
        examples.forEach((contract, idx) => {
          const description = contract.description ? contract.description.substring(0, 50) : 'N/A';
          console.log(`    ${idx + 1}. ${contract.contract_number || 'N/A'} - ${description}...`);
        });
      }
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('Erro na verificação:', error);
  }
}

checkContractStatus();