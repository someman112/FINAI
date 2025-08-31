"use client";

import React, { useState, useEffect } from 'react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useSymbol } from '@/context/SymbolContext';
import { FaPlus, FaTimes, FaSyncAlt } from 'react-icons/fa';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export const Watchlist: React.FC = () => {
  const { watchlist, addToWatchlist, removeFromWatchlist, updateWatchlistPrices } = useWatchlist();
  const { setSymbol } = useSymbol();
  const [newSymbol, setNewSymbol] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-update prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateWatchlistPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [updateWatchlistPrices]);

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      await addToWatchlist(newSymbol.trim());
      setNewSymbol('');
    }
  };

  const handleRefresh = async () => {
    setIsUpdating(true);
    await updateWatchlistPrices();
    setIsUpdating(false);
  };

  const handleSymbolClick = (symbol: string) => {
    setSymbol(symbol);
  };

  return (
    <div className="relative rounded-none">
      <div className="relative rounded-none border border-gray-800/50 p-2">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="font-bold text-lg text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to left, rgb(255, 255, 255) 15%, #1976d2 100%)" 
              }}
            >
              Watchlist
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isUpdating}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaSyncAlt className={`${isUpdating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Add new symbol form */}
          <form onSubmit={handleAddSymbol} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="Add symbol (e.g., AAPL)"
              className="flex-1 px-3 py-2 bg-gray-950 rounded-none bg-gradient-to-r from-[#002861] to-[rgba(13, 13, 13, 0.5)] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-none transition-colors flex items-center gap-2"
            >
              <FaPlus size={12} />
            </button>
          </form>

          {/* Watchlist items */}
          <div className="h-144 overflow-y-auto text-gray-400 custom-scrollbar">
            {watchlist.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No stocks in watchlist
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map((item) => (
                  <div
                    key={item.symbol}
                    style={{background: `radial-gradient(circle at 10% 10%, rgba(0, 40, 97, 0.8), rgba(13, 13, 13, 0.15))`}}
                    className="flex items-center justify-between p-3 bg-gray-900 rounded-none hover:bg-gray-800/70 transition-colors group cursor-pointer"
                    onClick={() => handleSymbolClick(item.symbol)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.symbol}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(item.symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.name}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-white">
                        ${item.price.toFixed(2)}
                      </div>
                      <div className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.change >= 0 ? '+' : ''}
                        {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Last updated timestamp */}
            {watchlist.length > 0 && (
              <div className="text-xs text-gray-500 text-center mt-4">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};