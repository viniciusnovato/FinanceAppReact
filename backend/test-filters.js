const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testContractFilters() {
  try {
    console.log('🧪 Testando filtros de contratos...\n');

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

    // 2. Testar filtro por local
    console.log('2. Testando filtro por local...');
    const localResponse = await axios.get(`${BASE_URL}/api/contracts?local=Lisboa`, { headers });
    console.log(`✅ Filtro por local: ${localResponse.data.data?.length || 0} contratos encontrados`);
    if (localResponse.data.data?.length > 0) {
      console.log(`   Primeiro contrato - Local: ${localResponse.data.data[0].local}`);
    }
    console.log('');

    // 3. Testar filtro por área
    console.log('3. Testando filtro por área...');
    const areaResponse = await axios.get(`${BASE_URL}/api/contracts?area=Saúde`, { headers });
    console.log(`✅ Filtro por área: ${areaResponse.data.data?.length || 0} contratos encontrados`);
    if (areaResponse.data.data?.length > 0) {
      console.log(`   Primeiro contrato - Área: ${areaResponse.data.data[0].area}`);
    }
    console.log('');

    // 4. Testar filtro por gestora
    console.log('4. Testando filtro por gestora...');
    const gestoraResponse = await axios.get(`${BASE_URL}/api/contracts?gestora=Maria Silva`, { headers });
    console.log(`✅ Filtro por gestora: ${gestoraResponse.data.data?.length || 0} contratos encontrados`);
    if (gestoraResponse.data.data?.length > 0) {
      console.log(`   Primeiro contrato - Gestora: ${gestoraResponse.data.data[0].gestora}`);
    }
    console.log('');

    // 5. Testar filtro por médico
    console.log('5. Testando filtro por médico...');
    const medicoResponse = await axios.get(`${BASE_URL}/api/contracts?medico=Dr. João Santos`, { headers });
    console.log(`✅ Filtro por médico: ${medicoResponse.data.data?.length || 0} contratos encontrados`);
    if (medicoResponse.data.data?.length > 0) {
      console.log(`   Primeiro contrato - Médico: ${medicoResponse.data.data[0].medico}`);
    }
    console.log('');

    // 6. Testar filtros combinados
    console.log('6. Testando filtros combinados (local + área)...');
    const combinedResponse = await axios.get(`${BASE_URL}/api/contracts?local=Lisboa&area=Saúde`, { headers });
    console.log(`✅ Filtros combinados: ${combinedResponse.data.data?.length || 0} contratos encontrados`);
    console.log('');

    // 7. Testar busca geral
    console.log('7. Testando busca geral...');
    const searchResponse = await axios.get(`${BASE_URL}/api/contracts?search=Lisboa`, { headers });
    console.log(`✅ Busca geral por "Lisboa": ${searchResponse.data.data?.length || 0} contratos encontrados`);
    console.log('');

    // 8. Listar alguns valores únicos para referência
    console.log('8. Obtendo todos os contratos para verificar valores únicos...');
    const allResponse = await axios.get(`${BASE_URL}/api/contracts?limit=100`, { headers });
    const contracts = allResponse.data.data || [];
    
    const locais = [...new Set(contracts.map(c => c.local).filter(Boolean))];
    const areas = [...new Set(contracts.map(c => c.area).filter(Boolean))];
    const gestoras = [...new Set(contracts.map(c => c.gestora).filter(Boolean))];
    const medicos = [...new Set(contracts.map(c => c.medico).filter(Boolean))];

    console.log(`📊 Valores únicos encontrados:`);
    console.log(`   Locais: ${locais.join(', ')}`);
    console.log(`   Áreas: ${areas.join(', ')}`);
    console.log(`   Gestoras: ${gestoras.join(', ')}`);
    console.log(`   Médicos: ${medicos.join(', ')}`);

  } catch (error) {
    console.error('❌ Erro ao testar filtros:', error.response?.data || error.message);
  }
}

testContractFilters();