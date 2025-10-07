const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNewContractNotes() {
  console.log('=== TESTE DE CRIAÇÃO DE CONTRATO COM NOVAS NOTAS ===');
  
  try {
    // 1. Buscar um cliente existente
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .limit(1);

    if (clientError) {
      console.error('❌ Erro ao buscar cliente:', clientError);
      return;
    }

    if (!clients || clients.length === 0) {
      console.log('❌ Nenhum cliente encontrado');
      return;
    }

    const client = clients[0];
    console.log(`✅ Cliente encontrado: ${client.first_name} ${client.last_name} (ID: ${client.id})`);

    // 2. Criar um novo contrato via API backend
    const contractData = {
      client_id: client.id,
      number: `TEST-NOTES-${Date.now()}`,
      value: 10000,
      down_payment: 1000,
      number_of_payments: 3,
      start_date: '2025-01-01',
      end_date: '2025-04-01'
    };

    console.log('\n📝 Criando contrato via API backend...');
    
    // Fazer requisição para o backend
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/api/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      },
      body: JSON.stringify(contractData)
    });

    if (!response.ok) {
      console.error('❌ Erro na API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalhes do erro:', errorText);
      return;
    }

    const result = await response.json();
    const newContract = result.data;
    
    console.log(`✅ Contrato criado via API: ${newContract.number} (ID: ${newContract.id})`);

    // 3. Aguardar um pouco para garantir que os pagamentos foram criados
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Buscar pagamentos do novo contrato
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', newContract.id)
      .order('due_date', { ascending: true });

    if (paymentError) {
      console.error('❌ Erro ao buscar pagamentos:', paymentError);
      return;
    }

    if (!payments || payments.length === 0) {
      console.log('❌ Nenhum pagamento encontrado para o novo contrato');
      return;
    }

    console.log(`\n📋 Pagamentos do novo contrato (${payments.length}):`);
    payments.forEach((payment, index) => {
      console.log(`  ${index + 1}. Tipo: ${payment.payment_type} | Valor: €${payment.amount} | Notas: "${payment.notes}"`);
    });

    // 5. Verificar especificamente as parcelas normais
    const installmentPayments = payments.filter(p => p.payment_type === 'normalPayment');
    console.log(`\n🔍 Verificando formato das notas das parcelas (${installmentPayments.length}):`);
    
    let correctFormat = true;
    installmentPayments.forEach((payment, index) => {
      const expectedFormat = `${index + 1}/${installmentPayments.length}`;
      const actualNotes = payment.notes;
      
      if (actualNotes === expectedFormat) {
        console.log(`  ✅ Parcela ${index + 1}: "${actualNotes}" (formato correto)`);
      } else {
        console.log(`  ❌ Parcela ${index + 1}: "${actualNotes}" (esperado: "${expectedFormat}")`);
        correctFormat = false;
      }
    });

    if (correctFormat) {
      console.log('\n🎉 Todas as notas estão no novo formato "X/Y"!');
    } else {
      console.log('\n⚠️  Algumas notas não estão no formato esperado.');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testNewContractNotes();