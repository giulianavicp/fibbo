import { C } from '../lib/tokens';

export function LogoMark({ size = '2.125rem' }: { size?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '0.5625rem', background: '#F3EDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="60%" height="60%" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M32,9 A23,23 0 0,1 55,32" stroke={C.primary} strokeWidth="3" strokeLinecap="round" />
        <path d="M55,32 A23,23 0 0,1 32,55" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32,55 A13.5,13.5 0 0,1 18.5,41.5" stroke={C.mid1} strokeWidth="2" strokeLinecap="round" />
        <circle cx="33" cy="33" r="2" fill={C.primary} />
      </svg>
    </div>
  );
}
