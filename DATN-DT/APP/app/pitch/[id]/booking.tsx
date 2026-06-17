import React, { useState } from 'react';
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
import { ArrowLeft, Calendar, Clock, CreditCard } from 'lucide-react-native';
import { Button, Input, Card, Loading } from '@/components';
import { usePitch, useAvailableSlots, useCreateBooking } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import type { TimeSlot } from '@/types';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: pitch, isLoading: pitchLoading } = usePitch(id);
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(id, new Date().toISOString().split('T')[0]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'banking'>('cash');

  const createBooking = useCreateBooking();

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

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { weekday: 'short' });
  };

  const getDayNumber = (dateString: string): string => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const isToday = (dateString: string): boolean => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !pitch) return;

    try {
      await createBooking.mutateAsync({
        pitchId: pitch.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        note: note || undefined,
        paymentMethod,
      });

      Alert.alert(
        'Thành công',
        'Đặt sân thành công! Vui lòng chờ xác nhận từ chủ sân.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/schedule') }]
      );
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      );
    }
  };

  if (pitchLoading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt sân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pitch && (
          <Card variant="elevated" padding="md" style={styles.pitchCard}>
            <Text style={styles.pitchName}>{pitch.name}</Text>
            <Text style={styles.pitchAddress}>{pitch.address}</Text>
          </Card>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Chọn ngày</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
            {generateDates().map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateItem,
                  selectedDate === date && styles.dateItemSelected,
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    selectedDate === date && styles.dayNameSelected,
                  ]}
                >
                  {getDayName(date)}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === date && styles.dayNumberSelected,
                  ]}
                >
                  {getDayNumber(date)}
                </Text>
                {isToday(date) && (
                  <View style={styles.todayDot} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
          </View>

          {slotsLoading ? (
            <Loading text="Đang tải khung giờ..." />
          ) : slots?.slots && slots.slots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {slots.slots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotItem,
                    selectedSlot?.id === slot.id && styles.slotItemSelected,
                    !slot.isAvailable && styles.slotItemDisabled,
                  ]}
                  onPress={() => slot.isAvailable && setSelectedSlot(slot)}
                  disabled={!slot.isAvailable}
                >
                  <Text
                    style={[
                      styles.slotTime,
                      selectedSlot?.id === slot.id && styles.slotTimeSelected,
                      !slot.isAvailable && styles.slotTimeDisabled,
                    ]}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  <Text
                    style={[
                      styles.slotPrice,
                      selectedSlot?.id === slot.id && styles.slotPriceSelected,
                      !slot.isAvailable && styles.slotPriceDisabled,
                    ]}
                  >
                    {formatPrice(slot.price)}
                  </Text>
                  {!slot.isAvailable && (
                    <Text style={styles.slotUnavailable}>Đã đặt</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noSlotsText}>
              Không có khung giờ trống cho ngày này
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
          <Input
            placeholder="Nhập ghi chú cho chủ sân..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            containerStyle={styles.noteInput}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'cash' && styles.paymentTextSelected,
                ]}
              >
                Tiền mặt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'banking' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('banking')}
            >
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'banking' && styles.paymentTextSelected,
                ]}
              >
                Chuyển khoản
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Tổng tiền</Text>
          <Text style={styles.priceValue}>
            {selectedSlot ? formatPrice(selectedSlot.price) : formatPrice(pitch?.pricePerHour || 0)}
          </Text>
        </View>

        <Button
          title="Xác nhận đặt sân"
          onPress={handleBooking}
          loading={createBooking.isPending}
          disabled={!selectedSlot}
          style={styles.confirmButton}
          size="lg"
        />
      </View>
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
    paddingBottom: 120,
  },
  pitchCard: {
    marginBottom: SPACING.lg,
  },
  pitchName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  pitchAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginLeft: SPACING.sm,
  },
  dateList: {
    gap: SPACING.sm,
  },
  dateItem: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    marginRight: SPACING.sm,
  },
  dateItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  dayNameSelected: {
    color: COLORS.white,
  },
  dayNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  dayNumberSelected: {
    color: COLORS.white,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  slotItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotItemDisabled: {
    opacity: 0.5,
  },
  slotTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  slotTimeSelected: {
    color: COLORS.white,
  },
  slotTimeDisabled: {
    color: COLORS.gray[400],
  },
  slotPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  slotPriceSelected: {
    color: COLORS.white,
  },
  slotPriceDisabled: {
    color: COLORS.gray[400],
  },
  slotUnavailable: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  noSlotsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  noteInput: {
    marginBottom: 0,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  paymentOption: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  paymentOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  paymentTextSelected: {
    color: COLORS.white,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    ...SHADOWS.lg,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  priceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  confirmButton: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
});
