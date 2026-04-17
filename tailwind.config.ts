import type { Config } from "tailwindcss";
import preset from "./src/lib/ui/tailwind-preset";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  presets: [preset as Config],
};

export default config;
