insert into classes (name) values
  ('KG-Bronze'),
  ('KG-Silver'),
  ('KG-Gold'),
  ('P1'),
  ('P2'),
  ('P3'),
  ('P4'),
  ('P5'),
  ('P6'),
  ('P7')
on conflict do nothing;

insert into subjects (name, level) values
  ('Literacy (Early Language)', 'nursery'),
  ('Numeracy', 'nursery'),
  ('Motor Skills', 'nursery'),
  ('Social Development', 'nursery'),
  ('English', 'p1-p3'),
  ('Mathematics', 'p1-p3'),
  ('Science', 'p1-p3'),
  ('Social Studies', 'p1-p3'),
  ('Literacy I A', 'p1-p3'),
  ('Literacy I B', 'p1-p3'),
  ('Literacy II (Reading)', 'p1-p3'),
  ('English', 'p4-p7'),
  ('Mathematics', 'p4-p7'),
  ('Science', 'p4-p7'),
  ('Social Studies', 'p4-p7')
on conflict do nothing;
