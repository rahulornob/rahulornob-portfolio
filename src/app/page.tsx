import { Hero } from "@/components/hero";
import { ProjectShowcase } from "@/components/project-showcase";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { Preloader, type PreloaderItem } from "@/components/preloader";
import { Cursor } from "@/components/cursor";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getSiteContent } from "@/cms/storage";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  const customPreloaderImages = (content.preloader?.images || []).filter(
    (image): image is typeof image & { url: string } => Boolean(image.url),
  );
  const preloaderItems: PreloaderItem[] = customPreloaderImages.length
    ? customPreloaderImages.map((image, index) => ({
        label: image.alt || `Preloader image ${index + 1}`,
        url: image.url,
        width: image.width,
        height: image.height,
      }))
    : (content.projects || [])
        .map((project): PreloaderItem | null => {
          const image = project.images?.find((item) => item.url);
          return image?.url
            ? {
                label: project.title || "Selected project",
                url: image.url,
                width: image.width,
                height: image.height,
              }
            : null;
        })
        .filter((item): item is PreloaderItem => Boolean(item));

  return (
    <>
      <SmoothScroll />
      <Cursor />
      <Preloader
        items={preloaderItems}
        leftLabel={content.preloader?.leftLabel}
        rightLabel={content.preloader?.rightLabel}
      />
      <main className={styles.page}>
        <div className={styles.content}>
          <Hero
            about={content.about}
            content={content.hero}
            navigation={content.navigation?.items}
            socials={content.navigation?.socials}
          />
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
