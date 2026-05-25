import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
}) => {
  const formatTime = (time: string): string => {
    return time;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderSlot = ({ item }: { item: TimeSlot }) => {
    const isSelected = selectedSlot?.id === item.id;
    const isAvailable = item.isAvailable;

    return (
      <TouchableOpacity
        style={[
          styles.slot,
          isSelected && styles.slotSelected,
          !isAvailable && styles.slotDisabled,
        ]}
        onPress={() => isAvailable && onSelectSlot(item)}
        disabled={!isAvailable}
        activeOpacity={0.7}
      >
        <Clock size={16} color={isSelected ? COLORS.white : COLORS.gray[500]} />
        <Text
          style={[
            styles.slotTime,
            isSelected && styles.slotTimeSelected,
            !isAvailable && styles.slotTimeDisabled,
          ]}
        >
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        <Text
          style={[
            styles.slotPrice,
            isSelected && styles.slotPriceSelected,
            !isAvailable && styles.slotPriceDisabled,
          ]}
        >
          {formatPrice(item.price)}
        </Text>
        {!isAvailable && (
          <Text style={styles.slotUnavailable}>Đã đặt</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khung giờ</Text>
      {slots.length === 0 ? (
        <Text style={styles.emptyText}>Không có khung giờ trống</Text>
      ) : (
        <FlatList
          data={slots}
          renderItem={renderSlot}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: SPACING.sm,
  },
  list: {
    gap: SPACING.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  slot: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
    minHeight: 80,
  },
  slotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotDisabled: {
    backgroundColor: COLORS.gray[100],
    opacity: 0.6,
  },
  slotTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginTop: SPACING.xs,
  },
  slotTimeSelected: {
    color: COLORS.white,
  },
  slotTimeDisabled: {
    color: COLORS.gray[400],
  },
  slotPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 2,
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
    marginTop: 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});

export default TimeSlotPicker;
