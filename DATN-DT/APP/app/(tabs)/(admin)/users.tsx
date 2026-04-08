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
import { UserPlus, Search, Shield, ShieldOff } from 'lucide-react-native';
import { Button, Input, Card, Loading, EmptyState, Badge } from '@/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { User } from '@/types';

export default function AdminUsersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: () => userService.getAll(),
  });

  const toggleStatus = useMutation({
    mutationFn: (id: string) => userService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToggleStatus = (user: User) => {
    Alert.alert(
      'Thay đổi trạng thái',
      `Bạn muốn ${user.role === 'admin' ? 'hạ quyền admin' : 'nâng quyền admin'} của "${user.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await toggleStatus.mutateAsync(user.id);
              Alert.alert('Thành công', 'Đã cập nhật trạng thái');
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc muốn xóa người dùng "${user.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser.mutateAsync(user.id);
              Alert.alert('Thành công', 'Đã xóa người dùng');
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = data?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
  ) || [];

  const renderUser = ({ item }: { item: User }) => (
    <Card variant="elevated" padding="md" style={styles.userCard}>
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
            {item.role === 'admin' && (
              <Badge label="Admin" variant="secondary" size="sm" />
            )}
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: item.role === 'admin' ? COLORS.warning + '20' : COLORS.success + '20' },
            ]}
            onPress={() => handleToggleStatus(item)}
          >
            {item.role === 'admin' ? (
              <ShieldOff size={18} color={COLORS.warning} />
            ) : (
              <Shield size={18} color={COLORS.success} />
            )}
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
        <Text style={styles.title}>Quản lý người dùng</Text>
        <Text style={styles.subtitle}>Quản lý tài khoản người dùng</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Search size={20} color={COLORS.gray[400]} />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInputField}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Tổng: {data?.length || 0} người dùng
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <EmptyState
            title="Không tìm thấy người dùng"
            description="Không có người dùng nào phù hợp"
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
  statsRow: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING['2xl'],
  },
  userCard: {
    marginBottom: SPACING.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  userPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
