import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import { BackToTop } from '@/components/BackToTop';
import { GlobalCallListener } from '@/components/GlobalCallListener';
import { BackgroundMusic } from '@/components/BackgroundMusic';

import { FoilBackground } from '@/components/FoilBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkillSwap | Peer-to-Peer Skill Exchange',
  description: 'Connect, teach, and learn new skills with a global community. Trade skills without currency and build your knowledge network.',
  keywords: ['skill swap', 'learning', 'mentorship', 'peer-to-peer', 'education matrix'],
  authors: [{ name: 'Mikesh Kumar Pradhan' }],
  openGraph: {
    title: 'SkillSwap | Peer-to-Peer Skill Exchange',
    description: 'A peer-to-peer knowledge matrix. Trade skills securely across the globe without currency.',
    url: 'https://skillswap.io',
    siteName: 'SkillSwap',
    images: [
      {
        url: 'https://skillswap.io/og-bg.png',
        width: 1200,
        height: 630,
        alt: 'SkillSwap Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillSwap',
    description: 'Connect, teach, and learn new skills with a global community. Enter the matrix.',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen bg-transparent antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <FoilBackground />
          <GlobalCallListener />
          <Navbar />
          <main className="pt-16 flex-1 relative z-0">
            {children}
          </main>
          <Chatbot />
          <BackToTop />
          <BackgroundMusic />
        </ThemeProvider>
      </body>
    </html>
  );
}
