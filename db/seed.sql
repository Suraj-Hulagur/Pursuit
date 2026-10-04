-- Pursuit: FICTIONAL seed data for Supabase.
-- Generated from web/src/lib/data/seed.ts so mock mode and Supabase match.
-- Every source, organisation, program, clause, prize and date is invented.
--
-- Run after schema.sql, as the postgres/service role (SQL editor). Then give a
-- signed-up user the sample matches and campaigns with:
--   select public.seed_demo_for_user('<auth user uuid>');

-- shared sources (owner_id null)
insert into public.sources (id, name, kind, url) values
  ('src-gmail', 'Your Gmail forwards', 'gmail', null),
  ('src-campus', 'Campus Notices (sample feed)', 'web', 'https://example.org/notices'),
  ('src-opencalls', 'Open Calls Weekly (sample newsletter)', 'web', 'https://example.com/open-calls'),
  ('src-finder', 'Fellowship Finder (sample directory)', 'web', 'https://example.net/fellowships')
on conflict (id) do nothing;

-- catalogue
insert into public.opportunities (id, source_id, title, org, type, deadline, reward, reward_score, effort_hours, effort_score) values
  ('open-circuit-hack', 'src-gmail', 'Open Circuit Hackathon 2026', 'Open Circuit Collective', 'hackathon', '2026-10-09', '₹75,000 prize pool', 4, 10, 3),
  ('tidewater-internship', 'src-opencalls', 'Tidewater Labs Summer Internship', 'Tidewater Labs', 'internship', '2026-10-14', '8 weeks, ₹30,000/month stipend', 5, 6, 2),
  ('lantern-microgrant', 'src-opencalls', 'Lantern Open Source Microgrant', 'Lantern Fund', 'grant', '2026-10-20', 'Up to ₹1,50,000 for an open source project', 4, 8, 3),
  ('kestrel-merit', 'src-gmail', 'Kestrel Foundation Merit Scholarship', 'Kestrel Foundation', 'scholarship', '2026-10-31', '₹40,000 per year', 3, 3, 1),
  ('saffron-need', 'src-campus', 'Saffron Trust Need-Based Scholarship', 'Saffron Education Trust', 'scholarship', '2026-11-10', 'Full tuition for one year', 5, 4, 2),
  ('northstar-fellowship', 'src-finder', 'Northstar Institute Research Fellowship', 'Northstar Institute', 'internship', '2026-11-30', '10-week lab placement + stipend', 5, 9, 4),
  ('meridian-first-year', 'src-gmail', 'Meridian First-Year Scholarship', 'Meridian Foundation', 'scholarship', '2026-10-12', '₹60,000 one-time', 4, 4, 2),
  ('coral-science-award', 'src-campus', 'Coral Science Talent Award', 'Coral Science Society', 'scholarship', '2026-11-15', '₹50,000 per year', 4, 3, 1)
on conflict (id) do nothing;

