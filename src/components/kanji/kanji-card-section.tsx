'use client';

import { Fragment, useRef, useState } from 'react';
import { KanjiStrokeOrder, KanjiStrokeOrderHandle } from './kanji-stroke-order';
import { Button } from '@/components/ui/button';

interface Props {
  character: string;
  meaning: string;
  onyomi?: string | null;
  kunyomi?: string | null;
  strokeCount?: number | null;
  commonWords?: string[][];
}

export function KanjiCardSection({ character, meaning, onyomi, kunyomi, strokeCount, commonWords }: Props) {
  const strokeRef = useRef<KanjiStrokeOrderHandle>(null);
  const [loaded, setLoaded] = useState(false);
  const hasCommonWords = commonWords && commonWords.length > 0;

  return (
    <div className="space-y-4">
      {/* Row 1: SVG + reading info */}
      <div className="flex gap-6 items-start">
        <KanjiStrokeOrder ref={strokeRef} character={character} onLoaded={() => setLoaded(true)} />
        <div className="space-y-1.5 text-sm pt-1 flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{meaning}</p>
          {onyomi && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400 w-6">音</span>
              <span className="text-gray-600 dark:text-gray-300">{onyomi}</span>
            </div>
          )}
          {kunyomi && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400 w-6">訓</span>
              <span className="text-gray-600 dark:text-gray-300">{kunyomi}</span>
            </div>
          )}
          {strokeCount && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{strokeCount} Strokes</p>
          )}
        </div>
      </div>

      {/* Row 2: Stroke Order button + Common Words, both from the same left margin */}
      {loaded && (
        <div className="space-y-2">
          <Button
            size="sm"
            className="text-xs h-7 px-3 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => strokeRef.current?.strokeOrder()}
          >
            Stroke Order
          </Button>
          {hasCommonWords && (
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Common Words：</p>
          )}
          {hasCommonWords && (
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
              {commonWords.map((w, i) => (
                <Fragment key={i}>
                  <span className="font-medium">{w[0]}</span>
                  <span className="text-gray-500 dark:text-gray-400">{w[1]}</span>
                  <span>{w[2]}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
