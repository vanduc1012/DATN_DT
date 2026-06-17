import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { Badge, Loading } from '@/components';
import { useBookings } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

export default function BookingListScreen() {
  const { user } = useAuthStore();
  const { data: bookings, isLoading, error } = useBookings();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xác nhận', variant: 'warning' as const };
      case 'confirmed':
        return { label: 'Đã xác nhận', variant: 'success' as const };
      case 'cancelled':
        return { label: 'Đã hủy', variant: 'error' as const };
      case 'completed':
        return { label: 'Hoàn thành', variant: 'info' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <Loading fullScreen text="Đang tải danh sách đặt sân..." />;
  }

  if (error || !bookings?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có lịch sử đặt sân</Text>
          <Text style={styles.emptySubtext}>Các đơn đặt sân của bạn sẽ hiển thị tại đây</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderBookingItem = ({ item }: { item: any }) => {
    const statusInfo = getStatusInfo(item.status);
    const isPastBooking = new Date(item.date) < new Date();

    return (
      <TouchableOpacity
        style={[styles.bookingCard, isPastBooking && styles.pastBooking]}
        onPress={() => router.push(`/booking/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.pitchName}>{item.pitch?.name || 'Sân bóng'}</Text>
          <Badge label={statusInfo.label} variant={statusInfo.variant} />
        </View>

        {item.pitch?.address && (
          <View style={styles.locationRow}>
            <MapPin size={14} color={COLORS.gray[500]} />
            <Text style={styles.address} numberOfLines={1}>{item.pitch.address}</Text>
          </View>
        )}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Calendar size={14} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>{item.startTime} - {item.endTime}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
          <ChevronRight size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử đặt sân</Text>
        <Text style={styles.headerSubtitle}>{bookings.length} đơn đặt sân</Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  pastBooking: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pitchName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  address: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  separator: {
    height: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
