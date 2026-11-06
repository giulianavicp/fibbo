import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { C, chartTooltip as tt, essayStyle, gradeColor } from '../../lib/tokens';
import type { TeacherData } from '../data';
import { analytics, overview } from '../stats';
import { CourseFilter, Empty, Page, SectionTitle, card, chartH, fmtGrade } from '../../shared/ui';

export default function Analytics({ data }: { data: TeacherData }) {
  const [courseId, setCourseId] = useState(data.courses[0]?.id ?? '');
  const o = overview(data, courseId || undefined);
  const a = analytics(data, courseId || undefined);

  const header = <CourseFilter courses={data.courses} value={courseId} onChange={setCourseId} />;
  if (!a.topics.length) {
    return <Page title="Dashboard Analítico" subtitle="Análise detalhada de desempenho" actions={header}><Empty icon={<BarChart2 size={24} />} title="Sem dados ainda" text="As análises aparecem assim que os alunos enviarem respostas nesta disciplina." /></Page>;
  }

  const kpis = [
    { label: 'Média', value: fmtGrade(o.avg), color: o.avg === null ? C.textSec : gradeColor(o.avg) },
    { label: 'Alunos na média ou acima', value: a.aboveAvgPct === null ? '—' : `${a.aboveAvgPct}%`, color: C.info },
    { label: 'Maior dificuldade', value: a.weakestTopic ?? '—', color: C.error },
    { label: 'Dúvida frequente', value: a.hardestTopic ?? '—', color: C.pending },
  ];

  return (
    <Page title="Dashboard Analítico" subtitle="Baseado nas notas automáticas de cada questão" actions={header}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.75rem', marginBottom: '1.125rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...card, padding: '0.875rem', textAlign: 'center' }}>
            <div style={{ color: k.color, fontSize: '1.05rem', fontWeight: 800 }}>{k.value}</div>
            <div style={{ color: C.textSec, fontSize: '0.7rem', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '0.875rem', marginBottom: '0.875rem' }}>
        <div style={card}>
          <SectionTitle>Desempenho por tópico (% de acerto)</SectionTitle>
          <ResponsiveContainer width="100%" height={chartH(Math.max(160, a.topics.length * 38))}>
            <BarChart data={a.topics} layout="vertical" barSize={18} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: chartH(11), fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" width={chartH(110)} tick={{ fontSize: chartH(11), fill: C.textSec }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} formatter={v => [`${v}%`, 'Acerto']} />
              <Bar dataKey="score" radius={[0, 5, 5, 0]}>
                {a.topics.map(t => <Cell key={t.topic} fill={essayStyle(t.score).color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <SectionTitle>Questões com mais erros</SectionTitle>
          {a.hardest.map(h => {
            const color = essayStyle(100 - h.errorPct).color;
            return (
              <div key={h.id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.625rem', marginBottom: '0.1875rem' }}>
                  <span style={{ color: C.title, fontSize: '0.77rem' }} title={h.prompt}>{h.label}{h.topic ? ` · ${h.topic}` : ''}</span>
                  <span style={{ color, fontSize: '0.77rem', fontWeight: 700 }}>{h.errorPct}% erro</span>
                </div>
                <div style={{ background: C.barEmpty, borderRadius: '6.1875rem', height: '0.3125rem' }}>
                  <div style={{ background: color, height: '0.3125rem', borderRadius: '6.1875rem', width: `${h.errorPct}%` }} />
                </div>
                <div style={{ color: C.textTer, fontSize: '0.68rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.prompt} · {h.answers} respostas</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={card}>
        <SectionTitle>Evolução da média (por semana)</SectionTitle>
        {o.evolution.length > 1 ? (
          <ResponsiveContainer width="100%" height={chartH(170)}>
            <LineChart data={o.evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: chartH(11), fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: chartH(11), fill: C.textSec }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} />
              <Line type="monotone" dataKey="avg" name="Média" stroke={C.primary} strokeWidth={2} dot={{ fill: C.primary, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p style={{ color: C.textSec, fontSize: '0.8rem' }}>O gráfico aparece quando houver notas em pelo menos duas semanas.</p>}
      </div>
    </Page>
  );
}
