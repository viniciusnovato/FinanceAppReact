require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSimpleAdelaideFilter() {
  console.log('=== TESTE SIMPLES DO FILTRO ADELAIDE ===\n');

  try {
    // Testar diferentes abordagens de filtro
    console.log('1. Testando busca por nome do cliente (first_name):');
    
    const { data: firstNameResults, error: firstNameError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .ilike('contracts.clients.first_name', '%ADELAIDE%');

    if (firstNameError) {
      console.error('Erro na busca por first_name:', firstNameError);
    } else {
      console.log(`Encontrados ${firstNameResults.length} pagamentos por first_name`);
    }

    console.log('\n2. Testando busca por nome do cliente (last_name):');
    
    const { data: lastNameResults, error: lastNameError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .ilike('contracts.clients.last_name', '%ADELAIDE%');

    if (lastNameError) {
      console.error('Erro na busca por last_name:', lastNameError);
    } else {
      console.log(`Encontrados ${lastNameResults.length} pagamentos por last_name`);
    }

    console.log('\n3. Testando busca por notas:');
    
    const { data: notesResults, error: notesError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .ilike('notes', '%ADELAIDE%');

    if (notesError) {
      console.error('Erro na busca por notes:', notesError);
    } else {
      console.log(`Encontrados ${notesResults.length} pagamentos por notes`);
    }

    // Combinar resultados manualmente
    const allResults = [];
    const seenIds = new Set();

    // Adicionar resultados únicos
    [firstNameResults, lastNameResults, notesResults].forEach(results => {
      if (results) {
        results.forEach(payment => {
          if (!seenIds.has(payment.id)) {
            seenIds.add(payment.id);
            allResults.push(payment);
          }
        });
      }
    });

    console.log(`\n4. Total de pagamentos únicos encontrados: ${allResults.length}`);
    
    allResults.slice(0, 5).forEach((payment, index) => {
      const clientName = `${payment.contract.client.first_name} ${payment.contract.client.last_name}`;
      console.log(`${index + 1}. Cliente: ${clientName}, Contrato: ${payment.contract.contract_number}, Valor: ${payment.amount}`);
    });

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testSimpleAdelaideFilter();