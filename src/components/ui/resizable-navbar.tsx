"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Home", link: "/" },
  { name: "Dashboard", link: "/dashboard" },
  { name: "News", link: "/news" },
];

export function AnimatedNavbar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <nav
      className={cn(
        "w-full max-w-md mx-auto flex justify-center items-center bg-black/80 dark:bg-neutral-900/80 shadow-lg py-2 rounded-3xl",
        className
      )}
    >
      <ul className="relative flex gap-5">
        {tabs.map((tab, idx) => {
          const isActive = pathname === tab.link;
          const isHovered = hovered === idx;
          return (
            <li key={tab.name} className="relative">
              {/* Bubble effect on hover - changed from blue to greyish white */}
              {isHovered && (
                <motion.div
                  layoutId="bubble"
                  className="absolute inset-0 z-0 rounded-full bg-gray-200/30 dark:bg-gray-300/20"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                />
              )}
              <button
                className={cn(
                  "relative z-10 px-4 py-1.5 text-lg font-semibold transition-colors duration-200", // Reduced py-2 to py-1.5
                  isActive
                    ? "text-gray-100 dark:text-gray-200"
                    : "text-white hover:text-gray-300"
                )}
                onClick={() => router.push(tab.link)}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {tab.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute left-0 right-0 -bottom-1 h-1 rounded bg-gray-200 dark:bg-gray-300" // Changed from blue to light gray
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}