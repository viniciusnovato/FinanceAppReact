const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkFields() {
  try {
    console.log('🔍 Verificando estrutura da tabela contracts...');
    
    // Tentar fazer uma consulta que inclui os campos de saldo
    const { data, error } = await supabase
      .from('contracts')
      .select('id, positive_balance, negative_balance')
      .limit(1);
    
    if (error) {
      console.log('❌ Campos positive_balance e negative_balance não existem ainda');
      console.log('Erro:', error.message);
      
      // Vamos verificar quais campos existem
      const { data: existingData, error: existingError } = await supabase
        .from('contracts')
        .select('*')
        .limit(1);
        
      if (!existingError && existingData && existingData.length > 0) {
        console.log('📋 Campos existentes na tabela contracts:');
        console.log(Object.keys(existingData[0]));
      }
    } else {
      console.log('✅ Campos positive_balance e negative_balance já existem!');
      console.log('Dados de exemplo:', data);
    }
    
    // Verificar campo paid_amount na tabela payments
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('id, paid_amount')
      .limit(1);
    
    if (paymentError) {
      console.log('❌ Campo paid_amount não existe na tabela payments');
      console.log('Erro:', paymentError.message);
      
      // Verificar campos existentes em payments
      const { data: existingPaymentData, error: existingPaymentError } = await supabase
        .from('payments')
        .select('*')
        .limit(1);
        
      if (!existingPaymentError && existingPaymentData && existingPaymentData.length > 0) {
        console.log('📋 Campos existentes na tabela payments:');
        console.log(Object.keys(existingPaymentData[0]));
      }
    } else {
      console.log('✅ Campo paid_amount já existe na tabela payments!');
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message);
  }
  
  process.exit(0);
}

checkFields();