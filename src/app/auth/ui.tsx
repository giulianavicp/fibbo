import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { C, font } from '../lib/tokens';

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export const FibboLogo = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="60" height="60" rx="16" fill="#F3EDE5" />
    <path d="M32,9 A23,23 0 0,1 55,32" stroke={C.primary} strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M55,32 A23,23 0 0,1 32,55" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M32,55 A13.5,13.5 0 0,1 18.5,41.5" stroke={C.mid1} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M18.5,41.5 A7.5,7.5 0 0,1 26,34" stroke={C.mid1} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <circle cx="33" cy="33" r="2" fill={C.primary} />
  </svg>
);

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
      <main style={{ width: '100%', maxWidth: '25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><FibboLogo size={72} /></div>
          <h1 style={{ color: C.primary, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1, margin: 0 }}>Fibbo</h1>
          <p style={{ color: C.textSec, fontSize: '0.85rem', marginTop: '0.375rem' }}>Plataforma de Apoio ao Ensino com IA</p>
        </div>
        <section style={{ background: C.card, borderRadius: '1rem', padding: '1.75rem', border: `1px solid ${C.border}`, boxShadow: '0 0.25rem 1.5rem rgba(46,42,38,0.07)' }}>
          <div style={{ marginBottom: '1.375rem' }}>
            <h2 style={{ color: C.title, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h2>
            <p style={{ color: C.textSec, fontSize: '0.83rem', marginTop: '0.1875rem', marginBottom: 0 }}>{subtitle}</p>
          </div>
          {children}
        </section>
        {footer}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: '0.375rem' }}>
          <Link to="/ajuda" style={{ color: C.mid1 }}>Ajuda</Link> · <Link to="/privacidade" style={{ color: C.mid1 }}>Privacidade</Link> · <Link to="/termos" style={{ color: C.mid1 }}>Termos</Link>
        </p>
        <p style={{ textAlign: 'center', color: C.textSec, fontSize: '0.72rem', margin: 0 }}>Fibbo © 2026 — Plataforma Educacional com IA</p>
      </main>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; icon: ReactNode; error?: string; valid?: boolean };

export function Field({ label, icon, error, valid, type, id, ...rest }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const border = error ? C.errorBorder : valid ? C.success : C.border;
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', color: C.title, fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.375rem' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.8125rem', top: '50%', transform: 'translateY(-50%)', color: error ? C.error : C.textSec, display: 'flex' }}>{icon}</span>
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error}
          {...rest}
          style={{ width: '100%', padding: `0.75rem ${isPassword ? 44 : 14}px 0.75rem 2.625rem`, border: `1.5px solid ${border}`, borderRadius: '0.625rem', background: rest.disabled ? '#FAFAFA' : C.card, color: C.title, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', opacity: rest.disabled ? 0.6 : 1, transition: 'border-color 0.2s', fontFamily: font }}
        />
        {isPassword && (
          <button type="button" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)} style={{ position: 'absolute', right: '0.8125rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: C.textSec, padding: 0, display: 'flex' }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p style={{ color: C.error, fontSize: '0.73rem', marginTop: '0.25rem', marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const color = tone === 'error' ? C.error : C.success;
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} style={{ background: tone === 'error' ? C.errorBg : C.successBg, borderLeft: `0.1875rem solid ${tone === 'error' ? C.errorBorder : C.success}`, borderRadius: '0.5rem', padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Icon size={15} color={color} style={{ flexShrink: 0 }} />
      <span style={{ color, fontSize: '0.82rem', lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}

export function SubmitButton({ disabled, loading, children }: { disabled: boolean; loading: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={disabled || loading} style={{ width: '100%', padding: '0.8125rem', marginTop: '0.25rem', background: disabled || loading ? '#C9B9AE' : C.primary, color: 'white', border: 'none', borderRadius: '0.625rem', fontSize: '0.9rem', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: font }}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

export const linkButton = { background: 'none', border: 'none', color: C.mid1, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: font } as const;
