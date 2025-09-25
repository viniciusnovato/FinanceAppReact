import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Text, Card, Loading } from '../../components/ui';
import { dashboardService } from '../../services';
import { tokens } from '../../styles/tokens';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kpis, setKpis] = useState({});
  const [chartData, setChartData] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [clientStats, setClientStats] = useState({});

  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const [kpisResult, chartResult, revenueResult, clientsResult] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getChartData(),
        dashboardService.getRevenueData(),
        dashboardService.getClientStats(),
      ]);

      if (kpisResult.data) setKpis(kpisResult.data);
      if (chartResult.data) setChartData(chartResult.data);
      if (revenueResult.data) setRevenueData(revenueResult.data);
      if (clientsResult.data) setClientStats(clientsResult.data);

      // Verificar se há erros
      const errors = [kpisResult.error, chartResult.error, revenueResult.error, clientsResult.error]
        .filter(Boolean);
      
      if (errors.length > 0) {
        Alert.alert('Aviso', 'Alguns dados podem não estar atualizados.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDashboardData(false);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'increase':
        return tokens.colors.status.success;
      case 'decrease':
        return tokens.colors.status.error;
      default:
        return tokens.colors.text.secondary;
    }
  };

  const renderKPICard = (title, value, subtitle, status, icon) => (
    <Card key={title} variant="elevated" style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <Text variant="caption" color="secondary">
          {title}
        </Text>
        {icon && <Text style={styles.kpiIcon}>{icon}</Text>}
      </View>
      <Text variant="h3" weight="bold" style={styles.kpiValue}>
        {value}
      </Text>
      {subtitle && (
        <Text 
          variant="caption" 
          style={[styles.kpiSubtitle, { color: getStatusColor(status) }]}
        >
          {subtitle}
        </Text>
      )}
    </Card>
  );

  const renderRevenueChart = () => {
    if (!revenueData.monthlyRevenue || revenueData.monthlyRevenue.length === 0) {
      return (
        <Card style={styles.chartCard}>
          <Text variant="h4" weight="medium" style={styles.chartTitle}>
            Receita Mensal
          </Text>
          <View style={styles.noDataContainer}>
            <Text variant="body2" color="secondary">
              Dados não disponíveis
            </Text>
          </View>
        </Card>
      );
    }

    const chartConfig = {
      backgroundColor: tokens.colors.background.primary,
      backgroundGradientFrom: tokens.colors.background.primary,
      backgroundGradientTo: tokens.colors.background.primary,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(${tokens.colors.primary.main.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}, ${opacity})`,
      labelColor: (opacity = 1) => tokens.colors.text.primary,
      style: {
        borderRadius: tokens.borderRadius.md,
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: tokens.colors.primary.main,
      },
    };

    return (
      <Card style={styles.chartCard}>
        <Text variant="h4" weight="medium" style={styles.chartTitle}>
          Receita Mensal
        </Text>
        <LineChart
          data={{
            labels: revenueData.monthlyRevenue.map(item => item.month),
            datasets: [{
              data: revenueData.monthlyRevenue.map(item => item.revenue),
            }],
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>
    );
  };

  const renderPaymentStatusChart = () => {
    if (!chartData.paymentStatus || chartData.paymentStatus.length === 0) {
      return (
        <Card style={styles.chartCard}>
          <Text variant="h4" weight="medium" style={styles.chartTitle}>
            Status dos Pagamentos
          </Text>
          <View style={styles.noDataContainer}>
            <Text variant="body2" color="secondary">
              Dados não disponíveis
            </Text>
          </View>
        </Card>
      );
    }

    const pieData = chartData.paymentStatus.map((item, index) => ({
      name: item.status,
      population: item.count,
      color: [
        tokens.colors.status.success,
        tokens.colors.status.warning,
        tokens.colors.status.error,
        tokens.colors.primary.main,
      ][index % 4],
      legendFontColor: tokens.colors.text.primary,
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.chartCard}>
        <Text variant="h4" weight="medium" style={styles.chartTitle}>
          Status dos Pagamentos
        </Text>
        <PieChart
          data={pieData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </Card>
    );
  };

  if (isLoading) {
    return <Loading overlay message="Carregando dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="h2" weight="bold" style={styles.title}>
            Dashboard
          </Text>
          <Text variant="body2" color="secondary">
            Visão geral do seu negócio
          </Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpisContainer}>
          {renderKPICard(
            'Receita Total',
            formatCurrency(kpis.totalRevenue),
            kpis.revenueGrowth ? `${kpis.revenueGrowth > 0 ? '+' : ''}${kpis.revenueGrowth}% este mês` : null,
            kpis.revenueGrowth > 0 ? 'increase' : 'decrease',
            '💰'
          )}
          
          {renderKPICard(
            'Clientes Ativos',
            formatNumber(kpis.activeClients),
            kpis.clientGrowth ? `${kpis.clientGrowth > 0 ? '+' : ''}${kpis.clientGrowth} novos` : null,
            kpis.clientGrowth > 0 ? 'increase' : 'neutral',
            '👥'
          )}
          
          {renderKPICard(
            'Contratos Ativos',
            formatNumber(kpis.activeContracts),
            kpis.contractsThisMonth ? `${kpis.contractsThisMonth} este mês` : null,
            'neutral',
            '📄'
          )}
          
          {renderKPICard(
            'Pagamentos Pendentes',
            formatNumber(kpis.pendingPayments),
            kpis.overduePayments ? `${kpis.overduePayments} em atraso` : null,
            kpis.overduePayments > 0 ? 'decrease' : 'neutral',
            '⏰'
          )}
        </View>

        {/* Gráficos */}
        <View style={styles.chartsContainer}>
          {renderRevenueChart()}
          {renderPaymentStatusChart()}
        </View>

        {/* Estatísticas Adicionais */}
        {clientStats.topClients && clientStats.topClients.length > 0 && (
          <Card style={styles.statsCard}>
            <Text variant="h4" weight="medium" style={styles.statsTitle}>
              Principais Clientes
            </Text>
            {clientStats.topClients.slice(0, 5).map((client, index) => (
              <View key={client.id} style={styles.clientRow}>
                <View style={styles.clientInfo}>
                  <Text variant="body1" weight="medium">
                    {client.name}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {formatNumber(client.contractsCount)} contratos
                  </Text>
                </View>
                <Text variant="body1" weight="medium" color="primary">
                  {formatCurrency(client.totalRevenue)}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.md,
  },
  header: {
    marginBottom: tokens.spacing.lg,
  },
  title: {
    color: tokens.colors.primary.main,
    marginBottom: tokens.spacing.xs,
  },
  kpisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.lg,
  },
  kpiCard: {
    width: '48%',
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.md,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiValue: {
    marginBottom: tokens.spacing.xs,
  },
  kpiSubtitle: {
    fontSize: 12,
  },
  chartsContainer: {
    marginBottom: tokens.spacing.lg,
  },
  chartCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.md,
  },
  chartTitle: {
    marginBottom: tokens.spacing.md,
    color: tokens.colors.text.primary,
  },
  chart: {
    marginVertical: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.md,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  statsTitle: {
    marginBottom: tokens.spacing.md,
    color: tokens.colors.text.primary,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  clientInfo: {
    flex: 1,
  },
});

export default DashboardScreen;