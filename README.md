# Spec Ed Progress Tracker

A web app for teachers to track students by grade, set custom goals per
student, and log progress toward each goal in 10% increments over time.
Includes an overall-progress dashboard and a per-goal progress chart.

## Stack

- **Next.js 14** (App Router, TypeScript) — UI + API in one app
- **PostgreSQL** via **Prisma**
- **NextAuth.js** (Credentials provider) — each teacher has their own login and
  only sees their own students/goals
- **Recharts** for the dashboard and per-goal charts
- **Tailwind CSS** for styling

## Data model

- `Teacher` — an account (email + hashed password)
- `Student` — belongs to a teacher; has a name and grade
- `Goal` — belongs to a student; a custom goal with a title/description
- `ProgressEntry` — belongs to a goal; a percent-complete snapshot (0–100 in
  steps of 10) recorded at a point in time. A goal's "current progress" is its
  most recent entry.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in a local Postgres connection
   string and a `NEXTAUTH_SECRET` (generate one with `openssl rand -base64 32`).

3. Create the database schema:

   ```bash
   npm run db:migrate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`, register a teacher account, and start
   adding students and goals.

## Deploying to Render

This repo includes a `render.yaml` Blueprint that provisions:

- A free PostgreSQL database
- A web service running the Next.js app, wired to that database

### Steps

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In the Render dashboard, choose **New > Blueprint** and point it at the
   repo. Render will read `render.yaml` and provision the database and web
   service automatically.
3. After the database is created, set the web service's `NEXTAUTH_URL`
   environment variable to the service's public URL (e.g.
   `https://spec-ed-progress-tracker.onrender.com`) — Render leaves this one
   blank (`sync: false`) since it depends on the assigned domain.
4. Deploy. The build step runs `prisma migrate deploy` automatically, so the
   database schema is created/updated on every deploy.
5. Once live, visit the app and register the first teacher account.

If you'd rather set things up manually instead of via the Blueprint:

- Create a PostgreSQL instance in Render and copy its **Internal Connection
  String** into the web service's `DATABASE_URL`.
- Create a Web Service from the repo with:
  - Build command: `npm install && npx prisma migrate deploy && npm run build`
  - Start command: `npm start`
- Add `NEXTAUTH_SECRET` (random string) and `NEXTAUTH_URL` (the service's
  public URL) as environment variables.

## Notes on student data

This app stores student names, grades, and goal information, which may be sensitive (e.g. FERPA-relevant) depending on your school's policies. Each teacher's data is scoped to their own account, but you are responsible for reviewing your school/district's data-handling requirements before using this with real student records.
