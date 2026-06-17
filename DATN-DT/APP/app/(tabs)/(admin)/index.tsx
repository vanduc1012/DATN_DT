import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Card, Loading } from '@/components';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card variant="elevated" padding="md" style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </Card>
);

export default function AdminDashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: statsService.getOverview,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  if (isLoading) {
    return <Loading fullScreen text="Đang tải dữ liệu..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tổng quan</Text>
          <Text style={styles.subtitle}>Xem thống kê hệ thống</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng sân"
            value={stats?.totalPitches || 0}
            icon={<LayoutDashboard size={24} color={COLORS.primary} />}
            color={COLORS.primary}
          />

          <StatCard
            title="Tổng đặt sân"
            value={stats?.totalBookings || 0}
            icon={<Calendar size={24} color={COLORS.info} />}
            color={COLORS.info}
          />

          <StatCard
            title="Doanh thu"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<DollarSign size={24} color={COLORS.success} />}
            color={COLORS.success}
            subtitle="VNĐ"
          />

          <StatCard
            title="Đặt hôm nay"
            value={stats?.todayBookings || 0}
            icon={<Clock size={24} color={COLORS.warning} />}
            color={COLORS.warning}
          />

          <StatCard
            title="Chờ xác nhận"
            value={stats?.pendingBookings || 0}
            icon={<Clock size={24} color={COLORS.warning} />}
            color={COLORS.warning}
          />

          <StatCard
            title="Đã xác nhận"
            value={stats?.totalBookings - (stats?.pendingBookings || 0)}
            icon={<CheckCircle size={24} color={COLORS.success} />}
            color={COLORS.success}
          />
        </View>

        <Card variant="elevated" padding="lg" style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Calendar size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Xem lịch đặt</Text>
            </View>

            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                <LayoutDashboard size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionText}>Quản lý sân</Text>
            </View>

            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '20' }]}>
                <TrendingUp size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Xem thống kê</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: '47%',
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  statSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  quickActions: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
});
