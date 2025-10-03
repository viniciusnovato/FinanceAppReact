import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Modal } from './common/Modal';
import ApiService from '../services/api';

interface ContractDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  contractId: string | null;
}

interface ContractDetails {
  id: string;
  contract_number: string;
  value: string;
  down_payment: string;
  installments: number;
  number_of_payments: number;
  status: string;
  start_date: string;
  end_date: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  paidPercentage: number;
  totalPaid: number;
  totalPaidFromPayments: number;
  regularPayments: any[];
  complementaryPayments: any[];
  paymentsSummary: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    failed: number;
  };
}

export const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  visible,
  onClose,
  contractId
}) => {
  const [contractDetails, setContractDetails] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && contractId) {
      loadContractDetails();
    }
  }, [visible, contractId]);

  const loadContractDetails = async () => {
    if (!contractId) {
      console.log('❌ ContractDetailsModal: contractId is null or undefined');
      return;
    }

    console.log('🔍 ContractDetailsModal: Loading details for contractId:', contractId);
    setLoading(true);
    try {
      const details = await ApiService.getContractDetails(contractId);
      console.log('✅ ContractDetailsModal: Details loaded successfully:', details);
      setContractDetails(details);
    } catch (error) {
      console.error('❌ ContractDetailsModal: Error loading contract details:', error);
      console.error('❌ ContractDetailsModal: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        contractId
      });
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do contrato');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return '#10B981';
      case 'liquidado': return '#3B82F6';
      case 'renegociado': return '#F59E0B';
      case 'cancelado': return '#EF4444';
      case 'jurídico': return '#7C3AED';
      // Mantendo compatibilidade com status antigos
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'suspended': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      case 'failed': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const renderProgressBar = () => {
    if (!contractDetails) return null;

    const percentage = Math.min(contractDetails.paidPercentage, 100);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progresso de Pagamento</Text>
          <Text style={styles.progressPercentage}>{percentage.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Pago: {formatCurrency(contractDetails.totalPaid)}
          </Text>
          <Text style={styles.progressText}>
            Total: {formatCurrency(contractDetails.value)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPaymentsList = (payments: any[], title: string) => {
    if (!payments || payments.length === 0) return null;

    return (
      <View style={styles.paymentsSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {payments.map((payment, index) => (
          <View key={payment.id || index} style={styles.paymentItem}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentNumber}>
                {payment.payment_type === 'downPayment' ? 'Entrada' : `Parcela ${payment.installment_number || index + 1}`}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getPaymentStatusColor(payment.status) }
              ]}>
                <Text style={styles.statusText}>
                  {payment.status === 'paid' ? 'Pago' : 
                   payment.status === 'pending' ? 'Pendente' :
                   payment.status === 'overdue' ? 'Atrasado' : 'Falhou'}
                </Text>
              </View>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
              <Text style={styles.paymentDate}>
                Vencimento: {formatDate(payment.due_date)}
              </Text>
              {payment.paid_date && (
                <Text style={styles.paymentPaidDate}>
                  Pago em: {formatDate(payment.paid_date)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <Modal visible={visible} onClose={onClose} title="Detalhes do Contrato">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </Modal>
    );
  }

  if (!contractDetails) {
    return (
      <Modal visible={visible} onClose={onClose} title="Detalhes do Contrato">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Não foi possível carregar os detalhes do contrato</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onClose={onClose} title={`Contrato ${contractDetails.contract_number}`} width="50%" height="60%">
      <View style={styles.container}>
        {/* Contract Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Contrato</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{contractDetails.client.first_name} {contractDetails.client.last_name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(contractDetails.status) }
              ]}>
                <Text style={styles.statusText}>
                {contractDetails.status === 'ativo' ? 'Ativo' :
                 contractDetails.status === 'liquidado' ? 'Liquidado' :
                 contractDetails.status === 'renegociado' ? 'Renegociado' :
                 contractDetails.status === 'cancelado' ? 'Cancelado' :
                 contractDetails.status === 'jurídico' ? 'Jurídico' :
                 // Mantendo compatibilidade com status antigos
                 contractDetails.status === 'active' ? 'Ativo' :
                 contractDetails.status === 'completed' ? 'Concluído' :
                 contractDetails.status === 'cancelled' ? 'Cancelado' :
                 contractDetails.status === 'suspended' ? 'Suspenso' : contractDetails.status}
              </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Valor Total:</Text>
              <Text style={styles.infoValue}>{formatCurrency(contractDetails.value)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Entrada:</Text>
              <Text style={styles.infoValue}>{formatCurrency(contractDetails.down_payment)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Parcelas:</Text>
              <Text style={styles.infoValue}>{contractDetails.number_of_payments}x</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Período:</Text>
              <Text style={styles.infoValue}>
                {formatDate(contractDetails.start_date)} - {formatDate(contractDetails.end_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Pagamentos</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{contractDetails.paymentsSummary.total}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#10B981' }]}>
                {contractDetails.paymentsSummary.paid}
              </Text>
              <Text style={styles.summaryLabel}>Pagos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
                {contractDetails.paymentsSummary.pending}
              </Text>
              <Text style={styles.summaryLabel}>Pendentes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>
                {contractDetails.paymentsSummary.overdue}
              </Text>
              <Text style={styles.summaryLabel}>Atrasados</Text>
            </View>
          </View>
        </View>

        {/* Regular Payments */}
        {renderPaymentsList(contractDetails.regularPayments, 'Parcelas do Contrato')}

        {/* Complementary Payments */}
        {renderPaymentsList(contractDetails.complementaryPayments, 'Pagamentos Complementares')}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  paymentsSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  paymentItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentDetails: {
    gap: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  paymentPaidDate: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});