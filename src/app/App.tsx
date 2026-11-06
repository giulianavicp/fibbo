import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import LoginPage from './auth/login-page';
import SignupPage from './auth/signup-page';
import { ForgotPasswordPage, ResetPasswordPage } from './auth/password-pages';
import { FullPageSpinner, RequireRole, SessionProvider, homeFor, useSession } from './auth/session';
import Help from './legal/help';
import Privacy from './legal/privacy';
import Terms from './legal/terms';
import StudentApp from './student/student-app';
import TeacherApp from './teacher/teacher-app';

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, ready, recovering } = useSession();
  if (!ready) return <FullPageSpinner />;
  if (recovering) return <Navigate to="/redefinir-senha" replace />;
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}

function Shell({ role }: { role: 'student' | 'teacher' }) {
  const { user, signOut } = useSession();
  const App = role === 'student' ? StudentApp : TeacherApp;
  return (
    <RequireRole role={role}>
      <App user={user!} onLogout={signOut} />
    </RequireRole>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Toaster
        position="top-center"
        toastOptions={{ style: { fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', borderRadius: '0.625rem' } }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/cadastro" element={<GuestOnly><SignupPage /></GuestOnly>} />
          <Route path="/esqueci-senha" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/ajuda" element={<Help />} />
          <Route path="/aluno/:page?" element={<Shell role="student" />} />
          <Route path="/professor/:page?" element={<Shell role="teacher" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
