const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSpecificContract() {
  try {
    console.log('=== DEBUGGING SPECIFIC CONTRACT PAYMENT LOADING ===\n');

    // Let's test with a contract that we know has payments
    const contractWithPayments = '741b2215-a657-43e1-bbe9-b4ccf1307efb'; // Contract 10142 with 25 payments
    
    console.log(`🔍 Testing contract: ${contractWithPayments}`);
    
    // 1. Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', contractWithPayments)
      .single();

    if (contractError) {
      console.error('Error fetching contract:', contractError);
      return;
    }

    console.log('📄 Contract Details:');
    console.log(`   ID: ${contract.id}`);
    console.log(`   Number: ${contract.contract_number}`);
    console.log(`   Description: ${contract.description}`);
    console.log(`   Client: ${contract.client?.first_name} ${contract.client?.last_name}`);
    console.log(`   Status: ${contract.status}`);

    // 2. Get payments for this contract (same way the API does)
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          id,
          contract_number,
          description,
          client:clients(
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('contract_id', contractWithPayments)
      .order('due_date', { ascending: true });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return;
    }

    console.log(`\n💰 Payments Found: ${payments.length}`);
    
    if (payments.length > 0) {
      console.log('First 5 payments:');
      payments.slice(0, 5).forEach((payment, index) => {
        console.log(`${index + 1}. Amount: ${payment.amount}, Status: ${payment.status}, Due: ${payment.due_date}`);
        console.log(`   Contract in payment: ${payment.contract?.contract_number || 'N/A'}`);
        console.log(`   Client in payment: ${payment.contract?.client?.first_name || 'N/A'} ${payment.contract?.client?.last_name || 'N/A'}`);
      });
    }

    // 3. Test the exact same query that the API endpoint uses
    console.log('\n🔍 Testing API-style query...');
    
    const { data: apiStylePayments, error: apiError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts!inner(
          id,
          contract_number,
          description,
          client:clients!inner(
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .order('due_date', { ascending: false });

    if (apiError) {
      console.error('Error with API-style query:', apiError);
    } else {
      const contractPayments = apiStylePayments.filter(p => p.contract_id === contractWithPayments);
      console.log(`API-style query found ${contractPayments.length} payments for this contract`);
      
      if (contractPayments.length > 0) {
        console.log('First payment from API-style query:');
        const firstPayment = contractPayments[0];
        console.log(`   Amount: ${firstPayment.amount}`);
        console.log(`   Status: ${firstPayment.status}`);
        console.log(`   Contract: ${firstPayment.contract?.contract_number}`);
        console.log(`   Client: ${firstPayment.contract?.client?.first_name} ${firstPayment.contract?.client?.last_name}`);
      }
    }

    // 4. Test with a different contract that might be causing issues
    console.log('\n🔍 Testing another contract...');
    const anotherContract = '47a910c6-4993-496d-b6bb-a46703c888e3'; // Contract 666 with 0 payments
    
    const { data: anotherContractPayments, error: anotherError } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', anotherContract);

    if (anotherError) {
      console.error('Error fetching payments for another contract:', anotherError);
    } else {
      console.log(`Contract ${anotherContract} has ${anotherContractPayments.length} payments`);
    }

  } catch (error) {
    console.error('Error in debug:', error);
  }
}

debugSpecificContract();