const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqjqhqjqhqjqhqjqhqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxaHFqcWhxanFocWpxaHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzcsImV4cCI6MjA1MDU0ODk3N30.Ey7Ey7Ey7Ey7Ey7Ey7Ey7Ey7Ey7Ey7Ey7Ey7Ey7E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContractStatus() {
  try {
    console.log('🔍 Testando os novos status de contratos...\n');

    // Buscar um cliente existente para usar nos testes
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (clientError || !clients || clients.length === 0) {
      console.error('❌ Erro ao buscar cliente:', clientError);
      return;
    }

    const clientId = clients[0].id;
    console.log(`✅ Cliente encontrado: ${clientId}\n`);

    // Status para testar
    const statusToTest = ['ativo', 'liquidado', 'renegociado', 'cancelado', 'jurídico'];

    for (const status of statusToTest) {
      console.log(`📝 Testando status: ${status}`);
      
      const contractData = {
        contract_number: `TEST-${status.toUpperCase()}-${Date.now()}`,
        description: `Contrato de teste para status ${status}`,
        value: '10000.00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payment_frequency: 'monthly',
        down_payment: '2000.00',
        number_of_payments: 12,
        status: status,
        client_id: clientId
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select();

      if (error) {
        console.error(`❌ Erro ao criar contrato com status ${status}:`, error);
      } else {
        console.log(`✅ Contrato criado com sucesso - ID: ${data[0].id}, Status: ${data[0].status}`);
      }
    }

    console.log('\n🔍 Verificando contratos criados...');
    
    // Buscar contratos com os novos status
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, contract_number, status')
      .in('status', statusToTest)
      .order('created_at', { ascending: false })
      .limit(10);

    if (contractsError) {
      console.error('❌ Erro ao buscar contratos:', contractsError);
    } else {
      console.log(`\n📊 Contratos encontrados com os novos status: ${contracts.length}`);
      contracts.forEach((contract, index) => {
        console.log(`  ${index + 1}. ${contract.contract_number} - Status: ${contract.status}`);
      });
    }

    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testContractStatus();