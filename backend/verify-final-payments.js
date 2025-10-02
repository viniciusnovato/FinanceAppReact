const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAllPayments() {
  try {
    console.log('=== VERIFICAÇÃO FINAL DOS PAGAMENTOS ===');
    
    // Contar total de pagamentos
    const { count: totalPayments, error: totalError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Erro ao contar pagamentos:', totalError);
      return;
    }
    
    // Contar pagamentos com Stripe padronizado
    const { count: stripePayments, error: stripeError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_method', 'Stripe');
    
    if (stripeError) {
      console.error('Erro ao contar Stripe:', stripeError);
      return;
    }
    
    // Verificar se ainda existem outras variações
    const { data: remainingVariations, error: variationsError } = await supabase
      .from('payments')
      .select('payment_method')
      .ilike('payment_method', '%stripe%')
      .neq('payment_method', 'Stripe');
    
    if (variationsError) {
      console.error('Erro ao verificar variações:', variationsError);
      return;
    }
    
    console.log(`📊 Total de pagamentos no sistema: ${totalPayments}`);
    console.log(`🎯 Pagamentos com Stripe padronizado: ${stripePayments}`);
    console.log(`⚠️  Variações restantes de Stripe: ${remainingVariations.length}`);
    
    if (remainingVariations.length > 0) {
      console.log('\nVariações encontradas:');
      const uniqueVariations = [...new Set(remainingVariations.map(p => p.payment_method))];
      uniqueVariations.forEach((variation, index) => {
        console.log(`  ${index + 1}. "${variation}"`);
      });
    } else {
      console.log('✅ Nenhuma variação restante encontrada!');
    }
    
    // Verificar métodos de pagamento únicos
    const { data: allMethods, error: methodsError } = await supabase
      .from('payments')
      .select('payment_method');
    
    if (!methodsError && allMethods) {
      const uniqueMethods = [...new Set(allMethods.map(p => p.payment_method))].filter(Boolean);
      console.log(`\n📋 Total de métodos únicos: ${uniqueMethods.length}`);
      console.log('Métodos disponíveis:');
      uniqueMethods.sort().forEach((method, index) => {
        console.log(`  ${index + 1}. "${method}"`);
      });
    }
    
  } catch (error) {
    console.error('Erro na verificação:', error);
  }
}

verifyAllPayments();