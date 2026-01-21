// Charte graphique SAFIR (basée sur le logo officiel)
export const COLORS = {
  // Couleurs principales SAFIR
  primary: '#1e6bb8',        // Bleu SAFIR (texte logo)
  primaryLight: '#7ab8e0',   // Bleu clair (triangle logo)
  primaryDark: '#155a9c',    // Bleu foncé

  // Couleurs secondaires
  secondary: '#6c757d',      // Gris SAFIR (arc logo)
  secondaryLight: '#8e959b',
  secondaryDark: '#545b62',

  // Accent (rouge/magenta du logo)
  accent: '#a82255',         // Rouge SAFIR "INDUSTRIE"
  accentLight: '#c44d7a',
  accentDark: '#8a1c46',

  // Statuts
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',

  // Neutres
  dark: '#2c3e50',
  darkBlue: '#1a3a5c',
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },

  // Backgrounds
  background: {
    default: '#f4f6f8',
    paper: '#ffffff',
    dark: '#1a3a5c',
  },

  // Text
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.54)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    inverse: '#ffffff',
  },
};

// Configuration du thème Ant Design avec couleurs SAFIR
export const antdTheme = {
  token: {
    colorPrimary: COLORS.primary,
    colorSuccess: COLORS.success,
    colorWarning: COLORS.warning,
    colorError: COLORS.error,
    colorInfo: COLORS.info,
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Table: {
      borderRadius: 12,
    },
  },
};

export default COLORS;
