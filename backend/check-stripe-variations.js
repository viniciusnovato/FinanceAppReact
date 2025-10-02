const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStripeVariations() {
  try {
    console.log('=== VERIFICAÇÃO DAS VARIAÇÕES DO STRIPE ===');
    
    // Buscar todos os pagamentos com Stripe (case sensitive)
    const { data: stripePayments, error: stripeError } = await supabase
      .from('payments')
      .select('id, payment_method, amount, due_date, status')
      .eq('payment_method', 'Stripe');
    
    if (stripeError) {
      console.error('Erro ao buscar Stripe:', stripeError);
      return;
    }
    
    // Buscar todos os pagamentos com STRIPE (maiúsculo)
    const { data: stripeUpperPayments, error: stripeUpperError } = await supabase
      .from('payments')
      .select('id, payment_method, amount, due_date, status')
      .eq('payment_method', 'STRIPE');
    
    if (stripeUpperError) {
      console.error('Erro ao buscar STRIPE:', stripeUpperError);
      return;
    }
    
    console.log(`Pagamentos com 'Stripe': ${stripePayments.length}`);
    console.log(`Pagamentos com 'STRIPE': ${stripeUpperPayments.length}`);
    console.log(`Total de pagamentos Stripe: ${stripePayments.length + stripeUpperPayments.length}`);
    
    console.log('\n=== DETALHES DOS PAGAMENTOS ===');
    
    if (stripePayments.length > 0) {
      console.log('\nPrimeiros 5 pagamentos com "Stripe":');
      stripePayments.slice(0, 5).forEach((payment, index) => {
        console.log(`  ${index + 1}. ID: ${payment.id.substring(0, 8)}... | Valor: ${payment.amount} | Status: ${payment.status}`);
      });
    }
    
    if (stripeUpperPayments.length > 0) {
      console.log('\nPrimeiros 5 pagamentos com "STRIPE":');
      stripeUpperPayments.slice(0, 5).forEach((payment, index) => {
        console.log(`  ${index + 1}. ID: ${payment.id.substring(0, 8)}... | Valor: ${payment.amount} | Status: ${payment.status}`);
      });
    }
    
    // Verificar se há outras variações
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('payment_method')
      .ilike('payment_method', '%stripe%');
    
    if (!allError && allPayments) {
      const uniqueStripeVariations = [...new Set(allPayments.map(p => p.payment_method))];
      console.log('\n=== TODAS AS VARIAÇÕES DE STRIPE ENCONTRADAS ===');
      uniqueStripeVariations.forEach((variation, index) => {
        console.log(`  ${index + 1}. "${variation}"`);
      });
    }
    
  } catch (error) {
    console.error('Erro ao verificar variações:', error);
  }
}

checkStripeVariations();