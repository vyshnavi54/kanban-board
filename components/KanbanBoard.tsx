'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Card, Status, Priority } from '@/types';
import Column from './Column';
import CardModal from './CardModal';
import ConfettiCanvas from './ConfettiCanvas';
import Toast from './Toast';

const COLUMNS: { id: Status; label: string; dot: string; icon: string }[] = [
  { id: 'pending',     label: 'Pending',     dot: '#f59e0b', icon: '⏳' },
  { id: 'in-progress', label: 'In Progress', dot: '#3b82f6', icon: '⚡' },
  { id: 'completed',   label: 'Completed',   dot: '#10b981', icon: '✅' },
];

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const STORAGE_KEY = 'kanban-v3';

const DONE_MESSAGES = [
  { msg: 'Task destroyed! You legend.', emoji: '🏆' },
  { msg: "You're on fire today! 🔥",    emoji: '🔥' },
  { msg: 'Mission complete. Nicely done!', emoji: '🚀' },
  { msg: 'Outstanding work!',           emoji: '🌟' },
  { msg: 'One less thing to worry about!', emoji: '🎯' },
  { msg: 'Unstoppable! Keep going.',    emoji: '💪' },
];

interface ToastState {
  visible: boolean;
  message: string;
  emoji: string;
  color: string;
}

interface EffectState {
  sparkCol:     string | null;  // column id that gets spark glow (add card)
  lightningCol: string | null;  // column id that gets lightning glow (in-progress)
}

