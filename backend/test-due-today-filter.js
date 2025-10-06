const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjE2MDAsImV4cCI6MjA1MTQ5NzYwMH0.test';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDueTodayFilter() {
  try {
    console.log('Testando filtro hasDueTodayPayments via API backend...');
    
    // Fazer requisição para o backend com o filtro
    const response = await fetch('http://localhost:3000/api/clients?hasDueTodayPayments=true', {
      headers: {
        'Authorization': 'Bearer valid-token-here',
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Status da resposta:', response.status);
    console.log('Resultado da API:', result);
    
    if (response.ok && result.success) {
      console.log(`\nEncontrados ${result.data.length} clientes com pagamentos vencendo hoje:`);
      result.data.forEach(client => {
        console.log(`- ${client.first_name} ${client.last_name} (ID: ${client.id})`);
      });
    } else {
      console.log('Erro na API:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('Erro ao testar filtro:', error.message);
  }
}

testDueTodayFilter();
