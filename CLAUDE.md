# Pursuit

Pursuit is an opportunity campaign agent for students, pitched as **"your talent agent"**. It:

1. **Finds** opportunities: scholarships, internships, hackathons, grants.
2. **Proves eligibility** by quoting the exact clause from the source that makes the student eligible, not eligible, or unclear.
3. **Ranks the top 3** against the student's calendar (free hours, clashes, deadlines).
4. **Runs each application over weeks**: drafts, follow-ups, recommendation requests, with **human approval before anything is sent**.

## Architecture rules

- **n8n cloud is the brain and holds ALL agent logic**: intake, eligibility, ranking, campaign runner, pre-submission referee. If something makes a decision, it lives in n8n.
- **`/web` (Next.js) is a thin UI.** It only reads data and calls n8n webhooks. **No business logic in the web app**: no eligibility checks, no ranking, no deciding the next campaign step. It shows what n8n produced and passes the human's Approve / Edit / Skip on to n8n.
- **Supabase** will be the database (not added yet). Until then `/web` reads `web/src/data/opportunities.json` through `web/src/lib/data.ts`. Keep all reads behind that module so swapping in Supabase is a single-file change.
- **Gmail** is the second channel: students forward opportunities to it and approve steps by replying.
- **No Telegram or WhatsApp.**

## Folders

- `/web`: Next.js (App Router) + TypeScript + Tailwind v4 UI
- `/workflows`: exported n8n workflow JSON (source of truth for agent logic lives in n8n cloud; export here to version it)
- `/db`: Supabase schema and migrations (to come)

## Web app notes

- Next.js 16: route `params` is a Promise. See `web/AGENTS.md`, and check `web/node_modules/next/dist/docs/` before using unfamiliar APIs.
- Webhook calls go through `web/src/lib/n8n.ts`. Set `NEXT_PUBLIC_N8N_APPROVAL_WEBHOOK` in `web/.env.local`. Without it, the UI runs in demo mode and changes only show locally.
- Design tokens (paper, ink, signal, verdict colours) live in `web/src/app/globals.css`.
- Run: `cd web && npm run dev` → http://localhost:3000
