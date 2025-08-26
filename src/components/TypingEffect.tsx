import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';

interface TypingEffectProps {
  strings: string[];
  className?: string;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ strings, className = '' }) => {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const options = {
      strings,
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
    };

    if (el.current) {
      typed.current = new Typed(el.current, options);
    }

    return () => {
      if (typed.current) {
        typed.current.destroy();
      }
    };
  }, [strings]);

  return <span className={className} ref={el} />;
};

export default TypingEffect;