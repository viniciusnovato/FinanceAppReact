const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxbslulfitfsijqrzljd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4YnNsdWxmaXRmc2lqcXJ6bGpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk0ODg0OSwiZXhwIjoyMDczNTI0ODQ5fQ.h_7fe7U2QLrk57pp8VArZ5qlPQEbniUHkjSV5qsygGk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para fazer login e obter token
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

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    console.error('Erro no login:', error.message);
    return null;
  }
}

async function testClientNameFilter() {
  console.log('\n=== Teste 1: Filtro por nome do cliente (first_name) ===');
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts!inner(
          *,
          client:clients!inner(*)
        )
      `)
      .ilike('contracts.clients.first_name', '%ALEX%')
      .limit(5);

    if (error) {
      console.error('Erro:', error);
    } else {
      console.log(`Encontrados ${data.length} pagamentos para clientes com first_name contendo "ALEX"`);
      data.forEach(payment => {
        console.log(`- ID: ${payment.id}, Cliente: ${payment.contract.client.first_name} ${payment.contract.client.last_name}, Valor: ${payment.amount}`);
      });
    }
  } catch (err) {
    console.error('Erro na requisição:', err.message);
  }
}

async function testClientLastNameFilter() {
  console.log('\n=== Teste 2: Filtro por nome do cliente (last_name) ===');
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts!inner(
          *,
          client:clients!inner(*)
        )
      `)
      .ilike('contracts.clients.last_name', '%SILVA%')
      .limit(5);

    if (error) {
      console.error('Erro:', error);
    } else {
      console.log(`Encontrados ${data.length} pagamentos para clientes com last_name contendo "SILVA"`);
      data.forEach(payment => {
        console.log(`- ID: ${payment.id}, Cliente: ${payment.contract.client.first_name} ${payment.contract.client.last_name}, Valor: ${payment.amount}`);
      });
    }
  } catch (err) {
    console.error('Erro na requisição:', err.message);
  }
}

async function testBackendAPIWithAuth(token) {
  console.log('\n=== Teste 3: API do Backend - Filtro por nome do cliente (com autenticação) ===');
  try {
    const response = await fetch('http://localhost:3000/api/payments?client_name=ALEX&page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`API retornou ${result.data.length} pagamentos para cliente "ALEX"`);
    console.log(`Total: ${result.total}, Página: ${result.page}/${result.totalPages}`);
    
    result.data.forEach(payment => {
      console.log(`- ID: ${payment.id}, Cliente: ${payment.contract.client.first_name} ${payment.contract.client.last_name}, Valor: ${payment.amount}`);
    });
  } catch (err) {
    console.error('Erro na requisição da API:', err.message);
  }
}

async function testBackendAPILastNameWithAuth(token) {
  console.log('\n=== Teste 4: API do Backend - Filtro por sobrenome do cliente (com autenticação) ===');
  try {
    const response = await fetch('http://localhost:3000/api/payments?client_name=SILVA&page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`API retornou ${result.data.length} pagamentos para cliente "SILVA"`);
    console.log(`Total: ${result.total}, Página: ${result.page}/${result.totalPages}`);
    
    result.data.forEach(payment => {
      console.log(`- ID: ${payment.id}, Cliente: ${payment.contract.client.first_name} ${payment.contract.client.last_name}, Valor: ${payment.amount}`);
    });
  } catch (err) {
    console.error('Erro na requisição da API:', err.message);
  }
}

async function testBackendAPIBothNames(token) {
  console.log('\n=== Teste 5: API do Backend - Filtro que deve encontrar tanto first_name quanto last_name ===');
  
  // Teste com um nome que pode estar tanto no first_name quanto no last_name
  const testNames = ['ALEX', 'SILVA', 'SANTOS'];
  
  for (const name of testNames) {
    console.log(`\n--- Testando "${name}" ---`);
    try {
      const response = await fetch(`http://localhost:3000/api/payments?client_name=${name}&page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`API retornou ${result.data.length} pagamentos para "${name}"`);
      
      if (result.data.length > 0) {
        console.log('Clientes encontrados:');
        const uniqueClients = new Set();
        result.data.forEach(payment => {
          const clientName = `${payment.contract.client.first_name} ${payment.contract.client.last_name}`;
          uniqueClients.add(clientName);
        });
        
        uniqueClients.forEach(clientName => {
          console.log(`  - ${clientName}`);
        });
      }
    } catch (err) {
      console.error(`Erro na requisição da API para "${name}":`, err.message);
    }
  }
}

async function runAllTests() {
  console.log('🧪 Iniciando testes de filtros com autenticação...\n');
  
  // Primeiro, obter token de autenticação
  console.log('🔐 Fazendo login para obter token...');
  const token = await login();
  
  if (!token) {
    console.error('❌ Não foi possível obter token de autenticação. Parando testes da API.');
    console.log('\n📋 Executando apenas testes diretos do Supabase...');
    await testClientNameFilter();
    await testClientLastNameFilter();
    return;
  }
  
  console.log('✅ Token obtido com sucesso!');
  
  // Executar testes diretos do Supabase
  await testClientNameFilter();
  await testClientLastNameFilter();
  
  // Executar testes da API com autenticação
  await testBackendAPIWithAuth(token);
  await testBackendAPILastNameWithAuth(token);
  await testBackendAPIBothNames(token);
  
  console.log('\n✅ Todos os testes concluídos!');
}

runAllTests();