import type { Config } from "tailwindcss";
import preset from "@crymad/ui/tailwind-preset";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [preset as Config],
};

export default config;
