-- Assign path_tag values so courses appear in the correct sidebar sections:
--   Fast Start  → Welcome to HCMG (orientation) + Compensation & EPO
--   Harry's Playbook → Harry's Playbook course
UPDATE uni_courses SET path_tag = 'fast_start'      WHERE slug = 'new-team-member-orientation';
UPDATE uni_courses SET path_tag = 'fast_start'      WHERE slug = 'lo-compensation-epo';
UPDATE uni_courses SET path_tag = 'harrys_playbook' WHERE slug = 'harrys-playbook';
