import { SiteHeader } from '@/components/site-chrome';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
