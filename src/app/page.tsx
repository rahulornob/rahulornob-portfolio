import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { ProjectShowcase } from "@/components/project-showcase";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { client } from "@/sanity/lib/client";
import { siteContentQuery } from "@/sanity/lib/queries";
import type { SiteContent } from "@/sanity/types";
import styles from "./page.module.css";

async function getSiteContent() {
  try {
    return await client.fetch<SiteContent | null>(
      siteContentQuery,
      {},
      { next: { revalidate: 60 } },
    );
  } catch (error) {
    console.error("Unable to load Sanity content", error);
    return null;
  }
}

export default async function Home() {
  const content = await getSiteContent();

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Hero content={content?.hero} />
        <About content={content?.about} />
        <ProjectShowcase
          heading={content?.projectsHeading}
          projects={content?.projects}
        />
        <Services content={content?.servicesSection} />
        <Testimonials content={content?.testimonialsSection} />
        <Faq content={content?.faqSection} />
      </div>
      <SiteFooter content={content?.footer} />
    </main>
  );
}
