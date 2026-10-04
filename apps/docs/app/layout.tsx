import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { BrandThemeProvider } from '@/components/brand-theme';
import { cn } from 'cn';

const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  title: { default: 'thienui', template: '%s · thienui' },
  description: 'Hệ thiết kế trung tâm: token ba tầng, cổng UI máy cưỡng chế, component trên Base UI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning className={cn('antialiased', fontSans.variable, fontMono.variable)}>
      <body>
        {/* Hai trục theme, cả hai ghi lên <html>: `class="dark"` (mode) do next-themes,
            `data-theme` (brand) do BrandThemeProvider. Phải CÙNG một phần tử — token brand
            được khai ở `[data-theme='x'].dark`. */}
        <ThemeProvider>
          <BrandThemeProvider>{children}</BrandThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
