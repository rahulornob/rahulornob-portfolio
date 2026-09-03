export type CmsImage = {
  alt?: string;
  height?: number;
  url?: string;
  width?: number;
};

export type HeroContent = {
  avatar?: CmsImage;
  bio?: string[];
  ctaLabel?: string;
  name?: string;
  title?: string;
  wantLabel?: string;
};

export type AboutContent = {
  eyebrow?: string;
  heading?: string;
  logos?: Array<CmsImage & { name: string }>;
};

export type NavigationContent = {
  items?: Array<{ href?: string; label?: string }>;
  socials?: Array<{ label?: string; url?: string }>;
};

export type PreloaderContent = {
  images?: CmsImage[];
  leftLabel?: string;
  rightLabel?: string;
};

export type ProjectContent = {
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
  avatar?: CmsImage;
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
  navigation?: NavigationContent;
  preloader?: PreloaderContent;
  projects?: ProjectContent[];
  projectsCarouselSpeed?: number;
  projectsHeading?: string;
  servicesSection?: ServicesContent;
  testimonialsSection?: TestimonialsContent;
};
