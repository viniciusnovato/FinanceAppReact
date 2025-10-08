async function testOverdueFilter() {
  try {
    // Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login realizado com sucesso');

    // Testar filtro de pagamentos atrasados
    console.log('\n🔍 Testando filtro de pagamentos atrasados...');
    const overdueResponse = await fetch('http://localhost:3000/api/payments/paginated?status=overdue&page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!overdueResponse.ok) {
      throw new Error(`API request failed: ${overdueResponse.status}`);
    }

    const overdueData = await overdueResponse.json();
    console.log('📊 Resultado do filtro de atrasados:');
    console.log('- Total de pagamentos:', overdueData.data?.total || 0);
    console.log('- Pagamentos na página:', overdueData.data?.data?.length || 0);
    
    if (overdueData.data?.data?.length > 0) {
      console.log('\n📋 Primeiros pagamentos atrasados:');
      overdueData.data.data.slice(0, 3).forEach((payment, index) => {
        console.log(`  ${index + 1}. ID: ${payment.id}, Vencimento: ${payment.due_date}, Status: ${payment.status}`);
      });
    } else {
      console.log('⚠️  Nenhum pagamento atrasado encontrado');
    }

    // Testar filtro de pagamentos pendentes para comparação
    console.log('\n🔍 Testando filtro de pagamentos pendentes para comparação...');
    const pendingResponse = await fetch('http://localhost:3000/api/payments/paginated?status=pending&page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log('📊 Resultado do filtro de pendentes:');
      console.log('- Total de pagamentos:', pendingData.data?.total || 0);
      console.log('- Pagamentos na página:', pendingData.data?.data?.length || 0);
      
      if (pendingData.data?.data?.length > 0) {
        console.log('\n📋 Primeiros pagamentos pendentes:');
        pendingData.data.data.slice(0, 3).forEach((payment, index) => {
          const today = new Date().toISOString().split('T')[0];
          const isOverdue = payment.due_date < today;
          console.log(`  ${index + 1}. ID: ${payment.id}, Vencimento: ${payment.due_date}, Status: ${payment.status}${isOverdue ? ' (DEVERIA SER ATRASADO!)' : ''}`);
        });
      }
    }

    // Testar todos os pagamentos para ver a distribuição
    console.log('\n🔍 Testando todos os pagamentos...');
    const allResponse = await fetch('http://localhost:3000/api/payments/paginated?page=1&limit=50', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (allResponse.ok) {
      const allData = await allResponse.json();
      console.log('📊 Todos os pagamentos:');
      console.log('- Total de pagamentos:', allData.data?.total || 0);
      
      if (allData.data?.data?.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const statusCount = {};
        let realOverdueCount = 0;
        
        allData.data.data.forEach(payment => {
          statusCount[payment.status] = (statusCount[payment.status] || 0) + 1;
          
          // Verificar se é realmente atrasado
          if (payment.status === 'pending' && payment.due_date < today) {
            realOverdueCount++;
          }
        });
        
        console.log('📈 Distribuição por status:');
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`  - ${status}: ${count}`);
        });
        
        console.log(`🚨 Pagamentos que DEVERIAM estar atrasados: ${realOverdueCount}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testOverdueFilter();