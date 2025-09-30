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
import { Client } from '../types';
import ApiService from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import MainLayout from '../components/layout/MainLayout';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ClientForm from '../components/forms/ClientForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const ITEMS_PER_PAGE = isTablet ? 10 : 8;

const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form states
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Calculate total pages using useMemo to avoid unnecessary recalculations
  const totalPages = useMemo(() => {
    return Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  }, [filteredClients.length]);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => {
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        const email = client.email?.toLowerCase() || '';
        const taxId = client.tax_id?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || 
               email.includes(query) || 
               taxId.includes(query);
      });
      setFilteredClients(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [clients, searchQuery]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getClients();
      if (response.success && response.data) {
        setClients(response.data);
      } else {
        console.warn('API response not successful or no data:', response);
        setClients([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes. Verifique sua conexão.');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleSubmitClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      
      if (editingClient) {
        // Update existing client
        const response = await ApiService.updateClient(editingClient.id, clientData);
        if (response.success && response.data) {
          setClients(clients.map(c => c.id === editingClient.id ? response.data : c));
          Alert.alert('Sucesso', 'Cliente actualizado com sucesso');
        } else {
          Alert.alert('Erro', 'Não foi possível actualizar o cliente');
        }
      } else {
        // Create new client
        const response = await ApiService.createClient(clientData);
        if (response.success && response.data) {
          // Reload the complete list from server to ensure data consistency
          await loadClients();
          Alert.alert('Sucesso', 'Cliente criado com sucesso');
        } else {
          Alert.alert('Erro', 'Não foi possível criar o cliente');
        }
      }
      
      setShowClientForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error submitting client:', error);
      Alert.alert('Erro', 'Não foi possível guardar o cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseClientForm = () => {
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowConfirmDialog(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsSubmitting(true);
      const response = await ApiService.deleteClient(clientToDelete.id);
      if (response.success) {
        setClients(clients.filter(c => c.id !== clientToDelete.id));
        Alert.alert('Sucesso', 'Cliente excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cliente');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
      setClientToDelete(null);
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const response = await ApiService.deleteClient(clientId);
      if (response.success) {
        setClients(clients.filter(client => client.id !== clientId));
        Alert.alert('Sucesso', 'Cliente excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cliente');
    }
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    
    const sortedClients = [...clients].sort((a, b) => {
      let aValue = a[column as keyof Client] as any;
      let bValue = b[column as keyof Client] as any;
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setClients(sortedClients);
    setCurrentPage(1); // Reset to first page after sorting
  };

  const handleRowPress = (client: Client) => {
    Alert.alert(
      'Acções do Cliente',
      `${client.first_name} ${client.last_name}`,
      [
        { text: 'Editar', onPress: () => handleEditClient(client) },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleDeleteClient(client) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, endIndex);
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
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} de {filteredClients.length} clientes
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

  const renderStatusBadge = (status: string) => (
    <View style={[
      styles.statusBadge,
      status === 'ativo' ? styles.activeBadge : styles.inactiveBadge
    ]}>
      <Text style={[
        styles.statusText,
        { color: status === 'ativo' ? '#16A34A' : '#DC2626' }
      ]}>
        {status}
      </Text>
    </View>
  );

  const columns: DataTableColumn[] = [
    {
      key: 'first_name',
      title: 'Nome',
      sortable: true,
      width: isTablet ? 150 : 100,
    },
    {
      key: 'last_name',
      title: 'Sobrenome',
      sortable: true,
      width: isTablet ? 150 : 100,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      width: isTablet ? 200 : 120,
    },
    {
      key: 'phone',
      title: 'Telefone',
      sortable: true,
      width: isTablet ? 140 : 100,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: isTablet ? 100 : 80,
      render: (client: Client, status: string) => renderStatusBadge(status),
    },
    {
      key: 'created_at',
      title: 'Registo',
      sortable: true,
      width: isTablet ? 120 : 90,
      render: (client: Client, date: string) => new Date(date).toLocaleDateString('pt-PT'),
    },
    {
      key: 'actions',
      title: 'Ações',
      sortable: false,
      width: isTablet ? 120 : 100,
      render: (client: Client) => (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditClient(client)}
          >
            <Ionicons name="pencil" size={16} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteClient(client)}
          >
            <Ionicons name="trash" size={16} color="#DC3545" />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <MainLayout activeRoute="Clients">
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Clientes</Text>
            <Button
              title="Novo Cliente"
              onPress={handleCreateClient}
              variant="primary"
            />
          </View>

          <View style={styles.searchContainer}>
            <Input
              placeholder="Procurar por nome do cliente..."
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
            keyExtractor={(item) => item.id}
          />

          {renderPaginationControls()}
        </View>
      </ScrollView>

      <ClientForm
        visible={showClientForm}
        onClose={handleCloseClientForm}
        onSubmit={handleSubmitClient}
        client={editingClient}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        visible={showConfirmDialog}
        title="Confirmar Eliminação"
        message={`Tem a certeza que deseja eliminar o cliente "${clientToDelete?.first_name} ${clientToDelete?.last_name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteClient}
        onCancel={() => setShowConfirmDialog(false)}
        isDestructive={true}
        isLoading={isSubmitting}
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
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
});

export default ClientsScreen;