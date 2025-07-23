import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ServiceProvider } from '@/lib/hooks';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Interview Practice Website',
  description: 'Practice technical interview questions across different categories and technologies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ServiceProvider>
          <Layout>
            {children}
          </Layout>
        </ServiceProvider>
      </body>
    </html>
  );
}