-- Add PAUSED to job_status enum before seeding data that uses it.
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'PAUSED';
