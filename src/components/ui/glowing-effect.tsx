"use client";

import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  borderWidth?: number;
  lowPerformanceMode?: boolean;
  cornerPreference?: "random" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const GlowingEffect = memo(
  ({
    blur = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    borderWidth = 1,
    disabled = false,
    lowPerformanceMode = false,
    cornerPreference = "random",
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [glowPosition, setGlowPosition] = useState<number>(0);

    useEffect(() => {
      if (disabled) return;

      // Generate random position based on corner preference
      let angle: number;
      
      switch (cornerPreference) {
        case "top-left":
          // Top-left corner: 225-315 degrees
          angle = Math.random() * 90 + 225;
          break;
        case "top-right":
          // Top-right corner: 315-45 degrees (wraps around 0)
          angle = Math.random() * 90 + 315;
          if (angle >= 360) angle -= 360;
          break;
        case "bottom-right":
          // Bottom-right corner: 45-135 degrees
          angle = Math.random() * 90 + 45;
          break;
        case "bottom-left":
          // Bottom-left corner: 135-225 degrees
          angle = Math.random() * 90 + 135;
          break;
        case "random":
        default:
          // Completely random position
          angle = Math.random() * 360;
          break;
      }

      setGlowPosition(angle);

      // Set the CSS variable immediately
      if (containerRef.current) {
        containerRef.current.style.setProperty("--start", String(angle));
        containerRef.current.style.setProperty("--active", "1");
      }
    }, [disabled, cornerPreference]);

    // Skip complex rendering if disabled
    if (disabled) {
      return (
        <div
          className={cn(
            "pointer-events-none absolute -inset-px rounded-[inherit] border opacity-0 border-white"
          )}
        />
      );
    }

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": glowPosition.toString(),
              "--active": "1", // Always active since it's static
              "--glowingeffect-border-width": `${borderWidth}px`,
              // Simplified gradient for better performance
              "--repeating-conic-gradient-times": lowPerformanceMode ? "3" : "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : lowPerformanceMode 
                    ? `radial-gradient(circle,rgb(132, 210, 255) 10%, #38B6FF00 20%),
                       repeating-conic-gradient(
                         from 236.84deg at 50% 50%,
                         #38B6FF 0%,
                         #00A3FF calc(50% / var(--repeating-conic-gradient-times)),
                         #38B6FF calc(100% / var(--repeating-conic-gradient-times))
                       )`
                    : `radial-gradient(circle,rgb(132, 210, 255) 10%, #38B6FF00 20%),
                       radial-gradient(circle at 40% 40%,rgb(138, 220, 255) 5%, #5CCEFF00 15%),
                       radial-gradient(circle at 60% 60%,rgb(170, 224, 255) 10%, #00A3FF00 20%), 
                       radial-gradient(circle at 40% 60%, #86D4FF 10%, #86D4FF00 20%),
                       repeating-conic-gradient(
                         from 236.84deg at 50% 50%,
                         #38B6FF 0%,
                         #5CCEFF calc(25% / var(--repeating-conic-gradient-times)),
                         #00A3FF calc(50% / var(--repeating-conic-gradient-times)), 
                         #86D4FF calc(75% / var(--repeating-conic-gradient-times)),
                         #38B6FF calc(100% / var(--repeating-conic-gradient-times))
                       )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)]",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)]",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };