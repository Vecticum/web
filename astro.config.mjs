// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwind from "@astrojs/tailwind";

import alpinejs from "@astrojs/alpinejs";

// https://astro.build/config
export default defineConfig({
  site: "https://vecticum.lt",
  integrations: [mdx(), sitemap(), tailwind(), alpinejs()],
  adapter: vercel(),
  trailingSlash: "never",
});

