const axios = require('axios');

async function debugAuth() {
  try {
    console.log('🔍 Debugando autenticação...\n');

    // Login
    console.log('📋 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ Login response:', {
      status: loginResponse.status,
      data: loginResponse.data
    });

    const token = loginResponse.data.data?.token;
    if (!token) {
      console.log('❌ Token não encontrado na resposta');
      return;
    }

    console.log('🔑 Token:', token.substring(0, 50) + '...\n');

    // Testar endpoint protegido
    console.log('📋 Testando endpoint protegido...');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Endpoint protegido funcionou:', response.status);
    } catch (error) {
      console.log('❌ Erro no endpoint protegido:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Headers enviados:', error.config?.headers);
    }

  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
  }
}

debugAuth();