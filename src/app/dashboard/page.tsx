"use client";

import React from "react";
import { AnimatedNavbar } from "@/components/ui/resizable-navbar";
import { ThemeSwitcher } from "@/components/ui/themeswitch";
import { Logo } from "@/components/ui/logo";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import MarketOverview from "./MarketOverview";
import RelatedNewsCard from "./RelatedNewsCard";

export default function Dashboard() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 to-black">
      <header className="relative flex items-center space-x-4 pr-4 md:pr-8 lg:pr-12 py-3 z-50">
        {/* Header blur effect */}
        <div className="absolute w-full h-20 inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20"></div>

        {/* Navbar content */}
        <div className="relative z-10 flex w-full items-center">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          <div className="flex-grow flex justify-center">
            <AnimatedNavbar />
          </div>

          <div className="flex-shrink-0">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-0 pb-12"> {/* Adjusted padding to move title upwards */}
        {/* Dashboard Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6"> {/* Reduced bottom margin */}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-700">
            Dashboard
          </span>
        </h1>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Market Overview Card */}
          <div className="md:col-span-2 lg:col-span-2 ">
            <MarketOverview />
          </div>

          {/* Portfolio Performance */}
          <div className="relative rounded-xl">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                <RelatedNewsCard symbol="AAPL"/>
          </div>

          {/* News & Alerts */}
          <div className="relative rounded-xl">
            <div className="relative rounded-xl border border-gray-800/50 p-2">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-5 z-10">
                <h2 className="text-xl font-semibold text-white mb-4">Top News</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Recent news items placeholder
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="relative rounded-xl md:col-span-2">
            <div className="relative rounded-xl border border-gray-800/50 p-2">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-5 z-10">
                <h2 className="text-xl font-semibold text-white mb-4">AI Market Insights</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  AI-powered market analysis placeholder
                </div>
              </div>
            </div>
          </div>

          {/* Watchlist */}
          <div className="relative rounded-xl">
            <div className="relative rounded-xl border border-gray-800/50 p-2">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-5 z-10">
                <h2 className="text-xl font-semibold text-white mb-4">Watchlist</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Stock watchlist placeholder
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}