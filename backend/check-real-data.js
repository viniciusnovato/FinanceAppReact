const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRealData() {
  try {
    console.log('=== CHECKING REAL DATA STRUCTURE ===\n');

    // Check all clients
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientError) {
      console.error('Error fetching clients:', clientError);
      return;
    }

    console.log('📋 CLIENTS FOUND:', clients.length);
    console.log('First few clients:');
    clients.slice(0, 3).forEach((client, index) => {
      console.log(`${index + 1}. ID: ${client.id}`);
      console.log(`   Name: ${client.first_name || 'N/A'} ${client.last_name || 'N/A'}`);
      console.log(`   Email: ${client.email || 'N/A'}`);
      console.log(`   Created: ${client.created_at}`);
      console.log('   ---');
    });

    // Check all contracts
    const { data: contracts, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (contractError) {
      console.error('Error fetching contracts:', contractError);
      return;
    }

    console.log('\n📄 CONTRACTS FOUND:', contracts.length);
    console.log('First few contracts:');
    contracts.slice(0, 3).forEach((contract, index) => {
      console.log(`${index + 1}. ID: ${contract.id}`);
      console.log(`   Client ID: ${contract.client_id}`);
      console.log(`   Contract Number: ${contract.contract_number || 'N/A'}`);
      console.log(`   Description: ${contract.description || 'N/A'}`);
      console.log(`   Value: ${contract.value || 'N/A'}`);
      console.log(`   Status: ${contract.status || 'N/A'}`);
      console.log(`   Created: ${contract.created_at}`);
      console.log('   ---');
    });

    // Check all payments
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentError) {
      console.error('Error fetching payments:', paymentError);
      return;
    }

    console.log('\n💰 PAYMENTS FOUND:', payments.length);
    console.log('First few payments:');
    payments.slice(0, 5).forEach((payment, index) => {
      console.log(`${index + 1}. ID: ${payment.id}`);
      console.log(`   Contract ID: ${payment.contract_id}`);
      console.log(`   Amount: ${payment.amount || 'N/A'}`);
      console.log(`   Due Date: ${payment.due_date || 'N/A'}`);
      console.log(`   Status: ${payment.status || 'N/A'}`);
      console.log(`   Created: ${payment.created_at}`);
      console.log('   ---');
    });

    // Check for orphaned payments (payments without valid contracts)
    console.log('\n🔍 CHECKING FOR ORPHANED PAYMENTS...');
    const contractIds = contracts.map(c => c.id);
    const orphanedPayments = payments.filter(p => !contractIds.includes(p.contract_id));
    
    if (orphanedPayments.length > 0) {
      console.log(`⚠️  FOUND ${orphanedPayments.length} ORPHANED PAYMENTS:`);
      orphanedPayments.forEach((payment, index) => {
        console.log(`${index + 1}. Payment ID: ${payment.id}, Contract ID: ${payment.contract_id} (NOT FOUND)`);
      });
    } else {
      console.log('✅ No orphaned payments found');
    }

    // Check for contracts without payments
    console.log('\n🔍 CHECKING FOR CONTRACTS WITHOUT PAYMENTS...');
    const paymentContractIds = [...new Set(payments.map(p => p.contract_id))];
    const contractsWithoutPayments = contracts.filter(c => !paymentContractIds.includes(c.id));
    
    if (contractsWithoutPayments.length > 0) {
      console.log(`⚠️  FOUND ${contractsWithoutPayments.length} CONTRACTS WITHOUT PAYMENTS:`);
      contractsWithoutPayments.forEach((contract, index) => {
        console.log(`${index + 1}. Contract ID: ${contract.id}, Number: ${contract.contract_number || 'N/A'}`);
      });
    } else {
      console.log('✅ All contracts have payments');
    }

    // Check for missing contract_number field
    console.log('\n🔍 CHECKING FOR MISSING CONTRACT NUMBERS...');
    const contractsWithoutNumber = contracts.filter(c => !c.contract_number);
    
    if (contractsWithoutNumber.length > 0) {
      console.log(`⚠️  FOUND ${contractsWithoutNumber.length} CONTRACTS WITHOUT CONTRACT_NUMBER:`);
      contractsWithoutNumber.forEach((contract, index) => {
        console.log(`${index + 1}. Contract ID: ${contract.id}, Description: ${contract.description || 'N/A'}`);
      });
    } else {
      console.log('✅ All contracts have contract numbers');
    }

  } catch (error) {
    console.error('Error checking real data:', error);
  }
}

checkRealData();