'use client';

import { useState, useCallback } from 'react';
import type { Card, Priority } from '@/types';

/* ── Time-left helper ───────────────────────────────── */
function getDeadlineInfo(deadline: string | null): { label: string; color: string; bg: string } | null {
  if (!deadline) return null;

  const msLeft = new Date(deadline + 'T23:59:59').getTime() - Date.now();

  if (msLeft < 0)
    return { label: '⚠ Overdue!',           color: '#fca5a5', bg: 'rgba(239,68,68,0.18)' };

  const hours = Math.floor(msLeft / 3600000);
  const days  = Math.floor(hours / 24);

  if (days === 0 && hours < 3)
    return { label: `🔴 ${hours}h left`,      color: '#fca5a5', bg: 'rgba(239,68,68,0.15)' };
  if (days === 0)
    return { label: `🟠 ${hours}h left`,      color: '#fdba74', bg: 'rgba(249,115,22,0.15)' };
  if (days === 1)
    return { label: '🟡 1 day left',          color: '#fde68a', bg: 'rgba(245,158,11,0.15)' };
  if (days <= 3)
    return { label: `🟡 ${days} days left`,   color: '#fde68a', bg: 'rgba(245,158,11,0.12)' };
  return   { label: `🟢 ${days} days left`,   color: '#86efac', bg: 'rgba(16,185,129,0.12)' };
}

/* ── Priority config ────────────────────────────────── */
const PRIORITY: Record<Priority, { label: string; bg: string; text: string; glow: string }> = {
  high:   { label: 'HIGH',   bg: 'rgba(239,68,68,0.18)',   text: '#fca5a5', glow: 'rgba(239,68,68,0.3)'  },
  medium: { label: 'MED',    bg: 'rgba(245,158,11,0.18)',  text: '#fde68a', glow: 'rgba(245,158,11,0.25)' },
  low:    { label: 'LOW',    bg: 'rgba(16,185,129,0.15)',  text: '#86efac', glow: 'rgba(16,185,129,0.2)'  },
};

/* ── Sparkle hover data ─────────────────────────────── */
type Sparkle = { id: number; left: string; top: string; delay: string; sym: string };
const SYMS = ['✦', '✧', '⋆', '✦', '✧', '⊹'];

interface Props {
  card: Card;
  isDragging: boolean;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'forward' | 'backward') => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

const STATUS_ORDER = ['pending', 'in-progress', 'completed'] as const;

export default function KanbanCard({ card, isDragging, onEdit, onDelete, onMove, onDragStart, onDragEnd }: Props) {
  const [hovered,       setHovered]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sparkles,      setSparkles]      = useState<Sparkle[]>([]);

  const idx          = STATUS_ORDER.indexOf(card.status as typeof STATUS_ORDER[number]);
  const canBack      = idx > 0;
  const canForward   = idx < STATUS_ORDER.length - 1;
  const pConfig      = PRIORITY[card.priority];
  const deadlineInfo = card.status !== 'completed' ? getDeadlineInfo(card.deadline) : null;

  const dateStr = new Date(card.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });

  const handleEnter = useCallback(() => {
    setHovered(true);
    const s: Sparkle[] = SYMS.map((sym, i) => ({
      id:    Date.now() + i,
      left:  `${8 + Math.random() * 84}%`,
      top:   `${8 + Math.random() * 84}%`,
      delay: `${i * 0.05}s`,
      sym,
    }));
    setSparkles(s);
    setTimeout(() => setSparkles([]), 700);
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(false);
    setConfirmDelete(false);
  }, []);

  /* ── Styles ─────────────────────────────────────────── */

  const btn = (bg: string, color: string): React.CSSProperties => ({
    padding: '3px 11px',
    borderRadius: '6px',
    background: bg,
    color,
    border: 'none',
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
    transition: 'filter 0.12s',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="card-enter"
      style={{
        position: 'relative',
        background: hovered ? 'var(--card-hover)' : 'var(--card)',
        border: `1px solid ${hovered ? '#253a5e' : 'var(--card-border)'}`,
        borderRadius: '12px',
        padding: '14px',
        cursor: 'grab',
        opacity: isDragging ? 0.3 : 1,
        transform: isDragging ? 'rotate(2.5deg) scale(0.97)' : 'none',
        transition: 'background 0.15s, border-color 0.15s, opacity 0.15s, transform 0.15s, box-shadow 0.15s',
        boxShadow: hovered
          ? `0 6px 24px rgba(0,0,0,0.4), 0 0 0 0 transparent${card.priority === 'high' ? ', 0 0 14px rgba(239,68,68,0.12)' : ''}`
          : '0 2px 8px rgba(0,0,0,0.2)',
        userSelect: 'none',
        overflow: 'visible',
      }}
    >
      {/* ── Sparkle hover particles ─ */}
      {sparkles.map(s => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            fontSize: '10px',
            color: '#93c5fd',
            pointerEvents: 'none',
            animation: 'sparkle-pop 0.65s ease-out forwards',
            animationDelay: s.delay,
            opacity: 0,
            zIndex: 20,
          }}
        >
          {s.sym}
        </span>
      ))}

      {/* ── High-priority ribbon ─ */}
      {card.priority === 'high' && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 36px 36px 0',
          borderColor: `transparent #ef4444 transparent transparent`,
          borderTopRightRadius: '12px',
          zIndex: 5,
        }}>
          <span style={{
            position: 'absolute',
            top: 4,
            right: -33,
            fontSize: '9px',
            color: '#fff',
            fontWeight: 800,
            transform: 'rotate(45deg)',
            display: 'block',
            letterSpacing: '0.03em',
          }}>!</span>
        </div>
      )}

      {/* ── Priority badge + title row ─ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
        <span style={{
          padding: '2px 7px',
          borderRadius: '5px',
          background: pConfig.bg,
          color: pConfig.text,
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
          marginTop: '1px',
        }}>
          {pConfig.label}
        </span>
        <p style={{
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--text)',
          lineHeight: 1.35,
          flex: 1,
        }}>
          {card.title}
        </p>
      </div>

      {/* ── Description ─ */}
      {card.description && (
        <p
          className="line-clamp-2"
          style={{ fontSize: '12.5px', color: 'var(--text-sub)', lineHeight: 1.55, marginBottom: '10px' }}
        >
          {card.description}
        </p>
      )}

      {/* ── Deadline pill ─ */}
      {deadlineInfo && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: '6px',
          background: deadlineInfo.bg,
          color: deadlineInfo.color,
          fontSize: '11.5px',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: '10px',
          letterSpacing: '0.02em',
        }}>
          {deadlineInfo.label}
        </div>
      )}

      {/* ── Footer actions ─ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>

        {canBack && (
          <button style={btn('rgba(255,255,255,0.07)', '#8da4c8')} onClick={() => onMove(card.id, 'backward')}>
            ← Back
          </button>
        )}
        {canForward && (
          <button style={btn('rgba(59,130,246,0.18)', '#93c5fd')} onClick={() => onMove(card.id, 'forward')}>
            Next →
          </button>
        )}

        {/* Date */}
        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {dateStr}
        </span>

        {/* Edit */}
        <button style={btn('rgba(245,158,11,0.14)', '#fde68a')} onClick={() => onEdit(card)}>
          Edit
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <>
            <button style={btn('#ef4444', '#fff')} onClick={() => onDelete(card.id)}>Sure?</button>
            <button style={btn('rgba(255,255,255,0.06)', '#8da4c8')} onClick={() => setConfirmDelete(false)}>No</button>
          </>
        ) : (
          <button style={btn('rgba(239,68,68,0.13)', '#fca5a5')} onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
