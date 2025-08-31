/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useSymbol } from '@/context/SymbolContext';

interface SentimentData {
  analysis: string;
  loading: boolean;
  error: string | null;
}

// Helper function to format and color-code sentiment text
const formatSentimentText = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    // Market Environment section
    if (trimmedLine.startsWith('**Market Environment:**')) {
      return (
        <div key={index} className="mb-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
          <div className="text-blue-300 font-semibold text-xs uppercase tracking-wide mb-2">Market Environment</div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {trimmedLine.replace('**Market Environment:**', '').trim()}
          </p>
        </div>
      );
    }
    
    // Key Headlines Analysis section header
    if (trimmedLine.startsWith('**Key Headlines Analysis:**')) {
      return (
        <div key={index} className="text-amber-300 font-semibold text-xs uppercase tracking-wide mb-3 mt-4">
          Key Headlines Analysis
        </div>
      );
    }
    
    // Overall Sentiment section
    if (trimmedLine.startsWith('**Overall Sentiment:**')) {
      return (
        <div key={index} className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/30">
          <div className="text-green-300 font-semibold text-xs uppercase tracking-wide mb-2">Overall Sentiment</div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {trimmedLine.replace('**Overall Sentiment:**', '').trim()}
          </p>
        </div>
      );
    }
    
    // Bullet point sentiment analysis (handle the new format)
    if (trimmedLine.startsWith('- **') && (
        trimmedLine.includes('Strong Bullish') || 
        trimmedLine.includes('Cautious Bullish') || 
        trimmedLine.includes('Bullish')
    )) {
      return (
        <div key={index} className="mb-2 p-2 bg-green-900/20 rounded border-l-4 border-green-400">
          <p className="text-sm">
            <span className="text-green-400 font-medium">🟢 </span>
            <span className="text-gray-200">{formatBulletPoint(trimmedLine)}</span>
          </p>
        </div>
      );
    }
    
    if (trimmedLine.startsWith('- **') && (
        trimmedLine.includes('Cautious Bearish') || 
        trimmedLine.includes('Strong Bearish') || 
        trimmedLine.includes('Bearish') || 
        trimmedLine.includes('Fear')
    )) {
      return (
        <div key={index} className="mb-2 p-2 bg-red-900/20 rounded border-l-4 border-red-400">
          <p className="text-sm">
            <span className="text-red-400 font-medium">🔴 </span>
            <span className="text-gray-200">{formatBulletPoint(trimmedLine)}</span>
          </p>
        </div>
      );
    }
    
    if (trimmedLine.startsWith('- **') && (
        trimmedLine.includes('Neutral') || 
        trimmedLine.includes('Uncertain') || 
        trimmedLine.includes('Mixed')
    )) {
      return (
        <div key={index} className="mb-2 p-2 bg-yellow-900/20 rounded border-l-4 border-yellow-400">
          <p className="text-sm">
            <span className="text-yellow-400 font-medium">🟡 </span>
            <span className="text-gray-200">{formatBulletPoint(trimmedLine)}</span>
          </p>
        </div>
      );
    }
    
    // Regular paragraphs (for the 2-3 sentences after Market Environment)
    if (trimmedLine.length > 0 && !trimmedLine.startsWith('**') && !trimmedLine.startsWith('- **')) {
      return (
        <p key={index} className="mb-3 text-gray-300 text-sm leading-relaxed">
          {formatBulletPoint(trimmedLine)}
        </p>
      );
    }
    
    return null;
  });
};

// Helper function to format bullet points and bold text
const formatBulletPoint = (text: string) => {
  // Remove markdown-style bullet points
  let formatted = text.replace(/^-\s*/, '').replace(/^\*\s*/, '');
  
  // Format bold text within ** **
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  
  // Return JSX with dangerouslySetInnerHTML for bold formatting
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export default function AIMarketSentiment() {
  const { selectedSymbol } = useSymbol();
  const [sentiment, setSentiment] = useState<SentimentData>({
    analysis: '',
    loading: true,
    error: null
  });

  const fetchSentiment = async (symbol?: string) => {
    setSentiment(prev => ({ ...prev, loading: true, error: null, analysis: '' }));
    
    try {
      const endpoint = symbol 
        ? `http://localhost:5000/api/sentiment?symbol=${symbol}` 
        : 'http://localhost:5000/api/sentiment';
      
      const eventSource = new EventSource(endpoint);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.chunk) {
          setSentiment(prev => ({
            ...prev,
            analysis: prev.analysis + data.chunk
          }));
        } else if (data.done) {
          setSentiment(prev => ({
            ...prev,
            loading: false
          }));
          eventSource.close();
        } else if (data.error) {
          setSentiment(prev => ({
            ...prev,
            loading: false,
            error: 'Error generating sentiment analysis'
          }));
          eventSource.close();
        }
      };
      
      eventSource.onerror = () => {
        setSentiment(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to connect to sentiment stream'
        }));
        eventSource.close();
      };
      
      return () => {
        eventSource.close();
      };
      
    } catch (error) {
      setSentiment({
        analysis: '',
        loading: false,
        error: 'Failed to fetch sentiment analysis'
      });
    }
  };

  useEffect(() => {
    fetchSentiment(selectedSymbol);
  }, [selectedSymbol]);

  const refreshSentiment = () => {
    fetchSentiment(selectedSymbol);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 
          className="font-bold text-lg text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(to left, rgb(255, 255, 255) 50%, #1976d2 100%)",
          }}
        >
          {selectedSymbol ? `${selectedSymbol} Sentiment` : 'Market Sentiment'}
        </h2>
        <button
          onClick={refreshSentiment}
          disabled={sentiment.loading}
          className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded border border-blue-600/30 transition-colors disabled:opacity-50"
        >
          {sentiment.loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
        {sentiment.loading ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-sm">Analyzing sentiment...</span>
            </div>
            {/* Show partial content while streaming */}
            {sentiment.analysis && (
              <div className="space-y-2">
                {formatSentimentText(sentiment.analysis)}
                <span className="animate-pulse text-blue-400">▊</span> {/* Typing cursor */}
              </div>
            )}
          </div>
        ) : sentiment.error ? (
          <div className="flex items-center justify-center h-full text-red-400 text-sm p-4 bg-red-900/10 rounded border border-red-500/30">
            {sentiment.error}
          </div>
        ) : (
          <div className="space-y-2">
            {formatSentimentText(sentiment.analysis)}
          </div>
        )}
      </div>
    </div>
  );
}