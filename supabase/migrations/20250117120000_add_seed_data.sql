-- Migration to seed SVB jobs with titles/descriptions, including PAUSED status.
INSERT INTO public.jobs (
  job_number,
  part_number,
  title,
  description,
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
  ('V-101','P-9911','Aluminum bracket','High-tolerance bracket for engine mount',100,42,'IN_PROGRESS','2 days','HIGH','CNC','Haas VF-2','Primary production run',CURRENT_DATE - INTERVAL '3 days'),
  ('V-102','P-2211','Gear housing','Machined housing awaiting material',50,0,'QUOTED','5 days','MEDIUM','Manual',NULL,'Awaiting material confirmation',CURRENT_DATE - INTERVAL '2 days'),
  ('V-103','P-8823','Fixture plate','New fixture plate for assembly line',25,0,'RECEIVED',NULL,'LOW','Assembly',NULL,'New triple-signed drawing received',CURRENT_DATE - INTERVAL '1 day'),
  ('V-104','P-7641','Stainless cover','Cover plate paused pending QA signoff',85,40,'PAUSED','3 days','MEDIUM','CNC','Haas VF-4','Hold for QA inspection results',CURRENT_DATE - INTERVAL '4 days'),
  ('V-105','P-5532','Spacer set','Spacer kit for assembly line B',60,18,'IN_PROGRESS','1 day','LOW','Manual',NULL,'Running 2nd operation',CURRENT_DATE - INTERVAL '2 days'),
  ('V-106','P-3310','Control panel','Electrical panel enclosure',40,40,'COMPLETED','Complete','HIGH','Fabrication',NULL,'Ready for shipment',CURRENT_DATE - INTERVAL '6 days')
ON CONFLICT (job_number) DO NOTHING;
