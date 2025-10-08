const axios = require('axios');

async function testClientNameFilter() {
  try {
    console.log('🔍 Testando filtro client_name isolado...\n');

    // Login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso\n');

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Teste 1: Buscar todos os contratos
    console.log('📋 Teste 1: Buscar todos os contratos');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Total de contratos:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro no teste:', error.response?.data || error.message);
    }

    // Teste 2: Filtrar por client_name=Adelaide
    console.log('\n📋 Teste 2: Filtrar por client_name=Adelaide');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?client_name=Adelaide', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro no filtro client_name:', error.response?.data || error.message);
    }

    // Teste 3: Busca geral por search=Adelaide
    console.log('\n📋 Teste 3: Busca geral por search=Adelaide');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?search=Adelaide', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro na busca geral:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testClientNameFilter();