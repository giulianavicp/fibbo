import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { C } from '../lib/tokens';
import { AuthLayout, Field, Notice, SubmitButton, isValidEmail, linkButton } from './ui';

type LockStatus = { failures: number; locked_until: string | null };


const minutesLeft = (until: string) => Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 60000));
const lockedMessage = (until: string) => `Conta bloqueada após 3 tentativas. Tente novamente em ${minutesLeft(until)} min.`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = isValidEmail(email);
  const canSubmit = emailValid && password.length >= 6;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    const target = email.trim().toLowerCase();

    const { data: status } = await supabase.rpc('login_status', { email: target });
    const pre = status as LockStatus | null;
    if (pre?.locked_until && new Date(pre.locked_until) > new Date()) {
      setError(lockedMessage(pre.locked_until));
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email: target, password });
    if (!authError) {
      await supabase.rpc('record_login_attempt', { email: target, success: true });
      return;
    }

    if (authError.code === 'email_not_confirmed') {
      setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
    } else if (authError.status === 0 || authError.name === 'AuthRetryableFetchError') {
      setError('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
    } else {
      const { data } = await supabase.rpc('record_login_attempt', { email: target, success: false });
      const after = data as LockStatus | null;
      if (after?.locked_until) setError(lockedMessage(after.locked_until));
      else setError(`E-mail ou senha incorretos. ${3 - (after?.failures ?? 1)} tentativa(s) restante(s).`);
    }
    setLoading(false);
  };


  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais para continuar"
      footer={
        <p style={{ textAlign: 'center', color: C.textSec, fontSize: '0.82rem', marginTop: '1.125rem' }}>
          Ainda não tem conta? <Link to="/cadastro" style={{ ...linkButton, textDecoration: 'none' }}>Criar conta</Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field
          id="email" label="E-mail" type="email" autoComplete="email" placeholder="seu@email.com"
          icon={<Mail size={15} />} value={email}
          onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(true)}
          error={touched && email && !emailValid ? 'Digite um e-mail válido.' : undefined}
          valid={touched && emailValid}
        />
        <Field
          id="password" label="Senha" type="password" autoComplete="current-password" placeholder="••••••••"
          icon={<Lock size={15} />} value={password}
          onChange={e => setPassword(e.target.value)}
          error={password && password.length < 6 ? 'Mínimo de 6 caracteres.' : undefined}
        />
        <div style={{ textAlign: 'right', marginTop: '-0.375rem' }}>
          <Link to="/esqueci-senha" style={{ ...linkButton, textDecoration: 'none', fontSize: '0.75rem' }}>Esqueci minha senha</Link>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton disabled={!canSubmit} loading={loading}>Entrar</SubmitButton>
      </form>

    </AuthLayout>
  );
}
