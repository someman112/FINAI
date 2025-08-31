import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const API_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const CACHE_FILE = path.join(process.cwd(), 'cache', 'economic-events.json');

interface EconomicEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

interface CachedData {
  events: EconomicEvent[];
  timestamp: number;
  lastEventDate: string;
}

// Ensure cache directory exists
function ensureCacheDirectory() {
  const cacheDir = path.join(process.cwd(), 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

// Read cached data if available
function readCachedData(): CachedData | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading cache file:', error);
  }
  return null;
}

// Write data to cache file
function writeCacheData(data: CachedData) {
  try {
    ensureCacheDirectory();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache file:', error);
  }
}

export async function GET() {
  const now = new Date();
  const cachedData = readCachedData();
  
  // Check if cache is valid (last event date is in the future)
  if (cachedData) {
    const lastEventDate = new Date(cachedData.lastEventDate);
    if (now < lastEventDate) {
      console.log('Using cached economic events data');
      return NextResponse.json(cachedData.events);
    }
  }
  
  // Fetch fresh data if cache is invalid or doesn't exist
  try {
    console.log('Fetching fresh economic events data');
    const response = await fetch(API_URL, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const events: EconomicEvent[] = await response.json();
    
    // Find the last event date for cache validation
    const sortedEvents = [...events].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastEventDate = sortedEvents.length > 0 ? sortedEvents[0].date : now.toISOString();
    
    // Cache the data
    const newCacheData: CachedData = {
      events,
      timestamp: now.getTime(),
      lastEventDate
    };
    
    writeCacheData(newCacheData);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching economic events:', error);
    
    // If fetch fails but we have cached data, return it as fallback
    if (cachedData) {
      return NextResponse.json(cachedData.events);
    }
    
    // Return error response if everything fails
    return NextResponse.json(
      { error: 'Failed to fetch economic events data' },
      { status: 500 }
    );
  }
}