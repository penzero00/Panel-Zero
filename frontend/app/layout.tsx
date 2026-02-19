/**
 * Root Layout - TanStack Query provider and main wrapper
 */

import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/query-provider';

export const metadata: Metadata = {
  title: 'PanelZero - Academic Thesis Grading System',
  description: 'Role-based AI grading system for thesis defenses with non-destructive DOCX editing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
