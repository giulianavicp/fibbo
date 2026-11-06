import { useState } from 'react';
import { toast } from 'sonner';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { C, font } from '../lib/tokens';
import type { SessionUser } from '../auth/session';

const saveJson = (name: string, data: unknown) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  URL.revokeObjectURL(url);
};

async function exportData(user: SessionUser) {
  const all = <T,>(p: PromiseLike<{ data: T | null }>) => p.then(r => r.data);
  const base = {
    exportado_em: new Date().toISOString(),
    conta: { id: user.id, email: user.email, papel: user.role },
    perfil: await all(supabase.from('profiles').select('full_name, role, unit, consent_at, created_at').eq('id', user.id).single()),
  };
  if (user.role === 'teacher') {
    return {
      ...base,
      disciplinas: await all(supabase.from('courses').select('*').eq('teacher_id', user.id)),
      atividades: await all(supabase.from('activities').select('*')),
      materiais: await all(supabase.from('materials').select('name, size_bytes, created_at, course_id')),
    };
  }
  return {
    ...base,
    matriculas: await all(supabase.from('enrollments').select('course_id, created_at').eq('student_id', user.id)),
    envios: await all(supabase.from('submissions').select('*, answers(question_id, response, score, matched_keywords)').eq('student_id', user.id)),
    diario: await all(supabase.from('journal_entries').select('prompt, content, created_at')),
    conversas_katherine: await all(supabase.from('conversations').select('title, created_at, chat_messages(role, content, created_at)')),
  };
}

export default function YourData({ user, onDeleted }: { user: SessionUser; onDeleted: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  const download = async () => {
    setExporting(true);
    try {
      saveJson(`fibbo-meus-dados-${new Date().toISOString().slice(0, 10)}.json`, await exportData(user));
      toast.success('Arquivo com seus dados baixado.');
    } catch {
      toast.error('Não foi possível exportar agora.');
    }
    setExporting(false);
  };

  const remove = async () => {
    setDeleting(true);
    const { error } = await supabase.functions.invoke('delete-account', { body: { confirm: 'EXCLUIR' } });
    setDeleting(false);
    if (error) {
      const code = await (error as { context?: Response }).context?.json().then(b => b.error).catch(() => null);
      return toast.error(code === 'protected' ? 'Contas de demonstração não podem ser excluídas.' : 'Não foi possível excluir a conta. Tente novamente.');
    }
    toast.success('Sua conta e seus dados foram excluídos.');
    onDeleted();
  };

  const btn = { width: '100%', padding: '0.6875rem', borderRadius: '0.625rem', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: font } as const;

  return (
    <div style={{ background: C.card, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${C.border}`, marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}><ShieldCheck size={15} color={C.mid1} /><span style={{ color: C.title, fontSize: '0.83rem', fontWeight: 700 }}>Seus dados (LGPD)</span></div>
      <p style={{ color: C.textSec, fontSize: '0.76rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
        Você pode baixar uma cópia de tudo o que o Fibbo guarda sobre você ou excluir sua conta. Saiba mais na <Link to="/privacidade" style={{ color: C.mid1 }}>política de privacidade</Link>.
      </p>
      <button onClick={download} disabled={exporting} style={{ ...btn, background: C.bg, color: C.title, border: `1.5px solid ${C.border}`, marginBottom: '0.5rem' }}><Download size={14} /> {exporting ? 'Preparando…' : 'Baixar meus dados'}</button>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} style={{ ...btn, background: C.card, color: C.error, border: `1.5px solid ${C.border}` }}><Trash2 size={14} /> Excluir minha conta</button>
      ) : (
        <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: '0.625rem', padding: '0.75rem' }}>
          <p style={{ color: C.error, fontSize: '0.78rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
            {user.role === 'teacher' ? 'Suas disciplinas, atividades, materiais e as notas dos alunos nelas serão apagados.' : 'Seus envios, notas, diário e conversas com a Katherine serão apagados.'} Isso não pode ser desfeito. Digite <strong>EXCLUIR</strong> para confirmar.
          </p>
          <input value={typed} onChange={e => setTyped(e.target.value)} aria-label="Digite EXCLUIR para confirmar" style={{ width: '100%', padding: '0.5625rem 0.6875rem', border: `1.5px solid ${C.errorBorder}`, borderRadius: '0.5rem', fontSize: '0.85rem', boxSizing: 'border-box', fontFamily: font, marginBottom: '0.5rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setConfirming(false); setTyped(''); }} style={{ ...btn, background: C.card, color: C.title, border: `1.5px solid ${C.border}` }}>Cancelar</button>
            <button onClick={remove} disabled={typed !== 'EXCLUIR' || deleting} style={{ ...btn, background: typed === 'EXCLUIR' ? C.error : '#D9A9A3', color: 'white', border: 'none', cursor: typed === 'EXCLUIR' ? 'pointer' : 'not-allowed' }}>{deleting ? 'Excluindo…' : 'Excluir'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
