'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const STROKE_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
  '#1abc9c', '#e91e63', '#00bcd4', '#8bc34a', '#ff5722',
  '#607d8b', '#795548', '#9c27b0', '#03a9f4', '#e67e22',
];

export function KanjiStrokeOrder({ character }: { character: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const hex = character.codePointAt(0)!.toString(16).padStart(5, '0');

    fetch(`/kanji/${hex}.svg`)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(text => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = text;

        const svg = container.querySelector('svg');
        if (!svg) return;
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = '100%';
        svg.style.height = '100%';

        const paths = [...svg.querySelectorAll('path')] as SVGPathElement[];
        pathsRef.current = paths;

        paths.forEach((p, i) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          p.style.stroke = STROKE_COLORS[i % STROKE_COLORS.length];
          p.style.fill = 'none';
          p.style.strokeWidth = '3';
          p.style.strokeLinecap = 'round';
          p.style.strokeLinejoin = 'round';
          p.style.transition = 'stroke-dashoffset 0.5s ease';
        });

        setLoaded(true);
      })
      .catch(() => setError(true));

    return () => { timeoutsRef.current.forEach(clearTimeout); };
  }, [character]);

  const reset = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    pathsRef.current.forEach(p => {
      const len = p.getTotalLength();
      p.style.transition = 'none';
      p.style.strokeDashoffset = String(len);
      void p.getBoundingClientRect();
      p.style.transition = 'stroke-dashoffset 0.5s ease';
    });
  };

  const draw = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    pathsRef.current.forEach(p => { p.style.strokeDashoffset = '0'; });
  };

  const animate = () => {
    reset();
    const ids = pathsRef.current.map((p, i) =>
      setTimeout(() => { p.style.strokeDashoffset = '0'; }, i * 600 + 100)
    );
    timeoutsRef.current = ids;
  };

  if (error) {
    return (
      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-600">
        <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{character}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div
        ref={containerRef}
        className="w-28 h-28 bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-600 p-1"
      />
      {loaded && (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={draw}>Draw</Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={animate}>Animate</Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={reset}>Reset</Button>
        </div>
      )}
    </div>
  );
}
