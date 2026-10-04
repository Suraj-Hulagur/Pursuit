# Pursuit

Pursuit helps students find scholarships, internships, hackathons and grants they actually qualify for, and then helps them see each application through.

**Live demo:** https://pursuit-web.onrender.com

## The problem

Opportunities are scattered across posters, PDFs, group chats, emails and websites. The eligibility rules sit in the fine print, so students only find out they can't apply after reading the whole thing. And when they can apply, it takes weeks of drafting, follow ups and chasing recommendation letters. Most students either miss the good ones or spend time on ones they were never eligible for.

## What Pursuit does

A student fills in their profile once. Pursuit then:

1. **Reads the opportunity.** Paste a link or the text, and n8n pulls out the title, organisation, deadline, reward, documents needed and every eligibility clause.
2. **Shows its proof.** Each verdict (eligible, not eligible or unclear) quotes the exact clause it relied on. The quotes are checked against the source page, so the student can trust them or check them directly.
3. **Picks the few worth the time.** The dashboard shows the top 3 for the week, a deadline calendar and what is closing soon.
4. **Runs the application.** For each opportunity the student takes up, a campaign tracks every step: drafted, approved, sent, follow up due, recommendation requested.
5. **Waits for approval.** Every draft goes to an approvals queue, where the student approves, edits or skips it. Nothing is sent without their yes.

## Current progress

So far we have the intake step working end to end. You paste a link or some text into the dashboard, the app sends it to our n8n workflow, Gemini pulls out the details, and every eligibility clause it quotes is checked against the original page. We tried it on the Chevening scholarship page: it found 14 clauses and all 14 matched the page exactly. One run takes about 9 seconds.

The rest of the web app is built too: login, onboarding, dashboard, opportunity list and detail pages, campaigns, approvals, sources and profile. These pages run on made up sample data for now, since there is no database yet. Every organisation, clause and date in `web/src/lib/data/seed.ts` is fictional, and the app labels it as sample data.

## Future plan

During the 24 hours we want to build:

- a database, so opportunities, matches and campaigns are saved
- a scanner that checks sources every few hours for new opportunities
- a matcher that compares each opportunity with the student's profile
- the campaign runner that drafts emails, follows up and asks for recommendation letters
- approvals and reminders over Gmail
- a Source Doctor that fixes a source when its page layout changes
- a chat assistant for quick questions and changes

## How it fits together

```
 Browser
    │
    ▼
 Next.js app (Render)          pages + server actions, no agent logic
    │  calls webhook
    ▼
 n8n Cloud                     all the agent work happens here
    │  Intake: fetch page → clean text → Gemini extracts → verify quotes
    ▼
 Gemini Flash                  used only from inside n8n
```

The web app never talks to Gemini directly. The Gemini key is stored as a credential in n8n, and the app only knows the n8n webhook URL, which is kept on the server and never sent to the browser.

At the hackathon we plan to add a database, so n8n can save opportunities, matches and campaign state and the web app can read them back.

## Tech stack

- **Web:** Next.js, TypeScript, Tailwind CSS
- **Agent workflows:** n8n Cloud
- **AI:** Google Gemini 2.5 Flash, called from n8n
- **Data:** in memory sample data for now
- **Hosting:** Render for the web app

## Repo layout

```
web/         Next.js app
workflows/   n8n workflows exported as JSON
db/          draft database schema for later
render.yaml  Render deploy config
```

## Run it locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 and sign in with any name and email. The app starts in mock mode, so nothing else is needed. Sample data lives in server memory and resets when the server restarts.

To use the real intake workflow, copy `web/.env.example` to `web/.env.local` and set `N8N_INTAKE_WEBHOOK` to the workflow's production webhook URL. Without it, "Check it" will not reach n8n.

### Import the n8n workflow

1. In n8n, import `workflows/pursuit-intake.json`.
2. Add a Google Gemini credential and select it on the Gemini Flash node.
3. Set a webhook path of choice on the Intake Webhook node (the export has a placeholder).
4. Activate the workflow and copy its production URL into `web/.env.local`.

## Deploy

The web app deploys to Render from `render.yaml`.

1. On render.com, choose New → Blueprint and pick this repo.
2. Enter `N8N_INTAKE_WEBHOOK` when Render asks for it. It is stored in Render, not in the repo.
3. Deploy. Later pushes to `main` redeploy automatically.

On the free plan the app sleeps after about 15 minutes without visitors, so the first load can take up to a minute. Intake checks are limited to 10 per user per hour so a public demo can't use up the Gemini quota.

## Team

| Name           | GitHub                                             | Email                  |
| -------------- | -------------------------------------------------- | ---------------------- |
| Suraj Hulagur  | [@Suraj-Hulagur](https://github.com/Suraj-Hulagur) | hulagursuraj@gmail.com |
| Rithya Jayaram | [@riti2043](https://github.com/riti2043)           | rithya2043@gmail.com   |
