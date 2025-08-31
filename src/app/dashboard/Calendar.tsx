/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { format} from 'date-fns';
import { isAfter } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import React from 'react';

interface EconomicEvent {
  event: string;    
  currency: string; 
  date: string;     // Format like "Sun May 25"
  time: string;     // Format like "2:40pm" or "All Day"
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
}

// Function to determine badge color based on impact
function getImpactColor(impact: string) {
  switch (impact.toLowerCase()) {
    case 'high':
      return 'bg-rose-500/15 text-rose-300 border border-rose-400/30 backdrop-blur-md shadow-rose-500/10'; 
    case 'medium':
      return 'bg-amber-500/15 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-amber-500/10'; 
    case 'low':
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-emerald-500/10'; 
    case 'holiday':
      return 'bg-sky-500/15 text-sky-300 border border-sky-400/30 backdrop-blur-md shadow-sky-500/10'; 
    default:
      return 'bg-slate-500/15 text-slate-300 border border-slate-400/30 backdrop-blur-md shadow-slate-500/10'; 
  }
}

function getActualValueColor(actual: string, forecast: string) {
  if (!actual) return "text-gray-300"; // Default color for empty values
  
  // Try to parse values as numbers for comparison
  // Remove any % or other non-numeric characters first
  const actualValue = parseFloat(actual.replace(/[^\d.-]/g, ''));
  const forecastValue = parseFloat(forecast.replace(/[^\d.-]/g, ''));
  
  // Check if both are valid numbers
  if (!isNaN(actualValue) && !isNaN(forecastValue)) {
    if (actualValue > forecastValue) return "text-emerald-400"; // Better than forecast
    if (actualValue < forecastValue) return "text-rose-400";    // Worse than forecast
  }
  
  return "text-gray-300"; // Default color if comparison not possible
}


// Function to convert currency code to flag emoji
function getCountryFlag(countryCode: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'EUR': 'eu',
    'GBP': 'gb',
    'USD': 'us',
    'JPY': 'jp',
    'CNY': 'cn',
    'RUB': 'ru',
    'HKD': 'hk',
    'SGD': 'sg',
    'INR': 'in',
    'BRL': 'br',
    'ZAR': 'za',
    'MXN': 'mx',
    'SEK': 'se',
    'NOK': 'no',
    'DKK': 'dk',
    'PLN': 'pl',
    'TRY': 'tr',
    'KRW': 'kr',
  };

  
  if (countryCode.toUpperCase() == "ALL"){
    return "https://upload.wikimedia.org/wikipedia/commons/a/ac/White_flag_of_surrender.svg";
  }
  if (specialCases[countryCode.toUpperCase()]) {
    return `https://flagcdn.com/${specialCases[countryCode.toUpperCase()]}.svg`;
  }
  
  // Otherwise, just take the first two characters and convert to lowercase
  const isoCode = countryCode.substring(0, 2).toLowerCase();
  return `https://flagcdn.com/${isoCode}.svg`;
}

