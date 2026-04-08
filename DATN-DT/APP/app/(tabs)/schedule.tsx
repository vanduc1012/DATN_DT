import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Filter } from 'lucide-react-native';
import { BookingCard, Loading, EmptyState, Badge } from '@/components';
import { useMyBookings } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { Booking, BookingStatus } from '@/types';

const STATUS_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export default function ScheduleScreen() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch, isFetching } = useMyBookings();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredBookings = data?.filter((booking) =>
    selectedStatus === 'all' ? true : booking.status === selectedStatus
  ) || [];

  const handleBookingPress = (booking: Booking) => {
    router.push(`/booking/${booking.id}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Lịch đặt sân</Text>
      <Text style={styles.subtitle}>
        Quản lý các lịch đặt sân của bạn
      </Text>

      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === item.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(item.id as BookingStatus | 'all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === item.id && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{data?.length || 0}</Text>
          <Text style={styles.statLabel}>Tổng đặt</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>
            {data?.filter((b) => b.status === 'pending').length || 0}
          </Text>
          <Text style={styles.statLabel}>Chờ xác nhận</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {data?.filter((b) => b.status === 'confirmed').length || 0}
          </Text>
          <Text style={styles.statLabel}>Đã xác nhận</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Danh sách lịch đặt</Text>
    </View>
  );

  if (isLoading) {
    return <Loading fullScreen text="Đang tải lịch sử đặt sân..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="Chưa có lịch đặt"
            description={
              selectedStatus === 'all'
                ? 'Bạn chưa đặt sân nào. Hãy tìm và đặt sân ngay!'
                : `Không có lịch đặt với trạng thái "${STATUS_FILTERS.find((f) => f.id === selectedStatus)?.label}"`
            }
            icon={<Calendar size={48} color={COLORS.gray[300]} />}
            action={
              selectedStatus === 'all' ? (
                <TouchableOpacity
                  style={styles.findPitchButton}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.findPitchButtonText}>Tìm sân bóng</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.lg,
  },
  filterList: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.md,
  },
  statNumber: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  findPitchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  findPitchButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
