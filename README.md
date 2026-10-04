# Pursuit: your talent agent

Students miss the scholarships, internships, hackathons and grants they qualify for. Usually it isn't for lack of merit. Finding them, checking eligibility and keeping up with applications takes hours they don't have.

**Pursuit works like a talent agent.** It finds opportunities, **proves you're eligible by quoting the exact clause**, picks the **top 3 that fit your calendar this week**, and then **runs each application over weeks**: drafting, following up and asking for recommendations. **Nothing is sent without your approval.**

## What it does

| Stage | What Pursuit does |
| --- | --- |
| **Intake** | Pulls opportunities from forwarded emails and scheduled scans of listing sites. |
| **Eligibility** | Reads the fine print and returns *eligible*, *not eligible* or *unclear*, quoting the clause it relied on. |
| **Ranking** | Scores effort vs reward and checks your calendar to pick the 3 worth your week. |
| **Campaign runner** | Plans each application: found → verified → drafted → approved → sent → follow-up → recommendation. |
| **Pre-submission referee** | Checks every draft against the requirements before it reaches you for approval. |
| **Approval** | You approve, edit or skip each step in the web app or by replying in Gmail. |

## Architecture

```
            ┌──────────────────────────────┐
  Gmail ───▶│          n8n cloud           │◀─── scheduled scans
 (forwards, │        (the brain)           │
  approvals)│  intake · eligibility ·      │
            │  ranking · campaign runner · │
            │  pre-submission referee      │
            └──────┬───────────────▲───────┘
                   │ writes        │ webhooks (approve / edit / skip)
                   ▼               │
            ┌────────────┐   ┌─────┴──────────┐
            │  Supabase  │──▶│  Next.js /web  │
            │ (database) │   │  thin UI only  │
            └────────────┘   └────────────────┘
```

- **n8n cloud holds all agent logic.** Exported workflows are versioned in `/workflows`.
- **`/web`** is a Next.js + TypeScript + Tailwind app that only reads data and calls n8n webhooks. It has no business logic.
- **Supabase** stores opportunities, verdicts and campaign state. Schema goes in `/db` (coming soon; the UI uses local dummy data for now).
- **Gmail** is the second channel for forwarding opportunities and approving steps.

## Repo layout

```
/web        Next.js UI (dashboard + campaign timeline)
/workflows  Exported n8n workflow JSON
/db         Supabase schema.sql + seed.sql
```

## Running the UI

```bash
cd web
npm install
npm run dev
# open http://localhost:3000
```

The app starts in **mock mode** by default, so no setup is needed. Sign in with any name and email. Data is fictional and kept in server memory, so it resets when the dev server restarts. Profile edits, save/skip, answering questions and approvals all work within the session.

To change settings, copy `web/.env.example` to `web/.env.local`. If the n8n webhook URLs are empty, decisions are stored but not forwarded.

### Switch to Supabase

1. Run `db/schema.sql`, then `db/seed.sql`, in the Supabase SQL editor.
2. Set `NEXT_PUBLIC_DATA_MODE=supabase` along with the Supabase keys below.
3. After signing up, give your account the sample data with `select public.seed_demo_for_user('<your auth user id>');`.

### Set up Supabase auth (email + password, supabase mode)

1. Create a project at [supabase.com](https://supabase.com).
2. **Settings → API**: copy the Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Authentication → URL Configuration**: set Site URL to `http://localhost:3000` and add the redirect URL `http://localhost:3000/auth/callback`.
4. **Authentication → Providers → Email** is on by default. Turn off "Confirm email" if you want to skip the confirmation step while testing.
5. Restart `npm run dev` and create an account at `/login`.

**Google sign-in (later):**
1. Create an OAuth client in Google Cloud with the redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Enable the Google provider in Supabase.
3. Set `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`.

> The opportunity data in `web/src/data/opportunities.json` is **fictional sample data**. Every organisation, clause, prize and date is invented. The UI marks it with a "Sample data" chip.

## Team

| Name | Role | Contact |
| --- | --- | --- |
| _[Name]_ | _[Role, e.g. n8n workflows]_ | _[GitHub / email]_ |
| _[Name]_ | _[Role, e.g. Web UI]_ | _[GitHub / email]_ |
| _[Name]_ | _[Role, e.g. Data & Supabase]_ | _[GitHub / email]_ |
| _[Name]_ | _[Role, e.g. Product & pitch]_ | _[GitHub / email]_ |
