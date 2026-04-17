'use client';

import { useState } from 'react';
import type { Card, Status } from '@/types';
import KanbanCard from './KanbanCard';

interface Props {
  column: { id: Status; label: string; dot: string; icon: string };
  cards: Card[];
  draggedId: string | null;
  sparkActive: boolean;
  lightningActive: boolean;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'forward' | 'backward') => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (status: Status) => void;
}

// Floating particles that rise when spark/lightning fires
function FloatingBurst({ active, type }: { active: boolean; type: 'spark' | 'lightning' }) {
  if (!active) return null;
  const items = type === 'spark'
    ? ['✨', '⭐', '✦', '✧', '✨', '⊹', '✦']
    : ['⚡', '⚡', '💫', '⚡', '✦', '⚡'];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {items.map((sym, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${12 + Math.random() * 76}%`,
            bottom: '20%',
            fontSize: type === 'spark' ? '14px' : '18px',
            animation: `float-up ${0.6 + i * 0.08}s ease-out forwards`,
            animationDelay: `${i * 0.06}s`,
            opacity: 0,
            color: type === 'spark' ? '#fbbf24' : '#60a5fa',
          }}
        >
          {sym}
        </span>
      ))}
    </div>
  );
}

const EMPTY: Record<Status, { icon: string; text: string }> = {
  'pending':     { icon: '🗒️',  text: 'No tasks yet · Add one above' },
  'in-progress': { icon: '⚡',  text: 'Nothing in progress yet' },
  'completed':   { icon: '🏁',  text: 'No completions yet · Keep going!' },
};

export default function Column({
  column, cards, draggedId, sparkActive, lightningActive,
  onEdit, onDelete, onMove, onDragStart, onDragEnd, onDrop,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const effectClass = sparkActive
    ? 'spark-fx'
    : lightningActive
    ? 'lightning-fx'
    : '';

  return (
    <div
      className={effectClass}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={() => { onDrop(column.id); setIsDragOver(false); }}
      style={{
        background: isDragOver ? 'rgba(59,130,246,0.07)' : 'var(--col)',
        border: `1px solid ${isDragOver ? 'rgba(59,130,246,0.4)' : 'var(--col-border)'}`,
        borderRadius: '16px',
        padding: '16px',
        minHeight: '460px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {/* Burst particles */}
      <FloatingBurst active={sparkActive}     type="spark"     />
      <FloatingBurst active={lightningActive} type="lightning" />

      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{
          width: 9, height: 9,
          borderRadius: '50%',
          background: column.dot,
          flexShrink: 0,
          boxShadow: `0 0 8px ${column.dot}80`,
        }} />
        <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)', letterSpacing: '0.01em' }}>
          {column.label}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#4e6280',
          background: 'rgba(255,255,255,0.04)',
          padding: '2px 9px', borderRadius: '20px',
        }}>
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cards.length === 0 ? (
          <EmptyState status={column.id} />
        ) : (
          cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              isDragging={draggedId === card.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ status }: { status: Status }) {
  const { icon, text } = EMPTY[status];
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      paddingTop: '48px', gap: '8px', color: 'var(--text-muted)',
    }}>
      <span style={{ fontSize: '30px', opacity: 0.4 }}>{icon}</span>
      <span style={{ fontSize: '12px', textAlign: 'center', maxWidth: '180px', lineHeight: 1.5, color: '#2e4060' }}>
        {text}
      </span>
    </div>
  );
}