export function EconomicEvents({ events }: { events: EconomicEvent[] }) {
  const [sortedEvents, setSortedEvents] = useState<EconomicEvent[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<Map<string, EconomicEvent[]>>(new Map());
  const [nextEventId, setNextEventId] = useState<number | null>(null);
  const nextEventRef = useRef<HTMLTableRowElement>(null);

  // Helper function to parse "Sun May 25" format to Date object
const parseEventDate = (dateStr: string, timeStr: string) => {
  try {
    // Parse the date string "Sun May 25"
    const dateParts = dateStr.split(' ');
    if (dateParts.length < 3) throw new Error(`Invalid date format: ${dateStr}`);
    
    // Get month number (0-11) from month name
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const day = parseInt(dateParts[2], 10);
    const month = months[dateParts[1]];
    if (month === undefined || isNaN(day)) throw new Error(`Invalid date parts: ${dateStr}`);
    
    // Create date with current year
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, month, day);
    
    // Handle "All Day" and similar non-specific times
    if (timeStr.toLowerCase() === 'all day') {
      date.setHours(12, 0, 0, 0); // Default to noon for "All Day"
      return date;
    }
    
    // Parse time like "2:40pm"
    const isPM = timeStr.toLowerCase().includes('pm');
    const timeOnly = timeStr.toLowerCase().replace('am', '').replace('pm', '').trim();
    const [hours, minutes] = timeOnly.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) throw new Error(`Invalid time format: ${timeStr}`);
    
    // Adjust hours for PM
    let adjustedHours = hours;
    if (isPM && hours < 12) adjustedHours += 12;
    if (!isPM && hours === 12) adjustedHours = 0;
    
    date.setHours(adjustedHours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error("Error parsing date:", error, "for", dateStr, timeStr);
    // Return a more reasonable fallback - just a few hours in the future
    return new Date(Date.now() + 1000 * 60 * 60 * 3); // 3 hours in the future
  }
};

  const findNextEvent = () => {
    const now = new Date();
    let closestFutureEventIndex: number | null = null;
    let closestTimeDiff = Infinity;
    
    // Find the closest future event
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      try {
        const eventDate = parseEventDate(event.date, event.time);
        
        // Only consider future events
        if (isAfter(eventDate, now)) {
          const timeDiff = eventDate.getTime() - now.getTime();
          
          // If this event is sooner than our current closest
          if (timeDiff < closestTimeDiff) {
            closestFutureEventIndex = i;
            closestTimeDiff = timeDiff;
          }
        }
      } catch (error) {
        console.error("Error finding next event:", error);
      }
    }
    
    if (closestFutureEventIndex !== null) {
      // Store the index directly
      setNextEventId(closestFutureEventIndex);
      return;
    }
    
    // If no future events found, check for events today
    const todayString = format(now, 'EEE MMM d');
    const todayEvents = sortedEvents
      .map((event, index) => ({ event, index }))
      .filter(item => item.event.date === todayString);
    
    if (todayEvents.length > 0) {
      // If there are events today, highlight the last one
      const lastTodayEvent = todayEvents[todayEvents.length - 1];
      setNextEventId(lastTodayEvent.index);
    } else {
      setNextEventId(null);
    }
  };

  useEffect(() => {
    if (nextEventId !== null && nextEventRef.current) {
      // Scroll with a slight delay to ensure the table is fully rendered
      const timer = setTimeout(() => {
        nextEventRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [nextEventId, groupedByDate]);
  
  useEffect(() => {
    if (events && events.length > 0) {
      // Sort events by date
      const sorted = [...events].sort((a, b) => {
        try {
          const dateA = parseEventDate(a.date, a.time);
          const dateB = parseEventDate(b.date, b.time);
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error("Error sorting dates:", error);
          return 0;
        }
      });

      findNextEventWithData(sorted);
      setSortedEvents(sorted);
      
      // Group events by date for section headers
      const grouped = sorted.reduce((acc, event) => {
        const dateKey = event.date; // Use the full date string as key
        if (!acc.has(dateKey)) {
          acc.set(dateKey, []);
        }
        acc.get(dateKey)?.push(event);
        return acc;
      }, new Map<string, EconomicEvent[]>());
      
      setGroupedByDate(grouped);
    }
  }, [events]);

const findNextEventWithData = (events: EconomicEvent[]) => {
  if (events.length === 0) {
    setNextEventId(null);
    return;
  }

  const now = new Date();
  
  // Find first event that hasn't happened yet
  let foundFutureEvent = false;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    try {
      const eventDate = parseEventDate(event.date, event.time);
      const isEventInFuture = eventDate.getTime() > now.getTime();
      
      if (isEventInFuture) {
        setNextEventId(i);
        foundFutureEvent = true;
        return;
      }
    } catch (error) {
      console.error("Error parsing date in findNextEventWithData:", error);
    }
  }
  
  // If we didn't find any future events, try to find today's events
  if (!foundFutureEvent) {
    // Format today's date in the same format as the event dates
    const todayString = format(now, 'EEE MMM d');
    
    // Find events that match today's date
    const todayEvents = events
      .map((event, index) => ({ event, index }))
      .filter(item => {
        const matches = item.event.date === todayString;
        return matches;
      });
    
    
    if (todayEvents.length > 0) {
      // If there are events today, highlight the last one
      const lastTodayEvent = todayEvents[todayEvents.length - 1];
      setNextEventId(lastTodayEvent.index);
      return;
    }
  }
  
  // If all else fails, just use the first event
  setNextEventId(0);
};

useEffect(() => {
  const intervalId = setInterval(() => {
    if (sortedEvents.length > 0) {
      // Use the same function that's used during initialization
      findNextEventWithData(sortedEvents);
    }
  }, 15000); // Update every 15 seconds for more responsive UI
  
  return () => clearInterval(intervalId);
}, [sortedEvents]);
  
  // Function to check if an event is the next one
  const isNextEvent = (event: EconomicEvent, index: number) => {
    return nextEventId === index;
  };

  const getTimeRemaining = (event: EconomicEvent) => {
    try {
      const eventDate = parseEventDate(event.date, event.time);
      const now = new Date();
      
      if (!isAfter(eventDate, now)) return null;
      
      const diffMs = eventDate.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else if (diffMins > 0) {
        return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      } else {
        return 'now';
      }
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="relative rounded-none custom-scrollbar">
      <div className="relative rounded-none border border-gray-800/50 p-2">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10">
          <h2 className="font-bold text-lg text-transparent bg-clip-text" 
              style={{ backgroundImage: "linear-gradient(to left, rgb(255, 255, 255) 90%, #1976d2 100%)" }}>
            Economic Calendar
          </h2>
          
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="bg-black/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-medium text-gray-400">Date & Time</TableHead>
                  <TableHead className="text-xs font-medium text-gray-400">Event</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium text-gray-400">Country</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium text-gray-400">Impact</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-gray-400">Actual</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-gray-400">Forecast</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-gray-400">Previous</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(groupedByDate.entries()).map(([dateStr, dateEvents]) => (
                  <React.Fragment key={`date-group-${dateStr}`}>
                    <TableRow className="group">
                      <TableCell className="font-bold text-lg text-gray-100" colSpan={7}>
                        {dateStr}
                      </TableCell>
                    </TableRow>
                    
                    {dateEvents.map((event, index) => {
                      const globalIndex = sortedEvents.findIndex(e => 
                        e.event === event.event && e.date === event.date && e.time === event.time
                      );
                      
                      return (
                        <TableRow 
                          key={`${dateStr}-${index}`}
                          ref={isNextEvent(event, globalIndex) ? nextEventRef : null}
                          className={`hover:bg-gray-800/20 border-b border-gray-800/30 ${
                            isNextEvent(event, globalIndex) ? 'border-l-4 border-blue-500' : ''
                          }`}
                          style={isNextEvent(event, globalIndex) ? 
                            { 
                              backgroundColor: 'rgba(59, 131, 246, 0.1)',
                              borderLeftColor: 'rgb(59, 131, 246)',
                            } : {}
                          }
                        >
                          <TableCell className="font-mono text-xs text-gray-400">
                            {event.time}
                            {isNextEvent(event, globalIndex) && (
                              <span className="ml-2 text-xs bg-blue-900 text-white px-2 py-0.5 rounded-xs animate-pulse">
                                Up Next {getTimeRemaining(event) && `(${getTimeRemaining(event)})`}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {event.event}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase text-xs flex items-center gap-1">
                              <img 
                                src={getCountryFlag(event.currency)} 
                                alt={`${event.currency} flag`}
                                className="w-4 h-3 mr-1"
                                onError={(e) => {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='12' viewBox='0 0 16 12'%3E%3Crect width='16' height='12' fill='%23ccc'/%3E%3C/svg%3E";
                                }}
                              />
                              {event.currency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getImpactColor(event.impact)} text-xs font-medium px-2.5 py-0.5 rounded shadow-sm`}>
                              {event.impact}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-xs ${getActualValueColor(event.actual, event.forecast)}`}>
                            {event.actual || "-"}
                          </TableCell>
                          <TableCell className="text-xs text-gray-300">
                            {event.forecast || "-"}
                          </TableCell>
                          <TableCell className="text-xs text-gray-300">
                            {event.previous || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {sortedEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No economic events to display
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EconomicEventsContainer() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEconomicEvents() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/economic-events');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load economic events:', err);
        setError('Failed to load economic events data');
      } finally {
        setLoading(false);
      }
    }

    fetchEconomicEvents();
  }, []);

  if (loading) {
    return (
      <div className="relative rounded-none">
        <div className="relative rounded-none border border-gray-800/50 p-2">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
          <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10 h-[300px] flex items-center justify-center">
            <div className="text-gray-400">Loading economic events...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative rounded-none">
        <div className="relative rounded-none border border-gray-800/50 p-2">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
          <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10 h-[300px] flex items-center justify-center">
            <div className="text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return <EconomicEvents events={events} />;
}