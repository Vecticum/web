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
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
      ogType: z.string().optional(),
      canonical: z.string().optional(),
      schema: z.string().optional(),
    }),
    title: z.string(),
    description: z.string(),
    hero_image: z.string(),
    hero_image_alt: z.string().optional(),
  }),
});

const versions = defineCollection({
  loader: glob({ base: "./src/content/versions", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    version: z.string(),
    releaseDate: z.string(),
    description: z.string().optional(),
    features: z.array(
      z.union([
        z.string(),
        z.object({
          text: z.string(),
          image: z.string().optional(),
          imageAlt: z.string().optional(),
        })
      ])
    ),
    improvements: z.array(
      z.union([
        z.string(),
        z.object({
          text: z.string(),
          image: z.string().optional(),
          imageAlt: z.string().optional(),
        })
      ])
    ).optional(),
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
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
      ogType: z.string().optional(),
      canonical: z.string().optional(),
    }),
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
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
      ogType: z.string().optional(),
      canonical: z.string().optional(),
    }).optional(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    link: z.string(),
  }),
});

const industries = defineCollection({
  loader: glob({ base: "./src/content/industries", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
      ogType: z.string().optional(),
      canonical: z.string().optional(),
    }),
    title: z.string(),
    description: z.string(),
    hero_image: z.string(),
    hero_image_alt: z.string().optional(),
    industry: z.string(),
  }),
});

export const collections = {
  blog,
  services,
  versions,
  pages,
  careers,
  recomendations,
  industries,
};
