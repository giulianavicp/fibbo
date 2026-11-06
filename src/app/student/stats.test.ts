import { describe, expect, it } from 'vitest';
import type { StudentData } from './data';
import { courseSummary, level, overview, streak, topicScores } from './stats';

const now = new Date('2026-11-04T12:00:00Z');
const at = (days: number) => new Date(now.getTime() + days * 864e5).toISOString();

const data: StudentData = {
  courses: [{ id: 'c1', code: 'MAT001', name: 'Cálculo I', unit: null, topics: [], teacher_id: 't', join_code: 'X', created_at: at(-30) }],
  teachers: new Map([['t', 'Ana Martins']]),
  activities: [
    { id: 'a1', course_id: 'c1', title: 'L1', kind: 'atividade', due_at: at(-5), published: true, created_at: at(-10) },
    { id: 'a2', course_id: 'c1', title: 'L2', kind: 'atividade', due_at: at(-1), published: true, created_at: at(-10) },
    { id: 'a3', course_id: 'c1', title: 'P1', kind: 'prova', due_at: at(3), published: true, created_at: at(-10) },
    { id: 'a4', course_id: 'c1', title: 'hidden', kind: 'prova', due_at: at(3), published: false, created_at: at(-10) },
  ],
  submissions: [
    { id: 's1', activity_id: 'a1', student_id: 'me', submitted_at: at(0), grade: 8, reviewed: true },
  ],
  questions: [
    { id: 'q1', activity_id: 'a1', position: 1, kind: 'objective', topic: 'Limites' },
    { id: 'q2', activity_id: 'a1', position: 2, kind: 'essay', topic: 'Derivadas' },
  ],
  answers: [
    { id: 'r1', submission_id: 's1', question_id: 'q1', score: 100 },
    { id: 'r2', submission_id: 's1', question_id: 'q2', score: 50 },
  ],
  journal: [
    { id: 'j1', student_id: 'me', prompt: 'p', content: 'c', created_at: at(-1) },
    { id: 'j2', student_id: 'me', prompt: 'p', content: 'c', created_at: at(-2) },
  ],
  ranking: [
    { display_name: 'Maria S.', xp: 900, is_me: false },
    { display_name: 'João S.', xp: 420, is_me: true },
  ],
};

describe('level', () => {
  it('advances every 200 XP', () => {
    expect(level(0)).toMatchObject({ level: 1, into: 0 });
    expect(level(420)).toMatchObject({ level: 3, into: 20, title: 'Estudante Intermediário' });
    expect(level(1300)).toMatchObject({ level: 7, title: 'Estudante Avançado' });
  });
});

describe('overview', () => {
  it('splits pending and overdue and ignores hidden activities', () => {
    const o = overview(data, now);
    expect(o.pending).toBe(1);
    expect(o.overdue.map(r => r.activity.id)).toEqual(['a2']);
    expect(o.examsThisWeek).toBe(1);
    expect(o.avg).toBe(8);
    expect(o.rank).toBe(2);
    expect(o.xp).toBe(420);
  });
});

describe('courseSummary', () => {
  it('computes progress over visible activities', () => {
    expect(courseSummary(data, 'c1', now)).toMatchObject({ total: 3, done: 1, progress: 33, avg: 8, pending: 2 });
  });
});

describe('streak', () => {
  it('counts consecutive active days ending today', () => {
    expect(streak(data, now)).toBe(3);
  });
  it('breaks on a missing day', () => {
    expect(streak({ ...data, journal: [] }, now)).toBe(1);
  });
});

describe('topicScores', () => {
  it('orders topics from weakest to strongest', () => {
    expect(topicScores(data)).toEqual([{ topic: 'Derivadas', score: 50 }, { topic: 'Limites', score: 100 }]);
  });
});
