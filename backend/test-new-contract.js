const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNewContract() {
  try {
    console.log('=== TESTE DE CRIAÇÃO DE NOVO CONTRATO ===');
    
    // Buscar um cliente existente para usar no teste
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, first_name')
      .limit(1);
    
    if (clientError || !clients || clients.length === 0) {
      console.error('❌ Erro ao buscar cliente:', clientError);
      return;
    }
    
    const client = clients[0];
    console.log(`✅ Cliente encontrado: ${client.first_name} (ID: ${client.id})`);
    
    // Dados do contrato de teste
    const contractData = {
      client_id: client.id,
      contract_number: `TEST-${Date.now()}`,
      description: 'Contrato de teste para verificar status padrão',
      value: 15000.00,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_frequency: 'monthly',
      down_payment: 3000.00,
      number_of_payments: 12,
      notes: 'Teste automático - pode ser removido',
      // Não definindo status explicitamente para testar o padrão
    };
    
    console.log('\n📝 Criando contrato com dados:');
    console.log('- Cliente:', client.first_name);
    console.log('- Número:', contractData.contract_number);
    console.log('- Valor:', `€${contractData.value}`);
    console.log('- Status: (padrão - não especificado)');
    
    // Criar o contrato
    const { data: newContract, error: createError } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar contrato:', createError);
      return;
    }
    
    console.log('\n✅ Contrato criado com sucesso!');
    console.log(`📋 ID: ${newContract.id}`);
    console.log(`📋 Número: ${newContract.contract_number}`);
    console.log(`📋 Status: '${newContract.status}'`);
    console.log(`📋 Valor: €${newContract.value}`);
    
    // Verificar se o status foi salvo corretamente
    if (newContract.status === 'ativo') {
      console.log('\n🎉 SUCESSO: O status foi salvo corretamente como "ativo"!');
    } else {
      console.log(`\n⚠️  ATENÇÃO: O status foi salvo como "${newContract.status}" em vez de "ativo"`);
    }
    
    // Buscar o contrato novamente para confirmar
    const { data: verifyContract, error: verifyError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', newContract.id)
      .single();
    
    if (!verifyError && verifyContract) {
      console.log('\n🔍 Verificação adicional:');
      console.log(`Status confirmado: '${verifyContract.status}'`);
      console.log(`Data de criação: ${verifyContract.created_at}`);
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testNewContract();