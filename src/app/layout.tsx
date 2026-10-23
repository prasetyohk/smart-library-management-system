import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Perpustakaan KB-TK SBTH Magelang - Be Smart, Be Kind',
  description:
    'Sistem manajemen perpustakaan ceria ramah anak KB-TK Bhakti Tunas Harapan (SBTH) Magelang dengan katalog visual, barcode scanner USB/kamera, dan pencarian otomatis ISBN.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

