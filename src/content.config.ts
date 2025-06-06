import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ base: "./src/content/services", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero_image: z.string(),
  }),
});

const versions = defineCollection({
  loader: glob({ base: "./src/content/versions", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    version: z.string(),
    releaseDate: z.coerce.date(),
    description: z.string(),
    features: z.array(z.string()),
    improvements: z.array(z.string()).optional(),
  }),
});


const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const careers = defineCollection({
  loader: glob({ base: "./src/content/careers", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    description: z.string(),
    applyLink: z.string(),
  }),
});

const recomendations = defineCollection({
  loader: glob({
    base: "./src/content/recomendations",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    link: z.string(),
  }),
});

const news = defineCollection({
  loader: glob({ base: "./src/content/news", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: z.string(),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog,
  services,
  versions,
  pages,
  careers,
  recomendations,
  news,
};
