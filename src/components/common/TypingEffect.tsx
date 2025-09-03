
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
  staticText: string;
  words: string[];
  className?: string;
}

export function TypingEffect({ staticText, words, className }: TypingEffectProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentText, setCurrentText] = useState(staticText);
  const [phase, setPhase] = useState<'initial' | 'cycling'>('initial');

  useEffect(() => {
    // Initial phase: Just show the static text for a moment
    if (phase === 'initial') {
      const initialTimer = setTimeout(() => {
        setIsDeleting(true);
        setPhase('cycling');
      }, 2000); // Wait 2 seconds before starting the animation
      return () => clearTimeout(initialTimer);
    }

    // Cycling phase: The main animation loop
    if (phase === 'cycling') {
      // If we are deleting
      if (isDeleting) {
        if (subIndex === 0) {
          setIsDeleting(false);
          // If we deleted the static text, move to the first word
          if (currentText === staticText) {
             setIndex(0);
          } else {
             setIndex((prevIndex) => (prevIndex + 1) % words.length);
          }
        } else {
          const timeout = setTimeout(() => {
            setCurrentText(currentText.substring(0, subIndex - 1));
            setSubIndex(subIndex - 1);
          }, 100); // Deleting speed
          return () => clearTimeout(timeout);
        }
      }

      // If we are typing
      const targetWord = currentText === staticText ? words[index] : words[index];
      if (subIndex === targetWord.length) {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // Pause before deleting
        return () => clearTimeout(timeout);
      }

      const timeout = setTimeout(() => {
        setCurrentText(targetWord.substring(0, subIndex + 1));
        setSubIndex(subIndex + 1);
      }, 150); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [subIndex, isDeleting, phase, words, index, staticText, currentText]);

  return (
    <span className={cn('typing-container', className)}>
      {currentText}
      <span className="cursor" />
    </span>
  );
}
