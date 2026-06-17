import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { Card, Badge } from '@/components/ui';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { Pitch } from '@/types';

interface PitchCardProps {
  pitch: Pitch;
  onPress: () => void;
}

const PitchCard: React.FC<PitchCardProps> = ({ pitch, onPress }) => {
  const getPitchTypeLabel = (type: string): string => {
    switch (type) {
      case '5v5':
        return 'Sân 5 người';
      case '7v7':
        return 'Sân 7 người';
      case '11v11':
        return 'Sân 11 người';
      default:
        return type;
    }
  };

  const getPitchTypeColor = (type: string): string => {
    switch (type) {
      case '5v5':
        return COLORS.primary;
      case '7v7':
        return COLORS.secondary;
      case '11v11':
        return COLORS.info;
      default:
        return COLORS.gray[500];
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="elevated" padding="none" style={styles.container}>
        <Image
          source={{
            uri: pitch.images?.[0] || 'https://via.placeholder.com/400x200',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {pitch.status === 'maintenance' && (
          <View style={styles.maintenanceOverlay}>
            <Text style={styles.maintenanceText}>Đang bảo trì</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {pitch.name}
            </Text>
            <Badge
              label={getPitchTypeLabel(pitch.type)}
              variant="primary"
              size="sm"
              style={{ backgroundColor: getPitchTypeColor(pitch.type) }}
            />
          </View>

          <View style={styles.location}>
            <MapPin size={14} color={COLORS.gray[500]} />
            <Text style={styles.address} numberOfLines={1}>
              {pitch.address}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.rating}>
              <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingText}>
                {pitch.rating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.reviewCount}>
                ({pitch.reviewCount || 0} đánh giá)
              </Text>
            </View>

            <Text style={styles.price}>
              {formatPrice(pitch.pricePerHour)}
              <Text style={styles.priceUnit}>/giờ</Text>
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  maintenanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  maintenanceText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  location: {
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: COLORS.gray[500],
  },
});

export default PitchCard;
