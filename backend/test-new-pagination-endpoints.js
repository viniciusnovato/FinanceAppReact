const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3000/api';

async function testPaginationEndpoints() {
  try {
    console.log('=== TESTANDO NOVOS ENDPOINTS DE PAGINAÇÃO ===\n');

    // 1. Testar endpoint de paginação geral
    console.log('🔍 Testando GET /api/payments/paginated...');
    
    try {
      const response1 = await axios.get(`${API_BASE_URL}/payments/paginated?page=1&limit=100`);
      console.log(`   ✅ Status: ${response1.status}`);
      console.log(`   📊 Total de pagamentos: ${response1.data.data.total}`);
      console.log(`   📄 Página atual: ${response1.data.data.page}`);
      console.log(`   📋 Pagamentos nesta página: ${response1.data.data.data.length}`);
      console.log(`   📈 Total de páginas: ${response1.data.data.totalPages}`);
      console.log(`   ➡️ Tem próxima página: ${response1.data.data.hasNextPage}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.response?.status} - ${error.response?.statusText}`);
      console.log(`   📝 Detalhes: ${error.response?.data?.message || error.message}`);
    }

    // 2. Testar endpoint de paginação por contrato
    console.log('\n🔍 Testando GET /api/payments/contract/:contractId/paginated...');
    
    const contractId = '741b2215-a657-43e1-bbe9-b4ccf1307efb'; // Contrato conhecido
    
    try {
      const response2 = await axios.get(`${API_BASE_URL}/payments/contract/${contractId}/paginated?page=1&limit=50`);
      console.log(`   ✅ Status: ${response2.status}`);
      console.log(`   📊 Total de pagamentos do contrato: ${response2.data.data.total}`);
      console.log(`   📄 Página atual: ${response2.data.data.page}`);
      console.log(`   📋 Pagamentos nesta página: ${response2.data.data.data.length}`);
      console.log(`   📈 Total de páginas: ${response2.data.data.totalPages}`);
      console.log(`   ➡️ Tem próxima página: ${response2.data.data.hasNextPage}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.response?.status} - ${error.response?.statusText}`);
      console.log(`   📝 Detalhes: ${error.response?.data?.message || error.message}`);
    }

    // 3. Comparar com endpoints antigos
    console.log('\n🔍 Comparando com endpoints antigos...');
    
    try {
      const oldResponse = await axios.get(`${API_BASE_URL}/payments`);
      console.log(`   📊 Endpoint antigo (/payments): ${oldResponse.data.data.length} pagamentos`);
      
      const newResponse = await axios.get(`${API_BASE_URL}/payments/paginated?page=1&limit=1000`);
      console.log(`   📊 Endpoint novo (/payments/paginated): ${newResponse.data.data.total} total, ${newResponse.data.data.data.length} nesta página`);
      
      if (oldResponse.data.data.length < newResponse.data.data.total) {
        console.log(`   ✅ SUCESSO: Endpoint de paginação retorna mais dados!`);
        console.log(`   📈 Diferença: ${newResponse.data.data.total - oldResponse.data.data.length} pagamentos a mais`);
      } else {
        console.log(`   ⚠️ ATENÇÃO: Não há diferença significativa entre os endpoints`);
      }
    } catch (error) {
      console.log(`   ❌ Erro na comparação: ${error.message}`);
    }

  } catch (error) {
    console.error('Erro geral no teste:', error.message);
  }
}

testPaginationEndpoints();