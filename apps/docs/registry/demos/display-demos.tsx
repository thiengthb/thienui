'use client';

/**
 * Demo cho các bề mặt HIỂN THỊ: card, item, bảng, biểu đồ, ảnh, vùng cuộn.
 *
 * Nhóm này được đo bằng DỮ LIỆU THẬT chứ không bằng prop. Mọi demo ở đây cố tình chứa ít nhất một
 * giá trị khó: tên dài tràn, số 0 đúng nghĩa, hoặc một số đủ lớn để phá cột.
 */
import * as React from 'react';
import { Archive, Box, Clock, Image as ImageIcon, TriangleAlert } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/registry/base/alert';
import { AspectRatio } from '@/registry/base/aspect-ratio';
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/registry/base/avatar';
import { Badge } from '@/registry/base/badge';
import { Button } from '@/registry/base/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/registry/base/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/registry/base/carousel';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/registry/base/chart';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/base/empty';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/registry/base/item';
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from '@/registry/base/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/registry/base/resizable';
import { ScrollArea } from '@/registry/base/scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/base/table';
import { Truncate } from '@/registry/base/truncate';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

export function CardDemo() {
  return (
    <div className="@container grid gap-4 @2xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>JLPT N3 — động từ</CardTitle>
          <CardDescription>128 thẻ · ôn lần cuối 3 ngày trước</CardDescription>
          <CardAction>
            <Badge variant="secondary">Đang học</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-footnote text-muted-foreground">
            Thẻ đến hạn hôm nay: <span className="tabular-nums">24</span>
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Ôn ngay</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Truncate>Ngữ pháp trung cấp — mẫu câu điều kiện ば / たら / と / なら</Truncate>
          </CardTitle>
          <CardDescription>0 thẻ · chưa bắt đầu</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-footnote text-muted-foreground">
            Tiêu đề dài là trạng thái dữ liệu thứ tư, và nó luôn tới. Ở đây nó bị cắt chứ không đẩy
            <code> CardAction</code> rơi xuống dòng.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ItemDemo() {
  return (
    <div className="flex flex-col gap-6">
      <ItemGroup className="rounded-lg border">
        {[
          { t: 'JLPT N3 — động từ', d: '128 thẻ · 24 đến hạn', v: 'default' as const },
          { t: 'Kanji thường dùng', d: '0 thẻ · chưa có gì', v: 'default' as const },
        ].map((x) => (
          <Item key={x.t} variant={x.v}>
            <ItemMedia variant="icon">
              <Box />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{x.t}</ItemTitle>
              <ItemDescription>{x.d}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="ghost" size="sm">
                Mở
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>

      <div className="flex flex-col gap-3">
        <Item variant="outline" size="sm">
          <ItemContent>
            <ItemTitle>outline · sm</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="muted" size="xs">
          <ItemContent>
            <ItemTitle>muted · xs</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    </div>
  );
}

export function EmptyDemo() {
  return (
    <div className="@container grid gap-4 @2xl:grid-cols-2">
      <Empty className="rounded-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive />
          </EmptyMedia>
          <EmptyTitle>Chưa có bộ thẻ nào</EmptyTitle>
          <EmptyDescription>Tạo bộ đầu tiên, hoặc nhập từ một file CSV có sẵn.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Tạo bộ</Button>
        </EmptyContent>
      </Empty>

      <Empty className="rounded-lg border">
        <EmptyHeader>
          <EmptyTitle>Rỗng gọn, không icon</EmptyTitle>
          <EmptyDescription>
            Dạng này dùng khi ô rỗng nằm BÊN TRONG một card đã có tiêu đề — thêm icon nữa là thêm nhiễu.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

export function AlertDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <Clock />
        <AlertTitle>Phiên ôn hôm nay còn 24 thẻ</AlertTitle>
        <AlertDescription>Ôn hết trước nửa đêm để giữ chuỗi 213 ngày.</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline">
            Ôn ngay
          </Button>
        </AlertAction>
      </Alert>

      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>Không đồng bộ được</AlertTitle>
        <AlertDescription>
          Lần đồng bộ cuối là 2 ngày trước. Kiểm tra kết nối rồi thử lại — dữ liệu offline vẫn an toàn.
        </AlertDescription>
      </Alert>

      <p className="text-caption1 text-muted-foreground">
        Mô tả nói <strong>sửa thế nào</strong>, không chỉ nói có lỗi. “Đã có lỗi xảy ra” là một câu
        không ai làm gì được với nó.
      </p>
    </div>
  );
}

export function AvatarDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>TN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>H</AvatarFallback>
          <AvatarBadge className="size-3" />
        </Avatar>
      </div>

      <AvatarGroup>
        {['TN', 'H', 'M', 'Đ'].map((x) => (
          <Avatar key={x}>
            <AvatarFallback>{x}</AvatarFallback>
          </Avatar>
        ))}
        <AvatarGroupCount>+7</AvatarGroupCount>
      </AvatarGroup>

      <p className="text-caption1 text-muted-foreground">
        Fallback là CHỮ CÁI ĐẦU, không phải một icon người chung chung: hai người không ảnh vẫn phải
        phân biệt được. Vòng viền quanh mỗi avatar trong nhóm là cách chúng không dính vào nhau khi chồng.
      </p>
    </div>
  );
}

export function ProgressDemo() {
  const [v, setV] = React.useState(38);
  return (
    <div className="flex max-w-md flex-col gap-6">
      <Progress value={v}>
        <div className="flex items-baseline justify-between">
          <ProgressLabel>Đã ôn hôm nay</ProgressLabel>
          <ProgressValue className="tabular-nums" />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>

      <div className="flex gap-2">
        {[0, 38, 100].map((x) => (
          <Button key={x} size="sm" variant="outline" onClick={() => setV(x)}>
            {x}%
          </Button>
        ))}
      </div>

      <p className="text-caption1 text-muted-foreground">
        <strong>0% phải nhìn ra là 0%</strong>, không phải là “chưa tải xong”. Đó là trạng thái dữ liệu
        hay bị render thành một thanh rỗng trông y hệt lỗi.
      </p>
    </div>
  );
}

const DU_LIEU = [
  { ngay: 'T2', dung: 42, sai: 8 },
  { ngay: 'T3', dung: 55, sai: 5 },
  { ngay: 'T4', dung: 0, sai: 0 },
  { ngay: 'T5', dung: 61, sai: 12 },
  { ngay: 'T6', dung: 48, sai: 6 },
  { ngay: 'T7', dung: 73, sai: 9 },
  { ngay: 'CN', dung: 30, sai: 3 },
];

const CAU_HINH = {
  dung: { label: 'Nhớ', color: 'var(--chart-1)' },
  sai: { label: 'Quên', color: 'var(--chart-4)' },
} satisfies ChartConfig;

export function ChartDemo() {
  return (
    <div className="flex flex-col gap-3">
      <ChartContainer config={CAU_HINH} className="h-64 w-full">
        <BarChart data={DU_LIEU}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="ngay" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="dung" fill="var(--color-dung)" radius={4} />
          <Bar dataKey="sai" fill="var(--color-sai)" radius={4} />
        </BarChart>
      </ChartContainer>
      <p className="text-caption1 text-muted-foreground">
        Màu lấy từ <code>--chart-1…5</code>, không phải từ bảng mặc định của recharts — nếu không thì
        biểu đồ là thứ duy nhất trên trang không đổi theo theme. Thứ Tư là một ngày <strong>0</strong>
        thật: cột biến mất, nhưng nhãn trục vẫn còn, nên người đọc thấy “hôm đó không ôn” chứ không
        thấy “thiếu dữ liệu”.
      </p>
    </div>
  );
}

export function TableDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableCaption>Thống kê ôn tập bảy ngày gần nhất.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Bộ</TableHead>
            <TableHead className="text-right">Thẻ</TableHead>
            <TableHead className="text-right">Đến hạn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ['JLPT N3 — động từ', 128, 24],
            ['Kanji thường dùng', 1_284, 0],
            ['Ngữ pháp trung cấp — mẫu câu điều kiện ば / たら / と / なら', 42, 7],
          ].map(([t, a, b]) => (
            <TableRow key={String(t)}>
              <TableCell className="max-w-72">
                <Truncate>{String(t)}</Truncate>
              </TableCell>
              <TableCell className="text-right tabular-nums">{Number(a).toLocaleString('vi-VN')}</TableCell>
              <TableCell className="text-right tabular-nums">{Number(b).toLocaleString('vi-VN')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Tổng</TableCell>
            <TableCell className="text-right tabular-nums">1.454</TableCell>
            <TableCell className="text-right tabular-nums">31</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <p className="text-caption1 text-muted-foreground">
        Số căn PHẢI và dùng <code>tabular-nums</code>: chữ số rộng bằng nhau thì hàng nghìn mới thẳng
        cột. Và <code>0</code> ở hàng giữa là số 0 thật, không phải ô trống.
      </p>
    </div>
  );
}

export function AspectRatioDemo() {
  return (
    <div className="@container flex flex-col gap-3">
      <div className="grid gap-4 @2xl:grid-cols-3">
        {([
          [16 / 9, '16 / 9'],
          [1, '1 / 1'],
          [4 / 3, '4 / 3'],
        ] as const).map(([r, nhan]) => (
          <AspectRatio key={nhan} ratio={r} className="flex items-center justify-center rounded-lg bg-muted">
            <span className="flex items-center gap-2 text-caption1 text-muted-foreground">
              <ImageIcon className="size-4" /> {nhan}
            </span>
          </AspectRatio>
        ))}
      </div>
      <p className="text-caption1 text-muted-foreground">
        Giữ chỗ TRƯỚC khi ảnh về. Không có nó thì mỗi ảnh tải xong là một lần layout nhảy, và người
        đang đọc mất dòng.
      </p>
    </div>
  );
}

export function ScrollAreaDemo() {
  return (
    <div className="flex flex-col gap-3">
      <ScrollArea className="h-56 w-full max-w-sm rounded-lg border p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="flex items-baseline justify-between text-footnote">
              <span>Thẻ {i + 1}</span>
              <span className="text-caption1 text-muted-foreground tabular-nums">
                ôn {(i * 3) % 7} lần
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <p className="text-caption1 text-muted-foreground">
        Thanh cuộn tự vẽ, nên nó giống nhau trên mọi hệ điều hành — và nó chỉ hiện khi có chỗ để cuộn,
        thứ thanh cuộn mặc định của macOS cũng làm nhưng của Windows thì không.
      </p>
    </div>
  );
}

export function ResizableDemo() {
  return (
    <div className="flex flex-col gap-3">
      <ResizablePanelGroup orientation="horizontal" className="h-56 rounded-lg border">
        <ResizablePanel defaultSize="35%" minSize="20%">
          <div className="flex h-full items-center justify-center text-footnote text-muted-foreground">
            danh sách bộ
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="65%">
          <div className="flex h-full items-center justify-center text-footnote text-muted-foreground">
            thẻ đang xem
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <p className="text-caption1 text-muted-foreground">
        Tay nắm kéo được bằng <strong>bàn phím</strong> nữa: Tab tới nó rồi bấm mũi tên trái/phải.
        Một tay nắm chỉ kéo được bằng chuột là một bố cục mà người không dùng chuột không chỉnh được.
      </p>
    </div>
  );
}

export function CarouselDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Carousel className="w-full max-w-md">
        <CarouselContent>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i} className="basis-1/2">
              <div className="flex h-32 items-center justify-center rounded-lg border text-title3 tabular-nums">
                {i + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <p className="text-caption1 text-muted-foreground">
        Nút trước/sau tự <code>disabled</code> ở hai đầu — đó là cách duy nhất người dùng biết mình đã
        tới cuối mà không phải thử.
      </p>
    </div>
  );
}
