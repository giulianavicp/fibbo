import { Link } from 'react-router';
import { LogOut, Trophy } from 'lucide-react';
import YourData from '../../shared/your-data';
import { C, font } from '../../lib/tokens';
import type { SessionUser } from '../../auth/session';
import { initials } from '../../shared/ui';
import type { StudentData } from '../data';
import { level, overview } from '../stats';
import { sCard } from '../ui';

export default function Profile({ user, data, onLogout }: { user: SessionUser; data: StudentData; onLogout: () => void }) {
  const o = overview(data);
  const lv = level(o.xp);
  const top = data.ranking.slice(0, 8);
  const meIndex = data.ranking.findIndex(r => r.is_me);

  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      <div className="s-banner" style={{ background: C.primary, margin: '0 -1rem', padding: '1.75rem 1.5rem 2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '3.75rem', height: '3.75rem', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem', fontWeight: 700 }}>{initials(user.name)}</div>
          <div>
            <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.77rem' }}>{user.email}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', marginTop: '1px' }}>Nível {lv.level} · {lv.title}</div>
          </div>
        </div>
      </div>
      <div className="s-cols" style={{ marginTop: '-1rem', position: 'relative', zIndex: 1 }}>
        <div className="s-span" style={{ ...sCard, marginBottom: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
          {[
            { label: 'XP Total', value: o.xp.toLocaleString('pt-BR'), color: C.primary },
            { label: 'Ranking', value: o.rank ? `#${o.rank}` : '—', color: C.mid1 },
            { label: 'Atividades', value: String(data.submissions.length), color: C.textSec },
          ].map(s => <div key={s.label}><div style={{ color: s.color, fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</div><div style={{ color: C.textTer, fontSize: '0.7rem' }}>{s.label}</div></div>)}
        </div>

        <div>
        <div style={{ ...sCard, marginBottom: '0.75rem' }}>
          <div style={{ color: C.title, fontSize: '0.83rem', fontWeight: 700, marginBottom: '0.75rem' }}>Informações Acadêmicas</div>
          {[['Unidade', user.unit ?? '—'], ['Disciplinas', data.courses.map(c => c.name).join(', ') || '—'], ['Reflexões no diário', String(data.journal.length)]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.5rem 0', borderBottom: `1px solid ${C.bg}` }}>
              <span style={{ color: C.textSec, fontSize: '0.82rem' }}>{k}</span>
              <span style={{ color: C.title, fontSize: '0.82rem', fontWeight: 500, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>

          <YourData user={user} onDeleted={onLogout} />
        </div>

        <div style={{ ...sCard, marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}><Trophy size={15} color={C.mid1} /><span style={{ color: C.title, fontSize: '0.83rem', fontWeight: 700 }}>Ranking da Turma</span></div>
          {top.length === 0 && <p style={{ color: C.textSec, fontSize: '0.8rem', margin: 0 }}>Entre em uma disciplina para ver o ranking.</p>}
          {[...top, ...(meIndex >= 8 ? [data.ranking[meIndex]] : [])].map(r => {
            const rank = data.ranking.indexOf(r) + 1;
            return (
              <div key={`${rank}-${r.display_name}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', marginBottom: '2px', background: r.is_me ? C.bg : 'transparent', border: `1px solid ${r.is_me ? C.border : 'transparent'}` }}>
                <div style={{ width: '1.5rem', textAlign: 'center', color: rank <= 3 ? C.mid1 : C.textTer, fontSize: '0.78rem', fontWeight: 700 }}>{rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: r.is_me ? C.primary : C.title, fontSize: '0.82rem', fontWeight: r.is_me ? 700 : 400 }}>{r.display_name}{r.is_me ? ' (você)' : ''}</div>
                  <div style={{ color: C.textTer, fontSize: '0.68rem' }}>Nível {level(r.xp).level}</div>
                </div>
                <div style={{ color: C.textSec, fontSize: '0.78rem' }}>{r.xp.toLocaleString('pt-BR')} XP</div>
              </div>
            );
          })}
        </div>


        <button className="s-span" onClick={onLogout} style={{ width: '100%', padding: '0.8125rem', background: C.card, color: C.error, border: `1.5px solid ${C.border}`, borderRadius: '0.75rem', fontSize: '0.87rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: font }}><LogOut size={15} /> Sair da Conta</button>
        <p className="s-span" style={{ textAlign: 'center', fontSize: '0.76rem', marginTop: '0.875rem' }}>
          <Link to="/ajuda" style={{ color: C.mid1 }}>Ajuda</Link> · <Link to="/privacidade" style={{ color: C.mid1 }}>Privacidade</Link> · <Link to="/termos" style={{ color: C.mid1 }}>Termos</Link>
        </p>
      </div>
    </div>
  );
}
