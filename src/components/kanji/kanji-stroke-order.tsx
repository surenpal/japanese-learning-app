'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const STROKE_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
  '#1abc9c', '#e91e63', '#00bcd4', '#8bc34a', '#ff5722',
  '#607d8b', '#795548', '#9c27b0', '#03a9f4', '#e67e22',
];

export interface KanjiStrokeOrderHandle {
  strokeOrder: () => void;
}

interface Props {
  character: string;
  onLoaded?: () => void;
}

export const KanjiStrokeOrder = forwardRef<KanjiStrokeOrderHandle, Props>(
  ({ character, onLoaded }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathsRef = useRef<SVGPathElement[]>([]);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
      const hex = character.codePointAt(0)!.toString(16).padStart(5, '0');
      const callback = onLoaded;

      fetch(`/kanji/${hex}.svg`)
        .then(r => { if (!r.ok) throw new Error(); return r.text(); })
        .then(text => {
          const container = containerRef.current;
          if (!container) return;
          container.innerHTML = text.replace(/<!DOCTYPE[\s\S]*?]>/i, '');

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
            p.style.strokeDashoffset = '0';
            p.style.stroke = STROKE_COLORS[i % STROKE_COLORS.length];
            p.style.fill = 'none';
            p.style.strokeWidth = '5';
            p.style.strokeLinecap = 'round';
            p.style.strokeLinejoin = 'round';
            p.style.transition = 'stroke-dashoffset 0.5s ease';
          });

          svg.querySelectorAll('text').forEach(t => {
            (t as SVGTextElement).style.fontWeight = 'bold';
          });

          callback?.();
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

    const strokeOrder = () => {
      reset();
      const ids = pathsRef.current.map((p, i) =>
        setTimeout(() => { p.style.strokeDashoffset = '0'; }, i * 600 + 100)
      );
      timeoutsRef.current = ids;
    };

    useImperativeHandle(ref, () => ({ strokeOrder }));

    if (error) {
      return (
        <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-600">
          <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{character}</span>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="w-28 h-28 flex-shrink-0 bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-600 p-1"
      />
    );
  }
);

KanjiStrokeOrder.displayName = 'KanjiStrokeOrder';
