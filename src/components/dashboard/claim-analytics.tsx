"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types and utility functions for analytics data
// Normally this would be imported from a shared module, but including here for simplicity
interface AnalyticsData {
  totalEvents: number;
  totalTokensCreated: number;
  totalTokensClaimed: number;
  conversionRate: number;
  claimsByHour: {
    hour: number;
    count: number;
  }[];
  claimsByDay: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topEvents: {
    name: string;
    tokensIssued: number;
    tokensClaimed: number;
    conversionRate: number;
  }[];
  recentActivity: {
    time: string;
    action: string;
    recipient: string;
    event: string;
  }[];
}

// Function for getting analytics data - would be replaced with actual blockchain API calls
async function getAnalyticsData(publicKey: any, timeframe: 'week' | 'month' = 'week'): Promise<AnalyticsData | null> {
  if (!publicKey) return null;
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would fetch actual data from the blockchain
  // For now, we'll return zeros to indicate no real data yet
  return {
    totalEvents: 0,
    totalTokensCreated: 0,
    totalTokensClaimed: 0,
    conversionRate: 0,
    claimsByHour: Array(24).fill(0).map((_, hour) => ({ hour, count: 0 })),
    claimsByDay: Array(timeframe === 'week' ? 7 : 30).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        count: 0
      };
    }),
    deviceBreakdown: [
      { type: 'Mobile', count: 0, percentage: 0 },
      { type: 'Desktop', count: 0, percentage: 0 },
      { type: 'Tablet', count: 0, percentage: 0 }
    ],
    topEvents: [
      { name: 'Scalable cToken Demo', tokensIssued: 0, tokensClaimed: 0, conversionRate: 0 }
    ],
    recentActivity: []
  };
}

// Helper functions
function generateHourlyData() {
  const hourlyData = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Create a realistic distribution with more activity during day/evening
    let baseCount;
    if (hour >= 9 && hour <= 18) {
      // Work hours (9am-6pm): Higher activity
      baseCount = 50 + Math.floor(Math.random() * 60);
    } else if ((hour >= 19 && hour <= 22) || (hour >= 7 && hour <= 8)) {
      // Early morning and evening: Medium activity
      baseCount = 20 + Math.floor(Math.random() * 40);
    } else {
      // Night: Low activity
      baseCount = Math.floor(Math.random() * 15);
    }
    
    hourlyData.push({ hour, count: baseCount });
  }
  
  return hourlyData;
}

function generateDailyData(timeframe: 'week' | 'month') {
  const dailyData = [];
  const today = new Date();
  
  // Number of days to generate data for
  const daysToGenerate = timeframe === 'week' ? 7 : 30;
  
  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (daysToGenerate - 1 - i));
    
    // Generate a claim count with some variance and an upward trend
    const baseCount = 150 + Math.floor(Math.random() * 100);
    // Add a multiplier that increases for more recent days
    const recencyMultiplier = 1 + (i / daysToGenerate);
    // Weekend multiplier (weekend days get more claims)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendMultiplier = isWeekend ? 1.3 : 1;
    
    const count = Math.floor(baseCount * recencyMultiplier * weekendMultiplier);
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return dailyData;
}

