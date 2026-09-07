import './globals.css';
import type { Metadata } from 'next';
import VaultThemeProvider from './theme-provider';
export const metadata: Metadata = {
  title: "Tessa's Vault",
  description: 'A home for your moments',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VaultThemeProvider>{children}</VaultThemeProvider>
      </body>
    </html>
  );
}
