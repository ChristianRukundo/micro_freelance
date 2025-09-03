import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font from Google Fonts
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers'; // All global context providers
import { Toaster } from 'sonner'; // Global toast provider

// Configure Inter font with desired subsets and variable font for different weights
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Micro Freelance Marketplace',
  description: 'Connect clients with freelancers for project-based work.',
  // Add more meta tags for SEO, social sharing etc.
  keywords: ['freelance', 'marketplace', 'tasks', 'gigs', 'remote work', 'hiring'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Micro Freelance Marketplace',
    description: 'Connect clients with freelancers for project-based work.',
    url: 'https://your-marketplace.com', // Replace with your actual domain
    siteName: 'Micro Freelance Marketplace',
    images: [
      {
        url: 'https://your-marketplace.com/og-image.jpg', // Replace with your OG image
        width: 1200,
        height: 630,
        alt: 'Micro Freelance Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Micro Freelance Marketplace',
    description: 'Connect clients with freelancers for project-based work.',
    creator: '@your_twitter_handle', // Replace with your Twitter handle
    images: ['https://your-marketplace.com/twitter-image.jpg'], // Replace with your Twitter image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background antialiased', inter.variable)}>
        {/* Providers wrap the entire app for global contexts like TanStack Query, Zustand, etc. */}
        <Providers>
          {children}
          {/* Global toast component for notifications */}
          <Toaster richColors position="top-right" /> 
        </Providers>
      </body>
    </html>
  );
}