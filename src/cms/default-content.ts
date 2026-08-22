import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  hero: {
    headline: "Making the internet slightly less annoying.",
    intro:
      "Designing for the web, building when needed, and using AI to move faster without letting it make the creative decisions.",
    ctaLabel: "Start project",
  },
  about: {
    eyebrow: "Why me",
    heading:
      "5+ years in, I’m faster at finding what matters, better at knowing what doesn’t, and still annoyingly picky about the details people actually notice.",
  },
  projectsHeading: "A selection\nof things I’ve made",
  projectsCarouselSpeed: 60,
  projects: [
    {
      title:
        "NowHealth — Brand and launch website for performance-focused health lab",
      slug: "nowhealth",
      tags: ["Web design", "Web design", "Web design"],
      description:
        "The website was designed to capture early demand and build credibility before launch. It converted initial interest into a growing waitlist while clearly communicating Enroute’s performance-driven positioning.",
      images: [],
    },
  ],
  servicesSection: {
    heading: "The stuff I do best",
    intro:
      "Mostly websites. Sometimes apps, decks, and whatever else needs better taste and fewer unnecessary clicks.",
    items: [
      ["website-design", "Website Design", "I design responsive websites from landing pages to full marketing sites, with a strong focus on layout, visual direction, interactions, and usability.", ["Web design", "UI design", "Responsive design"]],
      ["design-engineering", "Design Engineering", "I take designs further with interactive prototypes, motion, and AI-assisted workflows, so ideas can be tested and refined before they reach development.", ["Prototyping", "Interaction", "AI workflow"]],
      ["mobile-app-design", "Mobile App Design", "I design mobile interfaces and user flows that are easy to understand, visually polished, and consistent across the full experience.", ["App design", "UI/UX", "Prototyping"]],
      ["pitch-deck-design", "Pitch Deck Design", "I turn raw content into clear, well-structured presentations with strong hierarchy, visual storytelling, and slides that are actually easy to follow.", ["Pitch deck", "Presentation", "Visual design"]],
      ["brand-collateral-design", "Brand Collateral Design", "I design business cards, banners, booklets, leaflets, and other print materials, keeping everything consistent with the existing brand and ready for production.", ["Print design", "Brand collateral", "Marketing materials"]],
    ].map(([id, title, description, tags]) => ({
      id: id as string,
      title: title as string,
      description: description as string,
      tags: tags as string[],
    })),
  },
  testimonialsSection: {
    heading: "Nice things people said",
    items: Array.from({ length: 5 }, () => ({
      quote:
        "Collaborating with Better Mistakes was an absolute joy. They build fast without ever on quality and consistently.",
      author: "Nothing Rahman",
      role: "Product Manager, SaaS Platform",
      company: "Cosmos",
    })),
  },
  faqSection: {
    heading: "Before we get into it",
    items: [
      ["What kind of projects are you best at?", "Visual-heavy websites are where I do my best work. I also take on mobile UI, pitch decks, brand collateral, and design-engineering work when the project needs more than static screens."],
      ["Can you work with an existing team or design system?", "Absolutely. I’m comfortable joining an agency or remote team, picking up an existing system, and getting productive without needing everything explained ten times."],
      ["Do you only design, or do you also prototype and build?", "I like taking ideas further than Figma. Depending on the project, I’ll prototype interactions, test flows, and push the design closer to something real."],
      ["How do you use AI in your process?", "AI handles the busywork. I make coffee. Then I put the saved time into visual direction, UX decisions, and the details where taste and judgment actually matter."],
      ["Are you available for freelance, agency, or remote roles?", "Yes. I’m open to freelance projects, agency collaborations, and remote roles where I can contribute as a visual-first Design Engineer and stay close to both the design and the build."],
    ].map(([question, answer]) => ({ question, answer })),
  },
  footer: {
    availabilityText: "Available for projects",
    email: "hey@rahulornob.com",
    ctaLabel: "Start conversation",
    particleText: "rahulornob",
    locationText: "Based in Dhaka & Serve worldwide.",
    copyrightText: "Rahulornob © 2026 All Rights Reserved",
    sitemap: [
      { label: "Home", href: "#top" },
      { label: "About", href: "#about" },
      { label: "Playground", href: "#playground" },
      { label: "Contact", href: "#contact" },
    ],
    socialLinks: [
      { label: "Linkedin", url: "" },
      { label: "X (Twitter)", url: "" },
      { label: "Instagram", url: "" },
      { label: "Behance", url: "" },
    ],
  },
};
