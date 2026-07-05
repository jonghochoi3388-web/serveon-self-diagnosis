"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

/**
 * recharts의 ResponsiveContainer가 일부 환경(CSS grid + 초기 측정 0)에서
 * 너비를 0으로 고정해버리는 문제를 우회하기 위한 자체 측정 래퍼.
 * 실제 렌더된 폭을 ResizeObserver로 측정해 자식 render-prop에 넘긴다.
 */
export default function ChartBox({
  height,
  children,
}: {
  height: number;
  children: (width: number, height: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      {width > 0 ? children(width, height) : null}
    </div>
  );
}
