const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSpecificFilters() {
  try {
    console.log('🧪 Testando filtros específicos dos novos campos...\n');

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

    // 2. Primeiro, vamos ver quais valores únicos existem
    console.log('2. Obtendo valores únicos dos novos campos...');
    const allResponse = await axios.get(`${BASE_URL}/api/contracts?limit=100`, { headers });
    const contracts = allResponse.data.data || [];
    
    const locais = [...new Set(contracts.map(c => c.local).filter(Boolean))];
    const areas = [...new Set(contracts.map(c => c.area).filter(Boolean))];
    const gestoras = [...new Set(contracts.map(c => c.gestora).filter(Boolean))];
    const medicos = [...new Set(contracts.map(c => c.medico).filter(Boolean))];

    console.log(`📊 Valores únicos encontrados:`);
    console.log(`   Locais (${locais.length}): ${locais.slice(0, 5).join(', ')}${locais.length > 5 ? '...' : ''}`);
    console.log(`   Áreas (${areas.length}): ${areas.slice(0, 5).join(', ')}${areas.length > 5 ? '...' : ''}`);
    console.log(`   Gestoras (${gestoras.length}): ${gestoras.slice(0, 5).join(', ')}${gestoras.length > 5 ? '...' : ''}`);
    console.log(`   Médicos (${medicos.length}): ${medicos.slice(0, 5).join(', ')}${medicos.length > 5 ? '...' : ''}`);
    console.log('');

    // 3. Testar filtro por local usando valor real
    if (locais.length > 0) {
      const localTeste = locais[0];
      console.log(`3. Testando filtro por local: "${localTeste}"...`);
      const localResponse = await axios.get(`${BASE_URL}/api/contracts?local=${encodeURIComponent(localTeste)}`, { headers });
      console.log(`✅ Filtro por local: ${localResponse.data.data?.length || 0} contratos encontrados`);
      if (localResponse.data.data?.length > 0) {
        console.log(`   Primeiro resultado - Local: ${localResponse.data.data[0].local}`);
      }
      console.log('');
    }

    // 4. Testar filtro por área usando valor real
    if (areas.length > 0) {
      const areaTeste = areas[0];
      console.log(`4. Testando filtro por área: "${areaTeste}"...`);
      const areaResponse = await axios.get(`${BASE_URL}/api/contracts?area=${encodeURIComponent(areaTeste)}`, { headers });
      console.log(`✅ Filtro por área: ${areaResponse.data.data?.length || 0} contratos encontrados`);
      if (areaResponse.data.data?.length > 0) {
        console.log(`   Primeiro resultado - Área: ${areaResponse.data.data[0].area}`);
      }
      console.log('');
    }

    // 5. Testar filtro por gestora usando valor real
    if (gestoras.length > 0) {
      const gestoraTeste = gestoras[0];
      console.log(`5. Testando filtro por gestora: "${gestoraTeste}"...`);
      const gestoraResponse = await axios.get(`${BASE_URL}/api/contracts?gestora=${encodeURIComponent(gestoraTeste)}`, { headers });
      console.log(`✅ Filtro por gestora: ${gestoraResponse.data.data?.length || 0} contratos encontrados`);
      if (gestoraResponse.data.data?.length > 0) {
        console.log(`   Primeiro resultado - Gestora: ${gestoraResponse.data.data[0].gestora}`);
      }
      console.log('');
    }

    // 6. Testar filtro por médico usando valor real
    if (medicos.length > 0) {
      const medicoTeste = medicos[0];
      console.log(`6. Testando filtro por médico: "${medicoTeste}"...`);
      const medicoResponse = await axios.get(`${BASE_URL}/api/contracts?medico=${encodeURIComponent(medicoTeste)}`, { headers });
      console.log(`✅ Filtro por médico: ${medicoResponse.data.data?.length || 0} contratos encontrados`);
      if (medicoResponse.data.data?.length > 0) {
        console.log(`   Primeiro resultado - Médico: ${medicoResponse.data.data[0].medico}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro ao testar filtros específicos:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('Stack trace:', error.response.data.stack);
    }
  }
}

testSpecificFilters();