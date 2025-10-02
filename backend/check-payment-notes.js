const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPaymentNotes() {
  try {
    console.log('=== VERIFICAÇÃO DO CAMPO NOTES DOS PAGAMENTOS ===\n');

    const { data, error } = await supabase
      .from('payments')
      .select('id, notes, amount, due_date, status')
      .limit(20);
    
    if (error) {
      console.error('Erro:', error);
      return;
    }
    
    console.log('Total de pagamentos encontrados:', data.length);
    console.log('');
    
    data.forEach((payment, index) => {
      console.log(`Pagamento ${index + 1}:`);
      console.log(`  ID: ${payment.id.substring(0, 8)}...`);
      console.log(`  Valor: ${payment.amount}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Vencimento: ${payment.due_date}`);
      console.log(`  Notes (Parcela): '${payment.notes || 'VAZIO'}'`);
      console.log('');
    });
    
    // Estatísticas
    const withNotes = data.filter(p => p.notes && p.notes.trim() !== '');
    const withoutNotes = data.filter(p => !p.notes || p.notes.trim() === '');
    
    console.log('=== ESTATÍSTICAS ===');
    console.log(`Pagamentos com notes: ${withNotes.length}`);
    console.log(`Pagamentos sem notes: ${withoutNotes.length}`);
    
    if (withNotes.length > 0) {
      console.log('\nExemplos de notes encontrados:');
      withNotes.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. "${p.notes}"`);
      });
    }
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
  }
}

checkPaymentNotes();