import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contract } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';
import { formatCurrency } from '../utils/currency';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const ITEMS_PER_PAGE = isTablet ? 10 : 8;

const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages using useMemo to avoid unnecessary recalculations
  const totalPages = useMemo(() => {
    return Math.ceil(contracts.length / ITEMS_PER_PAGE);
  }, [contracts.length]);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

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
    setCurrentPage(1); // Reset to first page after sorting
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

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return contracts.slice(startIndex, endIndex);
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

    const pageNumbers = [];
    const maxVisiblePages = isTablet ? 7 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, contracts.length)} de {contracts.length} contratos
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

  const columns: DataTableColumn[] = [
    {
      key: 'contract_number',
      title: 'Número',
      sortable: true,
      width: isTablet ? 120 : 80,
    },
    {
      key: 'description',
      title: 'Descrição',
      sortable: true,
      width: isTablet ? 200 : 120,
    },
    {
      key: 'client_name',
      title: 'Cliente',
      sortable: true,
      width: isTablet ? 180 : 100,
      render: (contract: Contract) => {
        if (contract.client) {
          const firstName = contract.client.first_name || '';
          const lastName = contract.client.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      key: 'value',
      title: 'Valor',
      sortable: true,
      width: isTablet ? 120 : 80,
      render: (contract: Contract, value: number) => formatCurrency(value as number),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: isTablet ? 100 : 80,
      render: (contract: Contract, status: string) => (
        <View style={[
          styles.statusBadge,
          status === 'ativo' ? styles.activeBadge :
          status === 'concluido' ? styles.completedBadge :
          styles.inactiveBadge
        ]}>
          <Text style={[
            styles.statusText,
            { color: status === 'ativo' ? '#16A34A' : status === 'concluido' ? '#2563EB' : '#DC2626' }
          ]}>
            {status}
          </Text>
        </View>
      ),
    },
    {
      key: 'start_date',
      title: 'Início',
      sortable: true,
      width: isTablet ? 100 : 80,
      render: (contract: Contract, date: string) => new Date(date as string).toLocaleDateString('pt-BR'),
    },
    {
      key: 'end_date',
      title: 'Fim',
      sortable: true,
      width: isTablet ? 100 : 80,
      render: (contract: Contract, date: string) => new Date(date as string).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <MainLayout activeRoute="Contracts">
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Contratos</Text>
            <Button
              title="Novo Contrato"
              onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              variant="primary"
            />
          </View>

          <DataTable
            data={getCurrentPageData()}
            columns={columns}
            loading={isLoading}
            onSort={handleSort}
            onRowPress={handleRowPress}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />

          {renderPaginationControls()}
        </View>
      </ScrollView>
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
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  paginationButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
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

export default ContractsScreen;