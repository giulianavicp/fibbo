import type { TeacherData } from './data';

export type StudentStatus = 'excellent' | 'good' | 'attention' | 'risk' | 'none';

export type StudentRow = { id: string; name: string; avg: number | null; delivered: number; total: number; status: StudentStatus };

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) => (xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export const statusFor = (avg: number | null, delivered: number, total: number): StudentStatus => {
  if (avg === null) return total > 0 && delivered === 0 ? 'risk' : 'none';
  if (avg >= 8) return 'excellent';
  if (avg >= 6) return 'good';
  if (avg >= 4) return 'attention';
  return 'risk';
};

export function scope(data: TeacherData, courseId?: string, now = new Date()) {
  const courseIds = new Set(courseId ? [courseId] : data.courses.map(c => c.id));
  const activities = data.activities.filter(a => courseIds.has(a.course_id));
  const activityIds = new Set(activities.map(a => a.id));
  const enrollments = data.enrollments.filter(e => courseIds.has(e.course_id));
  const submissions = data.submissions.filter(s => activityIds.has(s.activity_id));
  const due = activities.filter(a => a.published && a.due_at && new Date(a.due_at) <= now);
  return { courseIds, activities, enrollments, submissions, due };
}

export function studentRows(data: TeacherData, courseId?: string, now = new Date()): StudentRow[] {
  const { enrollments, submissions, due } = scope(data, courseId, now);
  const names = new Map(data.students.map(s => [s.id, s.full_name]));
  const studentIds = [...new Set(enrollments.map(e => e.student_id))];

  return studentIds
    .map(id => {
      const myCourses = new Set(enrollments.filter(e => e.student_id === id).map(e => e.course_id));
      const mine = submissions.filter(s => s.student_id === id);
      const grades = mine.map(s => s.grade).filter((g): g is number => g !== null);
      const myDue = new Set(due.filter(a => myCourses.has(a.course_id)).map(a => a.id));
      const total = myDue.size;
      const delivered = new Set(mine.filter(s => myDue.has(s.activity_id)).map(s => s.activity_id)).size;
      const avg = mean(grades);
      return { id, name: names.get(id) ?? 'Aluno', avg, delivered, total, status: statusFor(avg, delivered, total) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function overview(data: TeacherData, courseId?: string, now = new Date()) {
  const { enrollments, submissions, due } = scope(data, courseId, now);
  const grades = submissions.map(s => s.grade).filter((g): g is number => g !== null);
  const pairs = due.flatMap(a => enrollments.filter(e => e.course_id === a.course_id).map(e => `${a.id}:${e.student_id}`));
  const delivered = new Set(submissions.map(s => `${s.activity_id}:${s.student_id}`));
  const deliveredDue = pairs.filter(p => delivered.has(p)).length;

  const buckets = ['0–2', '2–4', '4–6', '6–8', '8–10'].map((range, i) => ({
    range,
    count: grades.filter(g => (i === 4 ? g >= 8 : g >= i * 2 && g < i * 2 + 2)).length,
  }));

  const byWeek = new Map<string, number[]>();
  for (const s of submissions) {
    if (s.grade === null) continue;
    const d = new Date(s.submitted_at);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    byWeek.set(key, [...(byWeek.get(key) ?? []), s.grade]);
  }
  const evolution = [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, gs]) => ({ week: `${week.slice(8, 10)}/${week.slice(5, 7)}`, avg: mean(gs)! }));

  return {
    avg: mean(grades),
    students: new Set(enrollments.map(e => e.student_id)).size,
    pending: submissions.filter(s => !s.reviewed).length,
    deliveryRate: pairs.length ? Math.round((deliveredDue / pairs.length) * 100) : null,
    engagement: pairs.length
      ? [
          { name: 'Entregues', value: deliveredDue },
          { name: 'Não entregues', value: pairs.length - deliveredDue },
        ]
      : [],
    buckets,
    evolution,
  };
}

export function activityStats(data: TeacherData, activityId: string) {
  const activity = data.activities.find(a => a.id === activityId)!;
  const enrolled = data.enrollments.filter(e => e.course_id === activity.course_id).length;
  const subs = data.submissions.filter(s => s.activity_id === activityId);
  const grades = subs.map(s => s.grade).filter((g): g is number => g !== null);
  return { enrolled, delivered: subs.length, avg: mean(grades), pending: subs.filter(s => !s.reviewed).length };
}

const csvCell = (v: string | number | null) => {
  const s = v === null ? '' : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function gradesCsv(data: TeacherData, courseId: string) {
  const activities = data.activities.filter(a => a.course_id === courseId).sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''));
  const rows = studentRows(data, courseId);
  const grade = (studentId: string, activityId: string) =>
    data.submissions.find(s => s.student_id === studentId && s.activity_id === activityId)?.grade ?? null;
  const header = ['Aluno', ...activities.map(a => a.title), 'Média', 'Entregas'];
  const lines = rows.map(r => [r.name, ...activities.map(a => grade(r.id, a.id)), r.avg, `${r.delivered}/${r.total}`]);
  return [header, ...lines].map(l => l.map(csvCell).join(';')).join('\n');
}

export function analytics(data: TeacherData, courseId?: string) {
  const { activities, submissions } = scope(data, courseId);
  const activityIds = new Set(activities.map(a => a.id));
  const subIds = new Set(submissions.map(s => s.id));
  const questions = data.questions.filter(q => activityIds.has(q.activity_id));
  const answers = data.answers.filter(a => subIds.has(a.submission_id) && a.score !== null);
  const title = new Map(activities.map(a => [a.id, a.title]));

  const byQuestion = new Map<string, number[]>();
  for (const a of answers) byQuestion.set(a.question_id, [...(byQuestion.get(a.question_id) ?? []), a.score!]);

  const byTopic = new Map<string, number[]>();
  for (const q of questions) {
    const scores = byQuestion.get(q.id) ?? [];
    if (!scores.length) continue;
    const topic = q.topic ?? 'Sem tópico';
    byTopic.set(topic, [...(byTopic.get(topic) ?? []), ...scores]);
  }
  const topics = [...byTopic.entries()]
    .map(([topic, s]) => ({ topic, score: Math.round(s.reduce((a, b) => a + b, 0) / s.length) }))
    .sort((a, b) => a.score - b.score);

  const hardest = questions
    .filter(q => byQuestion.has(q.id))
    .map(q => {
      const s = byQuestion.get(q.id)!;
      const avg = s.reduce((a, b) => a + b, 0) / s.length;
      return { id: q.id, label: `${title.get(q.activity_id)} · Q${q.position}`, prompt: q.prompt, topic: q.topic, errorPct: Math.round(100 - avg), answers: s.length };
    })
    .sort((a, b) => b.errorPct - a.errorPct)
    .slice(0, 5);

  const rows = studentRows(data, courseId).filter(r => r.avg !== null);
  const classAvg = mean(rows.map(r => r.avg!));
  const aboveAvgPct = rows.length && classAvg !== null ? Math.round((rows.filter(r => r.avg! >= classAvg).length / rows.length) * 100) : null;

  return { topics, hardest, aboveAvgPct, weakestTopic: topics[0]?.topic ?? null, hardestTopic: hardest[0]?.topic ?? null };
}
