import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthLayout, Field, Notice, SubmitButton, isValidEmail, linkButton } from './ui';

const backToLogin = (
  <p style={{ textAlign: 'center', marginTop: '1.125rem', marginBottom: 0 }}>
    <Link to="/" style={{ ...linkButton, textDecoration: 'none' }}>Voltar para o login</Link>
  </p>
);

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setLoading(false);
    if (authError?.code === 'over_email_send_rate_limit') setError('Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.');
    else if (authError) setError('Não foi possível enviar o e-mail. Tente novamente.');
    else setSent(true);
  };

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link para criar uma nova senha">
      {sent ? (
        <Notice tone="success">Se existir uma conta com {email}, você receberá um e-mail com o link em alguns minutos.</Notice>
      ) : (
        <form onSubmit={handle} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field id="email" label="E-mail" type="email" autoComplete="email" placeholder="seu@email.com" icon={<Mail size={15} />} value={email} onChange={e => setEmail(e.target.value)} />
          {error && <Notice tone="error">{error}</Notice>}
          <SubmitButton disabled={!isValidEmail(email)} loading={loading}>Enviar link</SubmitButton>
        </form>
      )}
      {backToLogin}
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (authError) {
      setError(authError.code === 'same_password' ? 'A nova senha precisa ser diferente da anterior.' : 'O link expirou ou é inválido. Peça um novo link.');
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <AuthLayout title="Nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres">
      <form onSubmit={handle} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field id="password" label="Nova senha" type="password" autoComplete="new-password" icon={<Lock size={15} />} value={password} onChange={e => setPassword(e.target.value)} error={password && password.length < 8 ? 'Mínimo de 8 caracteres.' : undefined} />
        <Field id="confirm" label="Confirmar senha" type="password" autoComplete="new-password" icon={<Lock size={15} />} value={confirm} onChange={e => setConfirm(e.target.value)} error={confirm && confirm !== password ? 'As senhas não coincidem.' : undefined} />
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton disabled={!valid} loading={loading}>Salvar nova senha</SubmitButton>
      </form>
      {backToLogin}
    </AuthLayout>
  );
}
