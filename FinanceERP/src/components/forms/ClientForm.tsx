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
import { Client } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import Yup from 'yup';

interface ClientFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  client?: Client | null;
  isLoading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  visible,
  onClose,
  onSubmit,
  client,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    tax_id: '',
    birth_date: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    notes: '',
    status: 'ativo',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '',
        mobile: client.mobile || '',
        tax_id: client.tax_id || '',
        birth_date: client.birth_date || '',
        address: client.address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        country: client.country || '',
        notes: client.notes || '',
        status: client.status || 'ativo',
      });
    } else {
      // Reset form for new client
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        mobile: '',
        tax_id: '',
        birth_date: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        notes: '',
        status: 'ativo',
      });
    }
    setErrors({});
  }, [client, visible]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome é obrigatório';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    if (formData.mobile && !/^\+?[\d\s\-\(\)]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Telemóvel inválido';
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar cliente');
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Básicas</Text>
              
              <Input
                label="Nome *"
                value={formData.first_name}
                onChangeText={(value) => updateField('first_name', value)}
                error={errors.first_name}
                placeholder="Digite o nome"
              />

              <Input
                label="Sobrenome"
                value={formData.last_name}
                onChangeText={(value) => updateField('last_name', value)}
                error={errors.last_name}
                placeholder="Digite o sobrenome"
              />

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                error={errors.email}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="NIF"
                value={formData.tax_id}
                onChangeText={(value) => updateField('tax_id', value)}
                error={errors.tax_id}
                placeholder="Digite o NIF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contato</Text>
              
              <Input
                label="Telefone"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                error={errors.phone}
                placeholder="Digite o telefone"
                keyboardType="phone-pad"
              />

              <Input
                label="Telemóvel"
                value={formData.mobile}
                onChangeText={(value) => updateField('mobile', value)}
                error={errors.mobile}
                placeholder="Digite o telemóvel"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Morada</Text>
              
              <Input
                label="Morada"
                value={formData.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder="Digite a morada completa"
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Cidade"
                    value={formData.city}
                    onChangeText={(value) => updateField('city', value)}
                    placeholder="Cidade"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Código Postal"
                    value={formData.postal_code}
                    onChangeText={(value) => updateField('postal_code', value)}
                    placeholder="0000-000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="País"
                value={formData.country}
                onChangeText={(value) => updateField('country', value)}
                placeholder="Portugal"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Adicionais</Text>
              
              <DatePicker
                label="Data de Nascimento"
                value={formData.birth_date}
                onDateChange={(value) => updateField('birth_date', value)}
                placeholder="DD/MM/AAAA"
                mode="date"
              />

              <Input
                label="Observações"
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                placeholder="Observações sobre o cliente"
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
            title={client ? 'Actualizar' : 'Criar Cliente'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
});

export default ClientForm;