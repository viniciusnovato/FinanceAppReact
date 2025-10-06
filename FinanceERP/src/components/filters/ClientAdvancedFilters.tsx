import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../common/Input';
import Button from '../common/Button';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export interface ClientAdvancedFiltersData {
  // Search filter
  search?: string;
  
  // Overdue payments filter
  hasOverduePayments?: boolean;
}

interface ClientAdvancedFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ClientAdvancedFiltersData) => void;
  onClearFilters: () => void;
  initialFilters?: ClientAdvancedFiltersData;
}

const ClientAdvancedFilters: React.FC<ClientAdvancedFiltersProps> = ({
  visible,
  onClose,
  onApplyFilters,
  onClearFilters,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<ClientAdvancedFiltersData>(initialFilters);

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const updateFilter = (key: keyof ClientAdvancedFiltersData, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    // Remove empty filters
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        acc[key as keyof ClientAdvancedFiltersData] = value;
      }
      return acc;
    }, {} as ClientAdvancedFiltersData);

    onApplyFilters(cleanedFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    onClearFilters();
    onClose();
  };

  const renderSectionWithIcon = (iconName: string, title: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={iconName as any} size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </View>
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtros Avançados - Clientes</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Filter */}
          {renderSectionWithIcon(
            'search-outline',
            'Busca Geral',
            <Input
              label="Buscar por nome, email ou NIF"
              value={filters.search || ''}
              onChangeText={(text) => updateFilter('search', text)}
              placeholder="Digite para buscar..."
            />
          )}

          {/* Overdue Payments Filter */}
          {renderSectionWithIcon(
            'warning-outline',
            'Pagamentos Atrasados',
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Apenas clientes com pagamentos atrasados</Text>
                  <Text style={styles.switchDescription}>
                    Mostra apenas clientes que possuem pagamentos vencidos ou em atraso
                  </Text>
                </View>
                <Switch
                  value={filters.hasOverduePayments || false}
                  onValueChange={(value) => updateFilter('hasOverduePayments', value)}
                  trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                  thumbColor={filters.hasOverduePayments ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Limpar Filtros"
            onPress={handleClearFilters}
            variant="secondary"
            style={styles.clearButton}
          />
          <Button
            title="Aplicar Filtros"
            onPress={handleApplyFilters}
            style={styles.applyButton}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchContainer: {
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default ClientAdvancedFilters;