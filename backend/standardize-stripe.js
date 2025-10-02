const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function standardizeStripe() {
  try {
    console.log('=== PADRONIZAÇÃO DO STRIPE ===');
    
    // Primeiro, vamos verificar o estado atual
    const { data: beforeUpdate, error: beforeError } = await supabase
      .from('payments')
      .select('payment_method')
      .ilike('payment_method', '%stripe%');
    
    if (beforeError) {
      console.error('Erro ao verificar estado inicial:', beforeError);
      return;
    }
    
    const beforeCounts = {};
    beforeUpdate.forEach(payment => {
      beforeCounts[payment.payment_method] = (beforeCounts[payment.payment_method] || 0) + 1;
    });
    
    console.log('Estado ANTES da padronização:');
    Object.entries(beforeCounts).forEach(([method, count]) => {
      console.log(`  "${method}": ${count} pagamentos`);
    });
    
    console.log('\n=== INICIANDO PADRONIZAÇÃO ===');
    
    // Atualizar "STRIPE" para "Stripe"
    const { data: updateUpper, error: errorUpper } = await supabase
      .from('payments')
      .update({ payment_method: 'Stripe' })
      .eq('payment_method', 'STRIPE')
      .select('id');
    
    if (errorUpper) {
      console.error('Erro ao atualizar STRIPE:', errorUpper);
      return;
    }
    
    console.log(`✅ Atualizados ${updateUpper.length} pagamentos de "STRIPE" para "Stripe"`);
    
    // Atualizar "stripe" para "Stripe"
    const { data: updateLower, error: errorLower } = await supabase
      .from('payments')
      .update({ payment_method: 'Stripe' })
      .eq('payment_method', 'stripe')
      .select('id');
    
    if (errorLower) {
      console.error('Erro ao atualizar stripe:', errorLower);
      return;
    }
    
    console.log(`✅ Atualizados ${updateLower.length} pagamentos de "stripe" para "Stripe"`);
    
    // Verificar outras possíveis variações e padronizar
    const possibleVariations = ['STRIPE', 'stripe', 'Stripe ', ' Stripe', ' STRIPE ', ' stripe '];
    
    for (const variation of possibleVariations) {
      if (variation !== 'Stripe') {
        const { data: updateVariation, error: errorVariation } = await supabase
          .from('payments')
          .update({ payment_method: 'Stripe' })
          .eq('payment_method', variation)
          .select('id');
        
        if (!errorVariation && updateVariation.length > 0) {
          console.log(`✅ Atualizados ${updateVariation.length} pagamentos de "${variation}" para "Stripe"`);
        }
      }
    }
    
    console.log('\n=== VERIFICAÇÃO FINAL ===');
    
    // Verificar o estado final
    const { data: afterUpdate, error: afterError } = await supabase
      .from('payments')
      .select('payment_method')
      .ilike('payment_method', '%stripe%');
    
    if (afterError) {
      console.error('Erro ao verificar estado final:', afterError);
      return;
    }
    
    const afterCounts = {};
    afterUpdate.forEach(payment => {
      afterCounts[payment.payment_method] = (afterCounts[payment.payment_method] || 0) + 1;
    });
    
    console.log('Estado APÓS a padronização:');
    Object.entries(afterCounts).forEach(([method, count]) => {
      console.log(`  "${method}": ${count} pagamentos`);
    });
    
    const totalBefore = Object.values(beforeCounts).reduce((sum, count) => sum + count, 0);
    const totalAfter = Object.values(afterCounts).reduce((sum, count) => sum + count, 0);
    
    console.log(`\n📊 RESUMO:`);
    console.log(`  Total antes: ${totalBefore} pagamentos`);
    console.log(`  Total após: ${totalAfter} pagamentos`);
    console.log(`  Diferença: ${totalAfter - totalBefore} (deve ser 0)`);
    
    if (totalBefore === totalAfter) {
      console.log('✅ SUCESSO: Nenhum pagamento foi perdido na padronização!');
    } else {
      console.log('❌ ATENÇÃO: Houve diferença no total de pagamentos!');
    }
    
  } catch (error) {
    console.error('Erro durante a padronização:', error);
  }
}

standardizeStripe();