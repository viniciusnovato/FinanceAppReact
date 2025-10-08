const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNewFields() {
  console.log('🧪 Testando os novos campos Local, Área, Gestora e Médico...\n');

  try {
    // 1. Verificar estrutura da tabela
    console.log('1. Verificando estrutura da tabela contracts...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('contracts')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }

    if (tableInfo && tableInfo.length > 0) {
      const fields = Object.keys(tableInfo[0]);
      const newFields = ['local', 'area', 'gestora', 'medico'];
      const hasAllFields = newFields.every(field => fields.includes(field));
      
      console.log('✅ Campos disponíveis:', fields.join(', '));
      console.log(`${hasAllFields ? '✅' : '❌'} Novos campos presentes:`, newFields.join(', '));
    }

    // 2. Buscar contratos existentes
    console.log('\n2. Buscando contratos existentes...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, contract_number, local, area, gestora, medico')
      .limit(5);

    if (contractsError) {
      console.error('❌ Erro ao buscar contratos:', contractsError);
      return;
    }

    console.log(`✅ Encontrados ${contracts.length} contratos:`);
    contracts.forEach(contract => {
      console.log(`  - ${contract.contract_number}: Local=${contract.local || 'N/A'}, Área=${contract.area || 'N/A'}, Gestora=${contract.gestora || 'N/A'}, Médico=${contract.medico || 'N/A'}`);
    });

    // 3. Testar criação de contrato com novos campos (se houver clientes)
    console.log('\n3. Verificando se podemos criar um contrato de teste...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .limit(1);

    if (clientsError || !clients || clients.length === 0) {
      console.log('⚠️  Nenhum cliente encontrado para teste de criação');
      return;
    }

    const testContract = {
      client_id: clients[0].id,
      contract_number: `TEST-${Date.now()}`,
      local: 'Local de Teste',
      area: 'Área de Teste',
      gestora: 'Gestora de Teste',
      medico: 'Dr. Teste',
      description: 'Contrato de teste para novos campos',
      value: 1000.00,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ativo',
      payment_frequency: 'mensal',
      down_payment: 100.00,
      number_of_payments: 10
    };

    console.log('4. Criando contrato de teste...');
    const { data: newContract, error: createError } = await supabase
      .from('contracts')
      .insert([testContract])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar contrato:', createError);
      return;
    }

    console.log('✅ Contrato criado com sucesso!');
    console.log(`  - ID: ${newContract.id}`);
    console.log(`  - Número: ${newContract.contract_number}`);
    console.log(`  - Local: ${newContract.local}`);
    console.log(`  - Área: ${newContract.area}`);
    console.log(`  - Gestora: ${newContract.gestora}`);
    console.log(`  - Médico: ${newContract.medico}`);

    // 5. Testar atualização
    console.log('\n5. Testando atualização dos novos campos...');
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        local: 'Local Atualizado',
        area: 'Área Atualizada',
        gestora: 'Gestora Atualizada',
        medico: 'Dr. Atualizado'
      })
      .eq('id', newContract.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar contrato:', updateError);
      return;
    }

    console.log('✅ Contrato atualizado com sucesso!');
    console.log(`  - Local: ${updatedContract.local}`);
    console.log(`  - Área: ${updatedContract.area}`);
    console.log(`  - Gestora: ${updatedContract.gestora}`);
    console.log(`  - Médico: ${updatedContract.medico}`);

    // 6. Limpar dados de teste
    console.log('\n6. Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('contracts')
      .delete()
      .eq('id', newContract.id);

    if (deleteError) {
      console.error('❌ Erro ao deletar contrato de teste:', deleteError);
    } else {
      console.log('✅ Contrato de teste removido com sucesso!');
    }

    console.log('\n🎉 Todos os testes dos novos campos foram executados com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testNewFields();
