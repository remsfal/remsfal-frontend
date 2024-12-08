import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:5173",
  },

  component: {
    specPattern: "test/**/*.cy.{js,jsx,ts,tsx}",
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
