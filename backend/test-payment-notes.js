const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPaymentNotes() {
  console.log('=== TESTE DE NOTAS DOS PAGAMENTOS ===');
  
  try {
    // Buscar um contrato recém-criado
    const { data: contracts, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (contractError) {
      console.error('❌ Erro ao buscar contrato:', contractError);
      return;
    }

    if (!contracts || contracts.length === 0) {
      console.log('❌ Nenhum contrato encontrado');
      return;
    }

    const contract = contracts[0];
    console.log(`✅ Contrato encontrado: ${contract.number} (ID: ${contract.id})`);

    // Buscar pagamentos deste contrato
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contract.id)
      .order('due_date', { ascending: true });

    if (paymentError) {
      console.error('❌ Erro ao buscar pagamentos:', paymentError);
      return;
    }

    if (!payments || payments.length === 0) {
      console.log('❌ Nenhum pagamento encontrado para este contrato');
      return;
    }

    console.log(`\n📋 Pagamentos encontrados (${payments.length}):`);
    payments.forEach((payment, index) => {
      console.log(`  ${index + 1}. Valor: €${payment.amount} | Status: ${payment.status} | Notas: "${payment.notes}"`);
    });

    // Verificar se as notas estão no formato correto
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
      console.log('\n🎉 Todas as notas estão no formato correto!');
    } else {
      console.log('\n⚠️  Algumas notas não estão no formato esperado.');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testPaymentNotes();