'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#B9A7E8', contrastText: '#111111' },
    secondary: { main: '#F8D84E', contrastText: '#111111' },
    info: { main: '#BFE3F8', contrastText: '#111111' },
    background: { default: '#F5F0FF', paper: '#FFFFFF' },
    text: { primary: '#111111', secondary: '#5A5A5A' },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    button: { fontWeight: 700, textTransform: 'none' },
    h1: {
      fontFamily: "'Brush Script MT', 'Segoe Print', 'Bradley Hand', cursive",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Brush Script MT', 'Segoe Print', 'Bradley Hand', cursive",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Brush Script MT', 'Segoe Print', 'Bradley Hand', cursive",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Brush Script MT', 'Segoe Print', 'Bradley Hand', cursive",
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 0, boxShadow: 'none' } } },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 0, boxShadow: '0 4px 18px rgba(17,17,17,.08)' } },
    },
  },
});

export default function VaultThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
