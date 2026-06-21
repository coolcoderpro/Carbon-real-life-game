import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The game logic under test is pure and DOM-free, so a fast node env is fine.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
