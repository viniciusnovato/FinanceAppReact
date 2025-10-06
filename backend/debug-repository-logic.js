const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRepositoryLogic() {
  console.log('=== DEBUG LÓGICA DO REPOSITORY ===\n');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Data de hoje: ${today}`);
    
    // Simular exatamente a lógica do repository
    let clientIds = [];
    
    // Buscar pagamentos atrasados (não pagos e due_date < hoje)
    console.log('\n1. Buscando pagamentos atrasados...');
    const { data: overduePayments, error: paymentsError } = await supabase
      .from('payments')
      .select('contract_id')
      .neq('status', 'paid')
      .lt('due_date', today);

    if (paymentsError) {
      console.error('Erro ao buscar pagamentos atrasados:', paymentsError);
      return;
    }

    console.log(`Pagamentos atrasados encontrados: ${overduePayments ? overduePayments.length : 0}`);

    if (overduePayments && overduePayments.length > 0) {
      const contractIds = Array.from(new Set(overduePayments.map(p => p.contract_id)));
      console.log(`Contratos únicos com pagamentos atrasados: ${contractIds.length}`);
      
      // Buscar client_ids desses contratos
      console.log('\n2. Buscando clientes dos contratos...');
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('client_id')
        .in('id', contractIds);

      if (contractsError) {
        console.error('Erro ao buscar contratos:', contractsError);
        return;
      }

      console.log(`Contratos encontrados: ${contracts ? contracts.length : 0}`);

      if (contracts && contracts.length > 0) {
        const overdueClientIds = contracts.map(c => c.client_id);
        clientIds.push(...overdueClientIds);
        console.log(`Client IDs adicionados: ${overdueClientIds.length}`);
      }
    }

    // Remover duplicatas
    clientIds = Array.from(new Set(clientIds));
    console.log(`\n3. Client IDs únicos: ${clientIds.length}`);

    // Se não encontrou clientes com os critérios de pagamento, retornar vazio
    if (clientIds.length === 0) {
      console.log('Nenhum cliente encontrado - retornando array vazio');
      return [];
    }

    // Construir query principal para clientes
    console.log('\n4. Buscando clientes finais...');
    let query = supabase.from('clients').select('*');

    // Se há filtros de pagamento, filtrar pelos IDs encontrados
    if (clientIds.length > 0) {
      query = query.in('id', clientIds);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Erro na query final:', error);
      return [];
    }

    console.log(`\n5. RESULTADO FINAL: ${data ? data.length : 0} clientes`);
    
    if (data && data.length > 0) {
      console.log('Primeiros 3 clientes:');
      data.slice(0, 3).forEach((client, index) => {
        console.log(`   ${index + 1}. ID: ${client.id}, Nome: ${client.first_name} ${client.last_name}`);
      });
    }

    return data || [];
    
  } catch (error) {
    console.error('Erro geral:', error);
    return [];
  }
}

debugRepositoryLogic();