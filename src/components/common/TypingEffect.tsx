
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
  words: string[];
  className?: string;
}

export function TypingEffect({ words, className }: TypingEffectProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (isDeleting) {
      if (subIndex === 0) {
        setIsDeleting(false);
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
      } else {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.substring(0, subIndex - 1));
          setSubIndex(subIndex - 1);
        }, 100);
        return () => clearTimeout(timeout);
      }
    }

    const targetWord = words[index];
    if (subIndex === targetWord.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCurrentText(targetWord.substring(0, subIndex + 1));
      setSubIndex(subIndex + 1);
    }, 150);
    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, words, index, currentText]);

  return (
    <span className={cn('typing-container', className)}>
      {currentText}
      <span className="cursor" />
    </span>
  );
}
