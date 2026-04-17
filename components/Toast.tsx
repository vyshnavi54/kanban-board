'use client';

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  emoji: string;
  color: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, emoji, color, visible, onHide }: Props) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) { setFading(false); return; }
    const fadeTimer  = setTimeout(() => setFading(true), 2400);
    const closeTimer = setTimeout(() => onHide(), 2900);
    return () => { clearTimeout(fadeTimer); clearTimeout(closeTimer); };
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '13px 22px',
        background: 'rgba(10,16,32,0.92)',
        border: `1px solid ${color}55`,
        borderRadius: '14px',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}30`,
        animation: fading
          ? 'toast-out 0.5s ease-in forwards'
          : 'toast-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '20px' }}>{emoji}</span>
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          color: '#dde6f5',
          letterSpacing: '0.01em',
        }}
      >
        {message}
      </span>
    </div>
  );
}
