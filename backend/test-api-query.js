const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testApiQuery() {
  try {
    console.log('=== TESTING API QUERY DIFFERENCES ===\n');

    // 1. Test the exact query from PaymentRepository.findAll()
    console.log('🔍 Testing PaymentRepository.findAll() query...');
    const { data: repoQuery, error: repoError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (repoError) {
      console.error('Repository query error:', repoError);
    } else {
      console.log(`Repository query found: ${repoQuery.length} payments`);
      
      // Check how many have complete contract/client data
      const withCompleteData = repoQuery.filter(p => p.contract && p.contract.client);
      const withoutCompleteData = repoQuery.filter(p => !p.contract || !p.contract.client);
      
      console.log(`  - With complete contract/client data: ${withCompleteData.length}`);
      console.log(`  - Without complete contract/client data: ${withoutCompleteData.length}`);
      
      if (withoutCompleteData.length > 0) {
        console.log('  - Examples of payments without complete data:');
        withoutCompleteData.slice(0, 3).forEach((payment, index) => {
          console.log(`    ${index + 1}. Payment ID: ${payment.id}`);
          console.log(`       Contract ID: ${payment.contract_id}`);
          console.log(`       Contract data: ${payment.contract ? 'EXISTS' : 'NULL'}`);
          if (payment.contract) {
            console.log(`       Client data: ${payment.contract.client ? 'EXISTS' : 'NULL'}`);
          }
        });
      }
    }

    // 2. Test with inner joins (like some queries might use)
    console.log('\n🔍 Testing with inner joins...');
    const { data: innerQuery, error: innerError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts!inner(
          *,
          client:clients!inner(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (innerError) {
      console.error('Inner join query error:', innerError);
    } else {
      console.log(`Inner join query found: ${innerQuery.length} payments`);
    }

    // 3. Check for orphaned payments (payments with invalid contract_id)
    console.log('\n🔍 Checking for orphaned payments...');
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('id, contract_id');

    const { data: allContracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id');

    if (allError || contractsError) {
      console.error('Error checking orphaned payments:', allError || contractsError);
    } else {
      const contractIds = new Set(allContracts.map(c => c.id));
      const orphanedPayments = allPayments.filter(p => !contractIds.has(p.contract_id));
      
      console.log(`Total payments: ${allPayments.length}`);
      console.log(`Total contracts: ${allContracts.length}`);
      console.log(`Orphaned payments: ${orphanedPayments.length}`);
      
      if (orphanedPayments.length > 0) {
        console.log('Examples of orphaned payments:');
        orphanedPayments.slice(0, 5).forEach((payment, index) => {
          console.log(`  ${index + 1}. Payment ID: ${payment.id}, Contract ID: ${payment.contract_id}`);
        });
      }
    }

    // 4. Check for contracts without clients
    console.log('\n🔍 Checking for contracts without clients...');
    const { data: contractsWithClients, error: contractClientError } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        client_id,
        client:clients(id, first_name, last_name)
      `);

    if (contractClientError) {
      console.error('Error checking contracts with clients:', contractClientError);
    } else {
      const contractsWithoutClients = contractsWithClients.filter(c => !c.client);
      console.log(`Total contracts: ${contractsWithClients.length}`);
      console.log(`Contracts without clients: ${contractsWithoutClients.length}`);
      
      if (contractsWithoutClients.length > 0) {
        console.log('Examples of contracts without clients:');
        contractsWithoutClients.slice(0, 5).forEach((contract, index) => {
          console.log(`  ${index + 1}. Contract ID: ${contract.id}, Number: ${contract.contract_number}, Client ID: ${contract.client_id}`);
        });
      }
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
}

testApiQuery();