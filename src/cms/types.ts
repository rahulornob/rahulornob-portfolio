export type CmsImage = {
  alt?: string;
  height?: number;
  url?: string;
  width?: number;
};

export type HeroContent = {
  backgroundImage?: CmsImage;
  ctaLabel?: string;
  headline?: string;
  intro?: string;
};

export type AboutContent = {
  eyebrow?: string;
  heading?: string;
  logos?: Array<CmsImage & { name: string }>;
};

export type ProjectContent = {
  autoplayDuration?: number;
  description?: string;
  images?: CmsImage[];
  slug?: string;
  tags?: string[];
  title?: string;
};

export type ServiceContent = {
  description?: string;
  id?: string;
  images?: CmsImage[];
  tags?: string[];
  title?: string;
};

export type ServicesContent = {
  heading?: string;
  intro?: string;
  items?: ServiceContent[];
};

export type TestimonialContent = {
  author?: string;
  company?: string;
  companyLogo?: CmsImage;
  portrait?: CmsImage;
  quote?: string;
  role?: string;
};

export type TestimonialsContent = {
  heading?: string;
  items?: TestimonialContent[];
};

export type FaqContent = {
  heading?: string;
  items?: Array<{ answer?: string; question?: string }>;
};

export type FooterContent = {
  availabilityText?: string;
  copyrightText?: string;
  ctaLabel?: string;
  email?: string;
  locationText?: string;
  particleText?: string;
  sitemap?: Array<{ href?: string; label?: string }>;
  socialLinks?: Array<{ label?: string; url?: string }>;
};

export type SiteContent = {
  about?: AboutContent;
  faqSection?: FaqContent;
  footer?: FooterContent;
  hero?: HeroContent;
  projects?: ProjectContent[];
  projectsHeading?: string;
  servicesSection?: ServicesContent;
  testimonialsSection?: TestimonialsContent;
};