-- per-user sample matches, campaigns and timeline events
create or replace function public.seed_demo_for_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid;
begin
  insert into public.matches (user_id, opportunity_id, verdict, clause, clause_source, missing, reasoning, rank, fit, status, questions) values
    (p_user, 'open-circuit-hack', 'eligible', 'Teams of 2 to 4 members, each enrolled full-time in an undergraduate programme at a recognised college in India.', 'Open Circuit Rules, §2 Teams', '{}'::text[], 'Any full-time undergraduate team of 2–4 qualifies. No other conditions.', 1, 'Idea submission fits Saturday''s 7 free hours.', 'new', '[]'::jsonb),
    (p_user, 'tidewater-internship', 'eligible', 'Open to students in the 2nd or 3rd year of a B.E./B.Tech programme in Computer Science, IT or Electronics.', 'Tidewater Careers, Internship eligibility', '{}'::text[], 'Year and branch match the clause exactly.', 2, 'Application already sent; one follow-up fits Wednesday evening.', 'saved', '[]'::jsonb),
    (p_user, 'lantern-microgrant', 'eligible', 'Individuals based in India maintaining a public project under an OSI-approved licence. Applications must include one endorsement from a mentor or maintainer.', 'Lantern Fund FAQ, Who can apply', array['Mentor endorsement (requested, not received yet)']::text[], 'Eligibility is met. The application can''t be submitted until the endorsement arrives.', 3, 'Proposal review on Sunday.', 'new', '[]'::jsonb),
    (p_user, 'kestrel-merit', 'unclear', 'Applicants must demonstrate a consistently strong academic record throughout their degree.', 'Kestrel Scholarship Notice, Eligibility (1)', array['The clause never defines ''consistently strong'' (no CGPA cutoff)', 'CGPA not in your profile yet']::text[], 'The rule is subjective. Worth emailing the foundation to ask for the cutoff.', null, null, 'new', '[{"id":"q-cgpa","question":"What is your current CGPA (out of 10)?","answer":null}]'::jsonb),
    (p_user, 'saffron-need', 'unclear', 'Annual family income from all sources must be below ₹3,00,000, supported by an income certificate issued in the last 12 months.', 'Saffron Trust Guidelines, §3 Income', array['Family income not in your profile', 'Income certificate not marked as on hand']::text[], 'Can''t confirm until income details are known.', null, null, 'new', '[{"id":"q-income","question":"Roughly what is your annual family income?","answer":null},{"id":"q-cert","question":"Do you have an income certificate issued in the last 12 months?","answer":null}]'::jsonb),
    (p_user, 'northstar-fellowship', 'unclear', 'Undergraduates in any year may apply. Preference will be given to candidates with prior research experience or a publication.', 'Northstar Fellowship Call, Selection', array['No research experience listed in your profile']::text[], 'Anyone can apply, but your chances depend on research experience.', null, null, 'new', '[{"id":"q-research","question":"Have you done any research work (projects, papers, lab assistance)?","answer":null}]'::jsonb),
    (p_user, 'meridian-first-year', 'not_eligible', 'Applicants must be enrolled in the first year of a full-time undergraduate degree at the time of application.', 'Meridian Scholarship Rules, Eligibility (a)', array['Only first-year students qualify']::text[], 'A hard exclusion: the sample profile is past first year.', null, null, 'new', '[]'::jsonb),
    (p_user, 'coral-science-award', 'not_eligible', 'Open only to students pursuing B.Sc. or integrated M.Sc. programmes in the natural sciences. Engineering and professional courses are excluded.', 'Coral Award Guidelines, §4', array['Engineering courses are excluded']::text[], 'A B.E./B.Tech programme falls under the excluded category.', null, null, 'new', '[]'::jsonb)
  on conflict (user_id, opportunity_id) do nothing;

  insert into public.campaigns (user_id, opportunity_id, state_label)
  values (p_user, 'open-circuit-hack', 'Drafted · awaiting your approval')
  on conflict (user_id, opportunity_id) do update set state_label = excluded.state_label
  returning id into v_campaign;

  insert into public.campaign_events (campaign_id, user_id, position, kind, status, at_label, title, detail, draft) values
    (v_campaign, p_user, 1, 'found', 'done', 'Oct 2, 09:14', 'Found', 'Read from a forwarded email.', null),
    (v_campaign, p_user, 2, 'verified', 'done', 'Oct 2, 09:15', 'Eligibility verified', 'Matched §2 Teams. Team size and enrolment confirmed.', null),
    (v_campaign, p_user, 3, 'drafted', 'done', 'Oct 3, 18:40', 'Idea submission drafted', 'Problem, approach and impact sections.', null),
    (v_campaign, p_user, 4, 'approved', 'pending', 'Waiting on you', 'Approve submission', 'The pre-submission referee found no problems. Approve to submit before Oct 9.', 'Title: [Project name]

Problem: [One-line problem statement]

Approach: [How the team will solve it]

Impact: [Who benefits and how]

Team: [Your name], [Teammate], [Teammate] — [College]'),
    (v_campaign, p_user, 5, 'sent', 'upcoming', 'By Oct 9', 'Submitted', 'Submitted on the hackathon portal.', null),
    (v_campaign, p_user, 6, 'follow_up', 'upcoming', 'Oct 16', 'Follow up due', 'Check shortlist results and nudge organisers if nothing is posted.', null),
    (v_campaign, p_user, 7, 'recommendation', 'upcoming', '—', 'Recommendation requested', 'Not required for this opportunity.', null)
  on conflict (campaign_id, kind) do nothing;

  insert into public.campaigns (user_id, opportunity_id, state_label)
  values (p_user, 'tidewater-internship', 'Follow up due Thu')
  on conflict (user_id, opportunity_id) do update set state_label = excluded.state_label
  returning id into v_campaign;

  insert into public.campaign_events (campaign_id, user_id, position, kind, status, at_label, title, detail, draft) values
    (v_campaign, p_user, 1, 'found', 'done', 'Sep 30, 21:02', 'Found', 'Found in a sample newsletter.', null),
    (v_campaign, p_user, 2, 'verified', 'done', 'Sep 30, 21:03', 'Eligibility verified', 'Year and branch match.', null),
    (v_campaign, p_user, 3, 'drafted', 'done', 'Oct 1, 10:20', 'Application drafted', 'Cover note and resume link prepared.', null),
    (v_campaign, p_user, 4, 'approved', 'done', 'Oct 1, 19:05', 'Approved', 'Approved by Gmail reply.', null),
    (v_campaign, p_user, 5, 'sent', 'done', 'Oct 1, 19:06', 'Sent', 'Application submitted. Confirmation email received.', null),
    (v_campaign, p_user, 6, 'follow_up', 'pending', 'Due Thu', 'Follow up due', 'No response after a week. A short, polite check-in is drafted.', 'Hi [Recruiter name],

I applied for the Tidewater Labs Summer Internship on Oct 1 and wanted to check whether you need anything else from me. I''m happy to share more about my projects.

Thanks,
[Your name]'),
    (v_campaign, p_user, 7, 'recommendation', 'upcoming', '—', 'Recommendation requested', 'Only needed if shortlisted.', null)
  on conflict (campaign_id, kind) do nothing;

  insert into public.campaigns (user_id, opportunity_id, state_label)
  values (p_user, 'lantern-microgrant', 'Proposal drafted · awaiting your approval')
  on conflict (user_id, opportunity_id) do update set state_label = excluded.state_label
  returning id into v_campaign;

  insert into public.campaign_events (campaign_id, user_id, position, kind, status, at_label, title, detail, draft) values
    (v_campaign, p_user, 1, 'found', 'done', 'Oct 3, 07:30', 'Found', 'Matched an open source project to the open grants call.', null),
    (v_campaign, p_user, 2, 'verified', 'done', 'Oct 3, 07:31', 'Eligibility verified', 'OSI-approved licence and India-based. Endorsement still needed.', null),
    (v_campaign, p_user, 3, 'drafted', 'pending', 'Waiting on you', 'Proposal drafted', 'Review the summary and budget before it goes to the referee.', '[Project name] is an open source tool for [purpose], released under [licence]. A grant of ₹[amount] would fund [months] months of work on:
1. [Milestone one]
2. [Milestone two]
3. [Milestone three]'),
    (v_campaign, p_user, 4, 'approved', 'upcoming', '—', 'Approve proposal', 'Final approval after the pre-submission referee check.', null),
    (v_campaign, p_user, 5, 'sent', 'upcoming', 'By Oct 20', 'Submitted', 'Submit through the grant form.', null),
    (v_campaign, p_user, 6, 'follow_up', 'upcoming', 'Nov 3', 'Follow up due', 'Status check if there''s no reply in 2 weeks.', null),
    (v_campaign, p_user, 7, 'recommendation', 'pending', 'Waiting on you', 'Recommendation requested', 'Ask your mentor for the required endorsement.', 'Dear [Mentor],

I''m applying for the Lantern Open Source Microgrant for [Project name]. The application needs a short endorsement (3–4 lines) from a mentor. Could you write one by Oct 17? I''ve attached the proposal summary.

Thank you,
[Your name]')
  on conflict (campaign_id, kind) do nothing;

end $$;

revoke execute on function public.seed_demo_for_user(uuid) from public, anon, authenticated;
