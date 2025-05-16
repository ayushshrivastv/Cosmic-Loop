/**
 * @file tracked-messages.tsx
 * @description Component to display a list of tracked cross-chain messages with real-time updates
 */

"use client";

import { useState, useEffect } from 'react';
import { useLayerZero } from '@/hooks/use-layerzero-v2';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
// Import MessageStatus from websocket-service only
import { MessageStatus as MessageStatusEnum } from '@/services/websocket-service';
import { MessageStatus } from './message-status';
import { useWebSocket, ConnectionState, MessageStatus as WebSocketMessageStatus } from '@/services/websocket-service';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Inbox,
  Wifi,
  WifiOff
} from 'lucide-react';

/**
 * Tracked messages component with real-time updates
 */
export function TrackedMessages() {
  const { getMessageTypeName } = useLayerZero();
  const { connectionState, messages, trackMessage } = useWebSocket();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Get all message IDs
  const messageIds = messages.map(msg => msg.messageId);

  // Track demo messages if none exist (for demonstration purposes)
  useEffect(() => {
    if (messages.length === 0) {
      // Create some demo messages for testing
      const demoMessageIds = [
        'demo-message-1-' + Math.random().toString(36).substring(2, 10),
        'demo-message-2-' + Math.random().toString(36).substring(2, 10),
      ];
      
      // Track these messages in the WebSocket service
      demoMessageIds.forEach(id => trackMessage(id));
    }
  }, [messages.length, trackMessage]);

  // No messages to display
  if (messageIds.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
        <Inbox className="h-12 w-12 mx-auto text-gray-500 mb-3" />
        <h3 className="text-xl font-medium text-white mb-2">No Active Queries</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          You don't have any active cross-chain queries. Use the form above to query data across chains.
        </p>
      </div>
    );
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'INFLIGHT':
        return <ArrowRightLeft className="h-4 w-4 text-blue-400" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-purple-400" />;
      case 'CREATED':
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  // Toggle message expansion
  const toggleExpanded = (messageId: string) => {
    setExpanded(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-white">Active Queries ({messageIds.length})</h3>
        
        {/* Connection status indicator */}
        {connectionState === ConnectionState.OPEN ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>Live Updates</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            <span>Polling</span>
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {messages.map(message => {
          const messageId = message.messageId;
          const isExpanded = expanded[messageId];

          return (
            <div key={messageId} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Message header - always visible */}
              <div className="flex justify-between items-center p-3 bg-gray-800 cursor-pointer" onClick={() => toggleExpanded(messageId)}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(message.status)}
                  <span className="text-gray-200 font-medium">
                    {message.data?.messageType !== undefined
                      ? getMessageTypeName(message.data.messageType)
                      : 'Cross-Chain Query'
                    }
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {messageId.slice(0, 8)}...
                  </span>
                  
                  {/* Timestamp */}
                  {message.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(messageId);
                  }}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-gray-700">
                  <MessageStatus messageId={messageId} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
