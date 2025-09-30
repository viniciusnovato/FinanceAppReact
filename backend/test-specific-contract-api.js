const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSpecificContractApi() {
  try {
    console.log('=== TESTING SPECIFIC CONTRACT API QUERIES ===\n');

    // Get some real contracts to test with
    console.log('🔍 Getting sample contracts...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, contract_number, client_id')
      .limit(5);

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return;
    }

    console.log(`Found ${contracts.length} contracts to test:`);
    contracts.forEach((contract, index) => {
      console.log(`  ${index + 1}. ID: ${contract.id}, Number: ${contract.contract_number}`);
    });

    // Test each contract with the exact API query
    for (const contract of contracts) {
      console.log(`\n🔍 Testing contract ${contract.contract_number} (${contract.id})...`);
      
      // This is the exact query from PaymentRepository.findByContractId
      const { data: apiPayments, error: apiError } = await supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .eq('contract_id', contract.id)
        .order('due_date', { ascending: true });

      if (apiError) {
        console.error(`  ❌ API query error:`, apiError);
        continue;
      }

      console.log(`  ✅ API query found: ${apiPayments.length} payments`);

      // Also test a simple count query
      const { count, error: countError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('contract_id', contract.id);

      if (countError) {
        console.error(`  ❌ Count query error:`, countError);
      } else {
        console.log(`  📊 Simple count query: ${count} payments`);
      }

      // Show first few payments if any
      if (apiPayments.length > 0) {
        console.log(`  📋 First few payments:`);
        apiPayments.slice(0, 3).forEach((payment, index) => {
          console.log(`    ${index + 1}. ID: ${payment.id}, Amount: ${payment.amount}, Status: ${payment.status}, Due: ${payment.due_date}`);
        });
      }
    }

    // Test with a known contract that should have payments
    console.log('\n🔍 Testing known contract with payments (741b2215-a657-43e1-bbe9-b4ccf1307efb)...');
    const knownContractId = '741b2215-a657-43e1-bbe9-b4ccf1307efb';
    
    const { data: knownPayments, error: knownError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          *,
          client:clients(*)
        )
      `)
      .eq('contract_id', knownContractId)
      .order('due_date', { ascending: true });

    if (knownError) {
      console.error('  ❌ Known contract query error:', knownError);
    } else {
      console.log(`  ✅ Known contract API query found: ${knownPayments.length} payments`);
      
      if (knownPayments.length > 0) {
        console.log(`  📋 Sample payments:`);
        knownPayments.slice(0, 5).forEach((payment, index) => {
          console.log(`    ${index + 1}. ID: ${payment.id}, Amount: ${payment.amount}, Status: ${payment.status}`);
          console.log(`       Contract: ${payment.contract ? payment.contract.contract_number : 'NULL'}`);
          console.log(`       Client: ${payment.contract?.client ? `${payment.contract.client.first_name} ${payment.contract.client.last_name}` : 'NULL'}`);
        });
      }
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSpecificContractApi();