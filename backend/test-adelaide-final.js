require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usando SERVICE_ROLE_KEY em vez de ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas');
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testAdelaideFilter() {
  console.log('🔍 Testando filtro para "ADELAIDE"...\n');
  
  try {
    // Simular a nova lógica do repositório
    const searchTerm = 'ADELAIDE';
    const searchPromises = [];
    
    // Busca em notas
    console.log('📝 Buscando em notas...');
    searchPromises.push(
      supabase
        .from('payments')
        .select(`
          *,
          contract:contracts!inner(
            *,
            client:clients!inner(*)
          )
        `)
        .ilike('notes', `%${searchTerm}%`)
    );
    
    // Busca em número do contrato
    console.log('📋 Buscando em número do contrato...');
    searchPromises.push(
      supabase
        .from('payments')
        .select(`
          *,
          contract:contracts!inner(
            *,
            client:clients!inner(*)
          )
        `)
        .ilike('contracts.contract_number', `%${searchTerm}%`)
    );
    
    // Busca em primeiro nome do cliente
    console.log('👤 Buscando em primeiro nome...');
    searchPromises.push(
      supabase
        .from('payments')
        .select(`
          *,
          contract:contracts!inner(
            *,
            client:clients!inner(*)
          )
        `)
        .ilike('contracts.clients.first_name', `%${searchTerm}%`)
    );
    
    // Busca em último nome do cliente
    console.log('👥 Buscando em último nome...');
    searchPromises.push(
      supabase
        .from('payments')
        .select(`
          *,
          contract:contracts!inner(
            *,
            client:clients!inner(*)
          )
        `)
        .ilike('contracts.clients.last_name', `%${searchTerm}%`)
    );
    
    // Executar todas as buscas
    console.log('\n⏳ Executando todas as buscas...');
    const searchResults = await Promise.all(searchPromises);
    
    // Combinar resultados únicos
    const allResults = [];
    const seenIds = new Set();
    
    searchResults.forEach(({ data, error }, index) => {
      const searchTypes = ['notas', 'número do contrato', 'primeiro nome', 'último nome'];
      console.log(`\n📊 Resultados da busca em ${searchTypes[index]}:`);
      
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Encontrados ${data.length} pagamentos`);
        data.forEach((payment, idx) => {
          if (!seenIds.has(payment.id)) {
            seenIds.add(payment.id);
            allResults.push(payment);
            
            // Debug: verificar estrutura dos dados
            if (idx < 3) { // Mostrar apenas os primeiros 3 para debug
              console.log(`   - Debug payment ${idx + 1}:`, {
                id: payment.id,
                contract: payment.contract ? {
                  contract_number: payment.contract.contract_number,
                  client: payment.contract.client ? {
                    first_name: payment.contract.client.first_name,
                    last_name: payment.contract.client.last_name
                  } : 'client is null'
                } : 'contract is null'
              });
            }
            
            const firstName = payment.contract?.client?.first_name || 'N/A';
            const lastName = payment.contract?.client?.last_name || 'N/A';
            const contractNumber = payment.contract?.contract_number || 'N/A';
            console.log(`   - ID: ${payment.id}, Cliente: ${firstName} ${lastName}, Contrato: ${contractNumber}`);
          }
        });
      } else {
        console.log('❌ Nenhum resultado encontrado');
      }
    });
    
    console.log(`\n🎯 RESULTADO FINAL:`);
    console.log(`📈 Total de pagamentos únicos encontrados: ${allResults.length}`);
    
    if (allResults.length > 0) {
      console.log('\n📋 Lista de clientes encontrados:');
      const uniqueClients = new Set();
      allResults.forEach(payment => {
        const clientName = `${payment.contract?.client?.first_name} ${payment.contract?.client?.last_name}`;
        uniqueClients.add(clientName);
      });
      
      uniqueClients.forEach(clientName => {
        console.log(`   - ${clientName}`);
      });
      
      // Verificar se há clientes que não são Adelaide
      const nonAdelaideClients = Array.from(uniqueClients).filter(name => 
        !name.toLowerCase().includes('adelaide')
      );
      
      if (nonAdelaideClients.length > 0) {
        console.log('\n⚠️  PROBLEMA DETECTADO: Clientes que não são Adelaide:');
        nonAdelaideClients.forEach(clientName => {
          console.log(`   - ${clientName}`);
        });
      } else {
        console.log('\n✅ SUCESSO: Todos os resultados são relacionados à Adelaide!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAdelaideFilter();