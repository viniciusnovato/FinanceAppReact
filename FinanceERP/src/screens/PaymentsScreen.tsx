import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Payment } from '../types';
import ApiService from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

type PaymentFilter = 'all' | 'pending' | 'paid' | 'overdue' | 'cancelled';

const PaymentsScreen: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, activeFilter]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getPayments();
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      // Mock data for development
      setPayments([
        {
          id: '1',
          contract_id: '1',
          amount: 2500,
          due_date: '2024-01-15',
          paid_date: '2024-01-14',
          status: 'paid',
          payment_method: 'bank_transfer',
          notes: 'Pagamento 1/6 - Desenvolvimento Web',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-14T15:30:00Z',
          contract: {
            id: '1',
            client_id: '1',
            contract_number: 'CTR-001',
            description: 'Contrato de Desenvolvimento Web',
            client: {
              id: '1',
              first_name: 'João',
              last_name: 'Silva',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z',
            },
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
          },
        },
        {
          id: '2',
          contract_id: '1',
          amount: 2500,
          due_date: '2024-02-15',
          status: 'pending',
          payment_method: 'bank_transfer',
          notes: 'Pagamento 2/6 - Desenvolvimento Web',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          contract: {
            id: '1',
            client_id: '1',
            contract_number: 'CTR-001',
            description: 'Contrato de Desenvolvimento Web',
            client: {
              id: '1',
              first_name: 'João',
              last_name: 'Silva',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z',
            },
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
          },
        },
        {
          id: '3',
          contract_id: '2',
          amount: 2000,
          due_date: '2024-01-10',
          status: 'overdue',
          payment_method: 'pix',
          notes: 'Pagamento 1/4 - Consultoria',
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-02-01T10:00:00Z',
          contract: {
            id: '2',
            client_id: '2',
            contract_number: 'CTR-002',
            description: 'Contrato de Consultoria',
            client: {
              id: '2',
              first_name: 'Maria',
              last_name: 'Santos',
              created_at: '2024-01-16T10:00:00Z',
              updated_at: '2024-01-16T10:00:00Z',
            },
            created_at: '2024-02-01T10:00:00Z',
            updated_at: '2024-02-01T10:00:00Z',
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;
    
    if (activeFilter !== 'all') {
      filtered = payments.filter(payment => payment.status === activeFilter);
    }
    
    setFilteredPayments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este pagamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletePayment(paymentId),
        },
      ]
    );
  };

  const deletePayment = async (paymentId: string) => {
    try {
      await ApiService.deletePayment(paymentId);
      setPayments(payments.filter(payment => payment.id !== paymentId));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o pagamento.');
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      const updatedPayments = payments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: 'paid' as const, paid_date: new Date().toISOString() }
          : payment
      );
      setPayments(updatedPayments);
      Alert.alert('Sucesso', 'Pagamento marcado como pago!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o pagamento.');
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
      case 'paid':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'overdue':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Transferência';
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'cash':
        return 'Dinheiro';
      default:
        return method;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    return new Date(dueDate) < new Date();
  };

  const filters: { key: PaymentFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: payments.length },
    { key: 'pending', label: 'Pendentes', count: payments.filter(p => p.status === 'pending').length },
    { key: 'paid', label: 'Pagos', count: payments.filter(p => p.status === 'paid').length },
    { key: 'overdue', label: 'Atrasados', count: payments.filter(p => p.status === 'overdue').length },
    { key: 'cancelled', label: 'Cancelados', count: payments.filter(p => p.status === 'cancelled').length },
  ];

  const renderFilterButton = (filter: { key: PaymentFilter; label: string; count: number }) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        activeFilter === filter.key && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(filter.key)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter.key && styles.activeFilterButtonText,
        ]}
      >
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentDescription}>{item.notes}</Text>
          <Text style={styles.contractInfo}>
            {item.contract?.contract_number} - {item.contract?.client?.first_name} {item.contract?.client?.last_name}
          </Text>
        </View>
        <View style={styles.paymentMeta}>
          <Text style={styles.paymentAmount}>
            {formatCurrency(item.amount || 0)}
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
      
      <View style={styles.paymentDetails}>
        <Text style={styles.detailText}>
          Vencimento: {new Date(item.due_date || '').toLocaleDateString('pt-BR')}
        </Text>
        {item.paid_date && (
          <Text style={styles.detailText}>
            Pago em: {new Date(item.paid_date).toLocaleDateString('pt-BR')}
          </Text>
        )}
        <Text style={styles.detailText}>
          Método: {getPaymentMethodLabel(item.payment_method || '')}
        </Text>
      </View>

      {isOverdue(item.due_date || '', item.status || '') && (
        <View style={styles.overdueWarning}>
          <Text style={styles.overdueText}>⚠️ Pagamento em atraso</Text>
        </View>
      )}

      <View style={styles.paymentActions}>
        {item.status === 'pending' && (
          <Button
            title="Marcar como Pago"
            variant="primary"
            size="small"
            onPress={() => markAsPaid(item.id)}
            style={styles.actionButton}
          />
        )}
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
          onPress={() => handleDeletePayment(item.id)}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (isLoading && payments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando pagamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos</Text>
        <Button
          title="Novo Pagamento"
          onPress={() => {
            Alert.alert('Info', 'Funcionalidade de cadastro em desenvolvimento');
          }}
          size="small"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(renderFilterButton)}
      </ScrollView>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
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
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  contractInfo: {
    fontSize: 14,
    color: '#8E8E93',
  },
  paymentMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
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
  paymentDetails: {
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
  overdueWarning: {
    backgroundColor: '#FF3B3020',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  overdueText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 8,
    marginTop: 4,
  },
});

export default PaymentsScreen;