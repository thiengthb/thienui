'use client';

/**
 * Demo cho các bề mặt ĐIỀU HƯỚNG và ĐÓNG/MỞ: accordion, collapsible, tabs, breadcrumb, pagination,
 * navigation menu, toggle group, sidebar.
 *
 * Nhóm này có một thứ không thấy được qua ảnh chụp: **bàn phím**. Mỗi demo dưới đây nói ra phím nào
 * làm gì, vì đó là phần hay mất nhất khi người ta tự dựng lại bằng `div` + `onClick`.
 */
import * as React from 'react';
import { ChevronDown, Grid2x2, Inbox, LayoutGrid, List, Rows3, Settings, Star } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/base/accordion';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/registry/base/breadcrumb';
import { Button } from '@/registry/base/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/base/collapsible';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/registry/base/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/registry/base/pagination';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/registry/base/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/base/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/registry/base/toggle-group';

export function AccordionDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Accordion defaultValue={['lich']} className="w-full max-w-lg">
        {[
          {
            v: 'lich',
            t: 'Lịch ôn được tính thế nào?',
            d: 'FSRS ước lượng xác suất bạn còn nhớ thẻ, rồi hẹn lại đúng lúc xác suất đó rơi xuống 90%.',
          },
          {
            v: 'bo',
            t: 'Xoá một bộ có mất lịch sử ôn không?',
            d: 'Có. Lịch sử ôn gắn với thẻ, nên xoá bộ là mất cả hai. Lưu trữ thì giữ lại.',
          },
          {
            v: 'offline',
            t: 'Dùng được khi mất mạng không?',
            d: 'Được. Phiên ôn chạy offline và đồng bộ lại khi có mạng.',
          },
        ].map((x) => (
          <AccordionItem key={x.v} value={x.v}>
            <AccordionTrigger>{x.t}</AccordionTrigger>
            <AccordionContent>{x.d}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-caption1 text-muted-foreground">
        Mũi tên lên/xuống đi giữa các mục, Home/End nhảy đầu cuối. Và chiều cao chạy mượt vì nội dung
        được đo thật — không phải một <code>max-height</code> đoán sẵn, thứ luôn sai với câu trả lời dài.
      </p>
    </div>
  );
}

export function CollapsibleDemo() {
  const [mo, setMo] = React.useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Collapsible open={mo} onOpenChange={setMo} className="w-full max-w-md">
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <span className="text-subhead font-medium">Tuỳ chọn nâng cao</span>
          <CollapsibleTrigger
            render={<Button variant="ghost" size="icon" aria-label={mo ? 'Thu gọn' : 'Mở rộng'} />}
          >
            <ChevronDown className={mo ? 'rotate-180' : undefined} />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="flex flex-col gap-2 px-4 py-3 text-footnote text-muted-foreground">
            <p>Giới hạn thẻ mới mỗi ngày</p>
            <p>Trộn thứ tự thẻ trong phiên</p>
            <p>Bỏ qua thẻ đã thuộc trên 90 ngày</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <p className="text-caption1 text-muted-foreground">
        Một cặp mở/đóng trần, không có kiểu dáng gì sẵn — khác <code>Accordion</code> ở chỗ nó không
        quản nhóm. Dùng nó khi chỉ có MỘT thứ để giấu.
      </p>
    </div>
  );
}

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Tabs defaultValue="the" className="w-full max-w-lg">
        <TabsList>
          <TabsTrigger value="the">Thẻ</TabsTrigger>
          <TabsTrigger value="thong-ke">Thống kê</TabsTrigger>
          <TabsTrigger value="cai-dat">Cài đặt</TabsTrigger>
        </TabsList>
        <TabsContent value="the" className="rounded-lg border p-4 text-footnote text-muted-foreground">
          128 thẻ · 24 đến hạn hôm nay
        </TabsContent>
        <TabsContent value="thong-ke" className="rounded-lg border p-4 text-footnote text-muted-foreground">
          Tỉ lệ nhớ 7 ngày: 86%
        </TabsContent>
        <TabsContent value="cai-dat" className="rounded-lg border p-4 text-footnote text-muted-foreground">
          Thuật toán: FSRS
        </TabsContent>
      </Tabs>
      <p className="text-caption1 text-muted-foreground">
        Mũi tên trái/phải đổi tab; Tab thì nhảy THẲNG vào nội dung của tab đang chọn, không đi qua ba
        cái tab. Cần thu thành select khi hẹp thì dùng <code>@thienui/tab-select</code>.
      </p>
    </div>
  );
}

