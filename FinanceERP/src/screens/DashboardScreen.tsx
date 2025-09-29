import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { DashboardStats } from '../types';
import ApiService from '../services/api';
import Card from '../components/common/Card';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Mock data for development
      setStats({
        activeClients: 640,
        activeContracts: 85,
        pendingPayments: 23,
        overduePayments: 5,
        totalReceived: 57000,
        monthlyRevenue: 12500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  // Mock chart data
  const revenueData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [8000, 12000, 15000, 11000, 14000, 12500],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const paymentsData = {
    labels: ['Pagos', 'Pendentes', 'Atrasados'],
    datasets: [
      {
        data: stats ? [
          stats.totalReceived / 1000,
          stats.pendingPayments,
          stats.overduePayments
        ] : [57, 23, 5],
      },
    ],
  };

  if (isLoading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.activeClients || 640}</Text>
          <Text style={styles.statLabel}>Clientes Ativos</Text>
          <View style={[styles.badge, styles.activeBadge]}>
            <Text style={styles.badgeText}>+12%</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.revenueNumber]}>
            R${((stats?.totalReceived || 57000) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Receita Total</Text>
          <View style={[styles.badge, styles.revenueBadge]}>
            <Text style={styles.badgeText}>+8%</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.contractsNumber]}>
            {stats?.activeContracts || 85}
          </Text>
          <Text style={styles.statLabel}>Contratos</Text>
          <View style={[styles.badge, styles.contractsBadge]}>
            <Text style={styles.badgeText}>+5</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.paymentsNumber]}>
            {stats?.pendingPayments || 23}
          </Text>
          <Text style={styles.statLabel}>Pagamentos Pendentes</Text>
          <View style={[styles.badge, styles.paymentsBadge]}>
            <Text style={styles.badgeText}>-3</Text>
          </View>
        </Card>
      </View>

      {/* Revenue Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Receita Mensal</Text>
        <LineChart
          data={revenueData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      {/* Payments Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Status dos Pagamentos</Text>
        <BarChart
          data={paymentsData}
          width={screenWidth - 60}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          }}
          style={styles.chart}
        />
      </Card>

      {/* Recent Activity */}
      <Card style={styles.activityCard}>
        <Text style={styles.chartTitle}>Atividade Recente</Text>
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <Text style={styles.activityText}>
            Novo cliente cadastrado: João Silva
          </Text>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, styles.paymentDot]} />
          <Text style={styles.activityText}>
            Pagamento recebido: R$ 2.500,00
          </Text>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, styles.contractDot]} />
          <Text style={styles.activityText}>
            Contrato renovado: Maria Santos
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    position: 'relative',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  revenueNumber: {
    color: '#34C759',
  },
  contractsNumber: {
    color: '#FF9500',
  },
  paymentsNumber: {
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E3F2FD',
  },
  revenueBadge: {
    backgroundColor: '#E8F5E8',
  },
  contractsBadge: {
    backgroundColor: '#FFF3E0',
  },
  paymentsBadge: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  chartCard: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  activityCard: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  paymentDot: {
    backgroundColor: '#34C759',
  },
  contractDot: {
    backgroundColor: '#FF9500',
  },
  activityText: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
});

export default DashboardScreen;