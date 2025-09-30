const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTotalPayments() {
  try {
    console.log('=== VERIFICANDO TOTAL DE PAGAMENTOS NO BANCO ===\n');

    // 1. Contar total de pagamentos
    console.log('🔍 Contando total de pagamentos...');
    const { count: totalCount, error: countError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Erro ao contar pagamentos:', countError);
      return;
    }

    console.log(`📊 Total de pagamentos no banco: ${totalCount}`);

    // 2. Testar consulta sem limitação
    console.log('\n🔍 Testando consulta sem limitação...');
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('id, amount, status, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Erro na consulta sem limitação:', allError);
    } else {
      console.log(`✅ Consulta sem limitação retornou: ${allPayments.length} pagamentos`);
    }

    // 3. Testar consulta com joins (como no repositório)
    console.log('\n🔍 Testando consulta com joins...');
    const { data: joinPayments, error: joinError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (joinError) {
      console.error('Erro na consulta com joins:', joinError);
    } else {
      console.log(`✅ Consulta com joins retornou: ${joinPayments.length} pagamentos`);
    }

    // 4. Verificar se há limitação no Supabase
    console.log('\n🔍 Testando consulta com limite explícito...');
    const { data: limitedPayments, error: limitError } = await supabase
      .from('payments')
      .select('id')
      .limit(1000);

    if (limitError) {
      console.error('Erro na consulta com limite:', limitError);
    } else {
      console.log(`✅ Consulta com limite 1000 retornou: ${limitedPayments.length} pagamentos`);
    }

    // 5. Testar consulta com limite maior
    console.log('\n🔍 Testando consulta com limite 5000...');
    const { data: bigLimitPayments, error: bigLimitError } = await supabase
      .from('payments')
      .select('id')
      .limit(5000);

    if (bigLimitError) {
      console.error('Erro na consulta com limite 5000:', bigLimitError);
    } else {
      console.log(`✅ Consulta com limite 5000 retornou: ${bigLimitPayments.length} pagamentos`);
    }

    // 6. Verificar distribuição por status
    console.log('\n📊 Verificando distribuição por status...');
    const { data: statusData, error: statusError } = await supabase
      .from('payments')
      .select('status')
      .order('status');

    if (statusError) {
      console.error('Erro ao verificar status:', statusError);
    } else {
      const statusCount = {};
      statusData.forEach(payment => {
        statusCount[payment.status] = (statusCount[payment.status] || 0) + 1;
      });
      
      console.log('Distribuição por status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count} pagamentos`);
      });
    }

    // 7. Verificar se há pagamentos muito antigos ou recentes
    console.log('\n📅 Verificando datas dos pagamentos...');
    const { data: dateData, error: dateError } = await supabase
      .from('payments')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1);

    const { data: latestData, error: latestError } = await supabase
      .from('payments')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!dateError && !latestError && dateData.length > 0 && latestData.length > 0) {
      console.log(`📅 Pagamento mais antigo: ${dateData[0].created_at}`);
      console.log(`📅 Pagamento mais recente: ${latestData[0].created_at}`);
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkTotalPayments();