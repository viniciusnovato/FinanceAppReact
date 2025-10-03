const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqjqfvqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxZnZxanFqcWpxanFqcWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzU5MzcsImV4cCI6MjA1MTA1MTkzN30.Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5Zt5';

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function testClientEmailFilter() {
  console.log('\n=== Teste 3: Filtro por email do cliente ===');
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
      .ilike('contracts.clients.email', '%@gmail.com%')
      .limit(5);

    if (error) {
      console.error('Erro:', error);
    } else {
      console.log(`Encontrados ${data.length} pagamentos para clientes com email contendo "@gmail.com"`);
      data.forEach(payment => {
        console.log(`- ID: ${payment.id}, Cliente: ${payment.contract.client.first_name} ${payment.contract.client.last_name}, Email: ${payment.contract.client.email}`);
      });
    }
  } catch (err) {
    console.error('Erro na requisição:', err.message);
  }
}

async function testClientPhoneFilter() {
  console.log('\n=== Teste 4: Filtro por telefone do cliente ===');
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
      .ilike('contracts.clients.phone', '%123%')
      .limit(5);

    if (error) {
      console.error('Erro:', error);
    } else {
      console.log(`Encontrados ${data.length} pagamentos para clientes com telefone contendo "123"`);
      data.forEach(payment => {
        console.log(`- ID: ${payment.id}, Cliente: ${payment.contract.client.first_name} ${payment.contract.client.last_name}, Telefone: ${payment.contract.client.phone}`);
      });
    }
  } catch (err) {
    console.error('Erro na requisição:', err.message);
  }
}

async function testBackendAPI() {
  console.log('\n=== Teste 5: API do Backend - Filtro por nome do cliente ===');
  try {
    const response = await fetch('http://localhost:3000/api/payments?client_name=ALEX&page=1&limit=5');
    
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

async function testBackendAPILastName() {
  console.log('\n=== Teste 6: API do Backend - Filtro por sobrenome do cliente ===');
  try {
    const response = await fetch('http://localhost:3000/api/payments?client_name=SILVA&page=1&limit=5');
    
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

async function runAllTests() {
  console.log('🧪 Iniciando testes de filtros...\n');
  
  await testClientNameFilter();
  await testClientLastNameFilter();
  await testClientEmailFilter();
  await testClientPhoneFilter();
  await testBackendAPI();
  await testBackendAPILastName();
  
  console.log('\n✅ Todos os testes concluídos!');
}

runAllTests();