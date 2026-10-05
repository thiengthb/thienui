'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { cn } from 'cn';
import { useBrandTheme } from '@/components/brand-theme';
import { useMounted } from '@/lib/use-mounted';
import { Button } from '@/registry/base/button';
import { ToggleGroup, ToggleGroupItem } from '@/registry/base/toggle-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/base/dropdown-menu';

const NAV = [
  { href: '/', label: 'Tổng quan' },
  { href: '/tokens', label: 'Token' },
  { href: '/components', label: 'Component' },
];

/**
 * Thanh trên của site. Glass CHỈ ở đây, và đó là đúng chỗ luật `glass-only-on-chrome` cho phép:
 * một header dính đè lên nội dung là chrome, không phải nền sau chữ thân bài. Có token nền đặc làm
 * fallback (`bg-background/80` + `supports-backdrop-filter:`) nên máy không hỗ trợ vẫn đọc được.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link
          href="/"
          className="mr-2 shrink-0 rounded-md font-semibold tracking-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          thienui
        </Link>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                nativeButton={false} render={<Link href={item.href} />}
                className={cn('shrink-0', active && 'font-medium')}
              >
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <BrandPicker />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

function BrandPicker() {
  const { brand, setBrand, themes } = useBrandTheme();
  const current = themes.find((t) => t.name === brand);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" aria-label={`Theme: ${current?.label ?? brand}`}>
            <Palette data-icon="inline-start" />
            <span className="max-sm:hidden">{current?.label ?? brand}</span>
          </Button>
        }
      />
      {/* Mở XUỐNG DƯỚI chân control, không đè lên chính nó — luật menus-open-below-trigger. */}
      <DropdownMenuContent align="end" side="bottom" sideOffset={6}>
        {themes.map((t) => (
          <DropdownMenuItem key={t.name} onClick={() => setBrand(t.name as typeof brand)}>
            <span className={cn('flex-1', t.name === brand && 'font-medium')}>{t.label}</span>
            {t.default ? <span className="text-footnote text-muted-foreground">mặc định</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  // Trước khi mount, `theme` chưa biết được (nó nằm trong localStorage), nên render một bộ ba trung
  // tính thay vì đoán — đoán rồi sửa sẽ làm nút nhảy trạng thái ngay trước mắt người dùng.
  const value = mounted ? (theme ?? 'system') : undefined;

  return (
    <ToggleGroup
      value={value ? [value] : []}
      onValueChange={(v) => v[0] && setTheme(String(v[0]))}
      aria-label="Chế độ sáng tối"
      className="gap-0"
    >
      <ToggleGroupItem value="light" aria-label="Sáng" size="sm">
        <Sun />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Tối" size="sm">
        <Moon />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="Theo hệ thống" size="sm">
        <Monitor />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
