import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react-native';
import { Card, Badge } from '@/components/ui';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const getStatusBadge = (status: string) => {
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

  const statusBadge = getStatusBadge(booking.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="elevated" padding="md" style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pitchName} numberOfLines={1}>
            {booking.pitch?.name || 'Sân bóng'}
          </Text>
          <Badge label={statusBadge.label} variant={statusBadge.variant} size="sm" />
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>

          {booking.pitch?.address && (
            <View style={styles.detailRow}>
              <MapPin size={16} color={COLORS.gray[500]} />
              <Text style={styles.detailText} numberOfLines={1}>
                {booking.pitch.address}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Tổng tiền</Text>
            <Text style={styles.price}>{formatPrice(booking.totalPrice)}</Text>
          </View>

          {booking.paymentStatus && (
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
              size="sm"
            />
          )}
        </View>

        {booking.note && (
          <View style={styles.note}>
            <Text style={styles.noteText}>Ghi chú: {booking.note}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pitchName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  details: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginLeft: SPACING.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.md,
  },
  priceSection: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  note: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  noteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontStyle: 'italic',
  },
});

export default BookingCard;
