-- supabase/schema.sql
-- Shop Visibility Board (SVB)
-- Postgres schema + basic constraints
-- NOTE: Run in Supabase SQL editor. Enable RLS after creating tables.

-- 1) Enums
DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('RECEIVED', 'QUOTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identifiers
  job_number text NOT NULL,         -- V-number alignment (e.g., V-101)
  part_number text NOT NULL,        -- Part identifier (e.g., P-9911)
  title text NULL,                  -- Optional display title
  description text NULL,            -- Optional display description

  -- Production
  total_pieces integer NOT NULL CHECK (total_pieces > 0),
  pieces_completed integer NOT NULL DEFAULT 0 CHECK (pieces_completed >= 0),

  -- Status & timeline
  status job_status NOT NULL DEFAULT 'RECEIVED',
  eta_text text NULL,               -- simple human-readable ETA (e.g., "3 days", "1 week")
  date_received date NOT NULL DEFAULT CURRENT_DATE,

  -- Optional
  priority job_priority NULL,
  shop_area text NULL,
  machine text NULL,
  notes text NULL,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique-ish guardrails (tune to your reality)
-- If job_number is globally unique, keep this.
DO $$ BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_job_number_unique UNIQUE (job_number);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ensure completed count never exceeds total
DO $$ BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_completed_lte_total CHECK (pieces_completed <= total_pieces);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3) Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_updated_at ON public.jobs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_date_received ON public.jobs(date_received DESC);

-- 5) Realtime (optional but recommended)
-- In Supabase Dashboard: Database -> Replication -> enable for public.jobs
