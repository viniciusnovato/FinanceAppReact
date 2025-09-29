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
import { Contract } from '../types';
import ApiService from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getContracts();
      if (response.success) {
        setContracts(response.data);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      // Mock data for development
      setContracts([
        {
          id: '1',
          client_id: '1',
          contract_number: 'CTR-001',
          description: 'Contrato de Desenvolvimento Web',
          value: 15000,
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          status: 'active',
          payment_frequency: 'monthly',
          number_of_payments: 6,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          client: {
            id: '1',
            first_name: 'João',
            last_name: 'Silva',
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
          },
        },
        {
          id: '2',
          client_id: '2',
          contract_number: 'CTR-002',
          description: 'Contrato de Consultoria',
          value: 8000,
          start_date: '2024-02-01',
          end_date: '2024-05-31',
          status: 'active',
          payment_frequency: 'monthly',
          number_of_payments: 4,
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-02-01T10:00:00Z',
          client: {
            id: '2',
            first_name: 'Maria',
            last_name: 'Santos',
            created_at: '2024-01-16T10:00:00Z',
            updated_at: '2024-01-16T10:00:00Z',
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContracts();
    setRefreshing(false);
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
      await ApiService.deleteContract(contractId);
      setContracts(contracts.filter(contract => contract.id !== contractId));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o contrato.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'completed':
        return '#007AFF';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'draft':
        return 'Rascunho';
      default:
        return status;
    }
  };

  const renderContractItem = ({ item }: { item: Contract }) => (
    <Card style={styles.contractCard}>
      <View style={styles.contractHeader}>
        <View style={styles.contractInfo}>
          <Text style={styles.contractNumber}>{item.contract_number}</Text>
          <Text style={styles.contractDescription}>{item.description}</Text>
          <Text style={styles.clientName}>
            Cliente: {item.client?.first_name} {item.client?.last_name}
          </Text>
        </View>
        <View style={styles.contractMeta}>
          <Text style={styles.contractValue}>
            {formatCurrency(item.value || 0)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status || '')}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status || '') },
              ]}
            >
              {getStatusLabel(item.status || '')}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contractDetails}>
        <Text style={styles.detailText}>
          Início: {new Date(item.start_date || '').toLocaleDateString('pt-BR')}
        </Text>
        <Text style={styles.detailText}>
          Fim: {new Date(item.end_date || '').toLocaleDateString('pt-BR')}
        </Text>
        <Text style={styles.detailText}>
          Pagamentos: {item.number_of_payments || 0}x
        </Text>
      </View>

      <View style={styles.contractActions}>
        <Button
          title="Ver Pagamentos"
          variant="secondary"
          size="small"
          onPress={() => {
            Alert.alert('Info', 'Navegação para pagamentos em desenvolvimento');
          }}
          style={styles.actionButton}
        />
        <Button
          title="Editar"
          variant="secondary"
          size="small"
          onPress={() => {
            Alert.alert('Info', 'Funcionalidade de edição em desenvolvimento');
          }}
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          variant="danger"
          size="small"
          onPress={() => handleDeleteContract(item.id)}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (isLoading && contracts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando contratos...</Text>
      </View>
    );
  }

  return (
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

      <FlatList
        data={contracts}
        renderItem={renderContractItem}
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
  contractCard: {
    marginBottom: 12,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contractInfo: {
    flex: 1,
  },
  contractNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  contractDescription: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contractMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  contractValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contractDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  contractActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 8,
    marginTop: 4,
  },
});

export default ContractsScreen;