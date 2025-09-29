import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Client } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';

const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getClients();
      if (response.success && response.data) {
        setClients(response.data);
      } else {
        console.warn('API response not successful or no data:', response);
        setClients([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes. Verifique sua conexão.');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
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
      const response = await ApiService.deleteClient(clientId);
      if (response.success) {
        setClients(clients.filter(client => client.id !== clientId));
        Alert.alert('Sucesso', 'Cliente excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cliente');
    }
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    
    const sortedClients = [...clients].sort((a, b) => {
      let aValue = a[column as keyof Client] as any;
      let bValue = b[column as keyof Client] as any;
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setClients(sortedClients);
  };

  const handleRowPress = (client: Client) => {
    Alert.alert(
      'Ações do Cliente',
      `${client.first_name} ${client.last_name}`,
      [
        { text: 'Editar', onPress: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento') },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteClient(client.id) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const renderStatusBadge = (client: Client, status: string) => (
    <View style={[
      styles.statusBadge,
      status === 'active' ? styles.activeBadge : styles.inactiveBadge
    ]}>
      <Text style={[
        styles.statusText,
        { color: status === 'active' ? '#34C759' : '#FF3B30' }
      ]}>
        {status === 'active' ? 'Ativo' : 'Inativo'}
      </Text>
    </View>
  );

  const columns: DataTableColumn[] = [
    {
      key: 'first_name',
      title: 'Nome',
      width: 120,
      sortable: true,
      render: (client: Client) => `${client.first_name} ${client.last_name}`,
    },
    {
      key: 'email',
      title: 'Email',
      width: 180,
      sortable: true,
    },
    {
      key: 'phone',
      title: 'Telefone',
      width: 140,
      sortable: false,
    },
    {
      key: 'status',
      title: 'Status',
      width: 100,
      sortable: true,
      render: renderStatusBadge,
    },
    {
      key: 'created_at',
      title: 'Criado em',
      width: 120,
      sortable: true,
      render: (client: Client) => new Date(client.created_at).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <MainLayout activeRoute="Clientes">
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

        <DataTable
          data={clients}
          columns={columns}
          loading={isLoading}
          onRowPress={handleRowPress}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          emptyMessage="Nenhum cliente encontrado"
          keyExtractor={(item) => item.id}
        />
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ClientsScreen;