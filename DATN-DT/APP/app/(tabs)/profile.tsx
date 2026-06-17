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
import { router } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Shield,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
} from 'lucide-react-native';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { useAuth } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  variant?: 'default' | 'danger';
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  variant = 'default',
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, variant === 'danger' && styles.menuIconDanger]}>
      {icon}
    </View>
    <View style={styles.menuContent}>
      <Text
        style={[
          styles.menuTitle,
          variant === 'danger' && styles.menuTitleDanger,
        ]}
      >
        {title}
      </Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showArrow && (
      <ChevronRight size={20} color={COLORS.gray[400]} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const menuGroups = [
    {
      title: 'Tài khoản',
      items: [
        {
          icon: <User size={20} color={COLORS.primary} />,
          title: 'Thông tin cá nhân',
          subtitle: 'Cập nhật hồ sơ của bạn',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
          icon: <Mail size={20} color={COLORS.primary} />,
          title: 'Email',
          subtitle: user?.email || 'Chưa cập nhật',
          onPress: () => {},
          showArrow: false,
        },
        {
          icon: <Phone size={20} color={COLORS.primary} />,
          title: 'Số điện thoại',
          subtitle: user?.phone || 'Chưa cập nhật',
          onPress: () => {},
          showArrow: false,
        },
      ],
    },
    {
      title: 'Cài đặt',
      items: [
        {
          icon: <Bell size={20} color={COLORS.primary} />,
          title: 'Thông báo',
          subtitle: 'Quản lý thông báo',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
          icon: <Shield size={20} color={COLORS.primary} />,
          title: 'Đổi mật khẩu',
          subtitle: 'Cập nhật mật khẩu mới',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
      ],
    },
    {
      title: 'Khác',
      items: [
        {
          icon: <Settings size={20} color={COLORS.primary} />,
          title: 'Cài đặt ứng dụng',
          subtitle: 'Phiên bản 1.0.0',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tài khoản</Text>
        </View>

        <Card variant="elevated" padding="lg" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </Card>

        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            <Card variant="default" padding="none">
              {group.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <MenuItem
                    icon={item.icon}
                    title={item.title}
                    subtitle={item.subtitle}
                    onPress={item.onPress}
                    showArrow={item.showArrow}
                  />
                  {itemIndex < group.items.length - 1 && (
                    <View style={styles.menuDivider} />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        <MenuItem
          icon={<LogOut size={20} color={COLORS.error} />}
          title="Đăng xuất"
          subtitle="Đăng xuất khỏi tài khoản"
          onPress={handleLogout}
          showArrow={false}
          variant="danger"
        />

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  adminBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
  },
  editButton: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  editButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  menuGroup: {
    marginBottom: SPACING.lg,
  },
  menuGroupTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIconDanger: {
    backgroundColor: COLORS.error + '10',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray[900],
  },
  menuTitleDanger: {
    color: COLORS.error,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginLeft: SPACING.md + 40 + SPACING.md,
  },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    marginTop: SPACING.xl,
  },
});
