const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdelaide() {
  try {
    console.log('=== INVESTIGANDO CONTRATO DA ADELAIDE ===\n');

    // Buscar cliente ADELAIDE - verificar estrutura da tabela primeiro
    console.log('🔍 Verificando estrutura da tabela clients...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Erro ao verificar tabela:', tableError);
      return;
    }

    if (tableInfo && tableInfo.length > 0) {
      console.log('📋 Colunas disponíveis na tabela clients:');
      console.log(Object.keys(tableInfo[0]));
    }

    // Buscar cliente ADELAIDE usando first_name ou last_name
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .or('first_name.ilike.%adelaide%,last_name.ilike.%adelaide%');

    if (clientsError) {
      console.error('Erro ao buscar cliente:', clientsError);
      return;
    }

    if (!clients || clients.length === 0) {
      console.log('❌ Cliente ADELAIDE não encontrado');
      return;
    }

    console.log(`👤 Cliente encontrado: ${clients[0].first_name} ${clients[0].last_name} (${clients[0].id})`);

    // Buscar contratos da ADELAIDE
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('client_id', clients[0].id);

    if (contractsError) {
      console.error('Erro ao buscar contratos:', contractsError);
      return;
    }

    if (!contracts || contracts.length === 0) {
      console.log('❌ Nenhum contrato encontrado para ADELAIDE');
      return;
    }

    for (const contract of contracts) {
      console.log(`\n📄 Contrato: ${contract.contract_number} (${contract.id})`);
      console.log(`   Descrição: ${contract.description}`);
      console.log(`   Status: ${contract.status}`);
      console.log(`   Número de parcelas: ${contract.installments}`);

      // Buscar pagamentos do contrato
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('contract_id', contract.id);

      if (paymentsError) {
        console.error(`   ❌ Erro ao buscar pagamentos:`, paymentsError);
        continue;
      }

      console.log(`   💰 Pagamentos encontrados: ${payments.length}`);
      
      if (payments.length > 0) {
        console.log('   📋 Detalhes dos pagamentos:');
        payments.forEach((p, i) => {
          console.log(`      ${i+1}. ID: ${p.id}`);
          console.log(`         Tipo: "${p.payment_type || 'null'}"`);
          console.log(`         Status: ${p.status}`);
          console.log(`         Valor: R$ ${p.amount}`);
          console.log(`         Vencimento: ${p.due_date}`);
          console.log('');
        });
      }
      
      // Aplicar a lógica do backend
      const regular = payments.filter(p => 
        !p.payment_type || 
        p.payment_type === 'installment' || 
        p.payment_type === 'normalPayment' ||
        p.payment_type === 'downPayment'
      );
      const complementary = payments.filter(p => p.payment_type && p.payment_type.startsWith('comp'));
      
      console.log(`   📊 Resultado do filtro:`);
      console.log(`      Regulares: ${regular.length}`);
      console.log(`      Complementares: ${complementary.length}`);
      
      if (regular.length === 0 && payments.length > 0) {
        console.log('   ⚠️  PROBLEMA: Tem pagamentos mas nenhum é considerado regular!');
        console.log('   🔍 Tipos únicos encontrados:');
        const uniqueTypes = [...new Set(payments.map(p => p.payment_type || 'null'))];
        uniqueTypes.forEach(type => console.log(`      - "${type}"`));
      }
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkAdelaide();