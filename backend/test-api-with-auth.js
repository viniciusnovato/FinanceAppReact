const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testando API com autenticação...\n');

  try {
    // 1. Fazer login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@institutoareluna.pt',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso!');

    // 2. Buscar contratos com token
    console.log('\n2. Buscando contratos com novos campos...');
    const contractsResponse = await axios.get('http://localhost:3000/api/contracts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const contracts = contractsResponse.data.data || contractsResponse.data;
    console.log(`✅ Encontrados ${contracts.length} contratos`);

    if (contracts.length > 0) {
      const firstContract = contracts[0];
      console.log('\n📋 Primeiro contrato:');
      console.log(`  - ID: ${firstContract.id}`);
      console.log(`  - Número: ${firstContract.contract_number}`);
      console.log(`  - Local: ${firstContract.local || 'N/A'}`);
      console.log(`  - Área: ${firstContract.area || 'N/A'}`);
      console.log(`  - Gestora: ${firstContract.gestora || 'N/A'}`);
      console.log(`  - Médico: ${firstContract.medico || 'N/A'}`);
      console.log(`  - Cliente: ${firstContract.client_name || 'N/A'}`);
      console.log(`  - Status: ${firstContract.status}`);
    }

    console.log('\n🎉 Teste da API concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testAPI();
