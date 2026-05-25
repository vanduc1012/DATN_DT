import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Plus, Search, Edit2, Trash2 } from 'lucide-react-native';
import { Button, Input, Card, Loading, EmptyState, Badge } from '@/components';
import {
  usePitches,
  useCreatePitch,
  useUpdatePitch,
  useDeletePitch,
} from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import type { Pitch, PitchType } from '@/types';

export default function AdminPitchesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [type, setType] = useState<PitchType>('5v5');

  const { data, isLoading, refetch } = usePitches({
    search: searchQuery || undefined,
  });

  const createPitch = useCreatePitch();
  const updatePitch = useUpdatePitch();
  const deletePitch = useDeletePitch();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const resetForm = () => {
    setName('');
    setAddress('');
    setDescription('');
    setPricePerHour('');
    setType('5v5');
    setEditingPitch(null);
  };

  const handleEdit = (pitch: Pitch) => {
    setEditingPitch(pitch);
    setName(pitch.name);
    setAddress(pitch.address);
    setDescription(pitch.description);
    setPricePerHour(pitch.pricePerHour.toString());
    setType(pitch.type);
    setShowModal(true);
  };

  const handleDelete = (pitch: Pitch) => {
    Alert.alert(
      'Xóa sân bóng',
      `Bạn có chắc muốn xóa sân "${pitch.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePitch.mutateAsync(pitch.id);
              Alert.alert('Thành công', 'Đã xóa sân bóng');
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!name || !address || !pricePerHour) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const pitchData = {
      name,
      address,
      description,
      pricePerHour: Number(pricePerHour),
      type,
      images: editingPitch?.images || [],
      status: editingPitch?.status || 'available',
    };

    try {
      if (editingPitch) {
        await updatePitch.mutateAsync({ id: editingPitch.id, data: pitchData });
        Alert.alert('Thành công', 'Đã cập nhật sân bóng');
      } else {
        await createPitch.mutateAsync(pitchData);
        Alert.alert('Thành công', 'Đã thêm sân bóng mới');
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const renderPitch = ({ item }: { item: Pitch }) => (
    <Card variant="elevated" padding="md" style={styles.pitchCard}>
      <View style={styles.pitchRow}>
        {item.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.pitchImage} />
        ) : (
          <View style={[styles.pitchImage, styles.pitchImagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.pitchInfo}>
          <Text style={styles.pitchName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.pitchAddress} numberOfLines={1}>{item.address}</Text>
          <View style={styles.pitchMeta}>
            <Badge
              label={item.type === '5v5' ? 'Sân 5' : item.type === '7v7' ? 'Sân 7' : 'Sân 11'}
              variant="primary"
              size="sm"
            />
            <Badge
              label={item.status === 'available' ? 'Hoạt động' : 'Bảo trì'}
              variant={item.status === 'available' ? 'success' : 'warning'}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.pitchActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
          >
            <Edit2 size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return <Loading fullScreen text="Đang tải dữ liệu..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý sân bóng</Text>
        <Text style={styles.subtitle}>Thêm, sửa, xóa sân bóng</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Search size={20} color={COLORS.gray[400]} />
            <Input
              placeholder="Tìm kiếm sân..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInputField}
            />
          </View>
          <Button
            title="Thêm"
            onPress={() => {
              resetForm();
              setShowModal(true);
            }}
            leftIcon={<Plus size={20} color={COLORS.white} />}
            size="md"
          />
        </View>
      </View>

      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={renderPitch}
        ListEmptyComponent={
          <EmptyState
            title="Không có sân bóng"
            description="Chưa có sân bóng nào trong hệ thống"
            icon={<Search size={48} color={COLORS.gray[300]} />}
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

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPitch ? 'Sửa sân bóng' : 'Thêm sân bóng mới'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalClose}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Tên sân"
              placeholder="Nhập tên sân"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Địa chỉ"
              placeholder="Nhập địa chỉ"
              value={address}
              onChangeText={setAddress}
            />

            <Input
              label="Mô tả"
              placeholder="Nhập mô tả"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Input
              label="Giá/giờ (VNĐ)"
              placeholder="Nhập giá"
              value={pricePerHour}
              onChangeText={setPricePerHour}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Loại sân</Text>
            <View style={styles.typeButtons}>
              {(['5v5', '7v7', '11v11'] as PitchType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    type === t && styles.typeButtonActive,
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === t && styles.typeButtonTextActive,
                    ]}
                  >
                    {t === '5v5' ? 'Sân 5' : t === '7v7' ? 'Sân 7' : 'Sân 11'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={editingPitch ? 'Cập nhật' : 'Thêm mới'}
              onPress={handleSubmit}
              loading={createPitch.isPending || updatePitch.isPending}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  searchInputField: {
    flex: 1,
    marginBottom: 0,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING['2xl'],
  },
  pitchCard: {
    marginBottom: SPACING.md,
  },
  pitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pitchImage: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
  },
  pitchImagePlaceholder: {
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  pitchInfo: {
    flex: 1,
  },
  pitchName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  pitchAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  pitchMeta: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  pitchActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  modalClose: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  typeButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});
