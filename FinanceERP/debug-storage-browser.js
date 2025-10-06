// Script para verificar AsyncStorage no navegador
console.log('🔍 === VERIFICANDO ASYNCSTORAGE ===');

// Função para verificar AsyncStorage
async function checkAsyncStorage() {
  try {
    // Importar AsyncStorage (simulação para web)
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    console.log('📱 Verificando tokens armazenados...');
    
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');
    
    console.log('🔑 Token encontrado:', !!token);
    console.log('🔑 Token length:', token?.length || 0);
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    }
    
    console.log('👤 User data encontrado:', !!userData);
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('👤 User email:', parsedUser.email);
        console.log('👤 User name:', parsedUser.name);
      } catch (e) {
        console.log('👤 Erro ao parsear user data:', e.message);
      }
    }
    
    // Listar todas as chaves
    console.log('📋 Todas as chaves no AsyncStorage:');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 Keys:', allKeys);
    
    // Obter todos os valores
    if (allKeys.length > 0) {
      const allValues = await AsyncStorage.multiGet(allKeys);
      console.log('📋 Todos os valores:');
      allValues.forEach(([key, value]) => {
        console.log(`📋 ${key}:`, value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'null');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar AsyncStorage:', error);
  }
}

// Executar verificação
checkAsyncStorage();
