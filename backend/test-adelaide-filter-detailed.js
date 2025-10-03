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

async function testAdelaideFilter() {
  console.log('=== TESTE DETALHADO DO FILTRO ADELAIDE ===\n');

  try {
    // 1. Buscar todos os clientes com "ADELAIDE" no nome
    console.log('1. Clientes com "ADELAIDE" no nome:');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .or('first_name.ilike.%ADELAIDE%,last_name.ilike.%ADELAIDE%');
    
    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError);
      return;
    }
    
    console.log(`Encontrados ${clients.length} clientes:`);
    clients.forEach(client => {
      console.log(`- ID: ${client.id}, Nome: ${client.first_name} ${client.last_name}`);
    });
    console.log('');

    // 2. Buscar contratos desses clientes
    const clientIds = clients.map(c => c.id);
    console.log('2. Contratos dos clientes ADELAIDE:');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .in('client_id', clientIds);
    
    if (contractsError) {
      console.error('Erro ao buscar contratos:', contractsError);
      return;
    }
    
    console.log(`Encontrados ${contracts.length} contratos:`);
    contracts.forEach(contract => {
      console.log(`- ID: ${contract.id}, Número: ${contract.contract_number}, Cliente ID: ${contract.client_id}`);
    });
    console.log('');

    // 3. Buscar pagamentos desses contratos
    const contractIds = contracts.map(c => c.id);
    console.log('3. Pagamentos dos contratos ADELAIDE:');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .in('contract_id', contractIds);
    
    if (paymentsError) {
      console.error('Erro ao buscar pagamentos:', paymentsError);
      return;
    }
    
    console.log(`Encontrados ${payments.length} pagamentos legítimos:`);
    payments.forEach(payment => {
      const clientName = `${payment.contract.client.first_name} ${payment.contract.client.last_name}`;
      console.log(`- ID: ${payment.id}, Valor: ${payment.amount}, Cliente: ${clientName}, Contrato: ${payment.contract.contract_number}`);
    });
    console.log('');

    // 4. Testar o filtro atual do repositório (simulando a busca geral)
    console.log('4. Teste do filtro atual (busca geral por "ADELAIDE"):');
    const searchTerm = 'ADELAIDE';
    const searchFilters = [
      `notes.ilike.%${searchTerm}%`,
      `contracts.contract_number.ilike.%${searchTerm}%`,
      `contracts.clients.first_name.ilike.%${searchTerm}%`,
      `contracts.clients.last_name.ilike.%${searchTerm}%`
    ];
    
    const searchFilter = searchFilters.join(',');
    console.log('Filtro aplicado:', searchFilter);
    
    const { data: searchResults, error: searchError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .or(searchFilter);
    
    if (searchError) {
      console.error('Erro na busca geral:', searchError);
      return;
    }
    
    console.log(`Resultados da busca geral: ${searchResults.length} pagamentos`);
    searchResults.forEach(payment => {
      const clientName = `${payment.contract.client.first_name} ${payment.contract.client.last_name}`;
      console.log(`- ID: ${payment.id}, Valor: ${payment.amount}, Cliente: ${clientName}, Contrato: ${payment.contract.contract_number}, Notes: ${payment.notes || 'N/A'}`);
    });
    console.log('');

    // 5. Verificar se há pagamentos com "ADELAIDE" nas notas
    console.log('5. Pagamentos com "ADELAIDE" nas notas:');
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
      console.error('Erro ao buscar por notas:', notesError);
    } else {
      console.log(`Encontrados ${notesResults.length} pagamentos com ADELAIDE nas notas:`);
      notesResults.forEach(payment => {
        const clientName = `${payment.contract.client.first_name} ${payment.contract.client.last_name}`;
        console.log(`- ID: ${payment.id}, Cliente: ${clientName}, Notes: ${payment.notes}`);
      });
    }
    console.log('');

    // 6. Verificar se há contratos com "ADELAIDE" no número
    console.log('6. Contratos com "ADELAIDE" no número:');
    const { data: contractNumberResults, error: contractNumberError } = await supabase
      .from('contracts')
      .select(`
        *,
        client:clients(*)
      `)
      .ilike('contract_number', '%ADELAIDE%');
    
    if (contractNumberError) {
      console.error('Erro ao buscar contratos por número:', contractNumberError);
    } else {
      console.log(`Encontrados ${contractNumberResults.length} contratos com ADELAIDE no número:`);
      contractNumberResults.forEach(contract => {
        const clientName = `${contract.client.first_name} ${contract.client.last_name}`;
        console.log(`- Número: ${contract.contract_number}, Cliente: ${clientName}`);
      });
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testAdelaideFilter();