export default function KanbanBoard() {
  const [cards,       setCards]       = useState<Card[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editCard,    setEditCard]    = useState<Card | null>(null);
  const [search,      setSearch]      = useState('');
  const [draggedId,   setDraggedId]   = useState<string | null>(null);
  const [confetti,    setConfetti]    = useState(false);
  const [toast,       setToast]       = useState<ToastState>({ visible: false, message: '', emoji: '', color: '' });
  const [effects,     setEffects]     = useState<EffectState>({ sparkCol: null, lightningCol: null });

  /* ── Persist ────────────────────────────────────────── */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCards(JSON.parse(raw));
    } catch { /* ignore */ }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, loading]);

  /* ── Helpers ────────────────────────────────────────── */

  const showToast = useCallback((message: string, emoji: string, color: string) => {
    setToast({ visible: true, message, emoji, color });
  }, []);

  const hideToast = useCallback(() => {
    setToast(t => ({ ...t, visible: false }));
  }, []);

  const triggerEffect = (type: keyof EffectState, colId: string) => {
    setEffects(e => ({ ...e, [type]: colId }));
    setTimeout(() => setEffects(e => ({ ...e, [type]: null })), 950);
  };

  /* ── CRUD ───────────────────────────────────────────── */

  const addCard = (title: string, description: string, priority: Priority, deadline: string | null) => {
    const card: Card = {
      id:          crypto.randomUUID(),
      title,
      description,
      status:      'pending',
      priority,
      deadline,
      createdAt:   Date.now(),
    };
    setCards(prev => [card, ...prev]);

    // ✨ Spark effect on Pending column
    triggerEffect('sparkCol', 'pending');
    showToast('Card added! Let\'s crush it.', '✨', '#f59e0b');
  };

  const updateCard = (id: string, title: string, description: string, priority: Priority, deadline: string | null) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, title, description, priority, deadline } : c));
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  /* ── Move ───────────────────────────────────────────── */

  const STATUS_ORDER: Status[] = ['pending', 'in-progress', 'completed'];

  const moveCard = (id: string, direction: 'forward' | 'backward') => {
    setCards(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const idx  = STATUS_ORDER.indexOf(c.status);
        const next = direction === 'forward' ? idx + 1 : idx - 1;
        if (next < 0 || next >= STATUS_ORDER.length) return c;

        const newStatus = STATUS_ORDER[next];

        if (newStatus === 'in-progress') {
          triggerEffect('lightningCol', 'in-progress');
          showToast('Task activated! You\'ve got this ⚡', '⚡', '#3b82f6');
        }
        if (newStatus === 'completed') {
          const pick = DONE_MESSAGES[Math.floor(Math.random() * DONE_MESSAGES.length)];
          setConfetti(true);
          showToast(pick.msg, pick.emoji, '#10b981');
        }

        return { ...c, status: newStatus };
      }),
    );
  };

  /* ── Drag & drop ────────────────────────────────────── */

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd   = ()           => setDraggedId(null);

  const handleDrop = (status: Status) => {
    if (!draggedId) return;

    const card = cards.find(c => c.id === draggedId);
    if (!card || card.status === status) { setDraggedId(null); return; }

    if (status === 'in-progress') {
      triggerEffect('lightningCol', 'in-progress');
      showToast('Task activated! You\'ve got this ⚡', '⚡', '#3b82f6');
    }
    if (status === 'completed') {
      const pick = DONE_MESSAGES[Math.floor(Math.random() * DONE_MESSAGES.length)];
      setConfetti(true);
      showToast(pick.msg, pick.emoji, '#10b981');
    }

    setCards(prev => prev.map(c => c.id === draggedId ? { ...c, status } : c));
    setDraggedId(null);
  };

  /* ── Filter & sort ──────────────────────────────────── */

  const filtered = cards.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()),
  );

  const getColumnCards = (status: Status) =>
    filtered
      .filter(c => c.status === status)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  /* ── Modal helpers ──────────────────────────────────── */

  const openCreate = () => { setEditCard(null); setModalOpen(true); };
  const openEdit   = (c: Card) => { setEditCard(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditCard(null); };

  const handleSave = (
    title: string, description: string, priority: Priority, deadline: string | null,
  ) => {
    if (editCard) updateCard(editCard.id, title, description, priority, deadline);
    else          addCard(title, description, priority, deadline);
    closeModal();
  };

  /* ── Stats bar ──────────────────────────────────────── */

  const total     = cards.length;
  const done      = cards.filter(c => c.status === 'completed').length;
  const highCount = cards.filter(c => c.priority === 'high' && c.status !== 'completed').length;

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

      {/* ── Toolbar ─ */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Stats chips */}
        {total > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip label={`${total} cards`}    color="#8da4c8" bg="rgba(59,130,246,0.1)"  />
            <Chip label={`${done} done`}      color="#6ee7b7" bg="rgba(16,185,129,0.1)"  />
            {highCount > 0 &&
              <Chip label={`${highCount} high-priority`} color="#fca5a5" bg="rgba(239,68,68,0.12)" />
            }
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', marginLeft: 'auto' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#3f5272', fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards…"
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              background: 'var(--col)',
              border: '1px solid var(--col-border)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '13.5px',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e  => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
            onBlur={e   => (e.target.style.borderColor = 'var(--col-border)')}
          />
        </div>

        {/* New Card */}
        <button
          onClick={openCreate}
          style={{
            padding: '10px 22px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.01em',
            boxShadow: '0 4px 18px rgba(59,130,246,0.35)',
            transition: 'filter 0.15s, transform 0.1s',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={e  => { (e.currentTarget.style.filter = 'brightness(1.15)'); (e.currentTarget.style.transform = 'translateY(-1px)'); }}
          onMouseOut={e   => { (e.currentTarget.style.filter = 'none'); (e.currentTarget.style.transform = 'none'); }}
        >
          + New Card
        </button>
      </div>

      {/* ── Board ─ */}
      {loading ? (
        <LoadingBoard />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              column={col}
              cards={getColumnCards(col.id)}
              draggedId={draggedId}
              sparkActive={effects.sparkCol === col.id}
              lightningActive={effects.lightningCol === col.id}
              onEdit={openEdit}
              onDelete={deleteCard}
              onMove={moveCard}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* ── Modal ─ */}
      {modalOpen && (
        <CardModal card={editCard} onSave={handleSave} onClose={closeModal} />
      )}

      {/* ── Confetti (completion only) ─ */}
      <ConfettiCanvas active={confetti} onDone={() => setConfetti(false)} />

      {/* ── Toast ─ */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        emoji={toast.emoji}
        color={toast.color}
        onHide={hideToast}
      />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      padding: '5px 12px',
      borderRadius: '20px',
      background: bg,
      color,
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {label}
    </span>
  );
}

function LoadingBoard() {
  return (
    <div style={{
      height: 320,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: '#3f5272',
      fontSize: 14,
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: '50%',
        border: '2.5px solid #3b82f6', borderTopColor: 'transparent',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading board…
    </div>
  );
}
