const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Create test clients
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          first_name: 'João',
          last_name: 'Silva',
          email: 'joao.silva@email.com',
          phone: '11999999999',
          address: 'Rua das Flores, 123, São Paulo, SP'
        },
        {
          first_name: 'Maria',
          last_name: 'Santos',
          email: 'maria.santos@email.com',
          phone: '11888888888',
          address: 'Av. Paulista, 456, São Paulo, SP'
        }
      ])
      .select();

    if (clientError) {
      console.error('Error creating clients:', clientError);
      return;
    }

    console.log('Clients created:', clients);

    // Create test contracts
    const { data: contracts, error: contractError } = await supabase
      .from('contracts')
      .insert([
        {
          client_id: clients[0].id,
          contract_number: 'CONT-001',
          description: 'Contrato de prestação de serviços de consultoria',
          value: 5000.00,
          start_date: '2024-01-01',
          end_date: '2024-10-31',
          status: 'ativo'
        },
        {
          client_id: clients[1].id,
          contract_number: 'CONT-002',
          description: 'Contrato de consultoria em gestão empresarial',
          value: 3000.00,
          start_date: '2024-02-01',
          end_date: '2024-07-31',
          status: 'ativo'
        }
      ])
      .select();

    if (contractError) {
      console.error('Error creating contracts:', contractError);
      return;
    }

    console.log('Contracts created:', contracts);

    // Create test payments for first contract
    const paymentsContract1 = [];
    for (let i = 1; i <= 10; i++) {
      const dueDate = new Date(2024, i - 1, 15); // 15th of each month
      const isPaid = i <= 3; // First 3 payments are paid
      
      paymentsContract1.push({
        contract_id: contracts[0].id,
        amount: 500.00,
        due_date: dueDate.toISOString().split('T')[0],
        status: isPaid ? 'paid' : (dueDate < new Date() ? 'overdue' : 'pending'),
        payment_method: isPaid ? 'credit_card' : null,
        paid_date: isPaid ? dueDate.toISOString().split('T')[0] : null,
        notes: `Parcela ${i} de 10`
      });
    }

    // Create test payments for second contract
    const paymentsContract2 = [];
    for (let i = 1; i <= 6; i++) {
      const dueDate = new Date(2024, i + 1, 10); // 10th of each month starting from March
      const isPaid = i <= 2; // First 2 payments are paid
      
      paymentsContract2.push({
        contract_id: contracts[1].id,
        amount: 500.00,
        due_date: dueDate.toISOString().split('T')[0],
        status: isPaid ? 'paid' : (dueDate < new Date() ? 'overdue' : 'pending'),
        payment_method: isPaid ? 'bank_transfer' : null,
        paid_date: isPaid ? dueDate.toISOString().split('T')[0] : null,
        notes: `Parcela ${i} de 6`
      });
    }

    const allPayments = [...paymentsContract1, ...paymentsContract2];

    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .insert(allPayments)
      .select();

    if (paymentError) {
      console.error('Error creating payments:', paymentError);
      return;
    }

    console.log('Payments created:', payments.length);
    console.log('Test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData();