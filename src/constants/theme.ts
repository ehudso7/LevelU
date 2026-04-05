/**
 * LEVEL app design tokens.
 * Single source of truth for colors, spacing, typography, and radii.
 */

export const Colors = {
  // Brand
  brand: '#6C5CE7',
  brandLight: '#A29BFE',
  brandDark: '#4A3FB5',

  // Backgrounds
  bg: '#0D0D0D',
  bgCard: '#1A1A2E',
  bgElevated: '#252540',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',

  // Accents
  success: '#00D68F',
  warning: '#FFAA00',
  error: '#FF3D71',
  info: '#0095FF',

  // Borders
  border: '#2A2A40',
  borderLight: '#3A3A55',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
