import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DataTableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (item: any, value: any) => React.ReactNode;
}

export interface DataTableProps {
  data: any[];
  columns: DataTableColumn[];
  loading?: boolean;
  onRowPress?: (item: any) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  keyExtractor?: (item: any, index: number) => string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  onRowPress,
  onSort,
  sortColumn,
  sortDirection,
  emptyMessage = 'Nenhum item encontrado',
  keyExtractor,
}) => {
  const handleSort = (column: DataTableColumn) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = 
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {columns.map((column) => (
        <TouchableOpacity
          key={column.key}
          style={[
            styles.headerCell,
            column.width 
              ? { width: column.width, flexShrink: 0 }
              : { flex: 1, minWidth: 80 }
          ]}
          onPress={() => handleSort(column)}
          disabled={!column.sortable}
        >
          <Text style={styles.headerText} numberOfLines={1}>{column.title}</Text>
          {column.sortable && sortColumn === column.key && (
            <Ionicons
              name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#6B7280"
              style={styles.sortIcon}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRow = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.dataRow,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
      onPress={() => {
        console.log('Row pressed:', item);
        onRowPress?.(item);
      }}
      disabled={!onRowPress}
      activeOpacity={0.7}
    >
      {columns.map((column) => {
        const value = item[column.key];
        const content = column.render ? column.render(item, value) : value;
        
        // Ensure content is renderable - convert objects to strings
        let renderableContent = content;
        if (typeof content === 'object' && content !== null && !React.isValidElement(content)) {
          renderableContent = JSON.stringify(content);
        } else if (content === null || content === undefined) {
          renderableContent = '';
        } else if (typeof content !== 'string' && typeof content !== 'number' && !React.isValidElement(content)) {
          renderableContent = String(content);
        }
        
        return (
          <View
            key={column.key}
            style={[
              styles.dataCell,
              column.width 
                ? { width: column.width, flexShrink: 0 }
                : { flex: 1, minWidth: 80 }
            ]}
          >
            {React.isValidElement(renderableContent) ? (
              renderableContent
            ) : (
              <Text style={styles.cellText} numberOfLines={2}>
                {renderableContent}
              </Text>
            )}
          </View>
        );
      })}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={data}
        renderItem={renderRow}
        keyExtractor={keyExtractor || ((item, index) => `${item.id || index}`)}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  sortableHeader: {
    // Adiciona visual feedback para colunas ordenáveis
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortIcon: {
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 56,
  },
  evenRow: {
    backgroundColor: '#FFFFFF',
  },
  oddRow: {
    backgroundColor: '#FAFAFA',
  },
  dataCell: {
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default DataTable;