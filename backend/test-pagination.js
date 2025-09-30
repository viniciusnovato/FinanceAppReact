const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPagination() {
  try {
    console.log('=== TESTANDO NOVA FUNCIONALIDADE DE PAGINAÇÃO ===\n');

    // 1. Testar paginação básica
    console.log('🔍 Testando paginação básica...');
    
    let allPaymentsFromPagination = [];
    let page = 1;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      console.log(`   Buscando página ${page} com limite ${limit}...`);
      
      const offset = (page - 1) * limit;
      
      // Primeiro, obter o total de registros
      const { count, error: countError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Erro ao contar:', countError);
        break;
      }

      // Depois, obter os dados paginados
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro na consulta paginada:', error);
        break;
      }

      console.log(`   ✅ Página ${page}: ${data.length} pagamentos encontrados`);
      
      allPaymentsFromPagination.push(...data);
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      hasMore = page < totalPages;
      
      console.log(`   📊 Total no banco: ${total}, Página atual: ${page}/${totalPages}`);
      
      page++;
      
      // Evitar loop infinito
      if (page > 20) {
        console.log('   ⚠️ Parando após 20 páginas para evitar loop infinito');
        break;
      }
    }

    console.log(`\n📈 RESULTADO FINAL:`);
    console.log(`   Total de pagamentos coletados via paginação: ${allPaymentsFromPagination.length}`);

    // 2. Testar paginação com limite menor
    console.log('\n🔍 Testando paginação com limite menor (50 por página)...');
    
    const smallLimit = 50;
    const { count: totalCount, error: totalError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Erro ao contar total:', totalError);
      return;
    }

    console.log(`   📊 Total de pagamentos no banco: ${totalCount}`);
    
    // Testar primeira página
    const { data: firstPage, error: firstPageError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .order('created_at', { ascending: false })
      .range(0, smallLimit - 1);

    if (firstPageError) {
      console.error('Erro na primeira página:', firstPageError);
    } else {
      console.log(`   ✅ Primeira página (limite ${smallLimit}): ${firstPage.length} pagamentos`);
      
      if (firstPage.length > 0) {
        console.log(`   📋 Primeiro pagamento: ID ${firstPage[0].id}, Valor: ${firstPage[0].amount}`);
        console.log(`   📋 Último pagamento: ID ${firstPage[firstPage.length - 1].id}, Valor: ${firstPage[firstPage.length - 1].amount}`);
      }
    }

    // 3. Testar paginação para um contrato específico
    console.log('\n🔍 Testando paginação para contrato específico...');
    
    const contractId = '741b2215-a657-43e1-bbe9-b4ccf1307efb'; // Contrato que sabemos ter pagamentos
    
    const { count: contractCount, error: contractCountError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('contract_id', contractId);

    if (contractCountError) {
      console.error('Erro ao contar pagamentos do contrato:', contractCountError);
    } else {
      console.log(`   📊 Total de pagamentos para contrato ${contractId}: ${contractCount}`);
      
      // Buscar todos os pagamentos deste contrato usando paginação
      let contractPayments = [];
      let contractPage = 1;
      let contractHasMore = true;
      
      while (contractHasMore && contractPage <= 5) { // Limitar a 5 páginas para teste
        const contractOffset = (contractPage - 1) * limit;
        
        const { data: contractData, error: contractDataError } = await supabase
          .from('payments')
          .select(`
            *,
            contract:contracts(
              *,
              client:clients(*)
            )
          `)
          .eq('contract_id', contractId)
          .order('due_date', { ascending: true })
          .range(contractOffset, contractOffset + limit - 1);

        if (contractDataError) {
          console.error(`Erro na página ${contractPage} do contrato:`, contractDataError);
          break;
        }

        console.log(`   ✅ Página ${contractPage} do contrato: ${contractData.length} pagamentos`);
        contractPayments.push(...contractData);
        
        const contractTotalPages = Math.ceil(contractCount / limit);
        contractHasMore = contractPage < contractTotalPages;
        contractPage++;
      }
      
      console.log(`   📈 Total coletado para o contrato: ${contractPayments.length} pagamentos`);
    }

  } catch (error) {
    console.error('Erro geral no teste:', error);
  }
}

testPagination();