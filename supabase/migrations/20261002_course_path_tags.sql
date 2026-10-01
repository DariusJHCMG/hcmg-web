-- Assign path_tag values so courses appear in the correct sidebar sections:
--   New LO Fast Start (key: 'start') → Welcome to HCMG U + Orientation + Compensation & EPO
--   Harry's Playbook  (key: 'harrys_playbook') → Harry's Playbook course
UPDATE uni_courses SET path_tag = 'start'           WHERE slug = 'welcome-to-hcmg-u';
UPDATE uni_courses SET path_tag = 'start'           WHERE slug = 'new-team-member-orientation';
UPDATE uni_courses SET path_tag = 'start'           WHERE slug = 'lo-compensation-epo';
UPDATE uni_courses SET path_tag = 'harrys_playbook' WHERE slug = 'harrys-playbook';
