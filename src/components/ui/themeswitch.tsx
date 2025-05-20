"use client";
import { useTheme } from "next-themes";
import { DarkModeToggle } from "@anatoliygatt/dark-mode-toggle";
import type { Mode } from "@anatoliygatt/dark-mode-toggle";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("light");
  const [mounted, setMounted] = useState(false);

  // Only show the theme switcher once mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync toggle state with next-themes
  useEffect(() => {
    if (resolvedTheme === "dark") setMode("dark");
    else setMode("light");
  }, [resolvedTheme]);

  // Don't render anything until mounted on client
  if (!mounted) {
    return <div className="w-12 h-6" />; // Placeholder with same approximate size
  }

  return (
    <DarkModeToggle
      mode={mode}
      size="sm"
      onChange={(mode) => {
        setMode(mode);
        setTheme(mode);
      }}
    />
  );
}