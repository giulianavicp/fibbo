export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<R, I = Partial<R>> = { Row: R; Insert: I; Update: Partial<R>; Relationships: [] };

type ActivityKind = 'atividade' | 'prova';
type QuestionKind = 'objective' | 'essay';
type UserRole = 'student' | 'teacher';

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.18' };
  public: {
    Tables: {
      activities: Table<
        { id: string; course_id: string; title: string; kind: ActivityKind; due_at: string | null; published: boolean; created_at: string },
        { course_id: string; title: string; kind?: ActivityKind; due_at?: string | null; published?: boolean }
      >;
      answer_key_files: Table<
        { activity_id: string; name: string; path: string; content_type: string; size_bytes: number; uploaded_at: string },
        { activity_id: string; name: string; path: string; content_type: string; size_bytes: number }
      >;
      answers: Table<
        { id: string; submission_id: string; question_id: string; response: string; score: number | null; matched_keywords: string[]; overridden: boolean },
        { submission_id: string; question_id: string; response?: string }
      >;
      audit_log: Table<{ id: number; actor_id: string | null; action: string; entity: string; entity_id: string | null; details: Json | null; created_at: string }>;
      conversations: Table<
        { id: string; student_id: string; course_id: string | null; activity_id: string | null; title: string; created_at: string; updated_at: string }
      >;
      chat_messages: Table<{ id: number; conversation_id: string; role: 'user' | 'assistant'; content: string; sources: Json; created_at: string }>;
      courses: Table<
        { id: string; code: string; name: string; unit: string | null; topics: string[]; teacher_id: string; join_code: string; created_at: string },
        { code: string; name: string; teacher_id: string; unit?: string | null; topics?: string[] }
      >;
      enrollments: Table<{ course_id: string; student_id: string; created_at: string }, { course_id: string; student_id: string }>;
      journal_entries: Table<
        { id: string; student_id: string; prompt: string; content: string; created_at: string },
        { prompt: string; content: string }
      >;
      login_attempts: Table<{ id: number; email: string; success: boolean; attempted_at: string }>;
      materials: Table<
        { id: string; course_id: string; name: string; path: string; size_bytes: number; created_at: string; status: 'pending' | 'processing' | 'ready' | 'error'; chunk_count: number },
        { course_id: string; name: string; path: string; size_bytes: number }
      >;
      profiles: Table<{ id: string; full_name: string; role: UserRole; unit: string | null; consent_at: string; created_at: string }>;
      question_keys: Table<{ question_id: string; correct_option: string | null; keywords: string[] }>;
      questions: Table<{ id: string; activity_id: string; position: number; kind: QuestionKind; prompt: string; topic: string | null; options: Json | null; weight: number }>;
      submissions: Table<
        { id: string; activity_id: string; student_id: string; submitted_at: string; grade: number | null; reviewed: boolean },
        { activity_id: string; student_id: string }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      create_activity: { Args: { course: string; title: string; kind: ActivityKind; due_at: string; questions: Json }; Returns: string };
      join_course: { Args: { code: string }; Returns: string };
      submit_activity: { Args: { activity: string; responses: Json }; Returns: string };
      review_answer: { Args: { answer: string; new_score: number }; Returns: number };
      mark_reviewed: { Args: { submission: string }; Returns: undefined };
      submission_feedback: {
        Args: { submission: string };
        Returns: { question_id: string; pos: number; kind: QuestionKind; prompt: string; topic: string | null; options: Json | null; response: string; score: number | null; matched_keywords: string[]; correct_option: string | null; keywords: string[] }[];
      };
      leaderboard: { Args: Record<string, never>; Returns: { display_name: string; xp: number; is_me: boolean }[] };
      top_questions: { Args: { course: string }; Returns: { question: string; asked_at: string }[] };
      reset_demo: { Args: Record<string, never>; Returns: undefined };
      am_i_demo_teacher: { Args: Record<string, never>; Returns: boolean };
      login_status: { Args: { email: string }; Returns: Json };
      record_login_attempt: { Args: { email: string; success: boolean }; Returns: Json };
    };
    Enums: { activity_kind: ActivityKind; question_kind: QuestionKind; user_role: UserRole };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
