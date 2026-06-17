import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Star, Clock, ChevronRight } from 'lucide-react-native';
import { Loading } from '@/components';
import { usePitches } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

export default function PitchListScreen() {
  const { data: pitches, isLoading, error } = usePitches();

  const getPitchTypeLabel = (type: string): string => {
    switch (type) {
      case '5v5': return 'Sân 5 người';
      case '7v7': return 'Sân 7 người';
      case '11v11': return 'Sân 11 người';
      default: return type;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <Loading fullScreen text="Đang tải danh sách sân..." />;
  }

  if (error || !pitches?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có sân bóng nào</Text>
          <Text style={styles.emptySubtext}>Vui lòng thử lại sau</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderPitchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.pitchCard}
      onPress={() => router.push(`/pitch/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/120x100' }}
        style={styles.pitchImage}
      />
      <View style={styles.pitchInfo}>
        <View style={styles.pitchHeader}>
          <Text style={styles.pitchName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{getPitchTypeLabel(item.type)}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={COLORS.gray[500]} />
          <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.rating}>{item.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount || 0})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(item.pricePerHour)}</Text>
            <Text style={styles.priceUnit}>/giờ</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={COLORS.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách sân bóng</Text>
        <Text style={styles.headerSubtitle}>{pitches.length} sân</Text>
      </View>

      <FlatList
        data={pitches}
        renderItem={renderPitchItem}
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
  pitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  pitchImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
  },
  pitchInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  pitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  pitchName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    flex: 1,
  },
  typeBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
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
  },
});
