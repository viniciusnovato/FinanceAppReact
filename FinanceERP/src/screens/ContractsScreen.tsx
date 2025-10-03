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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Contract } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';
import ContractForm from '../components/forms/ContractForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ContractDetailsModal } from '../components/ContractDetailsModal';
import { MainStackParamList } from '../navigation/AppNavigator';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const ITEMS_PER_PAGE = isTablet ? 10 : 8;

type ContractsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Contracts'>;
type ContractsScreenRouteProp = RouteProp<MainStackParamList, 'Contracts'>;

const ContractsScreen: React.FC = () => {
  const navigation = useNavigation<ContractsScreenNavigationProp>();
  const route = useRoute<ContractsScreenRouteProp>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Contract form states
  const [showContractForm, setShowContractForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  
  // Contract details modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Calculate total pages using useMemo to avoid unnecessary recalculations
  const totalPages = useMemo(() => {
    return Math.ceil(filteredContracts.length / ITEMS_PER_PAGE);
  }, [filteredContracts.length]);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    loadContracts();
  }, []);

  // Set initial search query if coming from client selection
  useEffect(() => {
    if (route.params?.clientName && !searchQuery) {
      setSearchQuery(route.params.clientName);
    }
  }, [route.params?.clientName]);

  // Filter contracts based on search query and client filter
  useEffect(() => {
    let filtered = contracts;

    // Filter by client ID if provided
    if (route.params?.clientId) {
      filtered = filtered.filter(contract => contract.client_id === route.params?.clientId);
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(contract => {
        // Search by contract number
        const contractNumber = contract.contract_number?.toLowerCase() || '';
        
        // Search by client name
        const clientName = contract.client 
          ? `${contract.client.first_name || ''} ${contract.client.last_name || ''}`.toLowerCase().trim()
          : '';
        
        return contractNumber.includes(query) || clientName.includes(query);
      });
    }

    setFilteredContracts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchQuery, contracts, route.params?.clientId]);

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

  const handleDeleteContract = (contract: Contract) => {
    setContractToDelete(contract);
    setShowConfirmDialog(true);
  };

  const confirmDeleteContract = async () => {
    if (!contractToDelete) return;
    
    try {
      const response = await ApiService.deleteContract(contractToDelete.id);
      if (response.success) {
        setContracts(contracts.filter(c => c.id !== contractToDelete.id));
        Alert.alert('Sucesso', 'Contrato excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      Alert.alert('Erro', 'Não foi possível excluir o contrato');
    } finally {
      setShowConfirmDialog(false);
      setContractToDelete(null);
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

  const handleCreateContract = () => {
    setEditingContract(null);
    setShowContractForm(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowContractForm(true);
  };

  const handleSubmitContract = async (contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      
      if (editingContract) {
        // Update existing contract
        const response = await ApiService.updateContract(editingContract.id, contractData);
        if (response.success && response.data) {
          setContracts(contracts.map(c => c.id === editingContract.id ? response.data : c));
          Alert.alert('Sucesso', 'Contrato actualizado com sucesso');
        } else {
          Alert.alert('Erro', 'Não foi possível actualizar o contrato');
        }
      } else {
        // Create new contract
        const response = await ApiService.createContract(contractData);
        if (response.success && response.data) {
          // Reload the complete list from server to ensure data consistency
          await loadContracts();
          Alert.alert('Sucesso', 'Contrato criado com sucesso');
        } else {
          Alert.alert('Erro', 'Não foi possível criar o contrato');
        }
      }
      
      setShowContractForm(false);
      setEditingContract(null);
    } catch (error) {
      console.error('Error submitting contract:', error);
      Alert.alert('Erro', 'Não foi possível guardar o contrato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseContractForm = () => {
    setShowContractForm(false);
    setEditingContract(null);
  };

  const handleRowPress = (contract: Contract) => {
    // Navigate to payments page for this contract
    navigation.navigate('Payments', { contractId: contract.id });
  };

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredContracts.slice(startIndex, endIndex);
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
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredContracts.length)} de {filteredContracts.length} contratos
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
      width: isTablet ? 100 : 70,
    },
    {
      key: 'description',
      title: 'Descrição',
      sortable: true,
    },
    {
      key: 'client_name',
      title: 'Cliente',
      sortable: true,
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
      width: isTablet ? 100 : 70,
      render: (contract: Contract, value: number) => formatCurrency(value as number),
    },
    {
      key: 'number_of_payments',
      title: 'Nº Parcelas',
      sortable: true,
      width: isTablet ? 80 : 60,
      render: (contract: Contract, numberOfPayments: number) => numberOfPayments ? numberOfPayments.toString() : 'N/A',
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: isTablet ? 90 : 70,
      render: (contract: Contract, status: string) => {
        const getStatusStyle = (status: string) => {
          switch (status) {
            case 'ativo':
              return { badge: styles.activeBadge, color: '#16A34A' };
            case 'liquidado':
              return { badge: styles.completedBadge, color: '#2563EB' };
            case 'renegociado':
              return { badge: styles.renegotiatedBadge, color: '#F59E0B' };
            case 'cancelado':
              return { badge: styles.cancelledBadge, color: '#DC2626' };
            case 'jurídico':
              return { badge: styles.legalBadge, color: '#7C3AED' };
            default:
              return { badge: styles.inactiveBadge, color: '#6B7280' };
          }
        };

        const statusStyle = getStatusStyle(status);
        
        return (
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {status}
            </Text>
          </View>
        );
      },
    },
    {
      key: 'start_date',
      title: 'Início',
      sortable: true,
      width: isTablet ? 80 : 60,
      render: (contract: Contract, date: string) => formatDate(date as string),
    },
    {
      key: 'end_date',
      title: 'Fim',
      sortable: true,
      width: isTablet ? 80 : 60,
      render: (contract: Contract, date: string) => formatDate(date as string),
    },

    {
      key: 'actions',
      title: 'Ações',
      sortable: false,
      width: isTablet ? 140 : 120,
      render: (contract: Contract) => (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewDetailsButton]}
            onPress={() => {
              setSelectedContractId(contract.id);
              setShowDetailsModal(true);
            }}
          >
            <Ionicons name="eye" size={16} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewPaymentsButton]}
            onPress={() => navigation.navigate('Payments', { contractId: contract.id })}
          >
            <Ionicons name="card" size={16} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditContract(contract)}
          >
            <Ionicons name="pencil" size={16} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteContract(contract)}
          >
            <Ionicons name="trash" size={16} color="#DC3545" />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <MainLayout activeRoute="Contracts">
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Contratos</Text>
              {route.params?.clientName && (
                <Text style={styles.subtitle}>
                  Filtrado por: {route.params.clientName}
                </Text>
              )}
            </View>
            <Button
              title="Novo Contrato"
              onPress={handleCreateContract}
              variant="primary"
            />
          </View>

          <View style={styles.searchContainer}>
            <Input
              placeholder="Procurar por título do contrato..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
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
      
      <ContractForm
        visible={showContractForm}
        onClose={handleCloseContractForm}
        onSubmit={handleSubmitContract}
        contract={editingContract}
        isLoading={isSubmitting}
      />
      
      <ConfirmDialog
        visible={showConfirmDialog}
        title="Confirmar Eliminação"
        message={`Tem certeza que deseja eliminar o contrato "${contractToDelete?.contract_number || contractToDelete?.description}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteContract}
        onCancel={() => setShowConfirmDialog(false)}
        isDestructive={true}
      />
      
      <ContractDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId}
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
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 0,
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
  renegotiatedBadge: {
    backgroundColor: '#FEF3C7',
  },
  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },
  legalBadge: {
    backgroundColor: '#EDE9FE',
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: 28,
    height: 28,
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
  viewPaymentsButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  viewDetailsButton: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
});

export default ContractsScreen;