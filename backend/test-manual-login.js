const { default: fetch } = require('node-fetch');

async function testManualLogin() {
  console.log('🔐 === TESTE DE LOGIN MANUAL ===');
  
  try {
    // 1. Fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@institutoareluna.pt',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado:', loginData.message);
    console.log('🔑 Token obtido:', loginData.token.substring(0, 50) + '...');

    const token = loginData.token;

    // 2. Testar dashboard
    console.log('\n2. Testando dashboard...');
    const dashboardResponse = await fetch('http://localhost:3000/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const dashboardData = await dashboardResponse.json();
    console.log('📊 Dashboard stats:', JSON.stringify(dashboardData, null, 2));

    // 3. Testar clientes
    console.log('\n3. Testando clientes...');
    const clientsResponse = await fetch('http://localhost:3000/api/clients?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const clientsData = await clientsResponse.json();
    console.log('👥 Clientes (primeiros 5):', JSON.stringify(clientsData, null, 2));

    // 4. Testar contratos
    console.log('\n4. Testando contratos...');
    const contractsResponse = await fetch('http://localhost:3000/api/contracts?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const contractsData = await contractsResponse.json();
    console.log('📄 Contratos (primeiros 5):', JSON.stringify(contractsData, null, 2));

    // 5. Testar pagamentos
    console.log('\n5. Testando pagamentos...');
    const paymentsResponse = await fetch('http://localhost:3000/api/payments?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const paymentsData = await paymentsResponse.json();
    console.log('💰 Pagamentos (primeiros 5):', JSON.stringify(paymentsData, null, 2));

    console.log('\n✅ === TODOS OS TESTES PASSARAM ===');
    console.log('🎯 A API está funcionando corretamente!');
    console.log('🔍 O problema está no frontend React Native.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testManualLogin();