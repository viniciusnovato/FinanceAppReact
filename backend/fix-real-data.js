const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRealData() {
  try {
    console.log('=== FIXING REAL DATA ISSUES ===\n');

    // Fix contract without contract_number
    const contractWithoutNumber = '7e562561-f181-4b8d-a901-711ae74e74bf';
    
    console.log('🔧 Fixing contract without contract_number...');
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({ contract_number: 'CONT-WEB-001' })
      .eq('id', contractWithoutNumber)
      .select();

    if (updateError) {
      console.error('Error updating contract:', updateError);
    } else {
      console.log('✅ Contract updated successfully:', updatedContract[0]);
    }

    // Check if the specific contract that user is clicking has payments
    console.log('\n🔍 Checking specific contracts for debugging...');
    
    // Let's check a few real contracts to see their payment status
    const { data: sampleContracts, error: sampleError } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        description,
        client_id,
        payments (
          id,
          amount,
          status,
          due_date
        )
      `)
      .limit(5);

    if (sampleError) {
      console.error('Error fetching sample contracts:', sampleError);
    } else {
      console.log('Sample contracts with their payments:');
      sampleContracts.forEach((contract, index) => {
        console.log(`${index + 1}. Contract: ${contract.contract_number}`);
        console.log(`   ID: ${contract.id}`);
        console.log(`   Description: ${contract.description}`);
        console.log(`   Payments: ${contract.payments?.length || 0}`);
        if (contract.payments && contract.payments.length > 0) {
          console.log(`   First payment: ${contract.payments[0].amount} - ${contract.payments[0].status}`);
        }
        console.log('   ---');
      });
    }

    // Let's also check what happens when we query payments for a specific contract
    console.log('\n🔍 Testing payment query for a specific contract...');
    const testContractId = '47a910c6-4993-496d-b6bb-a46703c888e3'; // Contract 666
    
    const { data: testPayments, error: testError } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', testContractId);

    if (testError) {
      console.error('Error fetching test payments:', testError);
    } else {
      console.log(`Payments for contract ${testContractId}:`, testPayments.length);
      if (testPayments.length > 0) {
        console.log('First payment:', testPayments[0]);
      }
    }

  } catch (error) {
    console.error('Error fixing real data:', error);
  }
}

fixRealData();