export const REFERRAL_SOURCES = [
  { value: "search", label: "Search engine (Google, etc.)" },
  { value: "social", label: "Social media" },
  { value: "friend", label: "Friend or colleague" },
  { value: "blog", label: "Blog or newsletter" },
  { value: "youtube", label: "YouTube or podcast" },
  { value: "conference", label: "Conference or event" },
  { value: "other", label: "Other" },
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number]["value"];
