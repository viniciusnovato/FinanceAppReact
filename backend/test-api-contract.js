const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3000/api';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testContractCreationViaAPI() {
  try {
    console.log('=== TESTE DE CRIAÇÃO DE CONTRATO VIA API ===');
    
    // Buscar um cliente existente
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
    
    // Dados do contrato para enviar à API
    const contractData = {
      client_id: client.id,
      contract_number: `API-TEST-${Date.now()}`,
      description: 'Contrato de teste via API para verificar status padrão',
      value: 20000.00,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_frequency: 'monthly',
      down_payment: 4000.00,
      number_of_payments: 16,
      notes: 'Teste via API - pode ser removido'
      // Não enviando status para testar o padrão do backend
    };
    
    console.log('\n📝 Enviando dados para API:');
    console.log('- Cliente:', client.first_name);
    console.log('- Número:', contractData.contract_number);
    console.log('- Valor:', `€${contractData.value}`);
    console.log('- Status: (não especificado - deve usar padrão do backend)');
    
    // Fazer requisição para a API
    console.log('\n🌐 Fazendo requisição POST para /api/contracts...');
    
    const response = await axios.post(`${API_BASE_URL}/contracts`, contractData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 201 && response.data.success) {
      const newContract = response.data.data;
      
      console.log('\n✅ Contrato criado via API com sucesso!');
      console.log(`📋 ID: ${newContract.id}`);
      console.log(`📋 Número: ${newContract.contract_number}`);
      console.log(`📋 Status: '${newContract.status}'`);
      console.log(`📋 Valor: €${newContract.value}`);
      
      // Verificar se o status foi definido corretamente
      if (newContract.status === 'ativo') {
        console.log('\n🎉 SUCESSO: O status foi definido corretamente como "ativo" pelo backend!');
      } else {
        console.log(`\n⚠️  ATENÇÃO: O status foi definido como "${newContract.status}" em vez de "ativo"`);
      }
      
      // Verificar no banco de dados diretamente
      const { data: verifyContract, error: verifyError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', newContract.id)
        .single();
      
      if (!verifyError && verifyContract) {
        console.log('\n🔍 Verificação no banco de dados:');
        console.log(`Status confirmado: '${verifyContract.status}'`);
        console.log(`Data de criação: ${verifyContract.created_at}`);
      }
      
    } else {
      console.log('❌ Resposta inesperada da API:', response.status, response.data);
    }
    
    console.log('\n✅ Teste via API concluído!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na API:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Erro de rede:', error.message);
      console.log('💡 Certifique-se de que o backend está rodando em http://localhost:3000');
    } else {
      console.error('❌ Erro no teste:', error.message);
    }
  }
}

testContractCreationViaAPI();