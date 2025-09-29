import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Payment } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';
import { formatCurrency } from '../utils/currency';

type PaymentFilter = 'all' | 'pending' | 'paid' | 'overdue' | 'cancelled';

const PaymentsScreen: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('all');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
      if (response.success && response.data) {
        setPayments(response.data);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os pagamentos');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Erro', 'Falha ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;
    
    if (activeFilter !== 'all') {
      filtered = payments.filter(payment => {
        if (activeFilter === 'overdue') {
          return payment.status === 'pending' && new Date(payment.due_date || '') < new Date();
        }
        return payment.status === activeFilter;
      });
    }
    
    setFilteredPayments(filtered);
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
      const response = await ApiService.deletePayment(paymentId);
      if (response.success) {
        setPayments(payments.filter(payment => payment.id !== paymentId));
        Alert.alert('Sucesso', 'Pagamento excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      Alert.alert('Erro', 'Não foi possível excluir o pagamento');
    }
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    
    const sortedPayments = [...filteredPayments].sort((a, b) => {
      let aValue = a[column as keyof Payment] as any;
      let bValue = b[column as keyof Payment] as any;
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredPayments(sortedPayments);
  };

  const handleRowPress = (payment: Payment) => {
    Alert.alert(
      'Ações do Pagamento',
      `${payment.contract?.contract_number} - ${formatCurrency(payment.amount || 0)}`,
      [
        { text: 'Marcar como Pago', onPress: () => markAsPaid(payment.id) },
        { text: 'Editar', onPress: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento') },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeletePayment(payment.id) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      // Simulate API call
      const updatedPayments = payments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'paid' as const, paid_date: new Date().toISOString() }
          : payment
      );
      setPayments(updatedPayments);
      Alert.alert('Sucesso', 'Pagamento marcado como pago');
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o pagamento');
    }
  };

  const renderStatusBadge = (payment: Payment, status: string) => (
    <View style={[
      styles.statusBadge,
      status === 'paid' ? styles.paidBadge : 
      status === 'pending' ? styles.pendingBadge :
      status === 'overdue' ? styles.overdueBadge : styles.cancelledBadge
    ]}>
      <Text style={[
        styles.statusText,
        { color: status === 'paid' ? '#34C759' : 
                 status === 'pending' ? '#FF9500' :
                 status === 'overdue' ? '#FF3B30' : '#8E8E93' }
      ]}>
        {status === 'paid' ? 'Pago' : 
         status === 'pending' ? 'Pendente' :
         status === 'overdue' ? 'Atrasado' : 'Cancelado'}
      </Text>
    </View>
  );

  const getFilterLabel = (filter: PaymentFilter) => {
    switch (filter) {
      case 'all': return 'Todos';
      case 'pending': return 'Pendentes';
      case 'paid': return 'Pagos';
      case 'overdue': return 'Atrasados';
      case 'cancelled': return 'Cancelados';
      default: return filter;
    }
  };

  const columns: DataTableColumn[] = [
    {
      key: 'contract',
      title: 'Contrato',
      width: 120,
      sortable: false,
      render: (payment: Payment) => payment.contract?.contract_number || 'N/A',
    },
    {
      key: 'client',
      title: 'Cliente',
      width: 140,
      sortable: false,
      render: (payment: Payment) => 
        payment.contract?.client ? 
          `${payment.contract.client.first_name} ${payment.contract.client.last_name}` : 'N/A',
    },
    {
      key: 'amount',
      title: 'Valor',
      width: 120,
      sortable: true,
      render: (payment: Payment) => formatCurrency(payment.amount || 0),
    },
    {
      key: 'due_date',
      title: 'Vencimento',
      width: 120,
      sortable: true,
      render: (payment: Payment) => new Date(payment.due_date || '').toLocaleDateString('pt-BR'),
    },
    {
      key: 'status',
      title: 'Status',
      width: 100,
      sortable: true,
      render: renderStatusBadge,
    },
    {
      key: 'payment_method',
      title: 'Método',
      width: 120,
      sortable: false,
      render: (payment: Payment) => {
        const method = payment.payment_method;
        return method === 'bank_transfer' ? 'Transferência' :
               method === 'pix' ? 'PIX' :
               method === 'credit_card' ? 'Cartão' : method || 'N/A';
      },
    },
  ];

  const filters: PaymentFilter[] = ['all', 'pending', 'paid', 'overdue', 'cancelled'];

  return (
    <MainLayout activeRoute="Pagamentos">
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

        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.activeFilterButton,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    activeFilter === filter && styles.activeFilterButtonText,
                  ]}
                >
                  {getFilterLabel(filter)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <DataTable
          data={filteredPayments}
          columns={columns}
          loading={isLoading}
          onRowPress={handleRowPress}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          emptyMessage="Nenhum pagamento encontrado"
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
  filtersContainer: {
    marginBottom: 20,
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
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
  },
  cancelledBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PaymentsScreen;