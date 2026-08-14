import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website Content',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero'},
    {name: 'about', title: 'About'},
    {name: 'projects', title: 'Projects'},
    {name: 'services', title: 'Services'},
    {name: 'testimonials', title: 'Testimonials'},
    {name: 'faq', title: 'FAQ'},
    {name: 'footer', title: 'Footer'},
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'headline', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 3, validation: (rule) => rule.required()}),
        defineField({name: 'ctaLabel', title: 'Button label', type: 'string'}),
        defineField({
          name: 'backgroundImage',
          title: 'Background image',
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string', title: 'Alternative text'})],
        }),
      ],
    }),
    defineField({
      name: 'about',
      title: 'About',
      type: 'object',
      group: 'about',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'heading', type: 'text', rows: 4, validation: (rule) => rule.required()}),
        defineField({
          name: 'logos',
          title: 'Client logos',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'image', type: 'image', validation: (rule) => rule.required()}),
                defineField({name: 'alt', type: 'string'}),
              ],
              preview: {select: {title: 'name', media: 'image'}},
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'projectsHeading',
      title: 'Projects heading',
      type: 'string',
      group: 'projects',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      group: 'projects',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
            defineField({name: 'description', type: 'text', rows: 4}),
            defineField({name: 'tags', type: 'array', of: [defineArrayMember({type: 'string'})]}),
            defineField({
              name: 'autoplayDuration',
              title: 'Autoplay duration (seconds)',
              type: 'number',
              initialValue: 42,
              validation: (rule) => rule.min(10).max(180),
            }),
            defineField({
              name: 'images',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'image',
                  options: {hotspot: true},
                  fields: [defineField({name: 'alt', type: 'string', validation: (rule) => rule.required()})],
                }),
              ],
            }),
          ],
          preview: {select: {title: 'title', media: 'images.0'}},
        }),
      ],
    }),
    defineField({
      name: 'servicesSection',
      title: 'Services',
      type: 'object',
      group: 'services',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'intro', type: 'text', rows: 3}),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'id', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
                defineField({name: 'description', type: 'text', rows: 4}),
                defineField({name: 'tags', type: 'array', of: [defineArrayMember({type: 'string'})]}),
                defineField({
                  name: 'images',
                  type: 'array',
                  of: [
                    defineArrayMember({
                      type: 'image',
                      options: {hotspot: true},
                      fields: [defineField({name: 'alt', type: 'string'})],
                    }),
                  ],
                }),
              ],
              preview: {select: {title: 'title', media: 'images.0'}},
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'testimonialsSection',
      title: 'Testimonials',
      type: 'object',
      group: 'testimonials',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'quote', type: 'text', rows: 5, validation: (rule) => rule.required()}),
                defineField({name: 'author', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'role', type: 'string'}),
                defineField({name: 'company', type: 'string'}),
                defineField({name: 'portrait', type: 'image', options: {hotspot: true}}),
                defineField({name: 'companyLogo', title: 'Company logo', type: 'image'}),
              ],
              preview: {select: {title: 'author', subtitle: 'role', media: 'portrait'}},
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'faqSection',
      title: 'FAQ',
      type: 'object',
      group: 'faq',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'question', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'answer', type: 'text', rows: 5, validation: (rule) => rule.required()}),
              ],
              preview: {select: {title: 'question', subtitle: 'answer'}},
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({name: 'availabilityText', type: 'string'}),
        defineField({name: 'email', type: 'string', validation: (rule) => rule.email()}),
        defineField({name: 'ctaLabel', title: 'Button label', type: 'string'}),
        defineField({name: 'particleText', type: 'string'}),
        defineField({name: 'locationText', type: 'string'}),
        defineField({name: 'copyrightText', type: 'string'}),
        defineField({
          name: 'sitemap',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'label', type: 'string'}),
                defineField({name: 'href', type: 'string'}),
              ],
              preview: {select: {title: 'label', subtitle: 'href'}},
            }),
          ],
        }),
        defineField({
          name: 'socialLinks',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'label', type: 'string'}),
                defineField({name: 'url', type: 'url'}),
              ],
              preview: {select: {title: 'label', subtitle: 'url'}},
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Website Content'}),
  },
})
