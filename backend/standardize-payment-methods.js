const { supabase } = require('./src/config/database.ts');

async function standardizePaymentMethods() {
  console.log('🔧 Padronizando métodos de pagamento...');
  
  // Mapeamento dos valores antigos para os novos
  const mappings = {
    'dd': 'DD',
    'trf': 'TRF', 
    'pp': 'PP',
    'trf op': 'TRF ou RECEÇÃO'
  };
  
  for (const [oldValue, newValue] of Object.entries(mappings)) {
    console.log(`📝 Atualizando "${oldValue}" para "${newValue}"...`);
    
    const { data, error } = await supabase
      .from('payments')
      .update({ payment_method: newValue })
      .eq('payment_method', oldValue)
      .select('id');
      
    if (error) {
      console.error(`❌ Erro ao atualizar ${oldValue}:`, error);
    } else {
      console.log(`✅ Atualizados ${data.length} pagamentos de "${oldValue}" para "${newValue}"`);
    }
  }
  
  // Verificar resultado final
  console.log('\n🔍 Verificando resultado final...');
  const { data, error } = await supabase
    .from('payments')
    .select('payment_method')
    .not('payment_method', 'is', null);
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  const methods = [...new Set(data.map(p => p.payment_method))].sort();
  console.log('📊 Métodos de pagamento após padronização:', methods);
  
  // Contar cada método
  const counts = {};
  data.forEach(p => {
    counts[p.payment_method] = (counts[p.payment_method] || 0) + 1;
  });
  
  console.log('📈 Contagem final por método:');
  Object.entries(counts).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} pagamentos`);
  });
}

standardizePaymentMethods().then(() => process.exit(0));