// Simple progress component
const Progress = ({ value = 0, className = '' }: { value?: number, className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-800 ${className}`}>
    <div 
      className="h-full bg-white transition-all" 
      style={{ width: `${value}%` }}
    />
  </div>
);

// Types for analytics data
interface AnalyticsData {
  totalEvents: number;
  totalTokensCreated: number;
  totalTokensClaimed: number;
  conversionRate: number;
  claimsByHour: {
    hour: number;
    count: number;
  }[];
  claimsByDay: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topEvents: {
    name: string;
    tokensIssued: number;
    tokensClaimed: number;
    conversionRate: number;
  }[];
  recentActivity: {
    time: string;
    action: string;
    recipient: string;
    event: string;
  }[];
}

export function ClaimAnalytics() {
  const { connected, publicKey } = useWallet();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [connected, publicKey, timeframe]);

  // Function to fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!connected || !publicKey) return;
    setLoading(true);
    try {
      const data = await getAnalyticsData(publicKey, timeframe);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Simple chart rendering for horizontal bar chart
  const renderBarChart = (data: {hour: number, count: number}[] | {date: string, count: number}[], maxValue: number) => {
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const label = 'hour' in item ? 
            `${item.hour}:00${item.hour < 12 ? 'am' : 'pm'}` : 
            formatDate(item.date);
          
          const percentage = (item.count / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-16 text-xs text-gray-400">{label}</div>
              <div className="flex-1 h-7 bg-gray-800 rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-white/90 flex items-center pl-2 text-xs text-black font-medium"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 ? item.count : ''}
                </div>
              </div>
              {percentage <= 15 && <div className="text-xs w-10">{item.count}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#121212] rounded-lg p-8 flex items-center justify-center min-h-[300px] border border-dashed border-gray-800">
        <div className="flex items-center">
          
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-800">
        <p className="text-gray-400 text-center mb-4">No analytics data available</p>
        <Button 
          onClick={fetchAnalyticsData}
          className="bg-white text-black hover:bg-gray-200 transition-colors"
          size="sm"
        >
          Load Analytics
        </Button>
      </div>
    );
  }

  const maxHourlyCount = Math.max(...analyticsData.claimsByHour.map(item => item.count));
  const maxDailyCount = Math.max(...analyticsData.claimsByDay.map(item => item.count));

  if (!connected) {
    return (
      <div className="bg-[#121212] rounded-lg p-8 flex items-center justify-center min-h-[300px] border border-dashed border-gray-800">
        <p className="text-gray-400 text-center">Connect your wallet to view token claim analytics</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Token Claim Analytics</h2>
        <div className="flex items-center gap-2">
          <Tabs value={timeframe} className="w-auto">
            <TabsList className="bg-[#1a1a1a]">
              <TabsTrigger 
                value="week" 
                onClick={() => setTimeframe('week')}
                className={timeframe === 'week' ? 'bg-white text-black' : 'text-gray-400'}
              >
                Week
              </TabsTrigger>
              <TabsTrigger 
                value="month" 
                onClick={() => setTimeframe('month')}
                className={timeframe === 'month' ? 'bg-white text-black' : 'text-gray-400'}
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={fetchAnalyticsData} 
            className="bg-white text-black hover:bg-gray-200 transition-colors"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards with gradient styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-start">
            
            <div>
              <div className="text-sm text-gray-400">Total Events</div>
              <div className="text-3xl font-semibold">{analyticsData.totalEvents}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-start">
            
            <div>
              <div className="text-sm text-gray-400">Tokens Created</div>
              <div className="text-3xl font-semibold">{analyticsData.totalTokensCreated.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-start">
            
            <div>
              <div className="text-sm text-gray-400">Tokens Claimed</div>
              <div className="text-3xl font-semibold">{analyticsData.totalTokensClaimed.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-900/10 to-yellow-900/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-start">
            
            <div>
              <div className="text-sm text-gray-400">Conversion Rate</div>
              <div className="text-3xl font-semibold">{analyticsData.conversionRate}%</div>
              <div className="mt-2">
                <Progress value={analyticsData.conversionRate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily and Hourly Charts with gradient styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <div className="flex items-start mb-4">
            
            <div>
              <div className="text-xl font-semibold">Daily Token Claims</div>
              <div className="text-sm text-gray-400">{`Token claims per day (${timeframe === 'week' ? 'Past week' : 'Past month'})`}</div>
            </div>
          </div>
          {renderBarChart(analyticsData.claimsByDay, maxDailyCount)}
        </div>

        <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <div className="flex items-start mb-4">
            
            <div>
              <div className="text-xl font-semibold">Hourly Distribution</div>
              <div className="text-sm text-gray-400">Token claims by hour of day</div>
            </div>
          </div>
          {renderBarChart(analyticsData.claimsByHour, maxHourlyCount)}
        </div>
      </div>

      {/* Device breakdown and Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <div className="flex items-start mb-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-900/20 text-green-400 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-semibold">Device Breakdown</div>
              <div className="text-sm text-gray-400">Tokens claimed by device type</div>
            </div>
          </div>
          <div className="space-y-4">
            {analyticsData.deviceBreakdown.map((device, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{device.type}</span>
                  <span>{device.count} claims ({device.percentage}%)</span>
                </div>
                <Progress value={device.percentage} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <div className="flex items-start mb-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-900/20 text-amber-400 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-semibold">Recent Activity</div>
              <div className="text-sm text-gray-400">Latest token actions</div>
            </div>
          </div>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between border-b border-gray-800/30 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-xs text-gray-400">{activity.recipient} • {activity.event}</div>
                </div>
                <div className="text-xs text-gray-400 self-start">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top events */}
      <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex items-start mb-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-900/20 text-indigo-400 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-semibold">Top Performing Events</div>
            <div className="text-sm text-gray-400">Events by claim conversion rate</div>
          </div>
        </div>
        <div className="space-y-4">
          {analyticsData.topEvents.map((event, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-end text-sm">
                <span className="font-medium">{event.name}</span>
                <span className="text-xs">
                  {event.tokensClaimed} / {event.tokensIssued} claimed ({event.conversionRate}%)
                </span>
              </div>
              <Progress value={event.conversionRate} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
