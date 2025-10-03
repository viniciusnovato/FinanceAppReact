require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testSimpleQuery() {
  console.log('🔍 Testando consulta simples...\n');
  
  try {
    // Primeiro, vamos ver um pagamento simples
    console.log('1. Buscando um pagamento simples:');
    const { data: simplePayment, error: simpleError } = await supabase
      .from('payments')
      .select('*')
      .limit(1);
    
    if (simpleError) {
      console.error('❌ Erro na consulta simples:', simpleError);
      return;
    }
    
    console.log('✅ Pagamento encontrado:', simplePayment[0]);
    
    // Agora vamos testar com join
    console.log('\n2. Buscando pagamento com contrato:');
    const { data: paymentWithContract, error: contractError } = await supabase
      .from('payments')
      .select(`
        *,
        contracts(*)
      `)
      .limit(1);
    
    if (contractError) {
      console.error('❌ Erro na consulta com contrato:', contractError);
      return;
    }
    
    console.log('✅ Pagamento com contrato:', paymentWithContract[0]);
    
    // Agora vamos testar com cliente
    console.log('\n3. Buscando pagamento com contrato e cliente:');
    const { data: fullPayment, error: fullError } = await supabase
      .from('payments')
      .select(`
        *,
        contracts(
          *,
          clients(*)
        )
      `)
      .limit(1);
    
    if (fullError) {
      console.error('❌ Erro na consulta completa:', fullError);
      return;
    }
    
    console.log('✅ Pagamento completo:', JSON.stringify(fullPayment[0], null, 2));
    
    // Testar busca por Adelaide especificamente
    console.log('\n4. Buscando pagamentos da Adelaide:');
    const { data: adelaidePayments, error: adelaideError } = await supabase
      .from('payments')
      .select(`
        *,
        contracts(
          *,
          clients(*)
        )
      `)
      .eq('contracts.clients.first_name', 'ADELAIDE')
      .limit(5);
    
    if (adelaideError) {
      console.error('❌ Erro na busca da Adelaide:', adelaideError);
      return;
    }
    
    console.log(`✅ Encontrados ${adelaidePayments.length} pagamentos da Adelaide`);
    adelaidePayments.forEach((payment, idx) => {
      console.log(`   ${idx + 1}. ID: ${payment.id}, Cliente: ${payment.contracts?.clients?.first_name} ${payment.contracts?.clients?.last_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSimpleQuery();