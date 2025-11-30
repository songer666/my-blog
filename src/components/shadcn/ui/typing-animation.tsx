"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  texts: string | string[];
  duration?: number;
  className?: string;
  as?: React.ElementType;
  loop?: boolean;
  pauseDuration?: number;
}

export function TypingAnimation({
  texts,
  duration = 100,
  className,
  as: Component = "p",
  loop = false,
  pauseDuration = 2000,
}: TypingAnimationProps) {
  const textArray = Array.isArray(texts) ? texts : [texts];
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!loop && currentIndex >= textArray.length) {
      return;
    }

    const currentText = textArray[currentIndex % textArray.length];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // 打字阶段
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else if (loop) {
          // 打完了，暂停后开始删除
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        // 删除阶段
        if (charIndex > 0) {
          setDisplayedText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // 删完了，切换到下一句
          setIsDeleting(false);
          setCurrentIndex(currentIndex + 1);
        }
      }
    }, isDeleting ? duration / 2 : duration);

    return () => clearTimeout(timeout);
  }, [charIndex, currentIndex, isDeleting, textArray, duration, loop, pauseDuration]);

  return (
    <Component
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className
      )}
    >
      {displayedText}
      <span className="animate-pulse">|</span>
    </Component>
  );
}
