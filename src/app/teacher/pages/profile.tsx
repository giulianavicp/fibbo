import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { LogOut, RotateCcw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { C } from '../../lib/tokens';
import type { SessionUser } from '../../auth/session';
import { useTeacherData, type TeacherData } from '../data';
import YourData from '../../shared/your-data';
import { Button, Input, Label, Page, card, initials } from '../../shared/ui';

export default function Profile({ user, data, onLogout }: { user: SessionUser; data: TeacherData; onLogout: () => void }) {
  const [name, setName] = useState(user.name);
  const [unit, setUnit] = useState(user.unit ?? '');
  const [saving, setSaving] = useState(false);
  const { reload } = useTeacherData();
  const [isDemo, setIsDemo] = useState(false);
  const [resetting, setResetting] = useState(false);
  useEffect(() => { supabase.rpc('am_i_demo_teacher').then(({ data }) => setIsDemo(data === true)); }, []);
  const resetDemo = async () => {
    setResetting(true);
    const { error } = await supabase.rpc('reset_demo');
    setResetting(false);
    if (error) return toast.error('Não foi possível restaurar a demonstração.');
    await reload();
    toast.success('Dados de demonstração restaurados.');
  };
  const students = new Set(data.enrollments.map(e => e.student_id)).size;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: name.trim(), unit: unit.trim() || null }).eq('id', user.id);
    setSaving(false);
    if (error) return toast.error('Não foi possível salvar.');
    toast.success('Perfil atualizado. Recarregue a página para ver o novo nome no menu.');
  };

  return (
    <Page title="Perfil">
      <div style={{ background: C.primary, borderRadius: '0.875rem', padding: '1.375rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>{initials(user.name)}</div>
        <div>
          <div style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700 }}>Prof. {user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.77rem' }}>{user.email}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '1px' }}>{data.courses.length} disciplinas · {students} alunos · {data.activities.length} atividades</div>
        </div>
      </div>
      <form onSubmit={save} style={{ ...card, display: 'grid', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <div><Label htmlFor="p-name">Nome</Label><Input id="p-name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><Label htmlFor="p-unit">Unidade FATEC</Label><Input id="p-unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="FATEC Santo André" /></div>
        <div><Button type="submit" loading={saving} disabled={name.trim().length < 3}>Salvar</Button></div>
      </form>
      {isDemo && (
        <div style={{ ...card, marginBottom: '0.875rem' }}>
          <div style={{ color: C.title, fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>Conta de demonstração</div>
          <p style={{ color: C.textSec, fontSize: '0.78rem', margin: '0 0 0.625rem', lineHeight: 1.5 }}>Volta as disciplinas, atividades, envios e materiais da demonstração ao estado original e apaga o que os alunos de demonstração fizeram.</p>
          <Button variant="ghost" loading={resetting} onClick={resetDemo}><RotateCcw size={14} /> Restaurar dados de demonstração</Button>
        </div>
      )}
      <YourData user={user} onDeleted={onLogout} />
      <Button variant="danger" onClick={onLogout} style={{ width: '100%' }}><LogOut size={14} /> Sair da conta</Button>
      <p style={{ textAlign: 'center', fontSize: '0.76rem', marginTop: '0.875rem' }}>
        <Link to="/ajuda" style={{ color: C.mid1 }}>Ajuda</Link> · <Link to="/privacidade" style={{ color: C.mid1 }}>Privacidade</Link> · <Link to="/termos" style={{ color: C.mid1 }}>Termos</Link>
      </p>
    </Page>
  );
}
