import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contract, Client } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import ApiService from '../../services/api';

interface ContractFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  contract?: Contract | null;
  isLoading?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  visible,
  onClose,
  onSubmit,
  contract,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    client_id: '',
    contract_number: '',
    description: '',
    value: '',
    start_date: '',
    end_date: '',
    status: 'ativo',
    payment_frequency: '',
    notes: '',
    down_payment: '',
    number_of_payments: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (visible) {
      loadClients();
    }
  }, [visible]);

  useEffect(() => {
    if (contract) {
      setFormData({
        client_id: contract.client_id || '',
        contract_number: contract.contract_number || '',
        description: contract.description || '',
        value: contract.value?.toString() || '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        status: contract.status || 'ativo',
        payment_frequency: contract.payment_frequency || '',
        notes: contract.notes || '',
        down_payment: contract.down_payment?.toString() || '',
        number_of_payments: contract.number_of_payments?.toString() || '',
      });
      
      // Find and set selected client
      if (contract.client_id && clients.length > 0) {
        const client = clients.find(c => c.id === contract.client_id);
        setSelectedClient(client || null);
      }
    } else {
      // Reset form for new contract
      setFormData({
        client_id: '',
        contract_number: '',
        description: '',
        value: '',
        start_date: '',
        end_date: '',
        status: 'ativo',
        payment_frequency: '',
        notes: '',
        down_payment: '',
        number_of_payments: '',
      });
      setSelectedClient(null);
    }
    setErrors({});
  }, [contract, visible, clients]);

  const loadClients = async () => {
    try {
      const response = await ApiService.getClients();
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Cliente é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      newErrors.value = 'Valor deve ser um número positivo';
    }

    if (!formData.start_date.trim()) {
      newErrors.start_date = 'Data de início é obrigatória';
    }

    if (formData.down_payment && (isNaN(Number(formData.down_payment)) || Number(formData.down_payment) < 0)) {
      newErrors.down_payment = 'Entrada deve ser um número positivo';
    }

    if (formData.number_of_payments && (isNaN(Number(formData.number_of_payments)) || Number(formData.number_of_payments) <= 0)) {
      newErrors.number_of_payments = 'Número de parcelas deve ser um número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    try {
      const contractData = {
        ...formData,
        value: Number(formData.value),
        down_payment: formData.down_payment ? Number(formData.down_payment) : undefined,
        number_of_payments: formData.number_of_payments ? Number(formData.number_of_payments) : undefined,
      };

      await onSubmit(contractData);
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar contrato');
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    updateField('client_id', client.id);
    setShowClientPicker(false);
  };

  const renderClientPicker = () => (
    <Modal
      visible={showClientPicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowClientPicker(false)}
    >
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Selecionar Cliente</Text>
          <TouchableOpacity onPress={() => setShowClientPicker(false)}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.pickerList}>
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientItem}
              onPress={() => handleClientSelect(client)}
            >
              <Text style={styles.clientName}>
                {client.first_name} {client.last_name}
              </Text>
              {client.email && (
                <Text style={styles.clientEmail}>{client.email}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {contract ? 'Editar Contrato' : 'Novo Contrato'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Básicas</Text>
              
              <View>
                <Text style={styles.inputLabel}>Cliente *</Text>
                <TouchableOpacity
                  style={[styles.clientSelector, errors.client_id && styles.inputError]}
                  onPress={() => setShowClientPicker(true)}
                >
                  <Text style={[
                    styles.clientSelectorText,
                    !selectedClient && styles.placeholderText
                  ]}>
                    {selectedClient 
                      ? `${selectedClient.first_name} ${selectedClient.last_name}`
                      : 'Selecione um cliente'
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
                {errors.client_id && (
                  <Text style={styles.errorText}>{errors.client_id}</Text>
                )}
              </View>

              <Input
                label="Número do Contrato"
                value={formData.contract_number}
                onChangeText={(value) => updateField('contract_number', value)}
                placeholder="Digite o número do contrato"
              />

              <Input
                label="Descrição *"
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                error={errors.description}
                placeholder="Digite a descrição do contrato"
                multiline
                numberOfLines={3}
              />

              <Input
                label="Valor Total *"
                value={formData.value}
                onChangeText={(value) => updateField('value', value)}
                error={errors.value}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Datas</Text>
              
              <DatePicker
                label="Data de Início *"
                value={formData.start_date}
                onDateChange={(value) => updateField('start_date', value)}
                error={errors.start_date}
                placeholder="DD/MM/AAAA"
                mode="date"
              />

              <DatePicker
                label="Data de Término"
                value={formData.end_date}
                onDateChange={(value) => updateField('end_date', value)}
                placeholder="DD/MM/AAAA"
                mode="date"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pagamento</Text>
              
              <Input
                label="Frequência de Pagamento"
                value={formData.payment_frequency}
                onChangeText={(value) => updateField('payment_frequency', value)}
                placeholder="Ex: Mensal, Trimestral, etc."
              />

              <Input
                label="Entrada"
                placeholder="Introduza o valor da entrada"
                value={formData.down_payment}
                onChangeText={(text) => setFormData({ ...formData, down_payment: text })}
                keyboardType="numeric"
                error={errors.down_payment}
              />

              <Input
                label="Número de Pagamentos"
                placeholder="Introduza o número de pagamentos"
                value={formData.number_of_payments}
                onChangeText={(text) => setFormData({ ...formData, number_of_payments: text })}
                keyboardType="numeric"
                error={errors.number_of_payments}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Adicionais</Text>
              
              <Input
                label="Observações"
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                placeholder="Observações sobre o contrato"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancelar"
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title={contract ? 'Actualizar' : 'Criar Contrato'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>

      {renderClientPicker()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  clientSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  clientSelectorText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  // Client picker styles
  pickerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  pickerList: {
    flex: 1,
  },
  clientItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default ContractForm;