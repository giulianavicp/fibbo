import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { BarChart2, BookOpen, CheckSquare, ClipboardList, FileBarChart, FileText, LayoutDashboard, Loader2, LogOut, Menu, User, Users, WifiOff } from 'lucide-react';
import { C, font } from '../lib/tokens';
import type { SessionUser } from '../auth/session';
import { TeacherDataProvider, useTeacherData } from './data';
import { Button, Empty, Page } from '../shared/ui';
import { LogoMark } from '../shared/logo';
import Dashboard from './pages/dashboard';
import Classes from './pages/classes';
import Courses from './pages/courses';
import Activities from './pages/activities';
import Reports from './pages/reports';
import Profile from './pages/profile';
import Corrections from './pages/corrections';
import Analytics from './pages/analytics';

type PageId = 'dashboard' | 'turmas' | 'disciplinas' | 'atividades' | 'provas' | 'correcoes' | 'analytics' | 'relatorios' | 'perfil';

const nav: { id: PageId; icon: ReactNode; label: string }[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { id: 'turmas', icon: <Users size={17} />, label: 'Turmas' },
  { id: 'disciplinas', icon: <BookOpen size={17} />, label: 'Disciplinas' },
  { id: 'atividades', icon: <FileText size={17} />, label: 'Atividades' },
  { id: 'provas', icon: <ClipboardList size={17} />, label: 'Provas' },
  { id: 'correcoes', icon: <CheckSquare size={17} />, label: 'Correções' },
  { id: 'analytics', icon: <BarChart2 size={17} />, label: 'Analytics' },
  { id: 'relatorios', icon: <FileBarChart size={17} />, label: 'Relatórios' },
  { id: 'perfil', icon: <User size={17} />, label: 'Perfil' },
];

function Sidebar({ page, user, pending, onNavigate, onLogout }: { page: PageId; user: SessionUser; pending: number; onNavigate: (p: PageId) => void; onLogout: () => void }) {
  return (
    <div style={{ width: '13.5rem', background: C.sidebar, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '1.375rem 1.125rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <LogoMark />
        <div>
          <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>Fibbo</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>Painel do Professor</div>
        </div>
      </div>
      <nav aria-label="Menu do professor" style={{ flex: 1, padding: '0.625rem', overflowY: 'auto' }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} aria-current={page === item.id ? 'page' : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5625rem', padding: '0.5625rem 0.6875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginBottom: '1px', background: page === item.id ? 'rgba(255,255,255,0.09)' : 'transparent', color: page === item.id ? 'white' : 'rgba(255,255,255,0.55)', textAlign: 'left', fontFamily: font }}>
            {item.icon}
            <span style={{ fontSize: '0.83rem', fontWeight: page === item.id ? 600 : 400, flex: 1 }}>{item.label}</span>
            {item.id === 'correcoes' && pending > 0 && <span style={{ background: C.error, color: 'white', fontSize: '0.62rem', borderRadius: '6.1875rem', padding: '1px 0.3125rem', fontWeight: 700 }}>{pending}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: '0.75rem 0.875rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
        <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4375rem', padding: '0.4375rem 0.625rem', background: 'rgba(179,58,47,0.15)', border: '1px solid rgba(179,58,47,0.25)', borderRadius: '0.4375rem', color: 'rgba(255,170,170,0.9)', cursor: 'pointer', fontSize: '0.76rem', fontFamily: font }}>
          <LogOut size={13} /> Sair
        </button>
      </div>
    </div>
  );
}

function Content({ page, user, onLogout }: { page: PageId; user: SessionUser; onLogout: () => void }) {
  const { data, error, reload } = useTeacherData();
  if (error && !data) return <Page title="Sem conexão"><Empty icon={<WifiOff size={24} />} title="Não foi possível carregar" text={error} action={<Button onClick={reload}>Tentar novamente</Button>} /></Page>;
  if (!data) return <div style={{ padding: '3.75rem', display: 'flex', justifyContent: 'center' }}><Loader2 size={26} color={C.primary} className="animate-spin" /></div>;

  const first = user.name.split(' ')[0];
  switch (page) {
    case 'dashboard': return <Dashboard data={data} firstName={first} />;
    case 'turmas': return <Classes data={data} />;
    case 'disciplinas': return <Courses data={data} teacherId={user.id} />;
    case 'atividades': return <Activities key="atividade" data={data} kind="atividade" />;
    case 'provas': return <Activities key="prova" data={data} kind="prova" />;
    case 'relatorios': return <Reports data={data} />;
    case 'perfil': return <Profile user={user} data={data} onLogout={onLogout} />;
    case 'correcoes': return <Corrections data={data} />;
    case 'analytics': return <Analytics data={data} />;
  }
}

function PendingBadgeSidebar(props: Omit<Parameters<typeof Sidebar>[0], 'pending'>) {
  const { data } = useTeacherData();
  return <Sidebar {...props} pending={data?.submissions.filter(s => !s.reviewed).length ?? 0} />;
}

export default function TeacherApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const { page: param } = useParams();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const page = (param ?? 'dashboard') as PageId;
  if (!nav.some(n => n.id === page)) return <Navigate to="/professor" replace />;

  const go = (p: PageId) => { navigate(`/professor/${p}`); setDrawer(false); };
  const sidebar = <PendingBadgeSidebar page={page} user={user} onNavigate={go} onLogout={onLogout} />;

  return (
    <TeacherDataProvider teacherId={user.id}>
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, display: 'flex' }}>
        <div className="hidden md:flex">{sidebar}</div>
        {drawer && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div onClick={() => setDrawer(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(46,42,38,0.5)' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>{sidebar}</div>
          </div>
        )}
        <main style={{ flex: 1, overflowX: 'hidden', minHeight: '100vh' }}>
          <div className="flex md:hidden" style={{ background: C.sidebar, padding: '0.8125rem 1rem', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 100 }}>
            <button onClick={() => setDrawer(true)} aria-label="Abrir menu" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '0.4375rem', width: '2.125rem', height: '2.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Menu size={17} color="rgba(255,255,255,0.75)" />
            </button>
            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>Fibbo · Professor</span>
          </div>
          <Content page={page} user={user} onLogout={onLogout} />
        </main>
      </div>
    </TeacherDataProvider>
  );
}
