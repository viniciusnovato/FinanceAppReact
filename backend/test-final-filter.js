const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simulando a função do repository corrigida
async function findAllWithFilters(filters) {
  try {
    // Se nenhum filtro especial está ativo, usar query simples
    if (!filters.hasOverduePayments && !filters.hasDueTodayPayments) {
      let query = supabase
        .from('clients')
        .select('*');

      // Filtro de busca por nome, email ou tax_id
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`);
      }

      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // Para filtros de pagamentos, usar abordagem com subquery
    const today = new Date().toISOString().split('T')[0];
    let clientIds = [];

    // Se filtro de pagamentos atrasados está ativo
    if (filters.hasOverduePayments) {
      const { data: overduePayments, error: overdueError } = await supabase
        .from('payments')
        .select(`
          contract_id,
          contracts(
            client_id
          )
        `)
        .or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`);

      if (overdueError) throw overdueError;
      
      const overdueClientIds = overduePayments?.map(p => p.contracts?.client_id).filter(id => id) || [];
      clientIds = [...clientIds, ...overdueClientIds];
    }

    // Se filtro de pagamentos vencendo hoje está ativo
    if (filters.hasDueTodayPayments) {
      const { data: dueTodayPayments, error: dueTodayError } = await supabase
        .from('payments')
        .select(`
          contract_id,
          contracts(
            client_id
          )
        `)
        .eq('status', 'pending')
        .eq('due_date', today);

      if (dueTodayError) throw dueTodayError;
      
      const dueTodayClientIds = dueTodayPayments?.map(p => p.contracts?.client_id).filter(id => id) || [];
      clientIds = [...clientIds, ...dueTodayClientIds];
    }

    // Remover duplicatas
    const uniqueClientIds = [...new Set(clientIds)];

    if (uniqueClientIds.length === 0) {
      return [];
    }

    // Buscar os clientes pelos IDs encontrados
    let query = supabase
      .from('clients')
      .select('*')
      .in('id', uniqueClientIds);

    // Filtro de busca por nome, email ou tax_id
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching clients with filters:', error);
    throw new Error('Failed to fetch clients with filters');
  }
}

async function testFinalFilter() {
  console.log('🔍 Testando filtro final corrigido...\n');
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Data atual: ${today}\n`);

  try {
    console.log('1️⃣ Testando sem filtros (todos os clientes):');
    const allClients = await findAllWithFilters({});
    console.log(`📊 Total de clientes: ${allClients.length}`);

    console.log('\n2️⃣ Testando filtro de pagamentos vencendo hoje:');
    const clientsWithDueToday = await findAllWithFilters({
      hasDueTodayPayments: true
    });
    console.log(`📊 Clientes com pagamentos vencendo hoje: ${clientsWithDueToday.length}`);
    clientsWithDueToday.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (${client.email || 'sem email'})`);
    });

    console.log('\n3️⃣ Testando filtro de busca + pagamentos vencendo hoje:');
    const clientsWithSearch = await findAllWithFilters({
      hasDueTodayPayments: true,
      search: 'CLAUDE'
    });
    console.log(`📊 Clientes encontrados com busca "CLAUDE": ${clientsWithSearch.length}`);
    clientsWithSearch.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (${client.email || 'sem email'})`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testFinalFilter();