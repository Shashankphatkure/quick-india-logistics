import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/utils/cn';
import { Provider as TooltipProvider } from '@/components/ui/tooltip';
import { NotificationProvider } from '@/components/ui/notification-provider';

const inter = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = localFont({
  src: './fonts/GeistMono[wght].woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Quick India Logistics',
  description: 'Logistics management platform — Quick India Logistics Pvt Ltd',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(inter.variable, geistMono.variable, 'antialiased')}
    >
      <body className='bg-bg-white-0 text-text-strong-950'>
        <ThemeProvider attribute='class'>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
        <NotificationProvider />
      </body>
    </html>
  );
}
