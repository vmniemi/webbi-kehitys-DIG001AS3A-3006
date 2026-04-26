import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base:
    process.env.NODE_ENV === "production"
      ? "/webbi-kehitys-DIG001AS3A-3006/viikko5_fixed/"
      : "/",
});