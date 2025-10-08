const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testClientNameSearch() {
  try {
    console.log('🧪 Testando busca por nome de cliente...');
    
    // Primeiro, fazer login para obter o token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('📋 Resposta do login:', loginResponse.data);
    
    if (!loginResponse.data.data || !loginResponse.data.data.token) {
      console.error('❌ Resposta do login:', loginResponse.data);
      throw new Error('Falha no login - token não encontrado');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Configurar headers com token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Teste 1: Busca simples por nome
    console.log('\n📋 Teste 1: Busca simples por nome de cliente');
    const searchUrl1 = `${BASE_URL}/contracts?search=João`;
    console.log('🌐 URL:', searchUrl1);
    
    try {
      const response1 = await axios.get(searchUrl1, { headers });
      console.log('✅ Resposta recebida:', response1.status);
      console.log('📊 Dados:', response1.data.data?.length || 0, 'contratos encontrados');
    } catch (error) {
      console.error('❌ Erro na busca simples:', error.response?.status, error.response?.data);
    }
    
    // Teste 2: Busca por nome + filtro de cliente
    console.log('\n📋 Teste 2: Busca por nome + client_id');
    const searchUrl2 = `${BASE_URL}/contracts?search=João&client_id=123`;
    console.log('🌐 URL:', searchUrl2);
    
    try {
      const response2 = await axios.get(searchUrl2, { headers });
      console.log('✅ Resposta recebida:', response2.status);
      console.log('📊 Dados:', response2.data.data?.length || 0, 'contratos encontrados');
    } catch (error) {
      console.error('❌ Erro na busca combinada:', error.response?.status, error.response?.data);
    }
    
    // Teste 3: Busca por nome + filtro avançado
    console.log('\n📋 Teste 3: Busca por nome + filtro avançado (medico)');
    const searchUrl3 = `${BASE_URL}/contracts?search=João&medico=Dr. Silva`;
    console.log('🌐 URL:', searchUrl3);
    
    try {
      const response3 = await axios.get(searchUrl3, { headers });
      console.log('✅ Resposta recebida:', response3.status);
      console.log('📊 Dados:', response3.data.data?.length || 0, 'contratos encontrados');
    } catch (error) {
      console.error('❌ Erro na busca com filtro avançado:', error.response?.status, error.response?.data);
    }
    
    // Teste 4: Filtro client_name específico
    console.log('\n📋 Teste 4: Filtro client_name específico');
    const searchUrl4 = `${BASE_URL}/contracts?client_name=João`;
    console.log('🌐 URL:', searchUrl4);
    
    try {
      const response4 = await axios.get(searchUrl4, { headers });
      console.log('✅ Resposta recebida:', response4.status);
      console.log('📊 Dados:', response4.data.data?.length || 0, 'contratos encontrados');
    } catch (error) {
      console.error('❌ Erro no filtro client_name:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

testClientNameSearch();