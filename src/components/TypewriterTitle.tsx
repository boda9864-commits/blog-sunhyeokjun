'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';

interface TypewriterTitleProps {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TypewriterTitle({
  text = 'SUNHYEOKJUN',
  className = '',
  style = {},
}: TypewriterTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIdx = 0;
    setDisplayText('');
    setIsTypingComplete(false);

    // Initial delay before typing starts
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        currentIdx++;
        setDisplayText(text.slice(0, currentIdx));

        if (currentIdx >= text.length) {
          clearInterval(interval);
          setIsTypingComplete(true);

          // Once complete, trigger subtle Anime.js spring bounce
          if (containerRef.current) {
            animate(containerRef.current.querySelectorAll('.typewriter-char'), {
              translateY: [-6, 0],
              duration: 500,
              delay: stagger(35),
              ease: 'outElastic(1, .7)',
            });
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(startTimeout);
  }, [text]);

  const handleReplay = () => {
    if (!containerRef.current) return;
    animate(containerRef.current.querySelectorAll('.typewriter-char'), {
      translateY: [
        { to: -14, duration: 200, ease: 'outQuad' },
        { to: 0, duration: 600, ease: 'outElastic(1, .6)' },
      ],
      color: [
        { to: '#38bdf8', duration: 200 },
        { to: '#ffffff', duration: 600 },
      ],
      delay: stagger(40),
    });
  };

  return (
    <h1
      ref={containerRef}
      onClick={handleReplay}
      className={className}
      style={{
        fontSize: 'clamp(3rem, 7vw, 5.5rem)',
        fontWeight: 700,
        lineHeight: 1.05,
        marginBottom: '2.5rem',
        letterSpacing: '-0.03em',
        color: '#ffffff',
        textShadow: isTypingComplete
          ? '0 0 35px rgba(56, 189, 248, 0.4), 0 0 70px rgba(15, 23, 42, 0.9)'
          : '0 0 20px rgba(56, 189, 248, 0.2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isTypingComplete ? 'pointer' : 'default',
        transition: 'text-shadow 0.6s ease',
        userSelect: 'none',
        ...style,
      }}
      title={isTypingComplete ? '클릭하면 글자가 통통 튕깁니다!' : undefined}
    >
      <span>
        {displayText.split('').map((char, idx) => (
          <span
            key={idx}
            className="typewriter-char"
            style={{
              display: 'inline-block',
              transition: 'color 0.3s ease',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>

      {/* Typing Blinking Caret */}
      <span
        style={{
          display: 'inline-block',
          width: '3px',
          height: '0.85em',
          backgroundColor: '#38bdf8',
          marginLeft: '4px',
          boxShadow: '0 0 10px #38bdf8, 0 0 20px rgba(56, 189, 248, 0.6)',
          animation: 'cursorBlink 0.9s infinite',
          verticalAlign: 'middle',
          borderRadius: '2px',
        }}
      />

      <style jsx>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </h1>
  );
}
