'use client';

import { useEffect, useRef, useState } from 'react';
import type { Card, Priority } from '@/types';

interface Props {
  card: Card | null;
  onSave: (title: string, desc: string, priority: Priority, deadline: string | null) => void;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'high',   label: '🔴 High',   color: '#fca5a5', bg: 'rgba(239,68,68,0.18)'  },
  { value: 'medium', label: '🟡 Medium', color: '#fde68a', bg: 'rgba(245,158,11,0.18)' },
  { value: 'low',    label: '🟢 Low',    color: '#86efac', bg: 'rgba(16,185,129,0.15)' },
];

export default function CardModal({ card, onSave, onClose }: Props) {
  const [title,    setTitle]    = useState(card?.title       ?? '');
  const [desc,     setDesc]     = useState(card?.description ?? '');
  const [priority, setPriority] = useState<Priority>(card?.priority ?? 'medium');
  const [deadline, setDeadline] = useState<string>(card?.deadline ?? '');
  const [err,      setErr]      = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  // Today string for min date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr('Title is required.'); titleRef.current?.focus(); return; }
    onSave(title.trim(), desc.trim(), priority, deadline || null);
  };

  /* ── Shared input style ─ */
  const inputSx: React.CSSProperties = {
    width: '100%',
    padding: '10px 13px',
    background: '#080e1e',
    border: '1px solid #1d2e4a',
    borderRadius: '8px',
    color: '#dde6f5',
    fontSize: '13.5px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  const labelSx: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#4e6280',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  const focus   = (e: React.FocusEvent<HTMLElement>) => ((e.target as HTMLElement).style.borderColor = 'rgba(59,130,246,0.55)');
  const unfocus = (e: React.FocusEvent<HTMLElement>) => ((e.target as HTMLElement).style.borderColor = '#1d2e4a');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="modal-enter"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0c1326',
          border: '1px solid #1d2e4a',
          borderRadius: '18px',
          padding: '28px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.08)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '17px', color: '#dde6f5', letterSpacing: '-0.02em' }}>
            {card ? '✏️ Edit Card' : '✨ New Card'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#3f5272', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '2px 6px', borderRadius: '6px' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Title */}
          <div>
            <label style={labelSx}>Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              ref={titleRef}
              value={title}
              onChange={e => { setTitle(e.target.value); if (err) setErr(''); }}
              placeholder="What needs to be done?"
              style={{ ...inputSx, borderColor: err ? '#ef4444' : '#1d2e4a' }}
              onFocus={focus} onBlur={unfocus}
            />
            {err && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>{err}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={labelSx}>Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Optional details…"
              rows={3}
              style={{ ...inputSx, resize: 'vertical', minHeight: '80px' }}
              onFocus={focus} onBlur={unfocus}
            />
          </div>

          {/* Priority + Deadline row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* Priority */}
            <div>
              <label style={labelSx}>Priority</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '7px',
                      background: priority === opt.value ? opt.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${priority === opt.value ? 'transparent' : '#1d2e4a'}`,
                      color: priority === opt.value ? opt.color : '#4e6280',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'all 0.12s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label style={labelSx}>Deadline</label>
              <input
                type="date"
                value={deadline}
                min={today}
                onChange={e => setDeadline(e.target.value)}
                style={{
                  ...inputSx,
                  colorScheme: 'dark',
                  cursor: 'pointer',
                }}
                onFocus={focus} onBlur={unfocus}
              />
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline('')}
                  style={{
                    marginTop: '6px',
                    padding: '4px 10px',
                    background: 'rgba(239,68,68,0.12)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fca5a5',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Clear date
                </button>
              )}
              {!deadline && (
                <p style={{ fontSize: '11px', color: '#2e4060', marginTop: '8px', lineHeight: 1.5 }}>
                  No deadline set · task won't show a countdown.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #1d2e4a',
                borderRadius: '9px',
                color: '#8da4c8',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 26px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '9px',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                transition: 'filter 0.12s',
              }}
              onMouseOver={e  => (e.currentTarget.style.filter = 'brightness(1.12)')}
              onMouseOut={e   => (e.currentTarget.style.filter = 'none')}
            >
              {card ? 'Save Changes' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
