'use client';

/**
 * Demo cho các control NHẬP LIỆU ghép nhiều phần.
 *
 * Điểm chung: giá trị là một thứ, cách hiện giá trị là một thứ khác. Chỗ hay hỏng nhất của nhóm này
 * không phải kiểu dáng — là lúc value và nhãn lệch nhau (`TabSelect` đã dính đúng lỗi đó ở pha 6),
 * hoặc lúc control mất liên kết với `<label>` nên không ai bấm được vào chữ.
 */
import * as React from 'react';
import { CalendarDays, CreditCard, Search } from 'lucide-react';
import { vi } from 'date-fns/locale';

import { Button } from '@/registry/base/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/registry/base/button-group';
import { Calendar } from '@/registry/base/calendar';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/registry/base/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/registry/base/field';
import { Input } from '@/registry/base/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/registry/base/input-group';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/registry/base/input-otp';
import { Label } from '@/registry/base/label';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/registry/base/native-select';
import { RadioGroup, RadioGroupItem } from '@/registry/base/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/base/select';
import { Slider } from '@/registry/base/slider';

const CAP_DO = [
  { value: 'n5', label: 'N5 — nhập môn' },
  { value: 'n4', label: 'N4 — sơ cấp' },
  { value: 'n3', label: 'N3 — trung cấp' },
  { value: 'n2', label: 'N2 — trung cao' },
  { value: 'n1', label: 'N1 — cao cấp' },
];

export function SelectDemo() {
  const [v, setV] = React.useState('n3');
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        `items` trên <code>Select</code> là thứ ánh xạ value → nhãn. Thiếu nó thì ô hiện ra
        <code> n3</code> chứ không hiện “N3 — trung cấp”.
      </p>
      <Select items={CAP_DO} value={v} onValueChange={(x) => setV(String(x))}>
        <SelectTrigger className="w-64" aria-label="Cấp độ JLPT">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Cơ bản</SelectLabel>
            {CAP_DO.slice(0, 2).map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Nâng cao</SelectLabel>
            {CAP_DO.slice(2).map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-caption1 text-muted-foreground tabular-nums">value = {v}</p>
    </div>
  );
}

export function NativeSelectDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        `&lt;select&gt;` THẬT của trình duyệt. Trên điện thoại nó mở bộ chọn của hệ điều hành — quen tay
        hơn, cuộn mượt hơn, và không tốn một dòng JS nào. Dùng nó khi không cần tìm kiếm hay nhóm phức tạp.
      </p>
      <NativeSelect className="w-64" defaultValue="n3" aria-label="Cấp độ JLPT">
        <NativeSelectOptGroup label="Cơ bản">
          <NativeSelectOption value="n5">N5 — nhập môn</NativeSelectOption>
          <NativeSelectOption value="n4">N4 — sơ cấp</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Nâng cao">
          <NativeSelectOption value="n3">N3 — trung cấp</NativeSelectOption>
          <NativeSelectOption value="n2">N2 — trung cao</NativeSelectOption>
          <NativeSelectOption value="n1">N1 — cao cấp</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  );
}

