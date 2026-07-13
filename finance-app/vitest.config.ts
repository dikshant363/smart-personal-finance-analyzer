import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@finance/shared-config": path.resolve(__dirname, "../packages/shared-config/index.ts"),
      "@finance/shared-types": path.resolve(__dirname, "../packages/shared-types/index.ts"),
      "@finance/shared-models": path.resolve(__dirname, "../packages/shared-models/index.ts"),
      "@finance/shared-validation": path.resolve(__dirname, "../packages/shared-validation/index.ts")
    }
  },
});
