-- supabase/seed.sql
-- Seed data for Shop Visibility Board (SVB)
-- Safe to run in development / staging

INSERT INTO public.jobs (
  job_number,
  part_number,
  total_pieces,
  pieces_completed,
  status,
  eta_text,
  priority,
  shop_area,
  machine,
  notes,
  date_received
) VALUES
(
  'V-101',
  'P-9911',
  100,
  42,
  'IN_PROGRESS',
  '2 days',
  'HIGH',
  'CNC',
  'Haas VF-2',
  'Primary production run',
  CURRENT_DATE - INTERVAL '3 days'
),
(
  'V-102',
  'P-2211',
  50,
  0,
  'QUOTED',
  '5 days',
  'MEDIUM',
  'Manual',
  NULL,
  'Awaiting material confirmation',
  CURRENT_DATE - INTERVAL '2 days'
),
(
  'V-103',
  'P-8823',
  25,
  0,
  'RECEIVED',
  NULL,
  'LOW',
  'Assembly',
  NULL,
  'New triple-signed drawing received',
  CURRENT_DATE - INTERVAL '1 day'
);
