"use client";
import React from "react";
import { SparklesCore } from "../ui/sparkles";
import { useTheme } from "next-themes";

export function Logo() {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const particleColor = isDark ? "#FFFFFF" : "#000000";

  return (
    <div className={`h-20 w-30 ml-2 bg-[var(--background)] flex flex-col items-center justify-start overflow-hidden rounded-full`}>
      <h1 className="w-full mt-2 text-xl md:text-2xl lg:text-3xl font-bold text-center text-black dark:text-white relative z-20">
        FIN.AI
      </h1>
      <div className="w-58 h-11 relative">  
        {/* Gradients */}
        <div className="absolute inset-x-8 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-8 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-16 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-16 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={500}
          className="w-full h-full"
          particleColor={particleColor}
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-[var(--background)] [mask-image:radial-gradient(80px_40px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}