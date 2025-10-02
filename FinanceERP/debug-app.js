// Script de debug para verificar o estado da aplicação
console.log('🔍 === DEBUG DA APLICAÇÃO ===');

// Verificar se AsyncStorage está funcionando
import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
  console.log('✅ AsyncStorage importado com sucesso');
  
  // Verificar se há token armazenado
  AsyncStorage.getItem('auth_token').then(token => {
    console.log('🔑 Token no storage:', token ? 'Existe' : 'Não existe');
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    }
  }).catch(error => {
    console.error('❌ Erro ao acessar AsyncStorage:', error);
  });

  // Verificar dados do usuário
  AsyncStorage.getItem('user_data').then(userData => {
    console.log('👤 Dados do usuário no storage:', userData ? 'Existem' : 'Não existem');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('👤 Usuário:', parsed.email);
      } catch (e) {
        console.error('❌ Erro ao parsear dados do usuário:', e);
      }
    }
  }).catch(error => {
    console.error('❌ Erro ao acessar dados do usuário:', error);
  });
}).catch(error => {
  console.error('❌ Erro ao importar AsyncStorage:', error);
});

// Verificar conectividade com a API
fetch('http://localhost:3000/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('🌐 API Health Check:', data.message);
  })
  .catch(error => {
    console.error('❌ Erro na conectividade com API:', error.message);
  });

console.log('🔍 === FIM DO DEBUG ===');