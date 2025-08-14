-- PMBA Study System Database Schema
-- Execute este script no Supabase SQL Editor

-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE goal_type AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE session_type AS ENUM ('study', 'break', 'long_break');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    study_goal INTEGER DEFAULT 4,
    current_streak INTEGER DEFAULT 0,
    total_study_hours DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    total_questions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    difficulty difficulty_level NOT NULL,
    year INTEGER,
    institution TEXT DEFAULT 'PMBA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE public.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study goals table
CREATE TABLE public.study_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type goal_type NOT NULL,
    target DECIMAL(10,2) NOT NULL,
    current_progress DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User question attempts table
CREATE TABLE public.question_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER, -- in seconds
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id, attempted_at)
);

-- Exams table
CREATE TABLE public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    time_limit INTEGER, -- in minutes
    score DECIMAL(5,2),
    total_time INTEGER, -- time taken in seconds
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Exam questions table
CREATE TABLE public.exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    user_answer INTEGER,
    is_correct BOOLEAN,
    time_spent INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pomodoro sessions table
CREATE TABLE public.pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_type session_type NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Study sessions table
CREATE TABLE public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL, -- in minutes
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subjects (public read access)
CREATE POLICY "Anyone can view subjects" ON public.subjects
    FOR SELECT USING (true);

-- RLS Policies for questions (public read access)
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

-- RLS Policies for flashcards
CREATE POLICY "Users can view own flashcards" ON public.flashcards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards" ON public.flashcards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" ON public.flashcards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards" ON public.flashcards
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for study_goals
CREATE POLICY "Users can view own study goals" ON public.study_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study goals" ON public.study_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study goals" ON public.study_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study goals" ON public.study_goals
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for question_attempts
CREATE POLICY "Users can view own question attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for exams
CREATE POLICY "Users can view own exams" ON public.exams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams" ON public.exams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" ON public.exams
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for exam_questions
CREATE POLICY "Users can view own exam questions" ON public.exam_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own exam questions" ON public.exam_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.user_id = auth.uid()
        )
    );

-- RLS Policies for pomodoro_sessions
CREATE POLICY "Users can view own pomodoro sessions" ON public.pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pomodoro sessions" ON public.pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pomodoro sessions" ON public.pomodoro_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_subject_id ON public.flashcards(subject_id);
CREATE INDEX idx_flashcards_next_review ON public.flashcards(next_review);
CREATE INDEX idx_question_attempts_user_id ON public.question_attempts(user_id);
CREATE INDEX idx_question_attempts_question_id ON public.question_attempts(question_id);
CREATE INDEX idx_exams_user_id ON public.exams(user_id);
CREATE INDEX idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_subject_id ON public.study_sessions(subject_id);