export function BreadcrumbDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Thư viện</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">JLPT N3</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Động từ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <p className="text-caption1 text-muted-foreground">
        Mục cuối là <code>BreadcrumbPage</code>, không phải link — nó là chỗ đang đứng, và một link
        trỏ về chính trang hiện tại là một lời hứa giả. Dấu “…” thay cho các cấp giữa khi đường dẫn
        sâu, chứ không xuống dòng.
      </p>
    </div>
  );
}

export function PaginationDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">12</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-caption1 text-muted-foreground">
        Luôn hiện trang CUỐI, không chỉ hiện các trang quanh chỗ đang đứng: nó là thứ duy nhất nói
        tổng cộng có bao nhiêu. Số mục mỗi trang nên đo theo màn hình —{' '}
        <code>@thienui/use-fit-rows</code>.
      </p>
    </div>
  );
}

export function NavigationMenuDemo() {
  return (
    <div className="flex flex-col gap-3">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Học</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-72 gap-1 p-2">
                {[
                  ['Phiên hôm nay', '24 thẻ đến hạn'],
                  ['Thẻ mới', 'Chưa học lần nào'],
                  ['Thẻ khó', 'Sai từ hai lần trở lên'],
                ].map(([t, d]) => (
                  <li key={t}>
                    <NavigationMenuLink href="#" className="flex flex-col gap-0.5">
                      <span className="font-medium">{t}</span>
                      <span className="text-caption1 text-muted-foreground">{d}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Thư viện</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <p className="text-caption1 text-muted-foreground">
        Khác <code>DropdownMenu</code> ở mục đích: đây là ĐIỀU HƯỚNG (các mục là link, mở tab mới được),
        còn dropdown là HÀNH ĐỘNG. Trình đọc màn hình đọc hai thứ đó khác nhau.
      </p>
    </div>
  );
}

export function ToggleGroupDemo() {
  const [xem, setXem] = React.useState<string>('luoi');
  const [kieu, setKieu] = React.useState<string[]>(['sao']);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-caption1 text-muted-foreground">Chọn MỘT — kiểu hiển thị.</p>
        <ToggleGroup value={[xem]} onValueChange={(v) => setXem(String(v[0] ?? xem))}>
          <ToggleGroupItem value="luoi" aria-label="Dạng lưới">
            <LayoutGrid />
          </ToggleGroupItem>
          <ToggleGroupItem value="danh-sach" aria-label="Dạng danh sách">
            <List />
          </ToggleGroupItem>
          <ToggleGroupItem value="bang" aria-label="Dạng bảng">
            <Rows3 />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption1 text-muted-foreground">Chọn NHIỀU — bộ lọc.</p>
        <ToggleGroup multiple value={kieu} onValueChange={(v) => setKieu(v as string[])}>
          <ToggleGroupItem value="sao">
            <Star /> Đánh dấu
          </ToggleGroupItem>
          <ToggleGroupItem value="moi">
            <Grid2x2 /> Thẻ mới
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <p className="text-caption1 text-muted-foreground">
        Chọn-một và chọn-nhiều trông giống hệt nhau nhưng là hai lời hứa khác nhau. Khi chỉ có icon,
        <code> aria-label</code> là thứ duy nhất nói nút đó làm gì.
      </p>
    </div>
  );
}

export function SidebarDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-80 overflow-hidden rounded-lg border">
        <SidebarProvider className="min-h-full">
          <Sidebar collapsible="icon" className="absolute">
            <SidebarHeader className="px-3 py-2 text-subhead font-semibold">Sakubun</SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Học</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive tooltip="Hộp đến">
                        <Inbox />
                        <span>Phiên hôm nay</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>24</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Cài đặt">
                        <Settings />
                        <span>Cài đặt</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex items-start gap-3 p-3">
            <SidebarTrigger />
            <p className="text-footnote text-muted-foreground">
              Bấm nút thu/mở. Ở dạng icon, nhãn biến thành tooltip — nếu không thì các mục trở thành
              một cột biểu tượng không ai đoán được.
            </p>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <p className="text-caption1 text-muted-foreground">
        Đây là primitive trần. Bản đã ghép sẵn nhóm, badge và liên kết của framework là{' '}
        <code>@thienui/app-sidebar</code>.
      </p>
    </div>
  );
}
