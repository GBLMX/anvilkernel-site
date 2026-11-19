import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://anvilkernel.com",
  integrations: [sitemap()],
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
