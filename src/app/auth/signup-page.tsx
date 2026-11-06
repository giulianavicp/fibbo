import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Building2, Lock, Mail, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { C, font } from '../lib/tokens';
import { AuthLayout, Field, Notice, SubmitButton, isValidEmail, linkButton } from './ui';
import type { Role } from './session';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 3 && isValidEmail(email) && password.length >= 8 && consent;

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name.trim(), role, unit: unit.trim(), consent_at: new Date().toISOString() },
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.code === 'user_already_exists' ? 'Já existe uma conta com este e-mail.' : authError.code === 'weak_password' ? 'Senha muito fraca. Use pelo menos 8 caracteres com letras e números.' : 'Não foi possível criar a conta. Tente novamente.');
      return;
    }
    if (!data.session) setDone(true);
  };

  if (done) {
    return (
      <AuthLayout title="Confirme seu e-mail" subtitle="Falta só um passo">
        <Notice tone="success">Enviamos um link de confirmação para {email}. Abra o e-mail e clique no link para ativar sua conta.</Notice>
        <p style={{ textAlign: 'center', marginTop: '1.125rem', marginBottom: 0 }}><Link to="/" style={{ ...linkButton, textDecoration: 'none' }}>Voltar para o login</Link></p>
      </AuthLayout>
    );
  }

  const roleButton = (value: Role, label: string, icon: string) => (
    <button key={value} type="button" role="radio" aria-checked={role === value} onClick={() => setRole(value)} style={{ padding: '0.6875rem 0.625rem', background: role === value ? '#F3E6DC' : C.bg, border: `1.5px solid ${role === value ? C.primary : C.border}`, borderRadius: '0.625rem', color: C.title, fontSize: '0.8rem', fontWeight: role === value ? 600 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontFamily: font }}>
      <span aria-hidden="true">{icon}</span>{label}
    </button>
  );

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto"
      footer={
        <p style={{ textAlign: 'center', color: C.textSec, fontSize: '0.82rem', marginTop: '1.125rem' }}>
          Já tem conta? <Link to="/" style={{ ...linkButton, textDecoration: 'none' }}>Entrar</Link>
        </p>
      }
    >
      <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <span style={{ display: 'block', color: C.title, fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.375rem' }}>Eu sou</span>
          <div role="radiogroup" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            {roleButton('student', 'Aluno', '🎓')}
            {roleButton('teacher', 'Professor', '📐')}
          </div>
        </div>
        <Field id="name" label="Nome completo" autoComplete="name" icon={<User size={15} />} value={name} onChange={e => setName(e.target.value)} />
        <Field id="email" label="E-mail" type="email" autoComplete="email" placeholder="seu@email.com" icon={<Mail size={15} />} value={email} onChange={e => setEmail(e.target.value)} error={email && !isValidEmail(email) ? 'Digite um e-mail válido.' : undefined} />
        <Field id="unit" label="Unidade FATEC (opcional)" placeholder="FATEC Santo André" icon={<Building2 size={15} />} value={unit} onChange={e => setUnit(e.target.value)} />
        <Field id="password" label="Senha" type="password" autoComplete="new-password" placeholder="mínimo 8 caracteres" icon={<Lock size={15} />} value={password} onChange={e => setPassword(e.target.value)} error={password && password.length < 8 ? 'Mínimo de 8 caracteres.' : undefined} />
        <label style={{ display: 'flex', gap: '0.5625rem', alignItems: 'flex-start', color: C.textSec, fontSize: '0.78rem', lineHeight: 1.45, cursor: 'pointer' }}>
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '2px', accentColor: C.primary }} />
          <span>
            Li e aceito os <Link to="/termos" target="_blank" style={{ color: C.mid1 }}>termos de uso</Link> e a <Link to="/privacidade" target="_blank" style={{ color: C.mid1 }}>política de privacidade</Link>, e autorizo o tratamento dos meus dados conforme a LGPD.
          </span>
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton disabled={!canSubmit} loading={loading}>Criar conta</SubmitButton>
      </form>
    </AuthLayout>
  );
}
