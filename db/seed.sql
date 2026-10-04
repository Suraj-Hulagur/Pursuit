-- Pursuit: FICTIONAL seed data for Supabase.
-- Generated from web/src/lib/data/seed.ts so mock mode and Supabase match.
-- Every source, organisation, program, clause, prize and date is invented,
-- and URLs use reserved example domains.
--
-- Run after schema.sql, as the postgres/service role (SQL editor). Then give a
-- signed-up user the sample matches, campaigns, sources and activity with:
--   select public.seed_demo_for_user('<auth user uuid>');

-- public sources (owner_id null)
insert into public.sources (id, name, kind, url, status, last_checked_at) values
  ('src-campus', 'Campus Notices', 'web', 'https://example.org/notices', 'healthy', now() - interval '20 minutes'),
  ('src-opencalls', 'Open Calls Weekly', 'web', 'https://example.com/open-calls', 'healthy', now() - interval '20 minutes'),
  ('src-finder', 'Fellowship Finder', 'web', 'https://example.net/fellowships', 'repairing', now() - interval '2 hours'),
  ('src-events', 'Student Events Board', 'web', 'https://example.org/events', 'healthy', now() - interval '20 minutes'),
  ('src-grants', 'Grant Board', 'web', 'https://example.com/grant-board', 'broken', now() - interval '1 day')
on conflict (id) do nothing;

