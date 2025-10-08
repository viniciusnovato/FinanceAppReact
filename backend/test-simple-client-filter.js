const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testSimpleClientFilter() {
  try {
    console.log('🔍 Testando filtro simples de cliente...');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    
    // Teste 1: Buscar contratos sem filtros
    console.log('\n📋 Teste 1: Buscar todos os contratos');
    const allContracts = await axios.get(`${BASE_URL}/contracts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Contratos encontrados:', allContracts.data.data.length);
    
    // Teste 2: Buscar com filtro client_id válido
    if (allContracts.data.data.length > 0) {
      const firstContract = allContracts.data.data[0];
      const clientId = firstContract.client_id;
      
      console.log('\n📋 Teste 2: Buscar por client_id válido:', clientId);
      const clientContracts = await axios.get(`${BASE_URL}/contracts?client_id=${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Contratos do cliente encontrados:', clientContracts.data.data.length);
    }
    
    // Teste 3: Buscar com filtro search simples
    console.log('\n📋 Teste 3: Buscar com search simples');
    const searchContracts = await axios.get(`${BASE_URL}/contracts?search=contrato`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Contratos com search encontrados:', searchContracts.data.data.length);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testSimpleClientFilter();