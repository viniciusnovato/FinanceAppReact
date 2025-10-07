import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';
import { formatCurrency } from '../utils/currency';

interface ManualPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  payment: {
    id: string;
    amount: number;
    due_date: string;
    status?: string;
    contract_id: string;
    paid_amount?: number;
  } | null;
  onConfirm: (paymentAmount: number) => Promise<void>;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  visible,
  onClose,
  payment,
  onConfirm
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('🔍 ManualPaymentModal renderizado:', { 
    visible, 
    payment: payment?.id, 
    paymentData: payment,
    hasPayment: !!payment 
  });

  // Early return if payment is null
  if (!payment) {
    console.log('🔍 Payment é null, retornando null');
    return null;
  }

  console.log('🔍 ManualPaymentModal vai renderizar Modal com:', { visible, title: 'Pagamento Manual' });

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      console.log('🔍 Modal ficou visível, resetando form');
      setPaymentAmount('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(amount);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao processar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setPaymentAmount(amount.toString());
  };

  const paidAmount = payment.paid_amount || 0;
  const remainingAmount = payment.amount - paidAmount;
  const inputAmount = parseFloat(paymentAmount) || 0;
  const excessAmount = inputAmount > remainingAmount ? inputAmount - remainingAmount : 0;
  const newRemainingAmount = Math.max(0, remainingAmount - inputAmount);

  console.log('🔍 Modal vai renderizar com visible:', visible);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Pagamento Manual"
      width="90%"
    >
      <View style={styles.container}>
        {/* Informações do Pagamento */}
        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>📋 Informações do Pagamento</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 Valor Original:</Text>
            <Text style={[styles.infoValue, styles.originalAmount]}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Data de Vencimento:</Text>
            <Text style={styles.infoValue}>
              {new Date(payment.due_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏷️ Status:</Text>
            <View style={[styles.statusBadge, getStatusStyle(payment.status || 'pending')]}>
              <Text style={styles.statusText}>{getStatusLabel(payment.status || 'pending')}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✅ Valor Pago:</Text>
            <Text style={[styles.infoValue, styles.paidAmount]}>
              {formatCurrency(paidAmount)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏳ Valor Restante:</Text>
            <Text style={[styles.infoValue, styles.remainingAmount]}>
              {formatCurrency(remainingAmount)}
            </Text>
          </View>
        </View>

        {/* Input de Valor com Design Melhorado */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>💳 Valor a Pagar</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="0,00"
              keyboardType="numeric"
              style={styles.enhancedInput}
            />
          </View>
          
          {/* Botões de Valor Rápido */}
          <View style={styles.quickAmountButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleQuickAmount(remainingAmount)}
            >
              <Text style={styles.quickButtonText}>
                💯 Total: {formatCurrency(remainingAmount)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleQuickAmount(payment.amount)}
            >
              <Text style={styles.quickButtonText}>
                🎯 Original: {formatCurrency(payment.amount)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações de Cálculo com Melhor Visualização */}
        {inputAmount > 0 && (
          <View style={styles.calculationInfo}>
            <Text style={styles.calculationTitle}>📊 Resumo do Pagamento</Text>
            
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>💸 Valor a Pagar:</Text>
              <Text style={[styles.calculationValue, styles.paymentValue]}>
                {formatCurrency(inputAmount)}
              </Text>
            </View>
            
            {excessAmount > 0 && (
              <View style={[styles.calculationRow, styles.excessRow]}>
                <Text style={[styles.calculationLabel, styles.excessLabel]}>
                  🎉 Saldo Positivo:
                </Text>
                <Text style={[styles.calculationValue, styles.excessValue]}>
                  +{formatCurrency(excessAmount)}
                </Text>
              </View>
            )}
            
            <View style={styles.calculationRow}>
              <Text style={[styles.calculationLabel, styles.remainingLabel]}>
                📉 Novo Saldo Restante:
              </Text>
              <Text style={[styles.calculationValue, styles.newRemainingValue]}>
                {formatCurrency(newRemainingAmount)}
              </Text>
            </View>
          </View>
        )}

        {/* Botões de Ação com Design Melhorado */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButtonStyle}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.confirmButtonStyle,
              {
                opacity: (!paymentAmount || parseFloat(paymentAmount) <= 0) ? 0.5 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
          >
            <Text style={styles.confirmButtonText}>
              {isSubmitting ? "⏳ Processando..." : "✅ Confirmar Pagamento"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'paid': return 'Pago';
    case 'pending': return 'Pendente';
    case 'overdue': return 'Atrasado';
    case 'failed': return 'Falhou';
    default: return status;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'paid':
      return { backgroundColor: '#10B981' };
    case 'pending':
      return { backgroundColor: '#F59E0B' };
    case 'overdue':
      return { backgroundColor: '#EF4444' };
    case 'failed':
      return { backgroundColor: '#6B7280' };
    default:
      return { backgroundColor: '#6B7280' };
  }
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  paymentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
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
  originalAmount: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 16,
  },
  paidAmount: {
    color: '#10B981',
  },
  remainingAmount: {
    color: '#dc3545',
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
  inputSection: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 8,
  },
  enhancedInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 15,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#E5F3FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  calculationInfo: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  paymentValue: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  excessRow: {
    backgroundColor: '#d4edda',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 5,
  },
  excessLabel: {
    color: '#059669',
  },
  excessValue: {
    color: '#059669',
  },
  remainingLabel: {
    color: '#dc2626',
  },
  remainingValue: {
    color: '#dc2626',
  },
  newRemainingValue: {
    color: '#dc3545',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButtonStyle: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonStyle: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});