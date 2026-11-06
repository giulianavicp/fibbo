import { useEffect, useRef, useState } from 'react';
import { History, Plus, Send, Sparkles, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { supabase } from '../../lib/supabase';
import type { Row } from '../../lib/database.types';
import { C, font } from '../../lib/tokens';
import { formatDate } from '../../shared/ui';
import type { StudentData } from '../data';

type Message = { id: string | number; role: 'user' | 'assistant'; content: string; sources: string[]; time: string };
type Conversation = Row<'conversations'>;

const clock = (iso?: string) => new Date(iso ?? Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
export const renderBold = (text: string) => text.split('**').map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));

const ERRORS: Record<string, string> = {
  rate_limited: 'Você atingiu o limite de 40 perguntas por hora. Tente de novo mais tarde.',
  busy: 'A Katherine está com muitas perguntas agora. Espere alguns segundos e tente de novo.',
  'no courses': 'Entre em uma disciplina para conversar com a Katherine.',
};

async function errorCode(error: unknown) {
  try {
    const body = await (error as { context?: Response }).context?.json();
    return body?.error as string | undefined;
  } catch {
    return undefined;
  }
}

export default function Katherine({ data }: { data: StudentData }) {
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [current, setCurrent] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [activityId, setActivityId] = useState(params.get('atividade') ?? '');
  const end = useRef<HTMLDivElement>(null);

  const loadConversations = () => supabase.from('conversations').select('*').order('updated_at', { ascending: false }).limit(30).then(({ data: rows }) => setConversations(rows ?? []));
  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => {
    const a = data.activities.find(x => x.id === activityId);
    if (a) setCourseId(a.course_id);
  }, [activityId, data.activities]);

  const open = async (c: Conversation) => {
    setCurrent(c);
    setShowHistory(false);
    const { data: rows } = await supabase.from('chat_messages').select('*').eq('conversation_id', c.id).order('created_at');
    setMessages((rows ?? []).map(m => ({ id: m.id, role: m.role, content: m.content, sources: (m.sources as string[]) ?? [], time: clock(m.created_at) })));
  };

  const reset = () => {
    setCurrent(null);
    setMessages([]);
    setActivityId('');
    params.delete('atividade');
    setParams(params);
    setShowHistory(false);
  };

  const remove = async (c: Conversation) => {
    if (!confirm('Apagar esta conversa?')) return;
    await supabase.from('conversations').delete().eq('id', c.id);
    if (current?.id === c.id) reset();
    loadConversations();
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setMessages(m => [...m, { id: `u${Date.now()}`, role: 'user', content: msg, sources: [], time: clock() }]);
    setInput('');
    setTyping(true);
    const { data: res, error } = await supabase.functions.invoke('katherine', {
      body: current ? { message: msg, conversation_id: current.id } : { message: msg, course_id: courseId || undefined, activity_id: activityId || undefined },
    });
    setTyping(false);
    if (error) {
      const code = await errorCode(error);
      setMessages(m => [...m, { id: `e${Date.now()}`, role: 'assistant', content: ERRORS[code ?? ''] ?? 'Não consegui responder agora. Verifique sua conexão e tente novamente.', sources: [], time: clock() }]);
      return;
    }
    setMessages(m => [...m, { id: `a${Date.now()}`, role: 'assistant', content: res.answer, sources: res.sources ?? [], time: clock() }]);
    if (!current) {
      const { data: conv } = await supabase.from('conversations').select('*').eq('id', res.conversation_id).single();
      if (conv) setCurrent(conv);
      loadConversations();
    }
  };

  const contextCourse = data.courses.find(c => c.id === (current?.course_id ?? courseId));
  const contextActivity = data.activities.find(a => a.id === (current?.activity_id ?? activityId));
  const topics = contextCourse?.topics ?? [...new Set(data.courses.flatMap(c => c.topics))];
  const suggestions = contextActivity
    ? ['Me dê uma dica para começar', 'Explique o conceito principal desta atividade']
    : topics.slice(0, 4).map(t => `Explique ${t.toLowerCase()} com um exemplo`);
  const selectStyle = { flex: 1, minWidth: 0, padding: '0.4375rem 0.5625rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.card, fontSize: '0.75rem', color: C.title, fontFamily: font } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--nav-h))', position: 'relative', boxSizing: 'border-box' }}>
      <div style={{ background: C.card, padding: '0.875rem 1rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#F3EDE5', border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} color={C.primary} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ color: C.title, fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Katherine</h1>
          <div style={{ color: C.textSec, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {contextActivity ? `Sobre: ${contextActivity.title}` : contextCourse ? `Sobre: ${contextCourse.name}` : 'IA tutora · responde com os materiais dos professores'}
          </div>
        </div>
        <button onClick={() => setShowHistory(true)} aria-label="Conversas anteriores" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', width: '2.125rem', height: '2.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.textSec }}><History size={16} /></button>
        <button onClick={reset} aria-label="Nova conversa" style={{ background: C.primary, border: 'none', borderRadius: '0.5rem', width: '2.125rem', height: '2.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><Plus size={16} /></button>
      </div>

      {!current && (
        <div style={{ background: C.bg, padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '0.5rem' }}>
          <select aria-label="Disciplina" value={courseId} onChange={e => { setCourseId(e.target.value); setActivityId(''); }} style={selectStyle}>
            <option value="">Todas as disciplinas</option>
            {data.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label="Atividade" value={activityId} onChange={e => setActivityId(e.target.value)} style={selectStyle}>
            <option value="">Nenhuma atividade</option>
            {data.activities.filter(a => a.published && (!courseId || a.course_id === courseId)).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
      )}

      <div role="log" aria-live="polite" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: C.bg }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: C.textSec, fontSize: '0.83rem', lineHeight: 1.6, padding: '1.25rem 0.625rem' }}>
            Olá! Sou a <strong>Katherine</strong>. Respondo com base nos materiais que seus professores enviaram.
            {contextActivity && !data.submissions.some(s => s.activity_id === contextActivity.id) && <><br />Como você ainda não entregou esta atividade, vou te dar dicas em vez das respostas. 😉</>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4375rem', justifyContent: 'center', marginTop: '1rem' }}>
              {suggestions.map(q => <button key={q} onClick={() => send(q)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '6.1875rem', padding: '0.375rem 0.8125rem', fontSize: '0.73rem', color: C.textSec, cursor: 'pointer', fontFamily: font }}>{q}</button>)}
            </div>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '0.875rem' }}>
            <div style={{ maxWidth: '85%' }}>
              <div style={{ background: m.role === 'user' ? C.primary : C.card, color: m.role === 'user' ? 'white' : C.title, borderRadius: m.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', lineHeight: 1.6, border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none', whiteSpace: 'pre-wrap' }}>{renderBold(m.content)}</div>
              {m.sources.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>{m.sources.map(s => <span key={s} style={{ fontSize: '0.65rem', color: C.mid1, background: '#F6EEE6', borderRadius: '6.1875rem', padding: '2px 0.5rem' }}>📄 {s}</span>)}</div>}
              <div style={{ color: C.textTer, fontSize: '0.68rem', marginTop: '0.1875rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing && <div style={{ color: C.textSec, fontSize: '0.78rem' }}>Katherine está pensando…</div>}
        <div ref={end} />
      </div>

      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ padding: '0.75rem 1rem', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', gap: '0.625rem' }}>
        <input value={input} onChange={e => setInput(e.target.value)} maxLength={2000} placeholder="Pergunte à Katherine..." aria-label="Mensagem para a Katherine" style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: '0.625rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', outline: 'none', background: C.bg, color: C.title, fontFamily: font, minWidth: 0 }} />
        <button type="submit" aria-label="Enviar" disabled={!input.trim() || typing} style={{ background: input.trim() && !typing ? C.primary : C.border, color: 'white', border: 'none', borderRadius: '0.625rem', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0 }}><Send size={16} /></button>
      </form>

      {showHistory && (
        <div role="dialog" aria-label="Conversas anteriores" style={{ position: 'absolute', inset: 0, background: C.bg, zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: `1px solid ${C.border}`, background: C.card }}>
            <h2 style={{ flex: 1, margin: 0, fontSize: '0.95rem', color: C.title }}>Conversas anteriores</h2>
            <button onClick={() => setShowHistory(false)} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSec }}><X size={18} /></button>
          </div>
          <div style={{ overflowY: 'auto', padding: '0.75rem 1rem' }}>
            {conversations.length === 0 && <p style={{ color: C.textSec, fontSize: '0.82rem' }}>Nenhuma conversa ainda.</p>}
            {conversations.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.card, border: `1px solid ${current?.id === c.id ? C.primary : C.border}`, borderRadius: '0.625rem', padding: '0.625rem 0.75rem', marginBottom: '0.5rem' }}>
                <button onClick={() => open(c)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, padding: 0, minWidth: 0 }}>
                  <div style={{ color: C.title, fontSize: '0.83rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ color: C.textTer, fontSize: '0.7rem' }}>{formatDate(c.updated_at)}{c.course_id ? ` · ${data.courses.find(x => x.id === c.course_id)?.name ?? ''}` : ''}</div>
                </button>
                <button onClick={() => remove(c)} aria-label="Apagar conversa" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, display: 'flex' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
