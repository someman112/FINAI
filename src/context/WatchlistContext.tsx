"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  updateWatchlistPrices: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = async (symbol: string) => {
    if (isInWatchlist(symbol)) return;

    try {
      // Fetch current price data
      const response = await fetch(`http://localhost:5000/api/stocks/${symbol}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const latest = data[data.length - 1];
        const previous = data[data.length - 2];
        
        const newItem: WatchlistItem = {
          symbol: symbol.toUpperCase(),
          name: symbol.toUpperCase(), // You might want to fetch the full company name
          price: latest.close,
          change: latest.close - (previous?.close || latest.close),
          changePercent: ((latest.close - (previous?.close || latest.close)) / (previous?.close || latest.close)) * 100,
          lastUpdated: new Date()
        };
        
        setWatchlist(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol.toUpperCase()));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol.toUpperCase());
  };

  const updateWatchlistPrices = async () => {
    const updatedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const response = await fetch(`http://localhost:5000/api/stocks/${item.symbol}`);
          const data = await response.json();
          
          if (data && data.length > 0) {
            const latest = data[data.length - 1];
            const previous = data[data.length - 2];
            
            return {
              ...item,
              price: latest.close,
              change: latest.close - (previous?.close || latest.close),
              changePercent: ((latest.close - (previous?.close || latest.close)) / (previous?.close || latest.close)) * 100,
              lastUpdated: new Date()
            };
          }
          return item;
        } catch (error) {
          console.error(`Error updating ${item.symbol}:`, error);
          return item;
        }
      })
    );
    
    setWatchlist(updatedWatchlist);
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      updateWatchlistPrices
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};