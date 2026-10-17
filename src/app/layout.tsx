import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'BatchTrace Agent — AI-Powered Food Traceability & Batch Investigation Platform',
  description: 'Every batch has a story. Find it instantly. Grounded deterministic traceability, document ingestion, open-weight AI investigation, and evidence-backed incident intelligence for food manufacturers.',
  keywords: [
    'Food Traceability',
    'Batch Investigation',
    'Food Safety AI',
    'FSMA 204 Compliance',
    'Supply Chain Intelligence',
    'Batch Recall Support'
  ],
  authors: [{ name: 'BatchTrace Systems' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7F6F0] text-[#27343A]">
        {children}
      </body>
    </html>
  );
}
