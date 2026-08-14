import {defineQuery} from 'next-sanity'

export const siteContentQuery = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    hero {
      headline,
      intro,
      ctaLabel,
      "backgroundImage": backgroundImage {
        alt,
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      }
    },
    about {
      eyebrow,
      heading,
      logos[] {
        name,
        alt,
        "url": image.asset->url,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height
      }
    },
    projectsHeading,
    projects[] {
      title,
      "slug": slug.current,
      description,
      tags,
      autoplayDuration,
      images[] {
        alt,
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      }
    },
    servicesSection {
      heading,
      intro,
      items[] {
        title,
        "id": id.current,
        description,
        tags,
        images[] {
          alt,
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      }
    },
    testimonialsSection {
      heading,
      items[] {
        quote,
        author,
        role,
        company,
        "portrait": portrait {
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        },
        "companyLogo": companyLogo {
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      }
    },
    faqSection {
      heading,
      items[] {question, answer}
    },
    footer {
      availabilityText,
      email,
      ctaLabel,
      particleText,
      locationText,
      copyrightText,
      sitemap[] {label, href},
      socialLinks[] {label, url}
    }
  }
`)
