-- Mock data for trial use.
-- IMPORTANT: Replace the UUID placeholders with real auth.users IDs before running.
-- 1) Create auth users in Supabase Auth (admin + teachers).
-- 2) Copy their auth.user IDs and paste below.

-- Replace these placeholders:
-- ADMIN_AUTH_ID
-- TEACHER_P1_AUTH_ID
-- TEACHER_P4_AUTH_ID
-- TEACHER_KG_AUTH_ID

-- Insert users (must match auth.users IDs)
insert into users (id, name, email, role, class_id)
values
  ('d2b20c04-c139-4291-9215-edf3bb34d187', 'EJr-DEVs', 'elvis.admin@hillview.com', 'admin', null),
  ('c847c28b-c91e-4447-8f5d-c3fbe6e5ddd4', 'Namakula Enid', 'enid.teacher@hillview.com', 'teacher',
    (select id from classes where name = 'P1' limit 1)),
  ('6f64cab9-a73a-4704-89e6-9adf82bfe28b', 'Mirembe Shayla', 'sheillah.teacher@hillview.com', 'teacher',
    (select id from classes where name = 'P4' limit 1)),
  ('8f3565ec-48d8-4a07-a66b-563ae3aec6ec', 'Luyobya Vicent', 'vicent.teacher@hillview.com', 'teacher',
    (select id from classes where name = 'KG-Bronze' limit 1))
on conflict do nothing;

-- Insert pupils
insert into pupils (name, class_id) values
  ('Amina Nakato', (select id from classes where name = 'P1' limit 1)),
  ('Brian Okello', (select id from classes where name = 'P1' limit 1)),
  ('Catherine Akello', (select id from classes where name = 'P1' limit 1)),
  ('David Kato', (select id from classes where name = 'P4' limit 1)),
  ('Esther Nansubuga', (select id from classes where name = 'P4' limit 1)),
  ('Francis Mugisha', (select id from classes where name = 'P4' limit 1)),
  ('Grace Namusoke', (select id from classes where name = 'KG-Bronze' limit 1)),
  ('Hassan Tumwebaze', (select id from classes where name = 'KG-Bronze' limit 1))
on conflict do nothing;

-- Insert marks for P1 (uses TEACHER_P1_AUTH_ID)
insert into marks (pupil_id, subject_id, score, teacher_id)
select p.id, s.id, v.score, 'c847c28b-c91e-4447-8f5d-c3fbe6e5ddd4'
from (
  values
    ('Amina Nakato', 'English', 78),
    ('Amina Nakato', 'Mathematics', 84),
    ('Amina Nakato', 'Science', 71),
    ('Amina Nakato', 'Social Studies', 75),
    ('Amina Nakato', 'Literacy I A', 81),
    ('Amina Nakato', 'Literacy I B', 79),
    ('Amina Nakato', 'Literacy II (Reading)', 83),

    ('Brian Okello', 'English', 62),
    ('Brian Okello', 'Mathematics', 58),
    ('Brian Okello', 'Science', 65),
    ('Brian Okello', 'Social Studies', 60),
    ('Brian Okello', 'Literacy I A', 64),
    ('Brian Okello', 'Literacy I B', 66),
    ('Brian Okello', 'Literacy II (Reading)', 59),

    ('Catherine Akello', 'English', 90),
    ('Catherine Akello', 'Mathematics', 88),
    ('Catherine Akello', 'Science', 92),
    ('Catherine Akello', 'Social Studies', 85),
    ('Catherine Akello', 'Literacy I A', 91),
    ('Catherine Akello', 'Literacy I B', 87),
    ('Catherine Akello', 'Literacy II (Reading)', 89)
) as v(pupil_name, subject_name, score)
join pupils p on p.name = v.pupil_name
join classes c on c.id = p.class_id and c.name = 'P1'
join subjects s on s.name = v.subject_name and s.level = 'p1-p3'
on conflict (pupil_id, subject_id) do update set score = excluded.score;

-- Insert marks for P4 (uses TEACHER_P4_AUTH_ID)
insert into marks (pupil_id, subject_id, score, teacher_id)
select p.id, s.id, v.score, '6f64cab9-a73a-4704-89e6-9adf82bfe28b'
from (
  values
    ('David Kato', 'English', 73),
    ('David Kato', 'Mathematics', 69),
    ('David Kato', 'Science', 75),
    ('David Kato', 'Social Studies', 71),

    ('Esther Nansubuga', 'English', 88),
    ('Esther Nansubuga', 'Mathematics', 91),
    ('Esther Nansubuga', 'Science', 86),
    ('Esther Nansubuga', 'Social Studies', 84),

    ('Francis Mugisha', 'English', 55),
    ('Francis Mugisha', 'Mathematics', 60),
    ('Francis Mugisha', 'Science', 58),
    ('Francis Mugisha', 'Social Studies', 52)
) as v(pupil_name, subject_name, score)
join pupils p on p.name = v.pupil_name
join classes c on c.id = p.class_id and c.name = 'P4'
join subjects s on s.name = v.subject_name and s.level = 'p4-p7'
on conflict (pupil_id, subject_id) do update set score = excluded.score;

-- Insert marks for KG-Bronze (uses TEACHER_KG_AUTH_ID)
insert into marks (pupil_id, subject_id, score, teacher_id)
select p.id, s.id, v.score, '8f3565ec-48d8-4a07-a66b-563ae3aec6ec'
from (
  values
    ('Grace Namusoke', 'Literacy (Early Language)', 85),
    ('Grace Namusoke', 'Numeracy', 88),
    ('Grace Namusoke', 'Motor Skills', 90),
    ('Grace Namusoke', 'Social Development', 82),

    ('Hassan Tumwebaze', 'Literacy (Early Language)', 60),
    ('Hassan Tumwebaze', 'Numeracy', 58),
    ('Hassan Tumwebaze', 'Motor Skills', 62),
    ('Hassan Tumwebaze', 'Social Development', 55)
) as v(pupil_name, subject_name, score)
join pupils p on p.name = v.pupil_name
join classes c on c.id = p.class_id and c.name = 'KG-Bronze'
join subjects s on s.name = v.subject_name and s.level = 'nursery'
on conflict (pupil_id, subject_id) do update set score = excluded.score;
