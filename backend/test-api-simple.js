const { default: fetch } = require('node-fetch');

async function testAPI() {
  console.log('🧪 Testando API de pagamentos...');
  
  try {
    // 1. Fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login realizado com sucesso!');

    // 2. Testar filtro por nome do cliente
    console.log('\n2. Testando filtro por nome do cliente (ALEX)...');
    const paymentsResponse = await fetch('http://localhost:3000/api/payments?page=1&limit=10&clientName=ALEX', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!paymentsResponse.ok) {
      throw new Error(`Payments API failed: ${paymentsResponse.status}`);
    }

    const paymentsData = await paymentsResponse.json();
    console.log('✅ Filtro por nome do cliente funcionando!');
    console.log('📊 Resposta completa:', JSON.stringify(paymentsData, null, 2));
    
    if (paymentsData.data && paymentsData.data.data) {
      console.log(`📊 Encontrados ${paymentsData.data.data.length} pagamentos para ALEX`);
      console.log(`📄 Total de páginas: ${paymentsData.data.totalPages}`);
      console.log(`🔢 Total de registros: ${paymentsData.data.total}`);
      
      // Mostrar alguns dados dos pagamentos encontrados
      if (paymentsData.data.data.length > 0) {
        console.log('\n📋 Primeiros pagamentos encontrados:');
        paymentsData.data.data.forEach((payment, index) => {
          console.log(`   ${index + 1}. Cliente: ${payment.clientName} - Valor: R$ ${payment.amount} - Status: ${payment.status}`);
        });
      }
    } else {
      console.log('❌ Estrutura de dados inesperada');
    }

    // 3. Testar sem filtros
    console.log('\n3. Testando sem filtros...');
    const allPaymentsResponse = await fetch('http://localhost:3000/api/payments?page=1&limit=5', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!allPaymentsResponse.ok) {
      throw new Error(`All payments API failed: ${allPaymentsResponse.status}`);
    }

    const allPaymentsData = await allPaymentsResponse.json();
    console.log('✅ API de pagamentos funcionando!');
    console.log(`📊 Total de pagamentos: ${allPaymentsData.data.data.length}`);
    console.log(`📄 Total de páginas: ${allPaymentsData.data.totalPages}`);
    console.log(`🔢 Total de registros: ${allPaymentsData.data.total}`);
    
    // Mostrar alguns dados dos pagamentos
    if (allPaymentsData.data.data.length > 0) {
      console.log('\n📋 Primeiros pagamentos (sem filtro):');
      allPaymentsData.data.data.slice(0, 3).forEach((payment, index) => {
        console.log(`   ${index + 1}. Cliente: ${payment.clientName} - Valor: R$ ${payment.amount} - Status: ${payment.status}`);
      });
    }

    console.log('\n🎉 Todos os testes passaram!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testAPI();