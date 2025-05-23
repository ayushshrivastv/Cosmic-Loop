"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CrossChainQueryForm } from './query-form';
import { MessageStatus } from './message-status';
import { TrackedMessages } from './tracked-messages';
import { useWebSocket, ConnectionState, MessageUpdate } from '@/services/websocket-service';
import { ArrowRightLeft, Activity, History, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { SupportedChain } from '@/lib/utils/layer-zero';

// Define dashboard stats type
type DashboardStats = {
  totalMessages: number;
  pendingMessages: number;
  completedMessages: number;
  failedMessages: number;
  supportedChains: number;
};

// Define message metadata type
type MessageMetadata = {
  sourceChain: string;
  destinationChain: string;
  messageType: string;
  timestamp: string;
};

export function CrossChainDashboard() {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showChainConfig, setShowChainConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { connectionState, messages, trackMessage } = useWebSocket();
  
  // State for development banner visibility
  const [showDevBanner, setShowDevBanner] = useState(true);
  
  // Check if this is a new user (no previous interactions)
  const [isNewUser, setIsNewUser] = useState<boolean>(true);
  
  // Check localStorage in useEffect to avoid SSR issues
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      setIsNewUser(localStorage.getItem('lz_first_time_user') !== 'false');
    }
  }, []);
  
  // Fetch real messages from LayerZero endpoints
  useEffect(() => {
    const fetchLayerZeroMessages = async () => {
      try {
        setIsLoading(true);
        // Import the WebSocketService to track messages
        const { WebSocketService } = await import('@/services/websocket-service');
        
        // Fetch recent messages from your API endpoint with new user flag if applicable
        const url = isNewUser ? '/api/cross-chain/messages?new_user=true' : '/api/cross-chain/messages';
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          // If we got data, this user is no longer considered new
          if (data.messages && data.messages.length > 0) {
            setIsNewUser(false);
            localStorage.setItem('lz_first_time_user', 'false');
          }
          
          // Get existing messages to avoid duplicates
          const existingMessages = messages.map(msg => msg.messageId);
          
          // Track each message with the WebSocketService, but only if it doesn't already exist
          data.messages.forEach((message: any) => {
            // Skip if we already have this message
            if (existingMessages.includes(message.id)) {
              return;
            }
            
            // The WebSocketService.trackMessage only accepts a messageId
            WebSocketService.trackMessage(message.id);
            
            // Store additional message metadata in localStorage for reference
            // Make sure we have all the necessary data
            const messageMetadata: MessageMetadata = {
              sourceChain: message.sourceChain || 'Solana',
              destinationChain: message.destinationChain || 'Ethereum',
              messageType: message.messageType || 'Cross-Chain Query',
              timestamp: message.timestamp || new Date().toISOString()
            };
            
            // Store in localStorage with browser check
            if (typeof window !== 'undefined') {
              localStorage.setItem(`message_${message.id}`, JSON.stringify(messageMetadata));
            }
          });
        }
      } catch (error) {
        console.error('Error fetching LayerZero messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLayerZeroMessages();
    
    // Set up polling to refresh messages every 30 seconds
    const intervalId = setInterval(() => {
      fetchLayerZeroMessages();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    pendingMessages: 0,
    completedMessages: 0,
    failedMessages: 0,
    supportedChains: Object.keys(SupportedChain).filter(key => isNaN(Number(key))).length / 2,
  });
  
  // Update stats based on WebSocket messages
  useEffect(() => {
    // Calculate stats based on real-time message data
    const pendingCount = messages.filter((msg: MessageUpdate) => 
      msg.status !== 'COMPLETED' && msg.status !== 'FAILED'
    ).length;
    
    const completedCount = messages.filter((msg: MessageUpdate) => msg.status === 'COMPLETED').length;
    const failedCount = messages.filter((msg: MessageUpdate) => msg.status === 'FAILED').length;
    
    setStats(prev => ({
      ...prev,
      totalMessages: Math.max(prev.totalMessages, messages.length),
      pendingMessages: pendingCount,
      completedMessages: completedCount,
      failedMessages: failedCount
    }));
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Development Banner */}
      {showDevBanner && (
        <div className="relative bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="text-blue-800 font-semibold text-sm">This page is under development</h3>
              <p className="text-blue-700 text-sm mt-1">
                The cross-chain functionality is currently being implemented. Please check the{' '}
                <a href="https://docs.layerzero.network/" target="_blank" rel="noopener noreferrer" className="underline font-medium">LayerZero documentation</a>{' '}
                to understand how cross-chain messaging works. Solana OpenAPI integration allows your application to 
                seamlessly communicate across multiple blockchains through a unified interface.
              </p>
            </div>
            <button 
              onClick={() => setShowDevBanner(false)} 
              className="text-blue-500 hover:text-blue-700 transition-colors ml-4"
              aria-label="Close development banner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cross-Chain Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">
            Access and query data across multiple blockchains with LayerZero V2
          </p>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-2">
          {connectionState === ConnectionState.OPEN ? (
            <div className="flex items-center text-green-500 text-sm">
              <Wifi className="h-4 w-4 mr-1" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400 text-sm">
              <WifiOff className="h-4 w-4 mr-1" />
              <span>Disconnected</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => {
                const fetchLayerZeroMessages = async () => {
                  try {
                    setIsLoading(true);
                    const { WebSocketService } = await import('@/services/websocket-service');
                    
                    // Fetch real messages from the API endpoint with new user flag if applicable
                    const url = isNewUser ? '/api/cross-chain/messages?new_user=true' : '/api/cross-chain/messages';
                    const response = await fetch(url);
                    
                    if (response.ok) {
                      const data = await response.json();
                      
                      // Get existing messages to avoid duplicates
                      const existingMessages = messages.map(msg => msg.messageId);
                      
                      // Track each message with the WebSocketService, but only if it doesn't already exist
                      data.messages.forEach((message: any) => {
                        // Skip if we already have this message
                        if (existingMessages.includes(message.id)) {
                          return;
                        }
                        
                        // The WebSocketService.trackMessage only accepts a messageId
                        WebSocketService.trackMessage(message.id);
                        
                        // Store additional message metadata in localStorage for reference
                        // Make sure we have all the necessary data
                        const messageMetadata: MessageMetadata = {
                          sourceChain: message.sourceChain || 'Solana',
                          destinationChain: message.destinationChain || 'Ethereum',
                          messageType: message.messageType || 'Cross-Chain Query',
                          timestamp: message.timestamp || new Date().toISOString()
                        };
                        
                        // Store in localStorage with browser check
                        if (typeof window !== 'undefined') {
                          localStorage.setItem(`message_${message.id}`, JSON.stringify(messageMetadata));
                        }
                      });
                    }
                  } catch (error) {
                    console.error('Error refreshing messages:', error);
                  } finally {
                    setIsLoading(false);
                  }
                };
                
                fetchLayerZeroMessages();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {/* Reset button to simulate new user experience */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => {
                // Clear localStorage items related to messages
                if (typeof window !== 'undefined') {
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('message_') || key === 'lz_first_time_user') {
                      localStorage.removeItem(key);
                    }
                  });
                }
                
                // Reset WebSocket service
                const resetWebSocket = async () => {
                  const { WebSocketService } = await import('@/services/websocket-service');
                  WebSocketService.disconnect();
                  
                  // Set new user flag
                  setIsNewUser(true);
                  
                  // Reload the page to reset the state completely
                  window.location.reload();
                };
                
                resetWebSocket();
              }}
            >
              Reset
            </Button>
          </div>
          <Dialog open={showChainConfig} onOpenChange={setShowChainConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Config
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chain Configuration</DialogTitle>
                <DialogDescription>
                  Configure RPC endpoints and gas settings for each chain
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {Object.keys(SupportedChain)
                  .filter(key => isNaN(Number(key)))
                  .map(chain => (
                    <div key={chain} className="space-y-2 p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs">
                            {chain.substring(0, 1)}
                          </div>
                          <span className="font-medium text-sm">{chain}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            id={`${chain}-enabled`}
                            checked={true}
                          />
                          <Label htmlFor={`${chain}-enabled`} className="text-xs">Enabled</Label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid gap-1">
                          <Label htmlFor={`${chain}-rpc`} className="text-xs">RPC Endpoint</Label>
                          <Input 
                            id={`${chain}-rpc`}
                            value={`https://${chain.toLowerCase()}.example.com/rpc`}
                            className="h-8 text-xs"
                          />
                        </div>
                        
                        <div className="grid gap-1">
                          <Label htmlFor={`${chain}-gas`} className="text-xs">Gas Price (ETH)</Label>
                          <Input 
                            id={`${chain}-gas`}
                            value="0.000001"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm relative overflow-hidden">
          <div className="flex flex-col space-y-1 p-4 pb-1">
            <div className="tracking-tight text-xs font-medium text-gray-400">Total Messages</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <div className="text-xs text-gray-500 mt-1">Across all chains</div>
          </div>
        </div>
        
        {/* Pending Messages */}
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm relative overflow-hidden">
          <div className="flex flex-col space-y-1 p-4 pb-1">
            <div className="tracking-tight text-xs font-medium text-gray-400">Pending</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingMessages}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.pendingMessages} messages in flight</div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-yellow-500" style={{ width: `${(stats.pendingMessages / Math.max(stats.totalMessages, 1)) * 100}%` }}></div>
        </div>
        
        {/* Completed Messages */}
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm relative overflow-hidden">
          <div className="flex flex-col space-y-1 p-4 pb-1">
            <div className="tracking-tight text-xs font-medium text-gray-400">Completed</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-500">{stats.completedMessages}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalMessages > 0 ? Math.round((stats.completedMessages / stats.totalMessages) * 100) : 0}% success rate
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-green-500" style={{ width: `${(stats.completedMessages / Math.max(stats.totalMessages, 1)) * 100}%` }}></div>
        </div>
        
        {/* Failed Messages */}
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm relative overflow-hidden">
          <div className="flex flex-col space-y-1 p-4 pb-1">
            <div className="tracking-tight text-xs font-medium text-gray-400">Failed</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-500">{stats.failedMessages}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.failedMessages} failed message{stats.failedMessages !== 1 ? 's' : ''}</div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-red-500" style={{ width: `${(stats.failedMessages / Math.max(stats.totalMessages, 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="new" className="text-sm">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            New Query
          </TabsTrigger>
          <TabsTrigger value="active" className="text-sm">
            <Activity className="h-4 w-4 mr-2" />
            Active
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cross-Chain Query</CardTitle>
              <CardDescription>
                Query data from multiple blockchains using LayerZero V2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrossChainQueryForm 
                onQuerySubmit={(messageId) => {
                  // Set the active message to the newly created one
                  setActiveMessageId(messageId);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Messages</CardTitle>
              <CardDescription>
                Track your ongoing cross-chain messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeMessageId && (
                <MessageStatus 
                  messageId={activeMessageId} 
                  onComplete={() => setActiveMessageId(null)}
                />
              )}
              <TrackedMessages />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Message History</CardTitle>
              <CardDescription>
                View your past cross-chain messages and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    // Format timestamp
                    const date = new Date(message.timestamp);
                    const formattedDate = `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    
                    // Get message metadata from localStorage if available
                    let sourceChain = 'Unknown';
                    let destChain = 'Unknown';
                    let queryType = 'Data Query';
                    
                    try {
                      // First try to get metadata from the message object directly
                      if (message.data && message.data.sourceChain && message.data.destinationChain) {
                        sourceChain = message.data.sourceChain;
                        destChain = message.data.destinationChain;
                        queryType = message.data.messageType || 'Data Query';
                      } else {
                        // Fall back to localStorage if not in the message object
                        if (typeof window !== 'undefined') {
                          const metadataStr = localStorage.getItem(`message_${message.messageId}`);
                          if (metadataStr) {
                            try {
                              const metadata = JSON.parse(metadataStr) as MessageMetadata;
                              sourceChain = metadata.sourceChain || 'Solana';
                              destChain = metadata.destinationChain || 'Ethereum';
                              queryType = metadata.messageType || 'Cross-Chain Query';
                            } catch (e) {
                              console.error('Error parsing message metadata:', e);
                            }
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error retrieving message metadata:', error);
                    }
                    
                    // Set badge color based on status
                    let badgeClass = '';
                    if (message.status === 'COMPLETED') {
                      badgeClass = 'bg-green-500/10 text-green-500';
                    } else if (message.status === 'FAILED') {
                      badgeClass = 'bg-red-500/10 text-red-500';
                    } else if (message.status === 'INFLIGHT' || message.status === 'DELIVERED') {
                      badgeClass = 'bg-yellow-500/10 text-yellow-500';
                    } else {
                      badgeClass = 'bg-blue-500/10 text-blue-500';
                    }
                    
                    return (
                      <div key={message.messageId} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{queryType}</div>
                          <div className="text-xs text-gray-400">{sourceChain} → {destChain}</div>
                          <div className="text-xs text-gray-500">{formattedDate}</div>
                        </div>
                        <Badge variant="outline" className={badgeClass}>
                          {message.status}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">No messages found</p>
                    <p className="text-xs mt-1">Submit a cross-chain query to see results here</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Load More
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Supported Chains Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Supported Chains</CardTitle>
          <CardDescription>
            LayerZero V2 enables cross-chain messaging across {stats.supportedChains} blockchains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(SupportedChain)
              .filter(key => isNaN(Number(key)))
              .map(chain => (
                <div key={chain} className="flex items-center gap-2 p-2 border border-border rounded-lg">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs">
                    {chain.substring(0, 1)}
                  </div>
                  <span className="text-sm">{chain}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
