import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Client } from '../types';
import ApiService from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getClients();
      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      // Mock data for development
      setClients([
        {
          id: '1',
          first_name: 'João',
          last_name: 'Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          first_name: 'Maria',
          last_name: 'Santos',
          email: 'maria@email.com',
          phone: '(11) 88888-8888',
          status: 'active',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleDeleteClient = (clientId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteClient(clientId),
        },
      ]
    );
  };

  const deleteClient = async (clientId: string) => {
    try {
      await ApiService.deleteClient(clientId);
      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o cliente.');
    }
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <Card style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.clientEmail}>{item.email}</Text>
          <Text style={styles.clientPhone}>{item.phone}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              item.status === 'active' ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.clientActions}>
        <Button
          title="Editar"
          variant="secondary"
          size="small"
          onPress={() => {
            // Navigate to edit screen
            Alert.alert('Info', 'Funcionalidade de edição em desenvolvimento');
          }}
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          variant="danger"
          size="small"
          onPress={() => handleDeleteClient(item.id)}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (isLoading && clients.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando clientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Button
          title="Novo Cliente"
          onPress={() => {
            Alert.alert('Info', 'Funcionalidade de cadastro em desenvolvimento');
          }}
          size="small"
        />
      </View>

      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  listContainer: {
    paddingBottom: 20,
  },
  clientCard: {
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default ClientsScreen;