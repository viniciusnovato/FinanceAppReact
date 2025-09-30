import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Payment } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';
import { formatCurrency } from '../utils/currency';
import PaymentForm from '../components/forms/PaymentForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const ITEMS_PER_PAGE = isTablet ? 10 : 8;

type PaymentFilter = 'all' | 'pending' | 'paid' | 'overdue' | 'cancelled';

const filters = [
  { key: 'all' as PaymentFilter, label: 'Todos' },
  { key: 'pending' as PaymentFilter, label: 'Pendentes' },
  { key: 'paid' as PaymentFilter, label: 'Pagos' },
  { key: 'overdue' as PaymentFilter, label: 'Atrasados' },
  { key: 'cancelled' as PaymentFilter, label: 'Cancelados' },
];

const PaymentsScreen: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('all');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Calculate total pages using useMemo to avoid unnecessary recalculations
  const totalPages = useMemo(() => {
    return Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  }, [filteredPayments.length]);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, activeFilter, searchQuery]);

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
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(payment => {
        if (activeFilter === 'overdue') {
          // Backend automatically sets status to 'overdue' for past due payments
          // Also check for 'pending' payments with past due dates as fallback
          return payment.status === 'overdue' || 
                 (payment.status === 'pending' && new Date(payment.due_date || '') < new Date());
        }
        return payment.status === activeFilter;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(payment => {
        // Search by client name
        const clientName = payment.contract?.client 
          ? `${payment.contract.client.first_name || ''} ${payment.contract.client.last_name || ''}`.toLowerCase().trim()
          : '';
        
        // Search by contract number
        const contractNumber = payment.contract?.contract_number?.toLowerCase() || '';
        
        // Search by payment ID (as a substitute for installment number)
        const paymentId = payment.id?.toLowerCase() || '';
        
        return clientName.includes(query) || 
               contractNumber.includes(query) || 
               paymentId.includes(query);
      });
    }
    
    setFilteredPayments(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, endIndex);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = isTablet ? 7 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} de {filteredPayments.length} pagamentos
          </Text>
        </View>
        
        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <Ionicons 
              name="chevron-back" 
              size={16} 
              color={currentPage === 1 ? '#9CA3AF' : '#374151'} 
            />
          </TouchableOpacity>

          {startPage > 1 && (
            <React.Fragment key="start-pagination">
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={() => goToPage(1)}
              >
                <Text style={styles.paginationButtonText}>1</Text>
              </TouchableOpacity>
              {startPage > 2 && (
                <Text key="start-ellipsis" style={styles.paginationEllipsis}>...</Text>
              )}
            </React.Fragment>
          )}

          {pageNumbers.map((pageNumber) => (
            <TouchableOpacity
              key={pageNumber}
              style={[
                styles.paginationButton,
                currentPage === pageNumber && styles.paginationButtonActive
              ]}
              onPress={() => goToPage(pageNumber)}
            >
              <Text style={[
                styles.paginationButtonText,
                currentPage === pageNumber && styles.paginationButtonTextActive
              ]}>
                {pageNumber}
              </Text>
            </TouchableOpacity>
          ))}

          {endPage < totalPages && (
            <React.Fragment key="end-pagination">
              {endPage < totalPages - 1 && (
                <Text key="end-ellipsis" style={styles.paginationEllipsis}>...</Text>
              )}
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={() => goToPage(totalPages)}
              >
                <Text style={styles.paginationButtonText}>{totalPages}</Text>
              </TouchableOpacity>
            </React.Fragment>
          )}

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={currentPage === totalPages ? '#9CA3AF' : '#374151'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
    setShowConfirmDialog(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      const response = await ApiService.deletePayment(paymentToDelete.id);
      if (response.success) {
        setPayments(payments.filter(payment => payment.id !== paymentToDelete.id));
        Alert.alert('Sucesso', 'Pagamento excluído com sucesso');
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o pagamento');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      Alert.alert('Erro', 'Não foi possível excluir o pagamento');
    } finally {
      setShowConfirmDialog(false);
      setPaymentToDelete(null);
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
    setCurrentPage(1); // Reset to first page after sorting
  };

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleSubmitPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      
      let response;
      if (editingPayment) {
        // Update existing payment
        response = await ApiService.updatePayment(editingPayment.id, paymentData);
        if (response.success && response.data) {
          setPayments(payments.map(payment => 
            payment.id === editingPayment.id ? response.data! : payment
          ));
          Alert.alert('Sucesso', 'Pagamento atualizado com sucesso');
        }
      } else {
        // Create new payment
        response = await ApiService.createPayment(paymentData);
        if (response.success && response.data) {
          setPayments([...payments, response.data]);
          Alert.alert('Sucesso', 'Pagamento criado com sucesso');
        }
      }
      
      if (!response.success) {
        Alert.alert('Erro', 'Falha ao salvar pagamento');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      Alert.alert('Erro', 'Falha ao salvar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setEditingPayment(null);
  };

  const handleRowPress = (payment: Payment) => {
    Alert.alert(
      'Ações do Pagamento',
      `${payment.contract?.contract_number} - ${formatCurrency(payment.amount || 0)}`,
      [
        { text: 'Marcar como Pago', onPress: () => markAsPago(payment.id) },
        { text: 'Editar', onPress: () => handleEditPayment(payment) },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeletePayment(payment) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const markAsPago = async (paymentId: string) => {
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
    {
      key: 'actions',
      title: 'Ações',
      sortable: false,
      width: 120,
      render: (payment: Payment) => (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditPayment(payment)}
          >
            <Ionicons name="pencil" size={16} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePayment(payment)}
          >
            <Ionicons name="trash" size={16} color="#DC3545" />
          </TouchableOpacity>
        </View>
      ),
    },
  ];



  return (
    <MainLayout activeRoute="Payments">
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Pagamentos</Text>
            <Button
              title="Novo Pagamento"
              onPress={handleCreatePayment}
              variant="primary"
            />
          </View>

          <View style={styles.searchContainer}>
            <Input
              placeholder="Buscar por nome do cliente, número do contrato ou ID do pagamento..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
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
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <DataTable
            data={getCurrentPageData()}
            columns={columns}
            loading={isLoading}
            onSort={handleSort}
            onRowPress={handleRowPress}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            keyExtractor={(item) => item.id}
          />

          {renderPaginationControls()}
        </View>
      </ScrollView>
      
      <PaymentForm
        visible={showPaymentForm}
        onClose={handleClosePaymentForm}
        onSubmit={handleSubmitPayment}
        payment={editingPayment}
        isLoading={isSubmitting}
      />
      
      <ConfirmDialog
        visible={showConfirmDialog}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o pagamento de ${paymentToDelete?.contract?.contract_number}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeletePayment}
        onCancel={() => setShowConfirmDialog(false)}
        isDestructive={true}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 0,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  paginationContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  paginationInfo: {
    marginBottom: 12,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#64748B',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationButton: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
  paginationButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  paginationButtonTextActive: {
    color: '#FFFFFF',
  },
  paginationEllipsis: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
});

export default PaymentsScreen;