const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTokenValidation() {
  try {
    console.log('🧪 Testando validação de token...\n');
    
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
    console.log('   Resposta do login:', JSON.stringify(loginData, null, 2));
    
    // Verificar se o login foi bem-sucedido (pode não ter propriedade success)
    if (!loginData.data || !loginData.data.token) {
      console.error('❌ Falha no login - token não encontrado');
      return;
    }
    
    const token = loginData.data.token;
    console.log(`   ✅ Login bem-sucedido`);
    console.log(`   🔑 Token obtido: ${token.substring(0, 50)}...`);
    console.log(`   📏 Tamanho do token: ${token.length}\n`);
    
    // Teste 2: Usar token para acessar clientes
    console.log('2️⃣ Testando acesso aos clientes com token:');
    const clientsResponse = await fetch('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${clientsResponse.status}`);
    
    if (clientsResponse.status === 200) {
      const clientsData = await clientsResponse.json();
      console.log(`   ✅ Sucesso! Total de clientes: ${clientsData.data ? clientsData.data.length : 'N/A'}`);
    } else {
      const errorData = await clientsResponse.json();
      console.log(`   ❌ Erro: ${JSON.stringify(errorData)}`);
    }
    
    console.log('\n3️⃣ Testando com token inválido:');
    const invalidResponse = await fetch('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer invalid_token_123`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${invalidResponse.status}`);
    const invalidData = await invalidResponse.json();
    console.log(`   Resposta: ${JSON.stringify(invalidData)}`);
    
    console.log('\n4️⃣ Testando sem token:');
    const noTokenResponse = await fetch('http://localhost:3000/api/clients', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${noTokenResponse.status}`);
    const noTokenData = await noTokenResponse.json();
    console.log(`   Resposta: ${JSON.stringify(noTokenData)}`);
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

testTokenValidation();
