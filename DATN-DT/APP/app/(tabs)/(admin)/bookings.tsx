import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Search, Filter } from 'lucide-react-native';
import { BookingCard, Loading, EmptyState, Badge } from '@/components';
import { useBookings, useUpdateBookingStatus } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { Booking, BookingStatus } from '@/types';

const STATUS_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export default function AdminBookingsScreen() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useBookings({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });

  const updateStatus = useUpdateBookingStatus();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBookingPress = (booking: Booking) => {
    Alert.alert(
      'Xác nhận đặt sân',
      `Bạn muốn xác nhận đặt sân này?`,
      [
        { text: 'Từ chối', style: 'destructive', onPress: () => handleUpdateStatus(booking.id, 'cancelled') },
        { text: 'Xác nhận', onPress: () => handleUpdateStatus(booking.id, 'confirmed') },
      ]
    );
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      Alert.alert('Thành công', `Đã cập nhật trạng thái đặt sân`);
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Quản lý đặt sân</Text>
      <Text style={styles.subtitle}>Xác nhận và quản lý các lịch đặt sân</Text>

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
        <Text style={styles.statsText}>
          Tổng: {data?.total || 0} lịch đặt
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <Loading fullScreen text="Đang tải dữ liệu..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="Không có lịch đặt"
            description="Không có lịch đặt nào với trạng thái này"
            icon={<Calendar size={48} color={COLORS.gray[300]} />}
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
    marginBottom: SPACING.md,
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
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
});
