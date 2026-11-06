import type { ButtonHTMLAttributes, CSSProperties, ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { C, font } from '../lib/tokens';
import type { StudentStatus } from '../teacher/stats';

export const chartH = (px: number) => Math.round(px * (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1));

export const card: CSSProperties = { background: C.card, borderRadius: '0.75rem', padding: '1.25rem', border: `1px solid ${C.border}` };

export function Page({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ padding: '1.75rem clamp(1rem, 3vw, 2.5rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: C.title, fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ color: C.textSec, fontSize: '0.8rem', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 style={{ color: C.title, fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.875rem' }}>{children}</h2>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; loading?: boolean };

export function Button({ variant = 'primary', loading, children, style, disabled, ...rest }: BtnProps) {
  const look = {
    primary: { background: C.primary, color: 'white', border: 'none' },
    ghost: { background: C.card, color: C.title, border: `1.5px solid ${C.border}` },
    danger: { background: C.card, color: C.error, border: `1.5px solid ${C.border}` },
  }[variant];
  const off = disabled || loading;
  return (
    <button
      disabled={off}
      {...rest}
      style={{ ...look, borderRadius: '0.5625rem', padding: '0.5625rem 1rem', fontSize: '0.82rem', fontWeight: 600, cursor: off ? 'not-allowed' : 'pointer', opacity: off ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontFamily: font, ...style }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

const controlStyle: CSSProperties = { width: '100%', padding: '0.5625rem 0.6875rem', border: `1.5px solid ${C.border}`, borderRadius: '0.5625rem', background: C.card, fontSize: '0.83rem', color: C.title, outline: 'none', boxSizing: 'border-box', fontFamily: font };

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} style={{ display: 'block', color: C.title, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3125rem' }}>{children}</label>;
}

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} style={{ ...controlStyle, cursor: 'pointer', ...props.style }} />;
export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} style={{ ...controlStyle, ...props.style }} />;
export const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} style={{ ...controlStyle, resize: 'vertical', minHeight: '4rem', ...props.style }} />;

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '2.5rem 1.25rem' }}>
      <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '0.875rem', background: '#F6EEE6', color: C.mid1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>{icon}</div>
      <div style={{ color: C.title, fontSize: '0.92rem', fontWeight: 700 }}>{title}</div>
      <p style={{ color: C.textSec, fontSize: '0.8rem', margin: '0.25rem auto 0', maxWidth: '22.5rem', lineHeight: 1.5 }}>{text}</p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

export const statusCfg: Record<StudentStatus, { label: string; color: string; bg: string }> = {
  excellent: { label: 'Excelente', color: C.info, bg: C.infoBg },
  good: { label: 'Bom', color: C.success, bg: C.successBg },
  attention: { label: 'Atenção', color: '#8A6020', bg: C.warningBg },
  risk: { label: 'Risco', color: C.error, bg: C.errorBg },
  none: { label: 'Sem notas', color: C.textSec, bg: C.bg },
};

export function StatusBadge({ status }: { status: StudentStatus }) {
  const cfg = statusCfg[status];
  return <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.68rem', borderRadius: '0.375rem', padding: '0.1875rem 0.5rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{cfg.label}</span>;
}

export const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : 'sem prazo');

export const fmtGrade = (g: number | null) => (g === null ? '—' : g.toFixed(1));

export function CourseFilter({ courses, value, onChange, allLabel = 'Todas as disciplinas' }: { courses: { id: string; name: string; code: string }[]; value: string; onChange: (v: string) => void; allLabel?: string | null }) {
  return (
    <Select value={value} onChange={e => onChange(e.target.value)} aria-label="Disciplina" style={{ width: 'auto', minWidth: '13.75rem' }}>
      {allLabel !== null && <option value="">{allLabel}</option>}
      {courses.map(c => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
    </Select>
  );
}
