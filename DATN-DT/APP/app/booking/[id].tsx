import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  XCircle,
} from 'lucide-react-native';
import { Button, Card, Badge, Loading } from '@/components';
import { useBooking, useCancelBooking } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: booking, isLoading } = useBooking(id);
  const cancelBooking = useCancelBooking();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xác nhận', variant: 'warning' as const, color: COLORS.warning };
      case 'confirmed':
        return { label: 'Đã xác nhận', variant: 'success' as const, color: COLORS.success };
      case 'cancelled':
        return { label: 'Đã hủy', variant: 'error' as const, color: COLORS.error };
      case 'completed':
        return { label: 'Hoàn thành', variant: 'info' as const, color: COLORS.info };
      default:
        return { label: status, variant: 'default' as const, color: COLORS.gray[500] };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
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

  const handleCancel = () => {
    Alert.alert(
      'Hủy đặt sân',
      'Bạn có chắc chắn muốn hủy đặt sân này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt sân',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking.mutateAsync(id);
              Alert.alert('Thành công', 'Đã hủy đặt sân thành công');
            } catch (err: any) {
              Alert.alert(
                'Lỗi',
                err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen text="Đang tải thông tin..." />;
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin đặt sân</Text>
          <Button title="Quay lại" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const isPastBooking = new Date(booking.date) < new Date();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt sân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" padding="lg" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.pitchName}>{booking.pitch?.name || 'Sân bóng'}</Text>
            <Badge label={statusInfo.label} variant={statusInfo.variant} />
          </View>

          {booking.pitch?.address && (
            <View style={styles.infoRow}>
              <MapPin size={18} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>{booking.pitch.address}</Text>
            </View>
          )}
        </Card>

        <Card variant="default" padding="lg" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Thông tin đặt sân</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày</Text>
              <Text style={styles.detailValue}>{formatDate(booking.date)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Giờ</Text>
              <Text style={styles.detailValue}>
                {booking.startTime} - {booking.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CreditCard size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Tổng tiền</Text>
              <Text style={styles.priceValue}>{formatPrice(booking.totalPrice)}</Text>
            </View>
          </View>

          {booking.note && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={{ fontSize: 16 }}>📝</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ghi chú</Text>
                <Text style={styles.detailValue}>{booking.note}</Text>
              </View>
            </View>
          )}
        </Card>

        <Card variant="default" padding="lg" style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Trạng thái thanh toán</Text>
            <Badge
              label={
                booking.paymentStatus === 'paid'
                  ? 'Đã thanh toán'
                  : booking.paymentStatus === 'unpaid'
                  ? 'Chưa thanh toán'
                  : 'Đã hoàn tiền'
              }
              variant={
                booking.paymentStatus === 'paid'
                  ? 'success'
                  : booking.paymentStatus === 'unpaid'
                  ? 'warning'
                  : 'info'
              }
            />
          </View>

          {booking.paymentMethod && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <Text style={styles.paymentValue}>
                {booking.paymentMethod === 'cash'
                  ? 'Tiền mặt'
                  : booking.paymentMethod === 'banking'
                  ? 'Chuyển khoản'
                  : booking.paymentMethod}
              </Text>
            </View>
          )}
        </Card>

        {canCancel && !isPastBooking && (
          <Button
            title="Hủy đặt sân"
            variant="danger"
            onPress={handleCancel}
            loading={cancelBooking.isPending}
            fullWidth
            style={styles.cancelButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  statusCard: {
    marginBottom: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pitchName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginLeft: SPACING.sm,
    flex: 1,
  },
  detailsCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray[900],
    marginTop: 2,
  },
  priceValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  paymentCard: {
    marginBottom: SPACING.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  paymentLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  paymentValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray[900],
  },
  cancelButton: {
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
  },
});
