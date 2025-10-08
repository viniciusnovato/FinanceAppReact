const axios = require('axios');

async function testAllFilters() {
  try {
    console.log('🔍 Testando todos os filtros de contratos...\n');

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

    // Teste 1: Buscar todos os contratos (baseline)
    console.log('📋 Teste 1: Buscar todos os contratos');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Total de contratos:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro:', error.response?.data || error.message);
    }

    // Teste 2: Filtro por client_name
    console.log('\n📋 Teste 2: Filtro por client_name=Adelaide');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?client_name=Adelaide', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro no filtro client_name:', error.response?.data || error.message);
    }

    // Teste 3: Filtro por médico
    console.log('\n📋 Teste 3: Filtro por medico=Dr. Silva');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?medico=Dr. Silva', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro no filtro médico:', error.response?.data || error.message);
    }

    // Teste 4: Filtro por gestora
    console.log('\n📋 Teste 4: Filtro por gestora=Gestora A');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?gestora=Gestora A', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro no filtro gestora:', error.response?.data || error.message);
    }

    // Teste 5: Filtro por status
    console.log('\n📋 Teste 5: Filtro por status=ativo');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?status=ativo', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro no filtro status:', error.response?.data || error.message);
    }

    // Teste 6: Busca geral
    console.log('\n📋 Teste 6: Busca geral por search=Adelaide');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?search=Adelaide', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro na busca geral:', error.response?.data || error.message);
    }

    // Teste 7: Filtros combinados
    console.log('\n📋 Teste 7: Filtros combinados (client_name + status)');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?client_name=Adelaide&status=ativo', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos encontrados:', response.data.data.length);
    } catch (error) {
      console.log('❌ Erro nos filtros combinados:', error.response?.data || error.message);
    }

    // Teste 8: Paginação
    console.log('\n📋 Teste 8: Paginação (page=1, limit=10)');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts?page=1&limit=10', { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Contratos na página:', response.data.data.length);
      console.log('✅ Paginação:', response.data.pagination);
    } catch (error) {
      console.log('❌ Erro na paginação:', error.response?.data || error.message);
    }

    console.log('\n🎉 Teste de filtros concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testAllFilters();