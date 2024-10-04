import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["json", "json-summary", "text"],
      reportOnFailure: true,
    },
    env: loadEnv("", process.cwd(), ""),
  },
});
