import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { C } from '../lib/tokens';

export type Role = 'student' | 'teacher';
export type SessionUser = { id: string; email: string; role: Role; name: string; unit: string | null };

type Session = { user: SessionUser | null; ready: boolean; recovering: boolean; signOut: () => Promise<void> };

const SessionContext = createContext<Session | null>(null);

async function loadProfile(id: string, email: string): Promise<SessionUser | null> {
  const { data } = await supabase.from('profiles').select('full_name, role, unit').eq('id', id).single();
  return data ? { id, email, role: data.role, name: data.full_name, unit: data.unit } : null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setTimeout(async () => {
        setUser(session ? await loadProfile(session.user.id, session.user.email ?? '') : null);
        setReady(true);
      });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRecovering(false);
  };

  return <SessionContext.Provider value={{ user, ready, recovering, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

export const homeFor = (role: Role) => (role === 'teacher' ? '/professor' : '/aluno');

export function FullPageSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <Loader2 size={28} color={C.primary} className="animate-spin" />
    </div>
  );
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, ready } = useSession();
  if (!ready) return <FullPageSpinner />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
