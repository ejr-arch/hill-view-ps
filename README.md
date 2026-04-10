# School Report Management System

Full-stack system for Nursery and Primary report management with automatic role detection and strict Row Level Security.

## Stack
- Next.js (App Router)
- Supabase (Postgres + Auth + RLS)

## Key Behaviors
- Role is derived from the logged-in account (`users.role`).
- Teachers are limited to their assigned class (RLS enforced).
- Admins have full access.
- Marks are entered raw; averages, positions, and UNEB grading are computed automatically.

## Setup
1. Create a Supabase project.
2. Run the schema and seed files:

```sql
-- Run in Supabase SQL editor
\i supabase/schema.sql
\i supabase/seed.sql
```

3. Create auth users in Supabase Auth and insert matching rows in `users`.
   - `users.id` must match `auth.users.id`.
   - Set `role` to `admin` or `teacher`.
   - Set `class_id` for teachers.

4. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

5. Install dependencies and run:

```bash
npm install
npm run dev
```

## Routes
- `/login` Sign in (role derived automatically).
- `/dashboard` Role-aware redirect.
- `/teacher` Teacher dashboard.
- `/admin` Admin dashboard.
- `/reports` Admin report card generation.

## Security
Row Level Security is enabled on all core tables. See `supabase/schema.sql` for policies.

## Reporting
Report cards render as printable HTML and can be exported as PDF via the browser print dialog.
