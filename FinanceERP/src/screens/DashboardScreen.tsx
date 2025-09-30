import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeLineChart } from '../components/charts/ChartWrapper';
import { DashboardStats } from '../types';
import ApiService from '../services/api';
import Card from '../components/common/Card';
import MainLayout from '../components/layout/MainLayout';
import { formatCurrencyCompact } from '../utils/currency';

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth > 768;
const cardPadding = isTablet ? 24 : 16; // Responsive padding
// Ajuste mais conservador para evitar extrapolação
const chartWidth = screenWidth - (cardPadding * 2) - (isTablet ? 100 : 80); // Margem mais segura

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
      // Mock data for development - Dados baseados nos números reais do banco
      setStats({
        totalClients: 580,
        activeClients: 532, // Número real informado pelo usuário
        totalContracts: 245,
        activeContracts: 198,
        totalPayments: 1850,
        pendingPayments: 67,
        overduePayments: 12,
        totalReceived: 185000,
        totalRevenue: 220000,
        monthlyRevenue: 18500,
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
    propsForBackgroundLines: {
      strokeDasharray: '', // solid line
      stroke: '#E9ECEF',
      strokeWidth: 1,
    },
    fillShadowGradient: '#007AFF',
    fillShadowGradientOpacity: 0.1,
  };

  const revenueData = {
    labels: stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 
      ? stats.monthlyRevenue.map(item => item.month)
      : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 
          ? stats.monthlyRevenue.map(item => Math.max(0, item.revenue))
          : [13875, 15725, 20350, 16650, 19425, 18500],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
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
    <MainLayout activeRoute="Dashboard">
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, color: '#6C757D' }}>
            Carregando dados do dashboard...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {/* Active Clients Card */}
              <View style={styles.statCard}>
                <Text style={[styles.statNumber]}>{stats?.activeClients || 0}</Text>
                <Text style={styles.statLabel}>CLIENTES ATIVOS</Text>
                <View style={[styles.badge, styles.activeBadge]}>
                  <Text style={styles.badgeText}>+32%</Text>
                </View>
              </View>

              {/* Total Revenue Card */}
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.revenueNumber]}>
                  {formatCurrencyCompact(stats?.totalRevenue || 0)}
                </Text>
                <Text style={styles.statLabel}>RECEITA TOTAL</Text>
                <View style={[styles.badge, styles.revenueBadge]}>
                  <Text style={styles.badgeText}>+8%</Text>
                </View>
              </View>

              {/* Active Contracts Card */}
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.contractsNumber]}>
                  {stats?.activeContracts || 0}
                </Text>
                <Text style={styles.statLabel}>CONTRATOS ATIVOS</Text>
                <View style={[styles.badge, styles.contractsBadge]}>
                  <Text style={styles.badgeText}>+5</Text>
                </View>
              </View>

              {/* Pending Payments Card */}
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.paymentsNumber]}>
                  {stats?.pendingPayments || 0}
                </Text>
                <Text style={styles.statLabel}>PAGAMENTOS PENDENTES</Text>
                <View style={[styles.badge, styles.paymentsBadge]}>
                  <Text style={styles.badgeText}>-3</Text>
                </View>
              </View>
            </View>

            {/* Revenue Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Receita Mensal</Text>
              <SafeLineChart
                data={revenueData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
              />
            </View>






          </View>
        </ScrollView>
      )}
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    overflow: 'scroll', // Enable scroll behavior
  },
  scrollContent: {
    paddingBottom: 100, // Increased padding to ensure content is not cut off
    flexGrow: 1,
    minHeight: '100%', // Ensure content takes full height
  },
  container: {
    backgroundColor: '#F8F9FA',
    padding: cardPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: isTablet ? 32 : 24,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: isTablet ? 32 : 24,
    gap: isTablet ? 16 : 12,
  },
  statCard: {
    width: isTablet ? '48%' : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    position: 'relative',
    marginBottom: isTablet ? 0 : 12,
  },
  statNumber: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: -1,
  },
  revenueNumber: {
    color: '#28A745',
  },
  contractsNumber: {
    color: '#007BFF',
  },
  paymentsNumber: {
    color: '#FD7E14',
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: '#6C757D',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  badge: {
    position: 'absolute',
    top: isTablet ? 16 : 12,
    right: isTablet ? 16 : 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#D4EDDA',
  },
  revenueBadge: {
    backgroundColor: '#D1ECF1',
  },
  contractsBadge: {
    backgroundColor: '#CCE5FF',
  },
  paymentsBadge: {
    backgroundColor: '#FFF3CD',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#495057',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    marginBottom: isTablet ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden', // Evita que o conteúdo extrapole
    width: '100%', // Garante largura total disponível
  },
  chartTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: isTablet ? 20 : 16,
    letterSpacing: -0.3,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: 'center',
    overflow: 'hidden', // Evita extrapolação
    maxWidth: '100%', // Garante que não ultrapasse o container
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007BFF',
    marginRight: 16,
  },
  paymentDot: {
    backgroundColor: '#28A745',
  },
  contractDot: {
    backgroundColor: '#FD7E14',
  },
  activityText: {
    fontSize: isTablet ? 14 : 13,
    color: '#495057',
    flex: 1,
    fontWeight: '500',
  },
});

export default DashboardScreen;