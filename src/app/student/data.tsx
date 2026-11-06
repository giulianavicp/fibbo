import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Row } from '../lib/database.types';

export type Course = Row<'courses'>;
export type Activity = Row<'activities'>;
export type Submission = Row<'submissions'>;
export type Answer = Pick<Row<'answers'>, 'id' | 'submission_id' | 'question_id' | 'score'>;
export type Question = Pick<Row<'questions'>, 'id' | 'activity_id' | 'position' | 'kind' | 'topic'>;
export type JournalEntry = Row<'journal_entries'>;
export type Ranked = { display_name: string; xp: number; is_me: boolean };

export type StudentData = {
  courses: Course[];
  teachers: Map<string, string>;
  activities: Activity[];
  submissions: Submission[];
  questions: Question[];
  answers: Answer[];
  journal: JournalEntry[];
  ranking: Ranked[];
};

type Ctx = { data: StudentData | null; error: string | null; reload: () => Promise<void> };

const StudentDataContext = createContext<Ctx | null>(null);

async function fetchAll(studentId: string): Promise<StudentData> {
  const [courses, profiles, activities, submissions, questions, answers, journal, ranking] = await Promise.all([
    supabase.from('courses').select('*').order('code'),
    supabase.from('profiles').select('id, full_name'),
    supabase.from('activities').select('*').order('due_at'),
    supabase.from('submissions').select('*').eq('student_id', studentId),
    supabase.from('questions').select('id, activity_id, position, kind, topic').order('position'),
    supabase.from('answers').select('id, submission_id, question_id, score'),
    supabase.from('journal_entries').select('*').order('created_at', { ascending: false }),
    supabase.rpc('leaderboard'),
  ]);
  const failed = [courses, profiles, activities, submissions, questions, answers, journal, ranking].find(r => r.error);
  if (failed?.error) throw failed.error;
  return {
    courses: courses.data!,
    teachers: new Map(profiles.data!.map(p => [p.id, p.full_name])),
    activities: activities.data!,
    submissions: submissions.data!,
    questions: questions.data!,
    answers: answers.data!,
    journal: journal.data!,
    ranking: ranking.data!,
  };
}

export function StudentDataProvider({ studentId, children }: { studentId: string; children: ReactNode }) {
  const [data, setData] = useState<StudentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setData(await fetchAll(studentId));
      setError(null);
    } catch {
      setError('Não foi possível carregar seus dados. Verifique sua conexão.');
    }
  }, [studentId]);

  useEffect(() => { reload(); }, [reload]);

  return <StudentDataContext.Provider value={{ data, error, reload }}>{children}</StudentDataContext.Provider>;
}

export function useStudentData() {
  const ctx = useContext(StudentDataContext);
  if (!ctx) throw new Error('useStudentData must be used inside StudentDataProvider');
  return ctx;
}
