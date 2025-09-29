import myConfig from "@sparticuz/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["dist", "coverage", "node_modules"],
  },
  ...myConfig,
);
