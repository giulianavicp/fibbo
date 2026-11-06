import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ListChecks, PenLine, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { C, font } from '../lib/tokens';
import type { Course } from './data';
import { Button, Input, Label, Select, TextArea, card } from '../shared/ui';
import { keywordList, questionProblem, type Draft } from './validation';
import { MAX_UNITS, coursesInUnits, toggleUnit, unitOf, unitsOf } from './units';

type Kind = 'atividade' | 'prova';

const LETTERS = ['A', 'B', 'C', 'D'];
const blank = (kind: Draft['kind']): Draft => ({ kind, prompt: '', topic: '', options: ['', '', '', ''], correct: '', keywords: '' });

export default function ActivityBuilder({ courses, kind, onDone, onCancel }: { courses: Course[]; kind: Kind; onDone: () => void; onCancel: () => void }) {
  const units = unitsOf(courses);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(courses[0] ? [unitOf(courses[0])] : []);
  const [courseIds, setCourseIds] = useState<string[]>(courses[0] ? [courses[0].id] : []);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [questions, setQuestions] = useState<Draft[]>([blank('objective')]);
  const [saving, setSaving] = useState(false);

  const update = (i: number, patch: Partial<Draft>) => setQuestions(qs => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const problems = questions.map(questionProblem);
  const available = coursesInUnits(courses, selectedUnits);
  const chosen = available.filter(c => courseIds.includes(c.id));
  const valid = chosen.length > 0 && title.trim() && due && problems.every(p => p === null);
  const topics = [...new Set(chosen.flatMap(c => c.topics))];

  const pickUnit = (unit: string) => {
    const next = toggleUnit(selectedUnits, unit);
    if (next.limitReached) return toast.error(`Selecione até ${MAX_UNITS} unidades por vez. Para outras unidades, publique esta ${kind} e cadastre de novo.`);
    setSelectedUnits(next.selected);
  };
  const pickCourse = (id: string) => setCourseIds(ids => (ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    const payload = {
      title,
      kind,
      due_at: new Date(due).toISOString(),
      questions: questions.map(q => ({
        kind: q.kind,
        prompt: q.prompt,
        topic: q.topic,
        options: q.kind === 'objective' ? q.options.map(o => o.trim()) : null,
        correct: q.kind === 'objective' ? q.correct : null,
        keywords: q.kind === 'essay' ? keywordList(q.keywords) : [],
      })),
    };
    const results = await Promise.all(chosen.map(c => supabase.rpc('create_activity', { course: c.id, ...payload })));
    setSaving(false);
    const failed = chosen.filter((_, i) => results[i].error);
    if (failed.length === chosen.length) return toast.error('Não foi possível salvar. Tente novamente.');
    if (failed.length) toast.error(`Não foi possível publicar em: ${failed.map(c => c.name).join(', ')}.`);
    const ok = chosen.length - failed.length;
    toast.success(`${kind === 'prova' ? 'Prova' : 'Atividade'} publicada em ${ok} ${ok === 1 ? 'disciplina' : 'disciplinas'}!`);
    onDone();
  };

  return (
    <form onSubmit={submit} style={{ ...card, marginBottom: '1.125rem' }}>
      <div style={{ marginBottom: '0.875rem' }}>
        <Label>Unidades FATEC (até {MAX_UNITS})</Label>
        <div role="group" aria-label="Unidades FATEC" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {units.map(u => {
            const on = selectedUnits.includes(u);
            return (
              <button key={u} type="button" aria-pressed={on} onClick={() => pickUnit(u)} style={{ background: on ? C.title : C.card, color: on ? '#fff' : C.title, border: `1.5px solid ${on ? C.title : C.border}`, borderRadius: '62.4375rem', padding: '0.375rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>{u}</button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: '1.125rem' }}>
        <Label>Disciplinas</Label>
        {available.length === 0
          ? <p style={{ color: C.textSec, fontSize: '0.78rem', margin: 0 }}>Selecione ao menos uma unidade.</p>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.75rem, 1fr))', gap: '0.5rem' }}>
              {available.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: courseIds.includes(c.id) ? C.successBg : C.card, border: `1.5px solid ${courseIds.includes(c.id) ? C.success : C.border}`, borderRadius: '0.5625rem', padding: '0.5rem 0.625rem', fontSize: '0.8rem', color: C.title, cursor: 'pointer' }}>
                  <input type="checkbox" checked={courseIds.includes(c.id)} onChange={() => pickCourse(c.id)} style={{ accentColor: C.success }} />
                  <span><strong>{c.code}</strong> · {c.name}<br /><span style={{ color: C.textTer, fontSize: '0.7rem' }}>{unitOf(c)}</span></span>
                </label>
              ))}
            </div>
          )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12.5rem, 1fr))', gap: '0.75rem', marginBottom: '1.125rem' }}>
        <div><Label htmlFor="b-title">Título</Label><Input id="b-title" value={title} onChange={e => setTitle(e.target.value)} placeholder={kind === 'prova' ? 'Prova 2 – Bimestral' : 'Lista 3 – Integrais'} /></div>
        <div><Label htmlFor="b-due">Prazo</Label><Input id="b-due" type="datetime-local" value={due} onChange={e => setDue(e.target.value)} /></div>
      </div>

      {questions.map((q, i) => (
        <fieldset key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '0.625rem', padding: '0.875rem', margin: '0 0 0.75rem', background: C.bg }}>
          <legend style={{ padding: '0 0.375rem', color: C.title, fontSize: '0.8rem', fontWeight: 700 }}>
            Questão {i + 1} · {q.kind === 'objective' ? 'objetiva' : 'dissertativa'}
          </legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 11.25rem auto', gap: '0.625rem', alignItems: 'start', marginBottom: '0.625rem' }}>
            <TextArea aria-label={`Enunciado da questão ${i + 1}`} value={q.prompt} onChange={e => update(i, { prompt: e.target.value })} placeholder="Enunciado" />
            <Select aria-label={`Tópico da questão ${i + 1}`} value={q.topic} onChange={e => update(i, { topic: e.target.value })}>
              <option value="">Tópico…</option>
              {topics.map(t => <option key={t}>{t}</option>)}
            </Select>
            <button type="button" aria-label={`Remover questão ${i + 1}`} disabled={questions.length === 1} onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: questions.length === 1 ? 'not-allowed' : 'pointer', color: C.error, padding: '0.5rem', opacity: questions.length === 1 ? 0.3 : 1 }}><Trash2 size={15} /></button>
          </div>

          {q.kind === 'objective' ? (
            <div role="radiogroup" aria-label="Alternativa correta" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.75rem, 1fr))', gap: '0.5rem' }}>
              {LETTERS.map((L, k) => (
                <label key={L} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: q.correct === L ? C.successBg : C.card, border: `1.5px solid ${q.correct === L ? C.success : C.border}`, borderRadius: '0.5625rem', padding: '0.25rem 0.5rem' }}>
                  <input type="radio" name={`correct-${i}`} checked={q.correct === L} onChange={() => update(i, { correct: L })} style={{ accentColor: C.success }} aria-label={`Alternativa ${L} correta`} />
                  <strong style={{ color: C.textSec, fontSize: '0.8rem' }}>{L})</strong>
                  <input value={q.options[k]} onChange={e => update(i, { options: q.options.map((o, m) => (m === k ? e.target.value : o)) })} placeholder={`Alternativa ${L}`} aria-label={`Texto da alternativa ${L}`} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', color: C.title, fontFamily: font, padding: '0.3125rem 0' }} />
                </label>
              ))}
            </div>
          ) : (
            <div>
              <Label htmlFor={`kw-${i}`}>Palavras-chave esperadas (separadas por vírgula)</Label>
              <Input id={`kw-${i}`} value={q.keywords} onChange={e => update(i, { keywords: e.target.value })} placeholder="função composta, derivada externa, derivada interna" />
              <p style={{ color: C.textTer, fontSize: '0.7rem', margin: '0.3125rem 0 0' }}>
                A nota da resposta é a porcentagem de palavras-chave encontradas: ≥ 80% azul, ≥ 60% verde, ≥ 40% amarelo, abaixo disso vermelho.
              </p>
            </div>
          )}
          {problems[i] && <p style={{ color: C.textSec, fontSize: '0.72rem', margin: '0.5rem 0 0' }}>Falta: {problems[i]}</p>}
        </fieldset>
      ))}

      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1.125rem' }}>
        <Button type="button" variant="ghost" onClick={() => setQuestions(qs => [...qs, blank('objective')])}><ListChecks size={14} /> Questão objetiva</Button>
        <Button type="button" variant="ghost" onClick={() => setQuestions(qs => [...qs, blank('essay')])}><PenLine size={14} /> Questão dissertativa</Button>
      </div>
      <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving} disabled={!valid}>Publicar {kind}</Button>
      </div>
    </form>
  );
}
