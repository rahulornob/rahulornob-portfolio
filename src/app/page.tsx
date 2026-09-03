import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { ProjectShowcase } from "@/components/project-showcase";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { Preloader } from "@/components/preloader";
import { Cursor } from "@/components/cursor";
import { getSiteContent } from "@/cms/storage";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  const preloaderItems = (content.projects || [])
    .map((project) => {
      const image = project.images?.find((item) => item.url);
      return image?.url
        ? { label: project.title || "Selected project", url: image.url }
        : null;
    })
    .filter((item): item is { label: string; url: string } => Boolean(item));

  return (
    <>
      <Cursor />
      <Preloader items={preloaderItems} />
      <main className={styles.page}>
        <div className={styles.content}>
          <Hero content={content.hero} />
          <About content={content.about} />
          <ProjectShowcase
            carouselSpeed={content.projectsCarouselSpeed}
            heading={content.projectsHeading}
            projects={content.projects}
          />
          <Services content={content.servicesSection} />
          <Testimonials content={content.testimonialsSection} />
          <Faq content={content.faqSection} />
        </div>
        <SiteFooter content={content.footer} />
      </main>
    </>
  );
}
