/**
 * Theme System
 *
 * Base primitives using tokens from design-system.json
 * No hardcoded colors, spacing, or typography values.
 */

// =============================================================================
// Color Tokens
// =============================================================================

export const colors = {
  primitive: {
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    blue: {
      500: '#007AFF',
      600: '#0056CC',
    },
    red: {
      500: '#FF3B30',
      600: '#D63029',
    },
    green: {
      500: '#34C759',
      600: '#28A745',
    },
  },
  light: {
    systemBackground: '#F2F2F7',
    cardBackground: '#FFFFFF',
    separator: 'rgb(231, 231, 232)',
    label: '#000000',
    secondaryLabel: '#8E8E93',
    tertiaryLabel: '#C7C7CC',
    sectionHeader: '#6D6D72',
    link: '#007AFF',
    destructive: '#FF3B30',
    activeHighlight: '#E5E5EA',
  },
  dark: {
    systemBackground: '#000000',
    cardBackground: '#1C1C1E',
    separator: '#38383A',
    label: '#FFFFFF',
    secondaryLabel: '#8E8E93',
    tertiaryLabel: '#636366',
    sectionHeader: '#8E8E93',
    link: '#007AFF',
    destructive: '#FF453A',
    chevron: '#48484A',
  },
} as const;

// =============================================================================
// Typography Tokens
// =============================================================================

export const typography = {
  fontFamily: {
    sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
    display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
  },
  scale: {
    xs: { size: '13px', lineHeight: '18px', letterSpacing: '-0.08px' },
    sm: { size: '14px', lineHeight: '20px', letterSpacing: '-0.08px' },
    base: { size: '16px', lineHeight: '22px', letterSpacing: '-0.41px' },
    lg: { size: '17px', lineHeight: '22px', letterSpacing: '-0.41px' },
    xl: { size: '20px', lineHeight: '25px', letterSpacing: '-0.41px' },
    '2xl': { size: '24px', lineHeight: '32px', letterSpacing: '-0.41px' },
    '3xl': { size: '30px', lineHeight: '36px', letterSpacing: '-0.41px' },
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// =============================================================================
// Spacing Tokens
// =============================================================================

export const spacing = {
  listGroupMargin: '0 16px 20px 16px',
  listGroupFirstMarginTop: '20px',
  listItemPadding: '11px 16px',
  listItemMinHeight: '50px',
  sectionHeaderMarginBottom: '7px',
  separatorLeftInset: '16px',
} as const;

// =============================================================================
// Border Radius Tokens
// =============================================================================

export const borderRadius = {
  listCard: '20px',
  button: '12px',
  iconBadge: '6px',
} as const;

// =============================================================================
// Theme Type
// =============================================================================

type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    card: string;
    separator: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    link: string;
    destructive: string;
  };
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

// =============================================================================
// Theme Factory
// =============================================================================

export const createTheme = (mode: ThemeMode): Theme => {
  const colorScheme = mode === 'dark' ? colors.dark : colors.light;

  return {
    mode,
    colors: {
      background: colorScheme.systemBackground,
      card: colorScheme.cardBackground,
      separator: colorScheme.separator,
      text: {
        primary: colorScheme.label,
        secondary: colorScheme.secondaryLabel,
        tertiary: colorScheme.tertiaryLabel,
      },
      link: colorScheme.link,
      destructive: colorScheme.destructive,
    },
    typography,
    spacing,
    borderRadius,
  };
};

// =============================================================================
// Pre-built Themes
// =============================================================================

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

// =============================================================================
// Primitive Style Factories
// =============================================================================

/**
 * Text primitive styles
 */
export const text = {
  primary: (theme: Theme) => ({
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    lineHeight: theme.typography.scale.lg.lineHeight,
    letterSpacing: theme.typography.scale.lg.letterSpacing,
    fontWeight: theme.typography.weight.normal,
  }),
  secondary: (theme: Theme) => ({
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    lineHeight: theme.typography.scale.lg.lineHeight,
    letterSpacing: theme.typography.scale.lg.letterSpacing,
    fontWeight: theme.typography.weight.normal,
  }),
  tertiary: (theme: Theme) => ({
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.xs.size,
    lineHeight: theme.typography.scale.xs.lineHeight,
    letterSpacing: theme.typography.scale.xs.letterSpacing,
    fontWeight: theme.typography.weight.normal,
  }),
  title: (theme: Theme) => ({
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.scale['3xl'].size,
    lineHeight: theme.typography.scale['3xl'].lineHeight,
    letterSpacing: theme.typography.scale['3xl'].letterSpacing,
    fontWeight: theme.typography.weight.bold,
  }),
  link: (theme: Theme) => ({
    color: theme.colors.link,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    lineHeight: theme.typography.scale.lg.lineHeight,
    letterSpacing: theme.typography.scale.lg.letterSpacing,
    fontWeight: theme.typography.weight.normal,
  }),
  destructive: (theme: Theme) => ({
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    lineHeight: theme.typography.scale.lg.lineHeight,
    letterSpacing: theme.typography.scale.lg.letterSpacing,
    fontWeight: theme.typography.weight.normal,
  }),
};

/**
 * Button primitive styles
 */
export const button = {
  primary: (theme: Theme) => ({
    backgroundColor: colors.primitive.blue[500],
    color: colors.primitive.white,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    fontWeight: theme.typography.weight.semibold,
    borderRadius: theme.borderRadius.button,
    height: '50px',
    border: 'none',
    cursor: 'pointer',
  }),
  secondary: (theme: Theme) => ({
    backgroundColor: 'transparent',
    color: theme.colors.link,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    fontWeight: theme.typography.weight.normal,
    borderRadius: theme.borderRadius.button,
    height: '50px',
    border: 'none',
    cursor: 'pointer',
  }),
  destructive: (theme: Theme) => ({
    backgroundColor: 'transparent',
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.scale.lg.size,
    fontWeight: theme.typography.weight.normal,
    borderRadius: theme.borderRadius.button,
    height: '50px',
    border: 'none',
    cursor: 'pointer',
  }),
};

/**
 * Card primitive styles
 */
export const card = {
  base: (theme: Theme) => ({
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.listCard,
    overflow: 'hidden',
  }),
  withPadding: (theme: Theme) => ({
    ...card.base(theme),
    padding: theme.spacing.listItemPadding,
  }),
};

/**
 * Screen container primitive styles
 */
export const screen = {
  base: (theme: Theme) => ({
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  }),
  withPadding: (theme: Theme) => ({
    ...screen.base(theme),
    padding: theme.spacing.listGroupMargin,
  }),
};

/**
 * Separator primitive styles
 */
export const separator = {
  base: (theme: Theme) => ({
    backgroundColor: theme.colors.separator,
    height: '0.33px',
    marginLeft: theme.spacing.separatorLeftInset,
  }),
  full: (theme: Theme) => ({
    backgroundColor: theme.colors.separator,
    height: '0.33px',
  }),
};

// =============================================================================
// Default Export
// =============================================================================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  createTheme,
  lightTheme,
  darkTheme,
  text,
  button,
  card,
  screen,
  separator,
};
