"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "motion/react";
import { Ticker } from "@/components/ui/tickers";

export function HomePage() {
  return (
<div className="flex flex-col w-full">
  {/* First section - Spotlight */}
  <section className="h-screen w-full rounded-none flex flex-col items-center justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
          <div className="absolute top-24 left-0 right-0 z-10 w-full">
          <Ticker />
        </div>
    <div className="absolute inset-0 scale-75 origin-center">
      <Spotlight />
    </div>
    <div className="p-4 max-w-7xl mx-auto relative z-10 w-full">
    <h1 className="text-4xl md:text-7xl font-bold text-center">
      <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
        FIN.
      </span>
      <span className="bg-clip-text text-transparent bg-gradient-to-b from-cyan-200 to-blue-700">
        AI
      </span>
      <br/> 
      <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
        Analyze Accurately.
      </span>
    </h1>
<p className="mt-4 font-light text-base tracking-wide text-neutral-200 max-w-lg text-center mx-auto font-sans">
  A streamlined financial analysis toolkit with Machine Learning Integration.
</p>
    </div>
    
    {/* Connecting element */}
    <div className="absolute bottom-0 left-0 w-full h-90 bg-gradient-to-b from-transparent to-slate-950 z-11"></div>
  </section>

  {/* Second section - Lamp */}
  <section className="h-screen w-full">
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 1.5,
          ease: "easeInOut",
        }}
        className="absolute top-55 mt-8 bg-gradient-to-b from-cyan-50 to-blue-900 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        DATA. <br/> <br/> NEWS. <br/> <br/> SENTIMENT.
      </motion.h1>
    </LampContainer>
  </section>
</div>
  );
}