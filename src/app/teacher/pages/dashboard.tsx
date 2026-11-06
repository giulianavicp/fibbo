import { useState } from 'react';
import { BarChart2, CheckSquare, Clock, Users, BookOpen } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router';
import { C, chartTooltip as tt, gradeColor } from '../../lib/tokens';
import KPICard from '../kpi-card';
import { useTeacherData, type TeacherData } from '../data';
import { overview, studentRows } from '../stats';
import { Button, CourseFilter, Empty, Page, SectionTitle, StatusBadge, card, chartH, fmtGrade } from '../../shared/ui';

const bucketColor = [C.error, C.error, C.warning, C.success, C.info];

export default function Dashboard({ data, firstName }: { data: TeacherData; firstName: string }) {
  const [courseId, setCourseId] = useState('');
  const navigate = useNavigate();
  const { reload } = useTeacherData();

  if (!data.courses.length) {
    return (
      <Page title={`Olá, Prof. ${firstName}!`} subtitle="Painel do Professor">
        <Empty
          icon={<BookOpen size={24} />}
          title="Crie sua primeira disciplina"
          text="Depois de criar uma disciplina, compartilhe o código de acesso com os alunos e cadastre atividades para ver os indicadores aqui."
          action={<Button onClick={() => navigate('/professor/disciplinas')}>Criar disciplina</Button>}
        />
      </Page>
    );
  }

  const o = overview(data, courseId || undefined);
  const attention = studentRows(data, courseId || undefined).filter(s => s.status === 'risk' || s.status === 'attention').slice(0, 5);
  const hasGrades = o.buckets.some(b => b.count > 0);

  return (
    <Page
      title={`Olá, Prof. ${firstName}!`}
      subtitle="Painel do Professor"
      actions={<><CourseFilter courses={data.courses} value={courseId} onChange={setCourseId} /><Button variant="ghost" onClick={reload}>Atualizar</Button></>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10.625rem, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <KPICard label="Média geral" value={fmtGrade(o.avg)} sub="todas as atividades corrigidas" icon={<BarChart2 size={18} />} color={C.success} bg={C.successBg} trend={null} />
        <KPICard label="Alunos" value={String(o.students)} sub="matriculados" icon={<Users size={18} />} color={C.info} bg={C.infoBg} trend={null} />
        <KPICard label="Correções pendentes" value={String(o.pending)} sub="dissertativas a revisar" icon={<Clock size={18} />} color={C.pending} bg={C.pendingBg} trend={null} />
        <KPICard label="Taxa de entrega" value={o.deliveryRate === null ? '—' : `${o.deliveryRate}%`} sub="atividades com prazo vencido" icon={<CheckSquare size={18} />} color={C.mid1} bg="#F6EEE6" trend={null} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18.75rem, 1fr))', gap: '0.875rem', marginBottom: '0.875rem' }}>
        <div style={card}>
          <SectionTitle>Distribuição de notas</SectionTitle>
          {hasGrades ? (
            <ResponsiveContainer width="100%" height={chartH(190)}>
              <BarChart data={o.buckets} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: chartH(11), fill: C.textSec }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: chartH(11), fill: C.textSec }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tt} cursor={{ fill: `${C.border}50` }} />
                <Bar dataKey="count" name="Envios" radius={[5, 5, 0, 0]}>
                  {o.buckets.map((_, i) => <Cell key={i} fill={bucketColor[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: C.textSec, fontSize: '0.8rem' }}>As notas aparecem aqui assim que os alunos enviarem respostas.</p>}
        </div>

        <div style={card}>
          <SectionTitle>Engajamento</SectionTitle>
          {o.engagement.length ? (
            <>
              <ResponsiveContainer width="100%" height={chartH(140)}>
                <PieChart>
                  <Pie data={o.engagement} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={2}>
                    <Cell fill={C.successAccent} />
                    <Cell fill={C.error} />
                  </Pie>
                  <Tooltip contentStyle={tt} />
                </PieChart>
              </ResponsiveContainer>
              {o.engagement.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: i ? C.error : C.successAccent }} />
                  <span style={{ color: C.textSec, flex: 1 }}>{d.name}</span>
                  <span style={{ color: C.title, fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </>
          ) : <p style={{ color: C.textSec, fontSize: '0.8rem' }}>Nenhuma atividade com prazo vencido ainda.</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18.75rem, 1fr))', gap: '0.875rem' }}>
        <div style={card}>
          <SectionTitle>Evolução da média (por semana)</SectionTitle>
          {o.evolution.length > 1 ? (
            <ResponsiveContainer width="100%" height={chartH(150)}>
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

        <div style={card}>
          <SectionTitle>Alunos que precisam de atenção</SectionTitle>
          {attention.length ? attention.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: `1px solid ${C.bg}` }}>
              <span style={{ flex: 1, color: C.title, fontSize: '0.82rem' }}>{s.name}</span>
              <span style={{ color: s.avg === null ? C.textSec : gradeColor(s.avg), fontSize: '0.82rem', fontWeight: 700 }}>{fmtGrade(s.avg)}</span>
              <StatusBadge status={s.status} />
            </div>
          )) : <p style={{ color: C.textSec, fontSize: '0.8rem' }}>Nenhum aluno em atenção ou risco. 🎉</p>}
        </div>
      </div>
    </Page>
  );
}
