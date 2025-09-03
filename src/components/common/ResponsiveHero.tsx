
'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TypingEffect } from './TypingEffect';

export function ResponsiveHero({ allWords }: { allWords: string[] }) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a static version on the server to avoid hydration mismatch
    return (
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
        Your All-in-One <span className="text-primary">Smart</span> <span className="text-accent">Toolkit</span>
      </h1>
    );
  }

  return (
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
      {isMobile ? (
        <>
         Your All-in-One <span className="text-primary">Smart</span> <span className="text-accent">Toolkit</span>
        </>
      ) : (
        <>
          Your All-in-One Smart&nbsp;
          <span className="text-primary whitespace-nowrap">
            <TypingEffect words={allWords} />
          </span>
          &nbsp;Toolkit
        </>
      )}
    </h1>
  );
}
