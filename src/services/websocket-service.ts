/**
 * @file websocket-service.ts
 * @description WebSocket service for real-time cross-chain message updates
 */

"use client";

import { useEffect, useState } from 'react';

// Define message status types
export enum MessageStatus {
  CREATED = 'CREATED',
  INFLIGHT = 'INFLIGHT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Define message update type
export interface MessageUpdate {
  messageId: string;
  status: MessageStatus;
  timestamp: string;
  data?: any;
  error?: string;
}

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

// Mock WebSocket implementation for development
class MockWebSocket {
  private callbacks: Record<string, Function[]> = {};
  private status: ConnectionState = ConnectionState.CLOSED;
  private messageUpdateInterval: NodeJS.Timeout | null = null;
  private trackedMessages: Record<string, MessageUpdate> = {};

  constructor(private url: string) {}

  connect() {
    this.status = ConnectionState.CONNECTING;
    this.trigger('connecting');

    // Simulate connection delay
    setTimeout(() => {
      this.status = ConnectionState.OPEN;
      this.trigger('open');

      // Start sending mock updates
      this.startMockUpdates();
    }, 1000);
  }

  disconnect() {
    if (this.status === ConnectionState.CLOSED) return;

    this.status = ConnectionState.CLOSING;
    this.trigger('closing');

    // Stop mock updates
    if (this.messageUpdateInterval) {
      clearInterval(this.messageUpdateInterval);
      this.messageUpdateInterval = null;
    }

    // Simulate disconnection delay
    setTimeout(() => {
      this.status = ConnectionState.CLOSED;
      this.trigger('close');
    }, 500);
  }

  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  private trigger(event: string, ...args: any[]) {
    if (!this.callbacks[event]) return;
    this.callbacks[event].forEach(callback => callback(...args));
  }

  // Track a message for updates
  trackMessage(messageId: string, initialStatus: MessageStatus = MessageStatus.CREATED) {
    this.trackedMessages[messageId] = {
      messageId,
      status: initialStatus,
      timestamp: new Date().toISOString()
    };

    // Immediately send an update for this message
    setTimeout(() => {
      this.trigger('message', this.trackedMessages[messageId]);
    }, 500);
  }

  // Start sending mock updates for tracked messages
  private startMockUpdates() {
    this.messageUpdateInterval = setInterval(() => {
      // For each tracked message, potentially update its status
      Object.keys(this.trackedMessages).forEach(messageId => {
        const message = this.trackedMessages[messageId];
        
        // Only update messages that aren't in a terminal state
        if (message.status !== MessageStatus.COMPLETED && message.status !== MessageStatus.FAILED) {
          // Randomly decide whether to update this message
          if (Math.random() > 0.7) {
            // Progress the message to the next status
            let newStatus: MessageStatus;
            
            switch (message.status) {
              case MessageStatus.CREATED:
                newStatus = MessageStatus.INFLIGHT;
                break;
              case MessageStatus.INFLIGHT:
                newStatus = MessageStatus.DELIVERED;
                break;
              case MessageStatus.DELIVERED:
                // 90% chance of success, 10% chance of failure
                newStatus = Math.random() > 0.1 ? MessageStatus.COMPLETED : MessageStatus.FAILED;
                break;
              default:
                return; // No update needed
            }
            
            // Update the message
            this.trackedMessages[messageId] = {
              ...message,
              status: newStatus,
              timestamp: new Date().toISOString(),
              // Add mock data for completed messages
              ...(newStatus === MessageStatus.COMPLETED && {
                data: {
                  result: "Mock data for " + messageId,
                  details: {
                    chain: "Solana",
                    blockHeight: Math.floor(Math.random() * 1000000)
                  }
                }
              }),
              // Add error for failed messages
              ...(newStatus === MessageStatus.FAILED && {
                error: "Mock error: Transaction timeout"
              })
            };
            
            // Trigger an update event
            this.trigger('message', this.trackedMessages[messageId]);
          }
        }
      });
    }, 3000); // Update every 3 seconds
  }

  // Get the current state
  getState() {
    return this.status;
  }

  // Get all tracked messages
  getTrackedMessages() {
    return Object.values(this.trackedMessages);
  }
}

// Singleton WebSocket instance
let wsInstance: MockWebSocket | null = null;

// Hook for using WebSocket in components
export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.CLOSED);
  const [messages, setMessages] = useState<MessageUpdate[]>([]);

  useEffect(() => {
    // Create WebSocket instance if it doesn't exist
    if (!wsInstance) {
      // In a real implementation, this would connect to your WebSocket server
      wsInstance = new MockWebSocket('wss://api.example.com/ws');
      
      // Connect to the WebSocket server
      wsInstance.connect();
    }

    // Update connection state when it changes
    const handleConnectionChange = (state: ConnectionState) => {
      setConnectionState(state);
    };

    // Handle new message updates
    const handleMessage = (update: MessageUpdate) => {
      setMessages(prev => {
        // Replace the message if it already exists, otherwise add it
        const exists = prev.some(msg => msg.messageId === update.messageId);
        if (exists) {
          return prev.map(msg => 
            msg.messageId === update.messageId ? update : msg
          );
        } else {
          return [...prev, update];
        }
      });
    };

    // Subscribe to events
    wsInstance.on('connecting', () => handleConnectionChange(ConnectionState.CONNECTING));
    wsInstance.on('open', () => handleConnectionChange(ConnectionState.OPEN));
    wsInstance.on('closing', () => handleConnectionChange(ConnectionState.CLOSING));
    wsInstance.on('close', () => handleConnectionChange(ConnectionState.CLOSED));
    wsInstance.on('message', handleMessage);

    // Initialize with any existing tracked messages
    setMessages(wsInstance.getTrackedMessages());

    // Cleanup on unmount
    return () => {
      wsInstance?.off('connecting', () => handleConnectionChange(ConnectionState.CONNECTING));
      wsInstance?.off('open', () => handleConnectionChange(ConnectionState.OPEN));
      wsInstance?.off('closing', () => handleConnectionChange(ConnectionState.CLOSING));
      wsInstance?.off('close', () => handleConnectionChange(ConnectionState.CLOSED));
      wsInstance?.off('message', handleMessage);
    };
  }, []);

  // Function to track a new message
  const trackMessage = (messageId: string) => {
    wsInstance?.trackMessage(messageId);
  };

  // Function to disconnect WebSocket
  const disconnect = () => {
    wsInstance?.disconnect();
  };

  return {
    connectionState,
    messages,
    trackMessage,
    disconnect
  };
}

// Export the WebSocket service for direct use
export const WebSocketService = {
  connect: () => {
    if (!wsInstance) {
      wsInstance = new MockWebSocket('wss://api.example.com/ws');
    }
    wsInstance.connect();
  },
  disconnect: () => {
    wsInstance?.disconnect();
  },
  trackMessage: (messageId: string) => {
    wsInstance?.trackMessage(messageId);
  },
  getState: () => {
    return wsInstance?.getState() || ConnectionState.CLOSED;
  }
};