export function ComboboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        Select + ô tìm. Chỉ đáng dùng khi danh sách đủ dài để cuộn thành việc — dưới mười mục thì một
        Select thường nhanh hơn, vì gõ là thêm việc chứ không bớt.
      </p>
      <Combobox items={CAP_DO}>
        <ComboboxInput placeholder="Chọn cấp độ…" className="w-64" />
        <ComboboxContent>
          <ComboboxEmpty>Không có cấp độ nào khớp.</ComboboxEmpty>
          <ComboboxList>
            {(item: { value: string; label: string }) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function RadioGroupDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        Mọi lựa chọn hiện cùng lúc — đó là lý do chọn radio thay vì select. Mũi tên lên/xuống đổi lựa
        chọn, Tab thì nhảy RA KHỎI cả nhóm: một nhóm radio là MỘT điểm dừng, không phải bốn.
      </p>
      <RadioGroup defaultValue="fsrs" className="flex flex-col gap-3">
        {[
          { v: 'fsrs', t: 'FSRS', d: 'Lịch ôn theo mô hình trí nhớ. Mặc định.' },
          { v: 'sm2', t: 'SM-2', d: 'Thuật toán cũ của Anki. Dễ đoán hơn.' },
          { v: 'tay', t: 'Tự đặt', d: 'Tự chọn ngày ôn cho từng thẻ.' },
        ].map((o) => (
          <div key={o.v} className="flex items-start gap-3">
            <RadioGroupItem value={o.v} id={`lich-${o.v}`} className="mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={`lich-${o.v}`}>{o.t}</Label>
              <p className="text-caption1 text-muted-foreground">{o.d}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export function SliderDemo() {
  const [mot, setMot] = React.useState([20]);
  const [hai, setHai] = React.useState([15, 45]);
  return (
    <div className="flex max-w-md flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label>Thẻ mới mỗi ngày</Label>
          <span className="text-footnote tabular-nums">{mot[0]}</span>
        </div>
        <Slider value={mot} onValueChange={(v) => setMot(v as number[])} min={0} max={60} step={5} />
        <p className="text-caption1 text-muted-foreground">
          Luôn hiện SỐ bên cạnh. Một slider không có số là một control mà người dùng không nói lại được
          họ vừa chọn gì.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label>Khoảng thời gian ôn (phút)</Label>
          <span className="text-footnote tabular-nums">
            {hai[0]}–{hai[1]}
          </span>
        </div>
        <Slider value={hai} onValueChange={(v) => setHai(v as number[])} min={0} max={60} step={5} />
      </div>
    </div>
  );
}

export function InputOtpDemo() {
  const [ma, setMa] = React.useState('');
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        Dán cả mã vào một ô thì nó tự rải ra các ô — nếu không, người dùng phải gõ lại tay từng số, và
        đó là lúc họ gõ sai.
      </p>
      <InputOTP maxLength={6} value={ma} onChange={setMa}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-caption1 text-muted-foreground tabular-nums">đã nhập: {ma.length}/6</p>
    </div>
  );
}

export function FieldDemo() {
  return (
    <FieldSet className="max-w-md">
      <FieldLegend>Thông tin bộ thẻ</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="f-ten">Tên bộ</FieldLabel>
          <Input id="f-ten" defaultValue="JLPT N3 — động từ" />
          <FieldDescription>Hiện ở mọi chỗ bộ này được nhắc tới.</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="f-slug">Đường dẫn</FieldLabel>
          <Input id="f-slug" defaultValue="n3 động từ" aria-invalid />
          <FieldError>Đường dẫn chỉ được chứa chữ thường, số và dấu gạch ngang.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="f-cong-khai">Công khai</FieldLabel>
          <NativeSelect id="f-cong-khai" defaultValue="rieng" className="w-40">
            <NativeSelectOption value="rieng">Chỉ mình tôi</NativeSelectOption>
            <NativeSelectOption value="link">Ai có liên kết</NativeSelectOption>
          </NativeSelect>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

export function InputGroupDemo() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Tìm thẻ…" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>sakubun.app/s/</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput defaultValue="n3-dong-tu" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <CreditCard />
        </InputGroupAddon>
        <InputGroupInput placeholder="Mã giảm giá" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">Áp dụng</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <p className="text-caption1 text-muted-foreground">
        Phần phụ nằm TRONG viền ô, không phải một hộp dán cạnh. Hai hộp cạnh nhau sẽ lệch chiều cao
        ngay khi một bên có trạng thái lỗi.
      </p>
    </div>
  );
}

export function ButtonGroupDemo() {
  return (
    <div className="flex flex-col gap-6">
      <ButtonGroup>
        <Button variant="outline">Ngày</Button>
        <Button variant="outline">Tuần</Button>
        <Button variant="outline">Tháng</Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline">Xuất .csv</Button>
        <ButtonGroupSeparator />
        <ButtonGroupText>128 thẻ</ButtonGroupText>
      </ButtonGroup>

      <ButtonGroup orientation="vertical" className="w-40">
        <Button variant="outline">Nhân bản</Button>
        <Button variant="outline">Lưu trữ</Button>
      </ButtonGroup>

      <p className="text-caption1 text-muted-foreground">
        Bo góc chỉ ở hai đầu, viền giữa gộp làm một — đó là thứ nói “đây là MỘT control có nhiều
        nhánh”, khác hẳn ba cái nút đặt gần nhau.
      </p>
    </div>
  );
}

export function CalendarDemo() {
  const [ngay, setNgay] = React.useState<Date | undefined>(new Date(2026, 9, 5));
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">
        <CalendarDays className="inline size-3.5 align-text-bottom" /> Locale quyết định thứ bắt đầu
        tuần và cách đọc ngày. Để mặc định tiếng Anh là lịch bắt đầu từ Chủ nhật — sai với phần lớn
        người dùng Việt.
      </p>
      <Calendar
        mode="single"
        locale={vi}
        selected={ngay}
        onSelect={setNgay}
        className="w-fit rounded-lg border"
      />
    </div>
  );
}
