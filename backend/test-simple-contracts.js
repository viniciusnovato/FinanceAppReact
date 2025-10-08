const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSimpleContracts() {
  try {
    console.log('🧪 Testando API de contratos simples...\n');

    // 1. Login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@institutoareluna.pt',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Testar endpoint básico de contratos
    console.log('2. Testando endpoint básico de contratos...');
    const basicResponse = await axios.get(`${BASE_URL}/api/contracts`, { headers });
    console.log(`✅ Endpoint básico: ${basicResponse.data.data?.length || 0} contratos encontrados`);
    
    if (basicResponse.data.data?.length > 0) {
      const firstContract = basicResponse.data.data[0];
      console.log(`   Primeiro contrato:`);
      console.log(`   - ID: ${firstContract.id}`);
      console.log(`   - Local: ${firstContract.local || 'N/A'}`);
      console.log(`   - Área: ${firstContract.area || 'N/A'}`);
      console.log(`   - Gestora: ${firstContract.gestora || 'N/A'}`);
      console.log(`   - Médico: ${firstContract.medico || 'N/A'}`);
    }
    console.log('');

    // 3. Testar com paginação
    console.log('3. Testando com paginação...');
    const paginatedResponse = await axios.get(`${BASE_URL}/api/contracts?page=1&limit=5`, { headers });
    console.log(`✅ Com paginação: ${paginatedResponse.data.data?.length || 0} contratos encontrados`);
    if (paginatedResponse.data.pagination) {
      console.log(`   Paginação: página ${paginatedResponse.data.pagination.page} de ${paginatedResponse.data.pagination.totalPages}`);
      console.log(`   Total: ${paginatedResponse.data.pagination.total} contratos`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao testar contratos:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('Stack trace:', error.response.data.stack);
    }
  }
}

testSimpleContracts();