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
/db         Supabase schema & migrations
```

## Running the UI

```bash
cd web
npm install
npm run dev
# open http://localhost:3000
```

To send approvals to n8n, create `web/.env.local`:

```
NEXT_PUBLIC_N8N_APPROVAL_WEBHOOK=https://<your-instance>.app.n8n.cloud/webhook/<id>
```

Without it, the app runs in demo mode.

> The opportunity data in `web/src/data/opportunities.json` is illustrative. Program names are real, but clauses, dates and amounts are paraphrased, not official.

## Team

| Name | Role | Contact |
| --- | --- | --- |
| _[Name]_ | _[Role, e.g. n8n workflows]_ | _[GitHub / email]_ |
| _[Name]_ | _[Role, e.g. Web UI]_ | _[GitHub / email]_ |
| _[Name]_ | _[Role, e.g. Data & Supabase]_ | _[GitHub / email]_ |
| _[Name]_ | _[Role, e.g. Product & pitch]_ | _[GitHub / email]_ |
