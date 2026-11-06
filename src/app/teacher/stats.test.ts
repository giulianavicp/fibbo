import { describe, expect, it } from 'vitest';
import type { TeacherData } from './data';
import { analytics, gradesCsv, overview, statusFor, studentRows } from './stats';
import { questionProblem } from './validation';

const now = new Date('2026-11-04T12:00:00Z');
const past = '2026-11-01T12:00:00Z';
const future = '2026-11-20T12:00:00Z';

const data: TeacherData = {
  courses: [{ id: 'c1', code: 'MAT001', name: 'Cálculo I', unit: null, topics: [], teacher_id: 't', join_code: 'CALC01', created_at: past }],
  enrollments: [
    { course_id: 'c1', student_id: 's1', created_at: past },
    { course_id: 'c1', student_id: 's2', created_at: past },
  ],
  students: [{ id: 's1', full_name: 'Ana' }, { id: 's2', full_name: 'Bruno' }],
  activities: [
    { id: 'a1', course_id: 'c1', title: 'Lista 1', kind: 'atividade', due_at: past, published: true, created_at: past },
    { id: 'a2', course_id: 'c1', title: 'Lista 2', kind: 'atividade', due_at: future, published: true, created_at: past },
  ],
  submissions: [
    { id: 'x1', activity_id: 'a1', student_id: 's1', submitted_at: past, grade: 9, reviewed: true },
    { id: 'x2', activity_id: 'a2', student_id: 's1', submitted_at: past, grade: 6, reviewed: false },
  ],
  materials: [],
  questions: [
    { id: 'q1', activity_id: 'a1', position: 1, kind: 'objective', prompt: 'p1', topic: 'Limites' },
    { id: 'q2', activity_id: 'a1', position: 2, kind: 'essay', prompt: 'p2', topic: 'Derivadas' },
  ],
  answers: [
    { id: 'r1', submission_id: 'x1', question_id: 'q1', score: 100 },
    { id: 'r2', submission_id: 'x1', question_id: 'q2', score: 40 },
  ],
};

describe('statusFor', () => {
  it('maps averages to the four bands', () => {
    expect(statusFor(8, 1, 1)).toBe('excellent');
    expect(statusFor(6, 1, 1)).toBe('good');
    expect(statusFor(4, 1, 1)).toBe('attention');
    expect(statusFor(3.9, 1, 1)).toBe('risk');
  });
  it('flags students with overdue work and no grades as risk', () => {
    expect(statusFor(null, 0, 2)).toBe('risk');
    expect(statusFor(null, 0, 0)).toBe('none');
  });
});

describe('studentRows', () => {
  it('counts only past-due activities in the total', () => {
    const [ana, bruno] = studentRows(data, 'c1', now);
    expect(ana).toMatchObject({ name: 'Ana', avg: 7.5, delivered: 1, total: 1, status: 'good' });
    expect(bruno).toMatchObject({ name: 'Bruno', avg: null, delivered: 0, total: 1, status: 'risk' });
  });
});

describe('overview', () => {
  it('computes average, pending and delivery rate', () => {
    const o = overview(data, undefined, now);
    expect(o.avg).toBe(7.5);
    expect(o.pending).toBe(1);
    expect(o.students).toBe(2);
    expect(o.deliveryRate).toBe(50);
    expect(o.buckets.find(b => b.range === '8–10')?.count).toBe(1);
    expect(o.buckets.find(b => b.range === '6–8')?.count).toBe(1);
  });
});

describe('gradesCsv', () => {
  it('builds one row per student with a column per activity', () => {
    const lines = gradesCsv(data, 'c1').split('\n');
    expect(lines[0]).toBe('Aluno;Lista 1;Lista 2;Média;Entregas');
    expect(lines[1]).toBe('Ana;9;6;7.5;1/1');
  });
});

describe('questionProblem', () => {
  const base = { prompt: 'Q', topic: '', options: ['a', 'b', 'c', 'd'], correct: 'B', keywords: '' };
  it('accepts complete questions', () => {
    expect(questionProblem({ ...base, kind: 'objective' })).toBeNull();
    expect(questionProblem({ ...base, kind: 'essay', keywords: 'área, curva' })).toBeNull();
  });
  it('rejects incomplete ones', () => {
    expect(questionProblem({ ...base, kind: 'objective', correct: '' })).toBe('marque a alternativa correta');
    expect(questionProblem({ ...base, kind: 'objective', options: ['a', '', 'c', 'd'] })).toBe('preencha as 4 alternativas');
    expect(questionProblem({ ...base, kind: 'essay', keywords: ' , ' })).toBe('informe ao menos uma palavra-chave');
  });
});

describe('analytics', () => {
  it('ranks topics by score and questions by error rate', () => {
    const a = analytics(data);
    expect(a.topics).toEqual([{ topic: 'Derivadas', score: 40 }, { topic: 'Limites', score: 100 }]);
    expect(a.hardest[0]).toMatchObject({ label: 'Lista 1 · Q2', errorPct: 60 });
    expect(a.weakestTopic).toBe('Derivadas');
  });
});
