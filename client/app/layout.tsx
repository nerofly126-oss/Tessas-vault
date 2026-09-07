import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Tessa's Vault",
  description: 'A home for your moments',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
