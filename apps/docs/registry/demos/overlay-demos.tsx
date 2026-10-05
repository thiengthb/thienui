'use client';

/**
 * Demo cho các bề mặt ĐÈ LÊN nội dung: dialog, sheet, drawer, popover, menu, tooltip.
 *
 * Chúng có một điểm chung mà ma trận `variants × sizes` không diễn tả được: **chúng không tồn tại
 * cho tới khi có người mở**. Trạng thái đáng xem nhất của một dialog là lúc nó đang mở và đang chờ,
 * không phải lúc nó là một cái nút.
 *
 * Mọi demo ở đây đều mở được bằng BÀN PHÍM — đó là nửa còn lại của một overlay, và là nửa hay hỏng.
 */
import * as React from 'react';
import { Copy, Pencil, Share2, Trash2, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/registry/base/avatar';
import { Button } from '@/registry/base/button';
import { Input } from '@/registry/base/input';
import { Kbd } from '@/registry/base/kbd';
import { Label } from '@/registry/base/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/registry/base/alert-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/registry/base/command';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/registry/base/context-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/base/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/base/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/registry/base/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/registry/base/hover-card';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/registry/base/menubar';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/registry/base/popover';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/registry/base/sheet';

/** Khung chung cho mọi demo ở file này: một dòng nói "bấm vào đâu", rồi chỗ bấm. */
function Khung({ huong, children }: { huong: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">{huong}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function DialogDemo() {
  return (
    <Khung huong="Mở bằng chuột, hoặc Tab tới nút rồi Enter. Trong hộp, Tab bị giữ lại — đó là focus trap.">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Sửa tên bộ</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa tên bộ</DialogTitle>
            <DialogDescription>Tên này hiện ở mọi chỗ bộ được nhắc tới.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten-bo">Tên bộ</Label>
            <Input id="ten-bo" defaultValue="JLPT N3 — động từ" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Huỷ</DialogClose>
            <Button>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Khung>
  );
}

export function AlertDialogDemo() {
  return (
    <Khung huong="Khác Dialog ở một chỗ: KHÔNG đóng được bằng bấm ra ngoài. Một việc không hoàn lại được thì không nên lỡ tay thoát khỏi.">
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" />}>
          <Trash2 /> Xoá bộ
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bộ “JLPT N3 — động từ”?</AlertDialogTitle>
            <AlertDialogDescription>
              128 thẻ và toàn bộ lịch sử ôn của chúng sẽ mất. Không hoàn lại được.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction>Xoá bộ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Khung>
  );
}

export function SheetDemo() {
  return (
    <Khung huong="Trượt từ cạnh màn hình. Dùng cho việc PHỤ chạy song song với trang — bộ lọc, chi tiết — chứ không dùng cho việc phải quyết xong mới đi tiếp.">
      {(['right', 'left', 'top', 'bottom'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>{side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
              <SheetDescription>Lọc áp ngay, không cần bấm xác nhận.</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button variant="ghost">Xoá lọc</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </Khung>
  );
}

export function DrawerDemo() {
  return (
    <Khung huong="Kéo được bằng ngón tay. Đây là dạng dành cho ĐIỆN THOẠI — trên màn rộng thì Sheet hoặc Dialog đúng hơn.">
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>Mở drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Thêm vào bộ</DrawerTitle>
            <DrawerDescription>Kéo xuống để đóng, hoặc bấm ra ngoài.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Thêm 12 thẻ</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Khung>
  );
}

export function PopoverDemo() {
  return (
    <Khung huong="Có thể chứa control bấm được — khác Tooltip, thứ chỉ được chứa chữ.">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>
          <Share2 /> Chia sẻ
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <PopoverHeader>
            <PopoverTitle>Chia sẻ bộ</PopoverTitle>
            <PopoverDescription>Ai có liên kết đều xem được, không sửa được.</PopoverDescription>
          </PopoverHeader>
          <div className="flex gap-2">
            <Input readOnly value="sakubun.app/s/n3-dongtu" />
            <Button variant="outline" size="icon" aria-label="Chép liên kết">
              <Copy />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Khung>
  );
}

export function HoverCardDemo() {
  return (
    <Khung huong="Chỉ mở bằng CON TRỎ, nên nội dung trong nó phải là thứ không bắt buộc. Thiết bị cảm ứng không có hover.">
      <HoverCard>
        <HoverCardTrigger render={<Button variant="link" />}>@hanh</HoverCardTrigger>
        <HoverCardContent className="w-72">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>H</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-subhead font-medium">Hạnh</p>
              <p className="text-caption1 text-muted-foreground">
                Đã chia sẻ 14 bộ · ôn đều 213 ngày liên tiếp
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </Khung>
  );
}

export function ContextMenuDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        Bấm CHUỘT PHẢI vào vùng dưới. Mọi mục ở đây phải có một đường khác để tới — menu chuột phải là
        lối tắt, không bao giờ là lối duy nhất.
      </p>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-footnote text-muted-foreground">
          chuột phải vào đây
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <Pencil /> Đổi tên
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <Copy /> Nhân bản
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <Trash2 /> Xoá
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

export function DropdownMenuDemo() {
  return (
    <Khung huong="Mũi tên lên/xuống đi trong menu, chữ cái đầu nhảy tới mục — đó là hành vi có sẵn, và là lý do không tự dựng menu bằng div.">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          <User /> Tài khoản
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>thien@sakubun.app</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Hồ sơ
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Cài đặt ôn tập</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Đăng xuất</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Khung>
  );
}

export function MenubarDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        Mở một menu rồi rê ngang: các menu còn lại mở theo mà không cần bấm lại. Đó là thứ phân biệt
        một menubar thật với bốn dropdown đặt cạnh nhau.
      </p>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Bộ thẻ</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Bộ mới
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Nhập từ CSV</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Xuất tất cả</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Ôn tập</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Bắt đầu phiên</MenubarItem>
            <MenubarItem>Đặt lại tiến độ</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Trợ giúp</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Phím tắt</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}

export function CommandDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        Gõ để lọc. Danh sách rỗng phải nói được điều đó — <Kbd>CommandEmpty</Kbd> là trạng thái
        “lọc không khớp”, không phải “chưa có dữ liệu”.
      </p>
      <Command className="max-w-md rounded-lg border">
        <CommandInput placeholder="Gõ lệnh hoặc tìm…" />
        <CommandList>
          <CommandEmpty>Không có lệnh nào khớp.</CommandEmpty>
          <CommandGroup heading="Bộ thẻ">
            <CommandItem>
              Tạo bộ mới
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>Nhập từ CSV</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Ôn tập">
            <CommandItem>Bắt đầu phiên hôm nay</CommandItem>
            <CommandItem>Xem thẻ cần ôn</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
