import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@gestolivre/core": path.resolve(__dirname, "../core/src"),
    },
  },
});
