import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { Button, Badge, Loading } from '@/components';
import { usePitch } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 250;

export default function PitchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pitch, isLoading, error } = usePitch(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return <Loading fullScreen text="Đang tải thông tin sân..." />;
  }

  if (error || !pitch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy sân bóng</Text>
          <Button title="Quay lại" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const images = pitch.images?.length > 0
    ? pitch.images
    : ['https://via.placeholder.com/400x250'];

  const getPitchTypeLabel = (type: string): string => {
    switch (type) {
      case '5v5': return 'Sân 5 người';
      case '7v7': return 'Sân 7 người';
      case '11v11': return 'Sân 11 người';
      default: return type;
    }
  };

  const getPitchTypeColor = (type: string): string => {
    switch (type) {
      case '5v5': return COLORS.primary;
      case '7v7': return COLORS.secondary;
      case '11v11': return COLORS.info;
      default: return COLORS.gray[500];
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBooking = () => {
    router.push(`/pitch/${id}/booking`);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>

          {images.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPreviousImage}
              >
                <ChevronLeft size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNextImage}
              >
                <ChevronRight size={24} color={COLORS.white} />
              </TouchableOpacity>

              <View style={styles.pagination}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}

          <View style={styles.typeContainer}>
            <Badge
              label={getPitchTypeLabel(pitch.type)}
              variant="primary"
              style={{ backgroundColor: getPitchTypeColor(pitch.type) }}
            />
          </View>

          {pitch.status === 'maintenance' && (
            <View style={styles.maintenanceOverlay}>
              <Text style={styles.maintenanceText}>Đang bảo trì</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{pitch.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={18} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.rating}>{pitch.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.reviewCount}>
                ({pitch.reviewCount || 0} đánh giá)
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={18} color={COLORS.gray[500]} />
            <Text style={styles.address}>{pitch.address}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Clock size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Giá thuê</Text>
                <Text style={styles.infoValue}>
                  {formatPrice(pitch.pricePerHour)} / giờ
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>
              {pitch.description || 'Không có mô tả'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Giá từ</Text>
          <Text style={styles.price}>{formatPrice(pitch.pricePerHour)}</Text>
          <Text style={styles.priceUnit}>/giờ</Text>
        </View>

        <Button
          title="Đặt sân ngay"
          onPress={handleBooking}
          disabled={pitch.status === 'maintenance'}
          style={styles.bookButton}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: IMAGE_HEIGHT / 2 - 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLeft: {
    left: SPACING.md,
  },
  navButtonRight: {
    right: SPACING.md,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  typeContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
  },
  maintenanceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maintenanceText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  address: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  infoCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  infoValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 24,
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
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginRight: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  bookButton: {
    flex: 1,
    marginLeft: SPACING.lg,
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
