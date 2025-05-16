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
import { useWebSocket, ConnectionState } from '@/services/websocket-service';
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

export function CrossChainDashboard() {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showChainConfig, setShowChainConfig] = useState(false);
  const { connectionState, messages, trackMessage } = useWebSocket();
  
  // Initialize with some test messages for demonstration
  useEffect(() => {
    // Create a few test messages when the component mounts
    const createTestMessages = async () => {
      const { WebSocketService } = await import('@/services/websocket-service');
      
      // Generate unique message IDs and track them
      const testIds = [
        `test-${Date.now()}-1`,
        `test-${Date.now()}-2`,
        `test-${Date.now()}-3`,
        `test-${Date.now()}-4`
      ];
      
      // Track each message with a slight delay to simulate real activity
      testIds.forEach((id, index) => {
        setTimeout(() => {
          WebSocketService.trackMessage(id);
        }, index * 500);
      });
    };
    
    createTestMessages();
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
    const pendingCount = messages.filter(msg => 
      msg.status !== 'COMPLETED' && msg.status !== 'FAILED'
    ).length;
    
    const completedCount = messages.filter(msg => msg.status === 'COMPLETED').length;
    const failedCount = messages.filter(msg => msg.status === 'FAILED').length;
    
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure Chains
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
                    
                    // Generate random source and destination chains for demo
                    const chains = Object.keys(SupportedChain).filter(key => isNaN(Number(key)));
                    const sourceChain = chains[Math.floor(Math.random() * chains.length)];
                    const destChain = chains[Math.floor(Math.random() * chains.length)];
                    
                    // Determine query type based on message ID
                    const queryTypes = ['NFT Data Query', 'Wallet History Query', 'Market Activity Query'];
                    const queryType = queryTypes[Math.floor(Math.random() * queryTypes.length)];
                    
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
