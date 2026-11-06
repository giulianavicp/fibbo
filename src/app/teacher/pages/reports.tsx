import { useState } from 'react';
import { toast } from 'sonner';
import { Download, FileBarChart, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { C } from '../../lib/tokens';
import type { TeacherData } from '../data';
import { gradesCsv, studentRows } from '../stats';
import { Button, CourseFilter, Empty, Page, card } from '../../shared/ui';

const download = (name: string, content: string) => {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
};

export default function Reports({ data }: { data: TeacherData }) {
  const [courseId, setCourseId] = useState(data.courses[0]?.id ?? '');
  const course = data.courses.find(c => c.id === courseId);

  if (!course) return <Page title="Relatórios"><Empty icon={<FileBarChart size={24} />} title="Nenhuma disciplina" text="Crie uma disciplina para gerar relatórios." /></Page>;

  const rows = studentRows(data, courseId);
  const exportQuestions = async () => {
    const { data: qs, error } = await supabase.rpc('top_questions', { course: courseId });
    if (error) return toast.error('Não foi possível gerar o relatório.');
    if (!qs.length) return toast('Os alunos ainda não fizeram perguntas à Katherine nesta disciplina.');
    const lines = [['Pergunta', 'Data'], ...qs.map(q => [q.question, new Date(q.asked_at).toLocaleString('pt-BR')])];
    download(`duvidas-katherine-${course.code.toLowerCase()}.csv`, lines.map(l => l.map(v => `"${v.replace(/"/g, '""')}"`).join(';')).join('\n'));
    toast.success(`${qs.length} perguntas exportadas.`);
  };
  const exportGrades = () => {
    download(`notas-${course.code.toLowerCase()}.csv`, gradesCsv(data, courseId));
    toast.success('Planilha de notas baixada.');
  };

  return (
    <Page title="Relatórios" subtitle="Exporte as notas para abrir no Excel ou Google Planilhas" actions={<CourseFilter courses={data.courses} value={courseId} onChange={setCourseId} allLabel={null} />}>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', background: '#F6EEE6', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileBarChart size={20} /></div>
        <div style={{ flex: 1, minWidth: '12.5rem' }}>
          <div style={{ color: C.title, fontSize: '0.9rem', fontWeight: 700 }}>Notas por aluno · {course.name}</div>
          <div style={{ color: C.textSec, fontSize: '0.78rem', marginTop: '2px' }}>{rows.length} alunos · uma coluna por atividade, média e entregas (CSV separado por ponto e vírgula)</div>
        </div>
        <Button onClick={exportGrades} disabled={!rows.length}><Download size={14} /> Baixar CSV</Button>
      </div>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.875rem' }}>
        <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', background: C.successBg, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} /></div>
        <div style={{ flex: 1, minWidth: '12.5rem' }}>
          <div style={{ color: C.title, fontSize: '0.9rem', fontWeight: 700 }}>Relatório da Katherine IA · {course.name}</div>
          <div style={{ color: C.textSec, fontSize: '0.78rem', marginTop: '2px' }}>Perguntas que os alunos fizeram à Katherine nesta disciplina (sem identificar quem perguntou)</div>
        </div>
        <Button variant="ghost" onClick={exportQuestions}><Download size={14} /> Baixar CSV</Button>
      </div>
    </Page>
  );
}
