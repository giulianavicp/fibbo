import type { ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { BookOpen, Brain, CheckSquare, FileText, Home as HomeIcon, Loader2, LogOut, User, WifiOff } from 'lucide-react';
import { LogoMark } from '../shared/logo';
import { C, font } from '../lib/tokens';
import type { SessionUser } from '../auth/session';
import { Empty } from '../shared/ui';
import { StudentDataProvider, useStudentData } from './data';
import Home from './pages/home';
import Courses from './pages/courses';
import Activities from './pages/activities';
import Katherine from './pages/katherine';
import Corrections from './pages/corrections';
import Profile from './pages/profile';

type PageId = 'home' | 'disciplinas' | 'atividades' | 'katherine' | 'correcoes' | 'perfil';

const nav: { id: PageId; icon: ReactNode; label: string }[] = [
  { id: 'home', icon: <HomeIcon size={22} />, label: 'Início' },
  { id: 'disciplinas', icon: <BookOpen size={22} />, label: 'Disciplinas' },
  { id: 'katherine', icon: <Brain size={22} />, label: 'Katherine' },
  { id: 'correcoes', icon: <CheckSquare size={22} />, label: 'Correções' },
  { id: 'perfil', icon: <User size={22} />, label: 'Perfil' },
];
const sideNav: { id: PageId; icon: ReactNode; label: string }[] = [
  { id: 'home', icon: <HomeIcon size={17} />, label: 'Início' },
  { id: 'disciplinas', icon: <BookOpen size={17} />, label: 'Disciplinas' },
  { id: 'atividades', icon: <FileText size={17} />, label: 'Atividades' },
  { id: 'katherine', icon: <Brain size={17} />, label: 'Katherine' },
  { id: 'correcoes', icon: <CheckSquare size={17} />, label: 'Correções' },
  { id: 'perfil', icon: <User size={17} />, label: 'Perfil' },
];
const pages: PageId[] = ['home', 'disciplinas', 'atividades', 'katherine', 'correcoes', 'perfil'];

function Content({ page, user, onLogout }: { page: PageId; user: SessionUser; onLogout: () => void }) {
  const { data, error, reload } = useStudentData();
  if (error && !data) return <div style={{ padding: '1.5rem 1rem' }}><Empty icon={<WifiOff size={24} />} title="Sem conexão" text={error} action={<button onClick={reload} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: '0.5625rem', padding: '0.5625rem 1rem', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>Tentar novamente</button>} /></div>;
  if (!data) return <div style={{ padding: '3.75rem', display: 'flex', justifyContent: 'center' }}><Loader2 size={26} color={C.primary} className="animate-spin" /></div>;
  switch (page) {
    case 'home': return <Home data={data} firstName={user.name.split(' ')[0]} />;
    case 'disciplinas': return <Courses data={data} />;
    case 'atividades': return <Activities data={data} />;
    case 'katherine': return <Katherine data={data} />;
    case 'correcoes': return <Corrections data={data} />;
    case 'perfil': return <Profile user={user} data={data} onLogout={onLogout} />;
  }
}

export default function StudentApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const { page: param } = useParams();
  const navigate = useNavigate();
  const page = (param ?? 'home') as PageId;
  if (!pages.includes(page)) return <Navigate to="/aluno" replace />;
  const active = page === 'atividades' ? 'disciplinas' : page;

  return (
    <StudentDataProvider studentId={user.id}>
      <div style={{ background: C.bg, minHeight: '100dvh', fontFamily: font, display: 'flex' }}>
        <aside className="hidden md:flex" style={{ width: '13.5rem', background: C.sidebar, flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
          <div style={{ padding: '1.375rem 1.125rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogoMark />
            <div>
              <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>Fibbo</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>Área do Aluno</div>
            </div>
          </div>
          <nav aria-label="Menu do aluno" style={{ flex: 1, padding: '0.625rem', overflowY: 'auto' }}>
            {sideNav.map(item => (
              <button key={item.id} onClick={() => navigate(`/aluno/${item.id}`)} aria-current={page === item.id ? 'page' : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5625rem', padding: '0.5625rem 0.6875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginBottom: '1px', background: page === item.id ? 'rgba(255,255,255,0.09)' : 'transparent', color: page === item.id ? 'white' : 'rgba(255,255,255,0.55)', textAlign: 'left', fontFamily: font }}>
                {item.icon}
                <span style={{ fontSize: '0.83rem', fontWeight: page === item.id ? 600 : 400 }}>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding: '0.75rem 0.875rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4375rem', padding: '0.4375rem 0.625rem', background: 'rgba(179,58,47,0.15)', border: '1px solid rgba(179,58,47,0.25)', borderRadius: '0.4375rem', color: 'rgba(255,170,170,0.9)', cursor: 'pointer', fontSize: '0.76rem', fontFamily: font }}>
              <LogOut size={13} /> Sair
            </button>
          </div>
        </aside>
        <main className="s-main" style={{ flex: 1, minWidth: 0, minHeight: '100dvh' }}>
          <Content page={page} user={user} onLogout={onLogout} />
        </main>
        <nav aria-label="Menu do aluno" className="flex md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, zIndex: 100 }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => navigate(`/aluno/${item.id}`)} aria-current={active === item.id ? 'page' : undefined} style={{ flex: 1, padding: '0.6875rem 0.25rem 0.5625rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1875rem', border: 'none', background: 'transparent', cursor: 'pointer', color: active === item.id ? C.navActive : C.navInactive, fontFamily: font }}>
              {item.icon}
              <span style={{ fontSize: '0.62rem', fontWeight: active === item.id ? 600 : 400 }}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </StudentDataProvider>
  );
}
