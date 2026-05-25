import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const getCardStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.base];

    switch (variant) {
      case 'default':
        baseStyle.push(styles.default);
        break;
      case 'outlined':
        baseStyle.push(styles.outlined);
        break;
      case 'elevated':
        baseStyle.push(styles.elevated);
        break;
    }

    switch (padding) {
      case 'none':
        break;
      case 'sm':
        baseStyle.push(styles.paddingSm);
        break;
      case 'md':
        baseStyle.push(styles.paddingMd);
        break;
      case 'lg':
        baseStyle.push(styles.paddingLg);
        break;
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  return <View style={getCardStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
  },
  default: {
    ...SHADOWS.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  elevated: {
    ...SHADOWS.lg,
  },
  paddingSm: {
    padding: SPACING.sm,
  },
  paddingMd: {
    padding: SPACING.md,
  },
  paddingLg: {
    padding: SPACING.lg,
  },
});

export default Card;
