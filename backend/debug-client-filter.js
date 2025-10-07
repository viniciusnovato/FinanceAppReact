const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testClientFilter() {
  console.log('🔍 Testando filtro de contratos por cliente...\n');

  try {
    // 1. Buscar alguns clientes para teste
    console.log('1. Buscando clientes disponíveis...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .limit(5);

    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError);
      return;
    }

    console.log(`Encontrados ${clients.length} clientes:`);
    clients.forEach(client => {
      console.log(`  - ${client.id}: ${client.first_name} ${client.last_name}`);
    });

    // 2. Para cada cliente, verificar quantos contratos ele tem
    for (const client of clients) {
      console.log(`\n2. Testando filtro para cliente: ${client.first_name} ${client.last_name} (ID: ${client.id})`);
      
      // Buscar contratos deste cliente
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          id,
          contract_number,
          client_id,
          clients!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq('client_id', client.id);

      if (contractsError) {
        console.error('Erro ao buscar contratos:', contractsError);
        continue;
      }

      console.log(`  Contratos encontrados: ${contracts.length}`);
      if (contracts.length > 0) {
        contracts.forEach(contract => {
          console.log(`    - Contrato ${contract.contract_number} (ID: ${contract.id})`);
          console.log(`      Cliente: ${contract.clients.first_name} ${contract.clients.last_name}`);
        });
        
        // Testar se o filtro por nome também funciona
        const clientName = `${client.first_name} ${client.last_name}`;
        console.log(`\n  3. Testando busca por nome: "${clientName}"`);
        
        const { data: contractsByName, error: nameError } = await supabase
          .from('contracts')
          .select(`
            id,
            contract_number,
            client_id,
            clients!inner(
              id,
              first_name,
              last_name
            )
          `)
          .ilike('clients.first_name', `%${client.first_name}%`);

        if (nameError) {
          console.error('Erro na busca por nome:', nameError);
        } else {
          console.log(`    Contratos encontrados por nome: ${contractsByName.length}`);
        }
        
        break; // Testar apenas o primeiro cliente que tem contratos
      }
    }

    // 3. Testar a query completa que a aplicação usa
    console.log('\n4. Testando query completa da aplicação...');
    const { data: allContracts, error: allError } = await supabase
      .from('contracts')
      .select(`
        *,
        clients!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          tax_id
        )
      `)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Erro na query completa:', allError);
    } else {
      console.log(`Total de contratos com dados de cliente: ${allContracts.length}`);
      
      // Verificar se todos os contratos têm dados de cliente
      const contractsWithoutClient = allContracts.filter(c => !c.clients);
      console.log(`Contratos sem dados de cliente: ${contractsWithoutClient.length}`);
      
      if (contractsWithoutClient.length > 0) {
        console.log('Contratos problemáticos:');
        contractsWithoutClient.forEach(c => {
          console.log(`  - Contrato ${c.contract_number} (ID: ${c.id}, client_id: ${c.client_id})`);
        });
      }
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testClientFilter();