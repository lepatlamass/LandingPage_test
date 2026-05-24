"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {/* 
        We use conditional rendering or hiding via Tailwind depending on how next-themes injects the dark class.
        Using next-themes, 'dark' class is applied to the html tag when in dark mode.
      */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-black dark:text-white" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
