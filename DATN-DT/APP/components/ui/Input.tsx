import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.input];

    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }

    if (error) {
      baseStyle.push(styles.inputError);
    }

    if (style) {
      baseStyle.push(style as ViewStyle);
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputWrapper}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={getInputStyle()}
          placeholderTextColor={COLORS.gray[400]}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsSecure(!isSecure)}
          >
            {isSecure ? (
              <EyeOff size={20} color={COLORS.gray[400]} />
            ) : (
              <Eye size={20} color={COLORS.gray[400]} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  leftIcon: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 1,
    padding: SPACING.xs,
  },
  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default Input;
