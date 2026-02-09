export interface FeatureItem {
  title: string;
  description: string;
  stat: string;
}

export interface IntegrationItem {
  name: string;
  status: string;
}

export interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  highlighted?: boolean;
  cta: string;
  features: string[];
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  result: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const landingContent = {
  announcement: "Marketing OS 2026.02: AI campaign planner + unified attribution timeline now available.",
  logos: ["Google Ads", "Meta", "LinkedIn", "HubSpot", "Shopify"],
  outcomes: [
    "Replace fragmented planning docs, social schedulers, and reporting sheets with one execution system.",
    "Give content, paid, and lifecycle teams one operating cadence with clear ownership and approvals.",
    "Move from weekly guesswork to channel-level decisions backed by campaign and revenue signal.",
  ],
  features: [
    {
      title: "Campaign Planner",
      description: "Build briefs, channel plans, and launch timelines from a single source of truth.",
      stat: "58% faster campaign kickoff",
    },
    {
      title: "AI Content Studio",
      description: "Generate and refine copy variations for ads, email, and social in your brand voice.",
      stat: "3.1x faster content production",
    },
    {
      title: "Publishing Calendar",
      description: "Coordinate social and email sends with conflict checks and approval checkpoints.",
      stat: "41% fewer missed deadlines",
    },
    {
      title: "Attribution Dashboard",
      description: "See CAC, pipeline, and conversion movement by channel, campaign, and audience.",
      stat: "Decision-ready reporting in minutes",
    },
    {
      title: "Competitor Watch",
      description: "Monitor messaging changes, launch cadence, and creative direction across competitors.",
      stat: "Daily market alerts",
    },
    {
      title: "Workflow Automation",
      description: "Automate handoffs, reminders, and status updates so teams stay in execution mode.",
      stat: "8.6 team hours recovered weekly",
    },
  ] as FeatureItem[],
  integrations: [
    { name: "Google Analytics", status: "Attribution + event sync" },
    { name: "Meta Ads", status: "Campaign sync" },
    { name: "LinkedIn", status: "Native publish" },
    { name: "HubSpot", status: "Pipeline + contact sync" },
    { name: "Shopify", status: "Revenue event sync" },
    { name: "Slack", status: "Workflow alerts" },
  ] as IntegrationItem[],
  pricing: [
    {
      name: "Starter",
      monthlyPrice: 49,
      annualPrice: 39,
      description: "For early-stage teams building a repeatable campaign engine.",
      cta: "Start free trial",
      features: ["Up to 5 users", "Campaign planner", "AI content studio", "Core analytics", "Email support"],
    },
    {
      name: "Growth",
      monthlyPrice: 129,
      annualPrice: 99,
      description: "For teams scaling paid, lifecycle, and content across channels.",
      highlighted: true,
      cta: "Start free trial",
      features: [
        "Up to 20 users",
        "Advanced automations",
        "Attribution dashboard",
        "Competitor watch",
        "Priority support",
      ],
    },
    {
      name: "Scale",
      monthlyPrice: 329,
      annualPrice: 269,
      description: "For multi-brand organizations with governance and advanced reporting needs.",
      cta: "Talk to sales",
      features: ["Unlimited users", "Custom roles + SSO", "Dedicated success manager", "API + premium integrations"],
    },
  ] as PricingTier[],
  testimonials: [
    {
      quote: "Marketing OS became our single operating layer across demand gen, social, and lifecycle in under 3 weeks.",
      name: "Jordan Park",
      role: "VP of Growth",
      company: "Atlas Commerce",
      result: "34% increase in campaign output QoQ",
    },
    {
      quote: "We stopped losing context between tools. Planning, execution, and reporting now happen in one workflow.",
      name: "Mina Patel",
      role: "Director of Marketing",
      company: "Nexa Cloud",
      result: "22% improvement in paid CAC in 90 days",
    },
    {
      quote: "Leadership finally gets one trusted performance view, and our team ships with more confidence every week.",
      name: "Ethan Brooks",
      role: "Marketing Operations Lead",
      company: "Summit Health Tech",
      result: "9 hours saved weekly on reporting",
    },
  ] as Testimonial[],
  faq: [
    {
      question: "How quickly can a team go live?",
      answer: "Most teams configure channels, templates, and dashboards in under 48 hours.",
    },
    {
      question: "Can we keep our existing tools during rollout?",
      answer: "Yes. Marketing OS is designed for phased adoption, so you can onboard by channel.",
    },
    {
      question: "Does the platform support attribution for SMB teams?",
      answer: "Yes. Attribution views are built for marketing teams, without requiring a dedicated analyst.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes. Every plan includes a 14-day free trial with full product access.",
    },
    {
      question: "What does support include?",
      answer: "All plans include onboarding resources and email support, with priority support on Growth and Scale.",
    },
  ] as FaqItem[],
} as const;
