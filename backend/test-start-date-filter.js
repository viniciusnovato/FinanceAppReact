const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testStartDateFilter() {
  try {
    console.log('🧪 Testando filtro de data de início no backend...\n');
    
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@institutoareluna.pt',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login realizado com sucesso\n');
    
    // 2. Buscar alguns contratos para ver as datas disponíveis
    const allResponse = await axios.get(`${BASE_URL}/api/contracts?limit=10`, { headers });
    console.log('📋 Primeiros 10 contratos (datas de início):');
    allResponse.data.data.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract.contract_number}: start_date=${contract.start_date || 'null'}`);
    });
    
    // 3. Testar filtro por data de início específica (2024-01-01)
    console.log('\n🔍 Testando filtro start_date_from=2024-01-01...');
    const filter1Response = await axios.get(`${BASE_URL}/api/contracts?start_date_from=2024-01-01&limit=5`, { headers });
    console.log(`✅ Encontrados ${filter1Response.data.data.length} contratos com start_date >= 2024-01-01`);
    filter1Response.data.data.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract.contract_number}: start_date=${contract.start_date}`);
    });
    
    // 4. Testar filtro por data de início específica (2025-01-01)
    console.log('\n🔍 Testando filtro start_date_from=2025-01-01...');
    const filter2Response = await axios.get(`${BASE_URL}/api/contracts?start_date_from=2025-01-01&limit=5`, { headers });
    console.log(`✅ Encontrados ${filter2Response.data.data.length} contratos com start_date >= 2025-01-01`);
    filter2Response.data.data.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract.contract_number}: start_date=${contract.start_date}`);
    });
    
    // 5. Testar filtro por intervalo de datas
    console.log('\n🔍 Testando filtro start_date_from=2024-01-01&start_date_to=2024-12-31...');
    const rangeResponse = await axios.get(`${BASE_URL}/api/contracts?start_date_from=2024-01-01&start_date_to=2024-12-31&limit=5`, { headers });
    console.log(`✅ Encontrados ${rangeResponse.data.data.length} contratos no intervalo 2024`);
    rangeResponse.data.data.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract.contract_number}: start_date=${contract.start_date}`);
    });
    
    // 6. Verificar se há contratos sem data de início
    console.log('\n🔍 Verificando contratos sem data de início...');
    const allContracts = await axios.get(`${BASE_URL}/api/contracts?limit=100`, { headers });
    const contractsWithoutStartDate = allContracts.data.data.filter(c => !c.start_date);
    console.log(`📊 Contratos sem start_date: ${contractsWithoutStartDate.length} de ${allContracts.data.data.length}`);
    
    if (contractsWithoutStartDate.length > 0) {
      console.log('   Exemplos:');
      contractsWithoutStartDate.slice(0, 3).forEach((contract, index) => {
        console.log(`     ${index + 1}. ${contract.contract_number}: start_date=${contract.start_date}, created_at=${contract.created_at?.split('T')[0]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testStartDateFilter();