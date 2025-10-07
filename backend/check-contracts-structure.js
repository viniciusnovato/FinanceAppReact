const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkContractsTable() {
  try {
    console.log('=== VERIFICAÇÃO DA ESTRUTURA DA TABELA CONTRACTS ===');
    
    // Buscar alguns contratos para ver a estrutura
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Erro ao buscar contratos:', error);
      return;
    }
    
    if (contracts && contracts.length > 0) {
      console.log('📋 Estrutura da tabela contracts:');
      console.log('Campos encontrados:', Object.keys(contracts[0]));
      
      console.log('\n📊 Exemplos de contratos:');
      contracts.forEach((contract, index) => {
        console.log(`  ${index + 1}. ID: ${contract.id}, Status: '${contract.status}', Número: ${contract.contract_number}`);
      });
      
      // Verificar status únicos
      const { data: allContracts, error: allError } = await supabase
        .from('contracts')
        .select('status');
      
      if (!allError && allContracts) {
        const statusCounts = {};
        allContracts.forEach(contract => {
          const status = contract.status || 'null';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('\n📈 Status únicos encontrados:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`  - '${status}': ${count} contratos`);
        });
      }
    } else {
      console.log('❌ Nenhum contrato encontrado na tabela');
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

checkContractsTable();