-- catalogue (opportunities found via a user's own source get source_id null here)
insert into public.opportunities (id, source_id, title, org, category, deadline, url, reward, terms, required_documents, effort_hours) values
  ('open-circuit-hack', null, 'Open Circuit Hackathon 2026', 'Open Circuit Collective', 'hackathon', '2026-10-09', 'https://example.org/open-circuit', '₹75,000 prize pool', array['Teams keep ownership of their code', 'Finalists present online']::text[], array['Bonafide certificate']::text[], 10),
  ('tidewater-internship', 'src-opencalls', 'Tidewater Labs Summer Internship', 'Tidewater Labs', 'internship', '2026-10-14', 'https://example.com/tidewater-internship', '8 weeks, ₹30,000/month stipend', array['Remote or on-site', 'Pre-placement interview for top interns']::text[], array['Resume / CV', 'Marksheets']::text[], 6),
  ('lantern-microgrant', 'src-opencalls', 'Lantern Open Source Microgrant', 'Lantern Fund', 'scholarship', '2026-10-20', 'https://example.net/lantern-microgrant', 'Up to ₹1,50,000 for an open source project', array['Paid in two instalments', 'Short public report at the end']::text[], array['Recommendation letter', 'ID proof (Aadhaar etc.)']::text[], 8),
  ('ember-summit', 'src-events', 'Ember Student Builders Summit', 'Ember Collective', 'event', '2026-10-18', 'https://example.org/ember-summit', 'Free pass + travel support', array['Two-day in-person event', 'Travel support for 50 students']::text[], array['Bonafide certificate']::text[], 2),
  ('quillon-debate', 'src-events', 'Quillon Policy Debate Weekend', 'Quillon Forum', 'event', '2026-10-07', 'https://example.com/quillon-debate', 'Certificate + ₹10,000 for the winning team', array['Online preliminary round', 'Finals in person']::text[], array['ID proof (Aadhaar etc.)']::text[], 5),
  ('kestrel-merit', null, 'Kestrel Foundation Merit Scholarship', 'Kestrel Foundation', 'scholarship', '2026-10-31', 'https://example.org/kestrel-scholarship', '₹40,000 per year', array['Renewable each year', 'Must maintain academic standing']::text[], array['Marksheets', 'Bonafide certificate']::text[], 3),
  ('saffron-need', 'src-campus', 'Saffron Trust Need-Based Scholarship', 'Saffron Education Trust', 'scholarship', '2026-11-10', 'https://example.net/saffron-scholarship', 'Full tuition for one year', array['Paid directly to the college', 'Income proof re-checked each year']::text[], array['Income certificate', 'Marksheets', 'ID proof (Aadhaar etc.)']::text[], 4),
  ('northstar-fellowship', 'src-finder', 'Northstar Institute Research Fellowship', 'Northstar Institute', 'internship', '2026-11-30', 'https://example.com/northstar-fellowship', '10-week lab placement + stipend', array['Full-time during the summer break', 'Housing provided']::text[], array['Resume / CV', 'Recommendation letter', 'Marksheets']::text[], 9),
  ('meridian-first-year', null, 'Meridian First-Year Scholarship', 'Meridian Foundation', 'scholarship', '2026-10-12', 'https://example.org/meridian-scholarship', '₹60,000 one-time', array['One-time award']::text[], array['Marksheets']::text[], 4),
  ('coral-science-award', 'src-campus', 'Coral Science Talent Award', 'Coral Science Society', 'scholarship', '2026-11-15', 'https://example.net/coral-award', '₹50,000 per year', array['Renewable for the length of the course']::text[], array['Marksheets']::text[], 3)
on conflict (id) do nothing;

-- per-user sample data
create or replace function public.seed_demo_for_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid;
  v_suffix text := substr(p_user::text, 1, 8);
begin
  -- the user's own sources
  insert into public.sources (id, name, kind, url, owner_id, status, last_checked_at) values
    ('src-gmail' || '-' || v_suffix, 'Gmail forwards', 'gmail', null, p_user, 'healthy', now() - interval '20 minutes'),
    ('src-club' || '-' || v_suffix, 'example.org/coding-club', 'web', 'https://example.org/coding-club', p_user, 'healthy', now() - interval '20 minutes')
  on conflict (id) do nothing;

  insert into public.source_subscriptions (user_id, source_id, enabled) values
    (p_user, 'src-grants', false)
  on conflict do nothing;

  insert into public.matches (user_id, opportunity_id, verdict, confidence, confidence_breakdown, clause, clause_source, criteria, reasoning, rank, is_new, status, questions) values
    (p_user, 'open-circuit-hack', 'eligible', 94, '[{"label":"Clause match","score":97},{"label":"Profile completeness","score":88},{"label":"Source reliability","score":96}]'::jsonb, 'Teams of 2 to 4 members, each enrolled full-time in an undergraduate programme at a recognised college in India.', 'Open Circuit Rules, §2 Teams', '[{"text":"Team of 2–4 members","status":"met","clause":"Teams of 2 to 4 members"},{"text":"Full-time undergraduate","status":"met","clause":"each enrolled full-time in an undergraduate programme"},{"text":"Recognised college in India","status":"met","clause":"at a recognised college in India"}]'::jsonb, 'Any full-time undergraduate team of 2–4 qualifies. No other conditions.', 1, false, 'new', '[]'::jsonb),
    (p_user, 'tidewater-internship', 'eligible', 91, '[{"label":"Clause match","score":95},{"label":"Profile completeness","score":84},{"label":"Source reliability","score":93}]'::jsonb, 'Open to students in the 2nd or 3rd year of a B.E./B.Tech programme in Computer Science, IT or Electronics.', 'Tidewater Careers, Internship eligibility', '[{"text":"2nd or 3rd year of B.E./B.Tech","status":"met","clause":"in the 2nd or 3rd year of a B.E./B.Tech programme"},{"text":"Branch: CS, IT or Electronics","status":"met","clause":"in Computer Science, IT or Electronics"}]'::jsonb, 'Year and branch match the clause exactly.', 2, false, 'saved', '[]'::jsonb),
    (p_user, 'lantern-microgrant', 'eligible', 86, '[{"label":"Clause match","score":92},{"label":"Profile completeness","score":74},{"label":"Source reliability","score":93}]'::jsonb, 'Individuals based in India maintaining a public project under an OSI-approved licence. Applications must include one endorsement from a mentor or maintainer.', 'Lantern Fund FAQ, Who can apply', '[{"text":"Based in India","status":"met","clause":"Individuals based in India"},{"text":"Public project under an OSI-approved licence","status":"met","clause":"maintaining a public project under an OSI-approved licence"},{"text":"Mentor endorsement","status":"unverified","clause":"must include one endorsement from a mentor or maintainer"}]'::jsonb, 'Eligibility is met. The application can''t be submitted until the endorsement arrives.', 3, false, 'new', '[]'::jsonb),
    (p_user, 'ember-summit', 'eligible', 78, '[{"label":"Clause match","score":90},{"label":"Profile completeness","score":60},{"label":"Source reliability","score":85}]'::jsonb, 'Open to students enrolled in any undergraduate programme in India. Participants must register with a college email address.', 'Ember Summit FAQ, Registration', '[{"text":"Undergraduate in India","status":"met","clause":"enrolled in any undergraduate programme in India"},{"text":"College email address","status":"unverified","clause":"must register with a college email address"}]'::jsonb, 'You qualify on enrolment. Registration needs a college email, which isn''t confirmed yet.', null, true, 'new', '[]'::jsonb),
    (p_user, 'quillon-debate', 'eligible', 66, '[{"label":"Clause match","score":80},{"label":"Profile completeness","score":45},{"label":"Source reliability","score":85}]'::jsonb, 'Open to students aged 18 to 25 who are currently studying in India.', 'Quillon Debate Rules, Eligibility', '[{"text":"Studying in India","status":"met","clause":"currently studying in India"},{"text":"Aged 18–25","status":"unverified","clause":"aged 18 to 25"}]'::jsonb, 'Your age isn''t in your profile, so the age rule can''t be confirmed.', null, true, 'new', '[]'::jsonb),
    (p_user, 'kestrel-merit', 'unclear', 55, '[{"label":"Clause match","score":50},{"label":"Profile completeness","score":40},{"label":"Source reliability","score":90}]'::jsonb, 'Applicants must demonstrate a consistently strong academic record throughout their degree.', 'Kestrel Scholarship Notice, Eligibility (1)', '[{"text":"Consistently strong academic record","status":"borderline","clause":"a consistently strong academic record throughout their degree"}]'::jsonb, 'The clause never defines ''consistently strong'', so there''s no CGPA cutoff to check against.', null, false, 'new', '[{"id":"q-cgpa","question":"What is your current CGPA (out of 10)?","answer":null}]'::jsonb),
    (p_user, 'saffron-need', 'unclear', 52, '[{"label":"Clause match","score":60},{"label":"Profile completeness","score":30},{"label":"Source reliability","score":88}]'::jsonb, 'Annual family income from all sources must be below ₹3,00,000, supported by an income certificate issued in the last 12 months.', 'Saffron Trust Guidelines, §3 Income', '[{"text":"Family income below ₹3,00,000","status":"unverified","clause":"Annual family income from all sources must be below ₹3,00,000"},{"text":"Income certificate from the last 12 months","status":"unverified","clause":"supported by an income certificate issued in the last 12 months"}]'::jsonb, 'Can''t confirm until income details are known.', null, true, 'new', '[{"id":"q-income","question":"Roughly what is your annual family income?","answer":null},{"id":"q-cert","question":"Do you have an income certificate issued in the last 12 months?","answer":null}]'::jsonb),
    (p_user, 'northstar-fellowship', 'unclear', 61, '[{"label":"Clause match","score":75},{"label":"Profile completeness","score":50},{"label":"Source reliability","score":58}]'::jsonb, 'Undergraduates in any year may apply. Preference will be given to candidates with prior research experience or a publication.', 'Northstar Fellowship Call, Selection', '[{"text":"Undergraduate in any year","status":"met","clause":"Undergraduates in any year may apply"},{"text":"Prior research experience (preferred)","status":"borderline","clause":"Preference will be given to candidates with prior research experience or a publication"}]'::jsonb, 'Anyone can apply, but your chances depend on research experience.', null, false, 'new', '[{"id":"q-research","question":"Have you done any research work (projects, papers, lab assistance)?","answer":null}]'::jsonb),
    (p_user, 'meridian-first-year', 'not_eligible', 96, '[{"label":"Clause match","score":98},{"label":"Profile completeness","score":92},{"label":"Source reliability","score":96}]'::jsonb, 'Applicants must be enrolled in the first year of a full-time undergraduate degree at the time of application.', 'Meridian Scholarship Rules, Eligibility (a)', '[{"text":"First-year undergraduate","status":"not_met","clause":"enrolled in the first year of a full-time undergraduate degree"}]'::jsonb, 'A hard exclusion: only first-year students qualify.', null, false, 'new', '[]'::jsonb),
    (p_user, 'coral-science-award', 'not_eligible', 97, '[{"label":"Clause match","score":99},{"label":"Profile completeness","score":92},{"label":"Source reliability","score":98}]'::jsonb, 'Open only to students pursuing B.Sc. or integrated M.Sc. programmes in the natural sciences. Engineering and professional courses are excluded.', 'Coral Award Guidelines, §4', '[{"text":"B.Sc. or integrated M.Sc. in natural sciences","status":"not_met","clause":"pursuing B.Sc. or integrated M.Sc. programmes in the natural sciences"},{"text":"Not an engineering course","status":"not_met","clause":"Engineering and professional courses are excluded"}]'::jsonb, 'Engineering courses are explicitly excluded.', null, false, 'new', '[]'::jsonb)
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
    (v_campaign, p_user, 1, 'found', 'done', 'Sep 30, 21:02', 'Found', 'Found in Open Calls Weekly.', null),
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

  insert into public.agent_activity (user_id, kind, message, href, created_at) values
    (p_user, 'scan', 'Scanned 6 sources and found 2 new opportunities', '/sources', now() - interval '0 hours'),
    (p_user, 'found', 'Found Ember Student Builders Summit (78% confidence)', '/opportunity/ember-summit', now() - interval '4 hours'),
    (p_user, 'repair', 'Fellowship Finder changed its layout. Repairing the reader', '/sources', now() - interval '8 hours'),
    (p_user, 'repair', 'Repaired Campus Notices after a page redesign', '/sources', now() - interval '12 hours'),
    (p_user, 'draft', 'Drafted your Open Circuit idea submission', '/campaign/open-circuit-hack', now() - interval '16 hours'),
    (p_user, 'sent', 'Sent a follow-up to Kestrel Foundation asking for their CGPA cutoff, after your approval', '/opportunity/kestrel-merit', now() - interval '20 hours'),
    (p_user, 'sent', 'Submitted your Tidewater Labs application after your approval', '/campaign/tidewater-internship', now() - interval '24 hours');

  insert into public.opportunity_views (user_id, opportunity_id, viewed_at) values
    (p_user, 'northstar-fellowship', now() - interval '1 hours'),
    (p_user, 'kestrel-merit', now() - interval '2 hours')
  on conflict do nothing;

end $$;

revoke execute on function public.seed_demo_for_user(uuid) from public, anon, authenticated;
