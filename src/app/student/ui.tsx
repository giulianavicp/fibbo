import type { CSSProperties, ReactNode } from 'react';
import { C } from '../lib/tokens';

export const sCard: CSSProperties = { background: C.card, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${C.border}` };

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0 1.125rem', gap: '0.75rem' }}>
      <div>
        <h1 style={{ color: C.title, fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: C.textSec, fontSize: '0.8rem', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export const statusBadge = (s: 'pending' | 'submitted' | 'overdue') =>
  s === 'submitted' ? { bg: C.successBg, color: C.success, label: 'Entregue' }
  : s === 'overdue' ? { bg: C.errorBg, color: C.error, label: 'Atrasada' }
  : { bg: C.pendingBg, color: C.pending, label: 'Pendente' };

export const kindTag = (kind: 'atividade' | 'prova') => (
  <span style={{ background: kind === 'prova' ? '#F0EDF8' : C.bg, color: kind === 'prova' ? '#6D28D9' : C.textSec, fontSize: '0.68rem', borderRadius: '6.1875rem', padding: '2px 0.5rem', fontWeight: 600, border: `1px solid ${C.border}`, textTransform: 'uppercase' }}>{kind}</span>
);
