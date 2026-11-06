import type { Activity, StudentData, Submission } from './data';

export type ActivityStatus = 'pending' | 'submitted' | 'overdue';

const round1 = (n: number) => Math.round(n * 10) / 10;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export const XP_PER_LEVEL = 200;

export function level(xp: number) {
  const n = Math.floor(xp / XP_PER_LEVEL) + 1;
  const title = n >= 7 ? 'Estudante Avançado' : n >= 5 ? 'Estudante Dedicado' : n >= 3 ? 'Estudante Intermediário' : 'Estudante Iniciante';
  return { level: n, title, into: xp % XP_PER_LEVEL, next: XP_PER_LEVEL };
}

export function statusOf(a: Activity, sub: Submission | undefined, now = new Date()): ActivityStatus {
  if (sub) return 'submitted';
  return a.due_at && new Date(a.due_at) < now ? 'overdue' : 'pending';
}

export function activityRows(data: StudentData, now = new Date()) {
  const subByActivity = new Map(data.submissions.map(s => [s.activity_id, s]));
  const course = new Map(data.courses.map(c => [c.id, c]));
  return data.activities
    .filter(a => a.published && course.has(a.course_id))
    .map(a => {
      const sub = subByActivity.get(a.id);
      return { activity: a, course: course.get(a.course_id)!, submission: sub, status: statusOf(a, sub, now) };
    });
}

export function courseSummary(data: StudentData, courseId: string, now = new Date()) {
  const rows = activityRows(data, now).filter(r => r.course.id === courseId);
  const grades = rows.map(r => r.submission?.grade).filter((g): g is number => g !== null && g !== undefined);
  const done = rows.filter(r => r.status === 'submitted').length;
  return {
    total: rows.length,
    done,
    progress: rows.length ? Math.round((done / rows.length) * 100) : 0,
    avg: grades.length ? round1(grades.reduce((a, b) => a + b, 0) / grades.length) : null,
    pending: rows.filter(r => r.status !== 'submitted').length,
  };
}

export function overview(data: StudentData, now = new Date()) {
  const rows = activityRows(data, now);
  const grades = data.submissions.map(s => s.grade).filter((g): g is number => g !== null);
  const weekEnd = new Date(now.getTime() + 7 * 864e5);
  const me = data.ranking.find(r => r.is_me);
  return {
    pending: rows.filter(r => r.status === 'pending').length,
    overdue: rows.filter(r => r.status === 'overdue'),
    examsThisWeek: rows.filter(r => r.activity.kind === 'prova' && r.status === 'pending' && r.activity.due_at && new Date(r.activity.due_at) <= weekEnd).length,
    avg: grades.length ? round1(grades.reduce((a, b) => a + b, 0) / grades.length) : null,
    xp: me?.xp ?? 0,
    rank: me ? data.ranking.indexOf(me) + 1 : null,
  };
}

export function streak(data: StudentData, now = new Date()) {
  const days = new Set([...data.submissions.map(s => s.submitted_at), ...data.journal.map(j => j.created_at)].map(d => dayKey(new Date(d))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return n;
}

export function topicScores(data: StudentData) {
  const topic = new Map(data.questions.map(q => [q.id, q.topic]));
  const mine = new Set(data.submissions.map(s => s.id));
  const by = new Map<string, number[]>();
  for (const a of data.answers) {
    if (!mine.has(a.submission_id) || a.score === null) continue;
    const t = topic.get(a.question_id);
    if (!t) continue;
    by.set(t, [...(by.get(t) ?? []), a.score]);
  }
  return [...by.entries()]
    .map(([t, s]) => ({ topic: t, score: Math.round(s.reduce((a, b) => a + b, 0) / s.length) }))
    .sort((a, b) => a.score - b.score);
}
