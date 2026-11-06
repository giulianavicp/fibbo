import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { C, font } from '../lib/tokens';
import { FibboLogo } from '../auth/ui';

export const UPDATED_AT = '4 de novembro de 2026';

export function LegalLayout({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div style={{ background: C.bg, minHeight: '100dvh', fontFamily: font, color: C.title }}>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0.875rem clamp(1rem, 4vw, 2rem)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <FibboLogo size={34} />
          <span style={{ color: C.primary, fontWeight: 800, fontSize: '1.1rem' }}>Fibbo</span>
        </Link>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <LegalLinks />
        </nav>
      </header>
      <main style={{ maxWidth: '47.5rem', margin: '0 auto', padding: '2rem clamp(1rem, 4vw, 2rem) 4rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.375rem' }}>{title}</h1>
        <p style={{ color: C.textSec, fontSize: '0.8rem', margin: '0 0 1.5rem' }}>Última atualização: {UPDATED_AT}</p>
        {intro && <p style={{ fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 0.5rem' }}>{intro}</p>}
        <div className="legal" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{children}</div>
      </main>
      <style>{`.legal h2{font-size:1.05rem;font-weight:700;margin:1.75rem 0 0.5rem}.legal p{margin:0 0 0.625rem}.legal ul{margin:0 0 0.75rem;padding-left:1.25rem}.legal li{margin-bottom:0.375rem}.legal a{color:${C.mid1}}.legal strong{font-weight:600}`}</style>
    </div>
  );
}

export function LegalLinks({ color = C.mid1 }: { color?: string }) {
  const style = { color, textDecoration: 'none', fontWeight: 500 };
  return (
    <>
      <Link to="/ajuda" style={style}>Ajuda</Link>
      <Link to="/privacidade" style={style}>Privacidade</Link>
      <Link to="/termos" style={style}>Termos</Link>
    </>
  );
}
