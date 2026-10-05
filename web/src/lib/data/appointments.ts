import type { Category } from "@/lib/types";

export interface CalendarAppointment {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  org: string;
  category: Category;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  duration?: string; // e.g. "45 min"
  type: "accepted" | "interview" | "mentor" | "milestone" | "orientation";
  typeLabel: string;
  location: string;
  meetingLink?: string;
  notes?: string;
  campaignUrl?: string;
}

export const SEED_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: "apt-1",
    opportunityId: "open-circuit-hack",
    opportunityTitle: "Open Circuit Hackathon 2026",
    org: "Open Circuit Collective",
    category: "hackathon",
    date: "2026-10-08",
    time: "10:00 AM",
    duration: "60 min",
    type: "accepted",
    typeLabel: "Accepted · Team Ideation & Prep",
    location: "Google Meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Review problem statements and confirm team role assignments.",
    campaignUrl: "/campaign/open-circuit-hack",
  },
  {
    id: "apt-2",
    opportunityId: "tidewater-internship",
    opportunityTitle: "Tidewater Labs Summer Internship",
    org: "Tidewater Labs",
    category: "internship",
    date: "2026-10-13",
    time: "02:30 PM",
    duration: "45 min",
    type: "interview",
    typeLabel: "Technical Screening Interview",
    location: "Zoom Call",
    meetingLink: "https://zoom.us/j/987654321",
    notes: "Discussion with Dr. Sarah Lin on distributed systems projects.",
    campaignUrl: "/campaign/tidewater-internship",
  },
  {
    id: "apt-3",
    opportunityId: "tidewater-internship",
    opportunityTitle: "Tidewater Labs Summer Internship",
    org: "Tidewater Labs",
    category: "internship",
    date: "2026-10-16",
    time: "11:00 AM",
    duration: "30 min",
    type: "accepted",
    typeLabel: "HR Discussion & Offer Briefing",
    location: "Tidewater Portal",
    notes: "Stipend details and project placement confirmation.",
    campaignUrl: "/campaign/tidewater-internship",
  },
  {
    id: "apt-4",
    opportunityId: "lantern-microgrant",
    opportunityTitle: "Lantern Open Source Microgrant",
    org: "Lantern Fund",
    category: "scholarship",
    date: "2026-10-17",
    time: "04:00 PM",
    duration: "45 min",
    type: "mentor",
    typeLabel: "Mentor Endorsement & Project Review",
    location: "Discord Voice · Dev Channel",
    notes: "Review project milestones with mentor before submission.",
    campaignUrl: "/campaign/lantern-microgrant",
  },
  {
    id: "apt-5",
    opportunityId: "ember-summit",
    opportunityTitle: "Ember Student Builders Summit",
    org: "Ember Collective",
    category: "event",
    date: "2026-10-19",
    time: "10:30 AM",
    duration: "90 min",
    type: "orientation",
    typeLabel: "Delegate Orientation & Travel Briefing",
    location: "Bengaluru Campus / Live Stream",
    notes: "Registration check-in and travel reimbursement details.",
    campaignUrl: "/opportunity/ember-summit",
  },
  {
    id: "apt-6",
    opportunityId: "open-circuit-hack",
    opportunityTitle: "Open Circuit Hackathon 2026",
    org: "Open Circuit Collective",
    category: "hackathon",
    date: "2026-10-23",
    time: "03:00 PM",
    duration: "60 min",
    type: "milestone",
    typeLabel: "Finalist Live Online Pitch",
    location: "YouTube Live Stage",
    notes: "5-minute project pitch followed by jury Q&A.",
    campaignUrl: "/campaign/open-circuit-hack",
  },
  {
    id: "apt-7",
    opportunityId: "lantern-microgrant",
    opportunityTitle: "Lantern Open Source Microgrant",
    org: "Lantern Fund",
    category: "scholarship",
    date: "2026-10-28",
    time: "05:00 PM",
    duration: "30 min",
    type: "milestone",
    typeLabel: "Milestone 1 Deliverables Review",
    location: "GitHub Call",
    notes: "Review pull requests and initial documentation.",
    campaignUrl: "/campaign/lantern-microgrant",
  },
  {
    id: "apt-8",
    opportunityId: "northstar-fellowship",
    opportunityTitle: "Northstar Institute Research Fellowship",
    org: "Northstar Institute",
    category: "internship",
    date: "2026-11-04",
    time: "02:00 PM",
    duration: "45 min",
    type: "interview",
    typeLabel: "Lab Placement Faculty Interview",
    location: "Online Meeting Room",
    notes: "Discussion with laboratory faculty advisor.",
    campaignUrl: "/opportunity/northstar-fellowship",
  },
];

export const appointmentTypeMeta: Record<
  CalendarAppointment["type"],
  { label: string; badge: string; fill: string }
> = {
  accepted: {
    label: "Accepted / Sync",
    badge: "bg-go-tint text-go border-go/30",
    fill: "bg-go",
  },
  interview: {
    label: "Interview",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-500/30",
    fill: "bg-blue-600 dark:bg-blue-500",
  },
  mentor: {
    label: "Mentor Sync",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-500/30",
    fill: "bg-purple-600 dark:bg-purple-500",
  },
  orientation: {
    label: "Orientation",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-500/30",
    fill: "bg-amber-600 dark:bg-amber-500",
  },
  milestone: {
    label: "Milestone / Pitch",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/30",
    fill: "bg-emerald-600 dark:bg-emerald-500",
  },
};
