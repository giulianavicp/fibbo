import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Row } from '../lib/database.types';

export type Course = Row<'courses'>;
export type Activity = Row<'activities'>;
export type Submission = Row<'submissions'>;
export type Material = Row<'materials'>;
export type Enrollment = Row<'enrollments'>;
export type Student = Pick<Row<'profiles'>, 'id' | 'full_name'>;
export type Answer = Pick<Row<'answers'>, 'id' | 'submission_id' | 'question_id' | 'score'>;
export type Question = Pick<Row<'questions'>, 'id' | 'activity_id' | 'position' | 'kind' | 'prompt' | 'topic'>;

export type TeacherData = {
  courses: Course[];
  enrollments: Enrollment[];
  students: Student[];
  activities: Activity[];
  submissions: Submission[];
  materials: Material[];
  questions: Question[];
  answers: Answer[];
};

type Ctx = { data: TeacherData | null; error: string | null; reload: () => Promise<void> };

const TeacherDataContext = createContext<Ctx | null>(null);

async function fetchAll(teacherId: string): Promise<TeacherData> {
  const [courses, enrollments, students, activities, submissions, materials, questions, answers] = await Promise.all([
    supabase.from('courses').select('*').eq('teacher_id', teacherId).order('code'),
    supabase.from('enrollments').select('*'),
    supabase.from('profiles').select('id, full_name').eq('role', 'student').order('full_name'),
    supabase.from('activities').select('*').order('due_at', { ascending: false }),
    supabase.from('submissions').select('*'),
    supabase.from('materials').select('*').order('created_at', { ascending: false }),
    supabase.from('questions').select('id, activity_id, position, kind, prompt, topic').order('position'),
    supabase.from('answers').select('id, submission_id, question_id, score'),
  ]);
  const failed = [courses, enrollments, students, activities, submissions, materials, questions, answers].find(r => r.error);
  if (failed?.error) throw failed.error;
  return {
    courses: courses.data!,
    enrollments: enrollments.data!,
    students: students.data!,
    activities: activities.data!,
    submissions: submissions.data!,
    materials: materials.data!,
    questions: questions.data!,
    answers: answers.data!,
  };
}

export function TeacherDataProvider({ teacherId, children }: { teacherId: string; children: ReactNode }) {
  const [data, setData] = useState<TeacherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setData(await fetchAll(teacherId));
      setError(null);
    } catch {
      setError('Não foi possível carregar os dados. Verifique sua conexão.');
    }
  }, [teacherId]);

  useEffect(() => { reload(); }, [reload]);

  return <TeacherDataContext.Provider value={{ data, error, reload }}>{children}</TeacherDataContext.Provider>;
}

export function useTeacherData() {
  const ctx = useContext(TeacherDataContext);
  if (!ctx) throw new Error('useTeacherData must be used inside TeacherDataProvider');
  return ctx;
}
