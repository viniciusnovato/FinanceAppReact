const { default: fetch } = require('node-fetch');

async function testApiStructure() {
  try {
    // 1. Login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login realizado');

    // 2. Testar API
    const response = await fetch('http://localhost:3000/api/payments?client_name=ALEX', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    console.log('\n📊 Estrutura da resposta:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testApiStructure();