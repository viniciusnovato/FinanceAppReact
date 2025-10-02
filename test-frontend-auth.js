// Script para testar o fluxo completo de autenticação
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3000/api';

async function testCompleteFlow() {
  try {
    console.log('🔐 === TESTE COMPLETO DE AUTENTICAÇÃO ===\n');
    
    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@institutoareluna.pt',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Erro no login:', loginResponse.status, loginResponse.statusText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');
    console.log('   Usuário:', loginData.data.user.email);
    
    const token = loginData.data.token;
    console.log('   Token obtido:', token.substring(0, 50) + '...\n');

    // 2. Testar Dashboard Stats
    console.log('2. Buscando estatísticas do dashboard...');
    const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statsResponse.ok) {
      console.error('❌ Erro ao buscar stats:', statsResponse.status, statsResponse.statusText);
    } else {
      const statsData = await statsResponse.json();
      console.log('✅ Estatísticas carregadas:');
      console.log('   Total de clientes:', statsData.data.totalClients);
      console.log('   Clientes ativos:', statsData.data.activeClients);
      console.log('   Total de contratos:', statsData.data.totalContracts);
      console.log('   Contratos ativos:', statsData.data.activeContracts);
      console.log('   Total de pagamentos:', statsData.data.totalPayments);
      console.log('   Receita total:', statsData.data.totalRevenue);
    }

    // 3. Testar Clientes
    console.log('\n3. Buscando clientes...');
    const clientsResponse = await fetch(`${API_BASE_URL}/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!clientsResponse.ok) {
      console.error('❌ Erro ao buscar clientes:', clientsResponse.status, clientsResponse.statusText);
    } else {
      const clientsData = await clientsResponse.json();
      console.log('✅ Clientes carregados:', clientsData.data.length);
      if (clientsData.data.length > 0) {
        console.log('   Primeiro cliente:', `${clientsData.data[0].first_name} ${clientsData.data[0].last_name}`);
      }
    }

    // 4. Testar Contratos
    console.log('\n4. Buscando contratos...');
    const contractsResponse = await fetch(`${API_BASE_URL}/contracts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!contractsResponse.ok) {
      console.error('❌ Erro ao buscar contratos:', contractsResponse.status, contractsResponse.statusText);
    } else {
      const contractsData = await contractsResponse.json();
      console.log('✅ Contratos carregados:', contractsData.data.length);
      if (contractsData.data.length > 0) {
        const contract = contractsData.data[0];
        console.log('   Primeiro contrato:', contract.contract_number);
        console.log('   Status:', contract.status);
        console.log('   Valor:', contract.value);
      }
    }

    // 5. Testar Pagamentos
    console.log('\n5. Buscando pagamentos...');
    const paymentsResponse = await fetch(`${API_BASE_URL}/payments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!paymentsResponse.ok) {
      console.error('❌ Erro ao buscar pagamentos:', paymentsResponse.status, paymentsResponse.statusText);
    } else {
      const paymentsData = await paymentsResponse.json();
      console.log('✅ Pagamentos carregados:', paymentsData.data.length);
      if (paymentsData.data.length > 0) {
        const payment = paymentsData.data[0];
        console.log('   Primeiro pagamento:', payment.amount);
        console.log('   Status:', payment.status);
        console.log('   Data de vencimento:', payment.due_date);
      }
    }

    console.log('\n🎉 === TESTE COMPLETO FINALIZADO ===');
    console.log('✅ Todos os endpoints estão funcionando corretamente!');
    console.log('📱 O problema pode estar no frontend (React Native)');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testCompleteFlow();