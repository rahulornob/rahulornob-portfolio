import type { SiteContent } from "./types";

const projectImageIds = [
  ["07cd6109c2a18373e81f9f6f429906c710f57004", "01"],
  ["a6068cd45fa43e72c3fd2f26e6dc2f2e29c19acb", "02"],
  ["3a5999e20d8a165e43966dfbb3ee9530569fceae", "03"],
  ["a2c5e552d3f89b54cb3bb12191513a9a4de5c846", "04"],
  ["969818d2d8e10d19b3cc97bc0382f74f1321c159", "05"],
  ["d1a61f2e663f9ecb93f91eff53f1b6a1e043165c", "06"],
  ["b7d8121fd2a299c31b94f4c5e352581580573a7f", "07"],
  ["ed6b7b50379bfe71dc6d6f1a2c58006494db0a7c", "08"],
  ["835920ab8466181a4030f90e1082b363dc1523b0", "09"],
  ["1fb828e2af53fb8cda6d0630aed5c6b55c16f421", "10"],
  ["2f36d32a754e86c0e6adee78f485eaed4c33054e", "11"],
  ["b8754c74b351a77cf6bfd5aba67f7c4f88f83073", "12"],
  ["749ed1f8f4d70c42e258611f8ad28576e88aae33", "13"],
  ["400536a49052b780a20631cb1fb49c88152f1670", "14"],
  ["f141a0145c10bdf082767ea3fbead12d4ea5b254", "15"],
  ["35058debb49a52fe0c701a28587f8a34d5490509", "16"],
  ["c3aa127f8ef5d1885f7dde3c571743cf8a9456b0", "17"],
  ["ca603460ce714e9dcff77dc6cea94ae01e30dc4f", "18"],
  ["98cd0a19ba5e287bb31aa0a553b3f4b9d1b7a463", "1"],
] as const;

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
  projects: [
    {
      title:
        "NowHealth — Brand and launch website for performance-focused health lab",
      slug: "nowhealth",
      tags: ["Web design", "Web design", "Web design"],
      description:
        "The website was designed to capture early demand and build credibility before launch. It converted initial interest into a growing waitlist while clearly communicating Enroute’s performance-driven positioning.",
      autoplayDuration: 42,
      images: projectImageIds.map(([id, number]) => ({
        alt: `now-health-redesign-project-${number}`,
        height: 600,
        url: `https://cdn.sanity.io/images/eo19umac/production/${id}-800x600.jpg`,
        width: 800,
      })),
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
