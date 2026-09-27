-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile
-- Feedbacks table for user suggestions, bug reports, and reviews
-- Migration: 20260405000000_create_feedbacks.sql

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('suggestion', 'bug', 'general')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  page_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed'))
);

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Indexes for performance and sorting
CREATE INDEX IF NOT EXISTS feedbacks_user_id_idx ON public.feedbacks(user_id);
CREATE INDEX IF NOT EXISTS feedbacks_created_at_idx ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS feedbacks_category_idx ON public.feedbacks(category);
CREATE INDEX IF NOT EXISTS feedbacks_status_idx ON public.feedbacks(status);

-- RLS Policies
-- Allow anyone (authenticated or guest) to insert feedback
CREATE POLICY "Anyone can submit feedback"
ON public.feedbacks
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to view their own feedback history
CREATE POLICY "Users can view own feedback"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
