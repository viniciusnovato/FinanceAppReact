const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkUserEmail() {
  try {
    console.log('🔍 Verificando emails disponíveis no sistema...\n');
    
    // Teste com admin@example.com
    console.log('1️⃣ Testando login com admin@example.com:');
    const response1 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    console.log(`   Status: ${response1.status}`);
    if (response1.status === 200) {
      const data1 = await response1.json();
      console.log(`   ✅ Sucesso! Usuário: ${data1.data.user.name} (${data1.data.user.email})`);
    } else {
      const error1 = await response1.json();
      console.log(`   ❌ Falha: ${error1.message || 'Erro desconhecido'}`);
    }
    
    console.log('\n2️⃣ Testando login com admin@institutoareluna.pt:');
    const response2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@institutoareluna.pt',
        password: 'admin123'
      })
    });

    console.log(`   Status: ${response2.status}`);
    if (response2.status === 200) {
      const data2 = await response2.json();
      console.log(`   ✅ Sucesso! Usuário: ${data2.data.user.name} (${data2.data.user.email})`);
    } else {
      const error2 = await response2.json();
      console.log(`   ❌ Falha: ${error2.message || 'Erro desconhecido'}`);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

checkUserEmail();
