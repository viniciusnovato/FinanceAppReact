const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function login() {
  try {
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

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    console.error('Erro no login:', error.message);
    return null;
  }
}

async function testEmptyFilters() {
  try {
    const token = await login();
    
    if (!token) {
      console.error('❌ Não foi possível obter token');
      return;
    }
    
    console.log('🧪 Testando diferentes cenários de filtros...\n');
    
    // Teste 1: Sem filtros
    console.log('1️⃣ Teste sem filtros:');
    const response1 = await fetch('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Total clientes: ${result1.success ? result1.data.length : 'Erro'}\n`);
    
    // Teste 2: Com filtros vazios (objeto vazio)
    console.log('2️⃣ Teste com filtros vazios (objeto vazio):');
    const response2 = await fetch('http://localhost:3000/api/clients?', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Total clientes: ${result2.success ? result2.data.length : 'Erro'}\n`);
    
    // Teste 3: Com parâmetros vazios
    console.log('3️⃣ Teste com parâmetros vazios:');
    const response3 = await fetch('http://localhost:3000/api/clients?search=&hasOverduePayments=&hasDueTodayPayments=', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Total clientes: ${result3.success ? result3.data.length : 'Erro'}\n`);
    
    // Teste 4: Com search vazio
    console.log('4️⃣ Teste com search vazio:');
    const response4 = await fetch('http://localhost:3000/api/clients?search=', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result4 = await response4.json();
    console.log(`   Status: ${response4.status}`);
    console.log(`   Total clientes: ${result4.success ? result4.data.length : 'Erro'}\n`);
    
  } catch (error) {
    console.error('Erro ao testar filtros:', error.message);
  }
}

testEmptyFilters();
