"use client";

import { useTheme } from "next-themes";
import { ThemeToggleView } from "./view";

/**
 * Container component for theme toggle.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme();

  return <ThemeToggleView onSetTheme={setTheme} />;
}

/**
 * Container component for compact theme toggle.
 */
export function ThemeToggleCompact() {
  const { setTheme } = useTheme();

  return <ThemeToggleView onSetTheme={setTheme} variant="ghost" />;
}
