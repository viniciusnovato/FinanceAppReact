const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function login() {
  try {
    console.log('🔐 Fazendo login para obter token...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      console.log('Tentando com credenciais alternativas...');
      const response2 = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123456'
        })
      });
      
      if (!response2.ok) {
        throw new Error(`Login failed: ${response2.status}`);
      }
      
      const data = await response2.json();
      return data.data.token;
    }

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    console.error('Erro no login:', error.message);
    return null;
  }
}

async function testDueTodayFilter() {
  try {
    // Obter token de autenticação
    const token = await login();
    
    if (!token) {
      console.error('❌ Não foi possível obter token de autenticação');
      return;
    }
    
    console.log('✅ Token obtido com sucesso!');
    console.log('\n📅 Testando filtro hasDueTodayPayments via API backend...');
    
    // Fazer requisição para o backend com o filtro
    const response = await fetch('http://localhost:3000/api/clients?hasDueTodayPayments=true', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Status da resposta:', response.status);
    console.log('Resultado da API:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log(`\n✅ Encontrados ${result.data.length} clientes com pagamentos vencendo hoje:`);
      result.data.forEach(client => {
        console.log(`- ${client.first_name} ${client.last_name} (ID: ${client.id})`);
      });
    } else {
      console.log('❌ Erro na API:', result.error || result.message);
    }
    
    // Testar também sem filtro para comparar
    console.log('\n📋 Testando sem filtro para comparar...');
    const responseAll = await fetch('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const resultAll = await responseAll.json();
    if (responseAll.ok && resultAll.success) {
      console.log(`Total de clientes sem filtro: ${resultAll.data.length}`);
    }
    
  } catch (error) {
    console.error('Erro ao testar filtro:', error.message);
  }
}

testDueTodayFilter();
