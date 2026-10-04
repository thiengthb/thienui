'use client';

import * as React from 'react';
import { CardDeck } from '@/registry/patterns/card-deck';

const CARDS = [
  { front: 'đồng tâm', back: 'r trong = r ngoài − padding' },
  { front: 'optical alignment', back: 'căn theo mắt, không theo hộp — rồi GIỮ cái nhích đó' },
  { front: 'container query', back: 'phản ứng theo hộp chứa, không theo viewport' },
  { front: 'hit-area overflow', back: 'vùng bấm 44px mà phần nhìn thấy vẫn nhỏ' },
];

export function CardDeckDemo() {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  // Lật thẻ phải reset khi ĐỔI thẻ — nếu không, thẻ sau mở ra đã ở mặt sau.
  const go = (next: number) => {
    setIndex(next);
    setFlipped(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <CardDeck
        count={CARDS.length}
        index={index}
        onIndexChange={go}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        renderCard={(i) => (
          <div className="flex min-h-28 items-center justify-center text-center">
            <p className={flipped ? 'text-callout text-muted-foreground' : 'text-title3 font-semibold'}>
              {flipped ? CARDS[i]!.back : CARDS[i]!.front}
            </p>
          </div>
        )}
      />
      <p className="text-caption1 text-muted-foreground">
        Vuốt ngang, bấm hai nút, hoặc dùng bàn phím: <kbd>←</kbd> <kbd>→</kbd> để đổi thẻ,{' '}
        <kbd>Space</kbd> để lật. Cả ba đường đều bắt buộc có — thiếu bàn phím thì cả thành phần vô
        hình với người không dùng chuột.
      </p>
    </div>
  );
}
