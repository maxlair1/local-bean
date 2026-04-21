import { DefaultTheme } from '@react-navigation/native';

const LIGHT = {
  background:            'hsl(75 25% 97%)',
  foreground:            'hsl(75 15% 8%)',
  card:                  'hsl(75 25% 97%)',
  cardForeground:        'hsl(75 15% 8%)',
  popover:               'hsl(75 25% 97%)',
  popoverForeground:     'hsl(75 15% 8%)',
  primary:               'hsl(142 72% 38%)',
  primaryForeground:     'hsl(144 80% 98%)',
  secondary:             'hsl(75 20% 90%)',
  secondaryForeground:   'hsl(75 15% 8%)',
  muted:                 'hsl(75 20% 90%)',
  mutedForeground:       'hsl(75 10% 42%)',
  accent:                'hsl(78 15% 72%)',
  accentForeground:      'hsl(75 15% 8%)',
  destructive:           'hsl(0 84% 60%)',
  destructiveForeground: 'hsl(0 0% 98%)',
  border:                'hsl(75 14% 87%)',
  input:                 'hsl(75 14% 87%)',
  ring:                  'hsl(142 72% 38%)',
};

const DARK = {
  background:            'hsl(78 14% 6%)',
  foreground:            'hsl(0 0% 100%)',
  card:                  'hsl(78 14% 9%)',
  cardForeground:        'hsl(0 0% 100%)',
  popover:               'hsl(78 14% 9%)',
  popoverForeground:     'hsl(0 0% 100%)',
  primary:               'hsl(142 72% 42%)',
  primaryForeground:     'hsl(144 80% 5%)',
  secondary:             'hsl(78 18% 16%)',
  secondaryForeground:   'hsl(0 0% 100%)',
  muted:                 'hsl(78 18% 16%)',
  mutedForeground:       'hsl(78 12% 60%)',
  accent:                'hsl(78 16% 24%)',
  accentForeground:      'hsl(0 0% 100%)',
  destructive:           'hsl(0 84% 60%)',
  destructiveForeground: 'hsl(0 0% 98%)',
  border:                'hsl(78 16% 19%)',
  input:                 'hsl(78 16% 21%)',
  ring:                  'hsl(142 72% 42%)',
};

export const THEME = { light: LIGHT, dark: DARK };

export const NAV_THEME = {
  light: {
    dark: false,
    colors: {
      background:   LIGHT.background,
      border:       LIGHT.border,
      card:         LIGHT.card,
      notification: LIGHT.destructive,
      primary:      LIGHT.primary,
      text:         LIGHT.foreground,
    },
    fonts: DefaultTheme.fonts,
  },
  dark: {
    dark: true,
    colors: {
      background:   DARK.background,
      border:       DARK.border,
      card:         DARK.card,
      notification: DARK.destructive,
      primary:      DARK.primary,
      text:         DARK.foreground,
    },
    fonts: DefaultTheme.fonts,
  },
};