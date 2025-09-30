// Script para testar os novos endpoints paginados
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3000/api';

async function testPaginatedEndpoints() {
  try {
    console.log('🔐 Fazendo login para obter token...');
    
    // 1. Login para obter token válido
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Token obtido com sucesso');

    // 2. Testar endpoint paginado de todos os pagamentos
    console.log('\n💰 Testando /api/payments/paginated...');
    const paginatedResponse = await fetch(`${API_BASE_URL}/payments/paginated?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (paginatedResponse.ok) {
      const paginatedData = await paginatedResponse.json();
      console.log('✅ Endpoint paginado funcionando!');
      console.log('📊 Dados:', {
        total: paginatedData.data.total,
        page: paginatedData.data.page,
        limit: paginatedData.data.limit,
        totalPages: paginatedData.data.totalPages,
        paymentsReturned: paginatedData.data.data.length
      });
    } else {
      const errorData = await paginatedResponse.json();
      console.log('❌ Erro no endpoint paginado:', errorData);
    }

    // 3. Testar endpoint paginado por contrato
    console.log('\n📄 Buscando um contrato para testar...');
    const contractsResponse = await fetch(`${API_BASE_URL}/contracts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const contractsData = await contractsResponse.json();
    if (contractsData.data && contractsData.data.length > 0) {
      const contractId = contractsData.data[0].id;
      console.log('📄 Testando pagamentos do contrato:', contractId);

      const contractPaginatedResponse = await fetch(`${API_BASE_URL}/payments/contract/${contractId}/paginated?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (contractPaginatedResponse.ok) {
        const contractPaginatedData = await contractPaginatedResponse.json();
        console.log('✅ Endpoint paginado por contrato funcionando!');
        console.log('📊 Dados:', {
          total: contractPaginatedData.data.total,
          page: contractPaginatedData.data.page,
          limit: contractPaginatedData.data.limit,
          totalPages: contractPaginatedData.data.totalPages,
          paymentsReturned: contractPaginatedData.data.data.length
        });
      } else {
        const errorData = await contractPaginatedResponse.json();
        console.log('❌ Erro no endpoint paginado por contrato:', errorData);
      }
    }

    // 4. Comparar com endpoint antigo
    console.log('\n🔄 Comparando com endpoint antigo...');
    const oldResponse = await fetch(`${API_BASE_URL}/payments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (oldResponse.ok) {
      const oldData = await oldResponse.json();
      console.log('📊 Endpoint antigo retorna:', oldData.data.length, 'pagamentos');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testPaginatedEndpoints();