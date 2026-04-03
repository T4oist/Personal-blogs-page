import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default(''),
    published: z.boolean().default(true),
    image: z.string().optional(),
  }),
});

const moments = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    mood: z.string().optional(),
    location: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    links: z.array(z.object({
      type: z.enum(['github', 'website', 'demo', 'docs', 'link']),
      url: z.string().url(),
      label: z.string(),
    })).optional(),
  }),
});

export const collections = {
  blog,
  moments,
  projects,
};
