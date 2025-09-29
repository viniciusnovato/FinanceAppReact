import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Contract } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';
import { formatCurrency } from '../utils/currency';

const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getContracts();
      if (response.success && response.data) {
        setContracts(response.data);
      } else {
        console.warn('API response not successful or no data:', response);
        setContracts([]);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      Alert.alert('Erro', 'Não foi possível carregar os contratos. Verifique sua conexão.');
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContract = (contractId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este contrato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteContract(contractId),
        },
      ]
    );
  };

  const deleteContract = async (contractId: string) => {
    try {
      const response = await ApiService.deleteContract(contractId);
      if (response.success) {
        setContracts(contracts.filter(contract => contract.id !== contractId));
        Alert.alert('Sucesso', 'Contrato excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      Alert.alert('Erro', 'Não foi possível excluir o contrato');
    }
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    
    const sortedContracts = [...contracts].sort((a, b) => {
      let aValue = a[column as keyof Contract] as any;
      let bValue = b[column as keyof Contract] as any;
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setContracts(sortedContracts);
  };

  const handleRowPress = (contract: Contract) => {
    Alert.alert(
      'Ações do Contrato',
      `${contract.contract_number} - ${contract.description}`,
      [
        { text: 'Editar', onPress: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento') },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteContract(contract.id) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const renderStatusBadge = (contract: Contract, status: string) => (
    <View style={[
      styles.statusBadge,
      status === 'active' ? styles.activeBadge : 
      status === 'completed' ? styles.completedBadge : styles.inactiveBadge
    ]}>
      <Text style={[
        styles.statusText,
        { color: status === 'active' ? '#34C759' : 
                 status === 'completed' ? '#007AFF' : '#FF3B30' }
      ]}>
        {status === 'active' ? 'Ativo' : 
         status === 'completed' ? 'Concluído' : 'Inativo'}
      </Text>
    </View>
  );

  const columns: DataTableColumn[] = [
    {
      key: 'contract_number',
      title: 'Número',
      width: 100,
      sortable: true,
    },
    {
      key: 'description',
      title: 'Descrição',
      width: 200,
      sortable: true,
    },
    {
      key: 'client',
      title: 'Cliente',
      width: 140,
      sortable: false,
      render: (contract: Contract) => 
        contract.client ? `${contract.client.first_name} ${contract.client.last_name}` : 'N/A',
    },
    {
      key: 'value',
      title: 'Valor',
      width: 120,
      sortable: true,
      render: (contract: Contract) => formatCurrency(contract.value || 0),
    },
    {
      key: 'status',
      title: 'Status',
      width: 100,
      sortable: true,
      render: renderStatusBadge,
    },
    {
      key: 'start_date',
      title: 'Início',
      width: 100,
      sortable: true,
      render: (contract: Contract) => new Date(contract.start_date || '').toLocaleDateString('pt-BR'),
    },
    {
      key: 'end_date',
      title: 'Fim',
      width: 100,
      sortable: true,
      render: (contract: Contract) => new Date(contract.end_date || '').toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <MainLayout activeRoute="Contratos">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contratos</Text>
          <Button
            title="Novo Contrato"
            onPress={() => {
              Alert.alert('Info', 'Funcionalidade de cadastro em desenvolvimento');
            }}
            size="small"
          />
        </View>

        <DataTable
          data={contracts}
          columns={columns}
          loading={isLoading}
          onRowPress={handleRowPress}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          emptyMessage="Nenhum contrato encontrado"
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
  completedBadge: {
    backgroundColor: '#DBEAFE',
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

export default ContractsScreen;