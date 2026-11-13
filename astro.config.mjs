import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://anvilkernel.com",
  build: { format: "preserve" },
  devToolbar: { enabled: false },
});
