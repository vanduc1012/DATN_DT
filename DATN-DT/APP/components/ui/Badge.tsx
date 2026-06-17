import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getBadgeStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.base];

    switch (variant) {
      case 'default':
        baseStyle.push(styles.default);
        break;
      case 'success':
        baseStyle.push(styles.success);
        break;
      case 'warning':
        baseStyle.push(styles.warning);
        break;
      case 'error':
        baseStyle.push(styles.error);
        break;
      case 'info':
        baseStyle.push(styles.info);
        break;
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
    }

    switch (size) {
      case 'sm':
        baseStyle.push(styles.sizeSm);
        break;
      case 'md':
        baseStyle.push(styles.sizeMd);
        break;
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'default':
      case 'primary':
        return COLORS.white;
      case 'success':
      case 'warning':
      case 'error':
      case 'info':
      case 'secondary':
        return COLORS.white;
      default:
        return COLORS.white;
    }
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: COLORS.gray[500],
  },
  success: {
    backgroundColor: COLORS.success,
  },
  warning: {
    backgroundColor: COLORS.warning,
  },
  error: {
    backgroundColor: COLORS.error,
  },
  info: {
    backgroundColor: COLORS.info,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  sizeSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  sizeMd: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

export default Badge;
