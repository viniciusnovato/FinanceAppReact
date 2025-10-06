const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOverdueClientsFilter() {
  try {
    console.log('🧪 Testando filtro de clientes com pagamentos atrasados...\n');
    
    // Teste 1: Login para obter token
    console.log('1️⃣ Fazendo login para obter token:');
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

    const loginData = await loginResponse.json();
    
    if (!loginData.data || !loginData.data.token) {
      console.error('❌ Falha no login - token não encontrado');
      return;
    }
    
    const token = loginData.data.token;
    console.log(`   ✅ Login bem-sucedido`);
    console.log(`   🔑 Token obtido: ${token.substring(0, 50)}...\n`);
    
    // Teste 2: Usar token para acessar clientes com filtro de atrasados
    console.log('2️⃣ Testando filtro de clientes com pagamentos atrasados:');
    const overdueClientsResponse = await fetch('http://localhost:3000/api/clients?hasOverduePayments=true', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${overdueClientsResponse.status}`);
    
    if (overdueClientsResponse.status === 200) {
      const overdueClientsData = await overdueClientsResponse.json();
      console.log(`   ✅ Sucesso! Clientes com pagamentos atrasados: ${overdueClientsData.data.length}`);
      
      if (overdueClientsData.data.length > 0) {
        console.log('\n   📋 Lista de clientes com pagamentos atrasados:');
        overdueClientsData.data.forEach((client, index) => {
          console.log(`   ${index + 1}. ${client.first_name} ${client.last_name} (${client.email})`);
        });
      } else {
        console.log('   ℹ️  Nenhum cliente com pagamentos atrasados encontrado');
      }
    } else {
      const errorData = await overdueClientsResponse.json();
      console.log(`   ❌ Erro: ${JSON.stringify(errorData)}`);
    }
    
    // Teste 3: Comparar com todos os clientes
    console.log('\n3️⃣ Comparando com total de clientes:');
    const allClientsResponse = await fetch('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (allClientsResponse.status === 200) {
      const allClientsData = await allClientsResponse.json();
      console.log(`   Total de clientes: ${allClientsData.data.length}`);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

testOverdueClientsFilter();