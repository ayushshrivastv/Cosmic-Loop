/**
 * @file message-status.tsx
 * @description Component to display the status of cross-chain messages with real-time updates
 */

"use client";

import { useState, useEffect } from 'react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLayerZero } from '../../hooks/use-layerzero-v2';
import { MessageStatus as MessageStatusEnum } from '../../lib/layerzero/v2-config';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  Wifi,
  WifiOff,
  Copy
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// WebSocket connection states (simplified for demo)
enum ConnectionState {
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

interface MessageStatusProps {
  messageId: string;
  onComplete?: () => void;
}

/**
 * Message status component with real-time updates
 */
export function MessageStatus({ messageId, onComplete }: MessageStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.CLOSED);
  
  const { checkMessageStatus, getMessageTypeName } = useLayerZero();
  const { toast } = useToast();

  // Simulate WebSocket connection for demo purposes
  useEffect(() => {
    // Simulate connection attempt
    setConnectionState(ConnectionState.CONNECTING);
    
    // Simulate successful connection after delay
    const connectionTimer = setTimeout(() => {
      setConnectionState(ConnectionState.OPEN);
    }, 1500);
    
    return () => {
      clearTimeout(connectionTimer);
      setConnectionState(ConnectionState.CLOSED);
    };
  }, []);

  // Poll for message status
  useEffect(() => {
    if (!messageId || !isPolling) return;

    const checkStatus = async () => {
      try {
        // In a real implementation, this would be replaced with WebSocket messages
        const result = await checkMessageStatus(messageId);
        setStatus(result);
        
        // Update progress based on status
        updateProgressFromStatus(result?.status);

        // If message is completed or failed, stop polling and notify
        if (
          result?.status === MessageStatusEnum.COMPLETED ||
          result?.status === MessageStatusEnum.FAILED
        ) {
          setIsPolling(false);
          if (onComplete) onComplete();
        }
      } catch (error) {
        console.error('Error checking message status:', error);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Use different polling intervals based on connection state
    const pollInterval = setInterval(
      checkStatus, 
      connectionState === ConnectionState.OPEN ? 2000 : 5000 // Poll faster if "WebSocket" is connected
    );

    return () => clearInterval(pollInterval);
  }, [messageId, isPolling, checkMessageStatus, onComplete, connectionState]);

  // Update progress based on message status
  const updateProgressFromStatus = (statusValue: any) => {
    if (!statusValue) {
      setProgress(5);
      return;
    }
    
    switch (statusValue) {
      case MessageStatusEnum.PENDING:
        setProgress(10);
        break;
      case MessageStatusEnum.INFLIGHT:
        setProgress(40);
        break;
      case MessageStatusEnum.DELIVERED:
        setProgress(70);
        break;
      case MessageStatusEnum.COMPLETED:
        setProgress(100);
        break;
      case MessageStatusEnum.FAILED:
        setProgress(100);
        break;
      default:
        setProgress(5);
    }
  };

  // Copy message ID to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(messageId);
    toast({
      title: 'Copied to clipboard',
      description: 'Message ID has been copied to clipboard',
    });
  };

  // Check status manually
  const handleCheckStatus = async () => {
    if (!messageId) return;

    const result = await checkMessageStatus(messageId);
    setStatus(result);
    updateProgressFromStatus(result?.status);
  };

  // Render response data
  const renderResponseData = () => {
    if (!status?.data) return null;

    return (
      <div className="border border-gray-700 rounded bg-gray-800 p-3 mt-3 overflow-auto max-h-60">
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(status.data, null, 2)}
        </pre>
      </div>
    );
  };

  if (!messageId) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-white mb-1">Cross-Chain Query Status</h3>

          <div className="flex items-center space-x-2 mb-2">
            <div className="text-sm text-gray-400">Message ID:</div>
            <div className="text-sm font-mono text-gray-300 truncate max-w-[200px]">
              {messageId.slice(0, 16)}...
            </div>
            <button
              onClick={copyToClipboard}
              className="text-gray-400 hover:text-white"
              aria-label="Copy message ID"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection status indicator */}
          {connectionState === ConnectionState.OPEN ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
              <WifiOff className="w-3 h-3 mr-1" />
              Polling
            </Badge>
          )}
          
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <RefreshCw className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 mt-2 mb-3" />

      <div className="flex items-center space-x-3 mb-3 border-t border-gray-700 pt-3">
        {!status ? (
          <Clock className="h-5 w-5 text-gray-400" />
        ) : status.status === MessageStatusEnum.COMPLETED ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : status.status === MessageStatusEnum.FAILED ? (
          <XCircle className="h-5 w-5 text-red-400" />
        ) : status.status === MessageStatusEnum.INFLIGHT ? (
          <ArrowRightLeft className="h-5 w-5 text-blue-400" />
        ) : (
          <Clock className="h-5 w-5 text-yellow-400" />
        )}
        
        <div className={`text-sm font-medium ${!status ? 'text-gray-400' : 
          status.status === MessageStatusEnum.COMPLETED ? 'text-green-400' :
          status.status === MessageStatusEnum.FAILED ? 'text-red-400' :
          status.status === MessageStatusEnum.INFLIGHT ? 'text-blue-400' :
          status.status === MessageStatusEnum.DELIVERED ? 'text-purple-400' :
          'text-yellow-400'}`}
        >
          {!status ? 'Checking status...' :
            status.status === MessageStatusEnum.COMPLETED ? 'Completed' :
            status.status === MessageStatusEnum.FAILED ? 'Failed' :
            status.status === MessageStatusEnum.INFLIGHT ? 'In Transit' :
            status.status === MessageStatusEnum.DELIVERED ? 'Delivered' :
            'Pending'}
        </div>

        {status?.messageType !== undefined && (
          <div className="text-sm text-gray-400">
            <span className="bg-gray-700 px-2 py-1 rounded text-xs">
              {getMessageTypeName(status.messageType)}
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {status?.timestamp && (
            <div className="flex items-center space-x-2 mt-1 text-sm">
              <div className="text-gray-400">Last Updated:</div>
              <div className="text-gray-300">
                {new Date(status.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {status?.sourceChainId && status?.destinationChainId && (
            <div className="flex items-center space-x-2 mt-1 text-sm">
              <div className="text-gray-400">Route:</div>
              <div className="text-gray-300">
                Chain {status.sourceChainId} → Chain {status.destinationChainId}
              </div>
            </div>
          )}

          {status?.error && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-800/50 rounded">
              <div className="text-sm text-red-400">{status.error}</div>
            </div>
          )}

          {status?.status === MessageStatusEnum.COMPLETED && renderResponseData()}
        </>
      )}

      <div className="flex space-x-2 mt-3">
        <Button
          onClick={handleCheckStatus}
          variant="outline"
          size="sm"
          className="text-xs bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>

        <Button
          onClick={() => setIsPolling(!isPolling)}
          variant="outline"
          size="sm"
          className={`text-xs ${
            isPolling
              ? 'bg-red-900/50 hover:bg-red-800/50 text-red-300 border-red-800/50'
              : 'bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 border-blue-800/50'
          }`}
        >
          {isPolling ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
        </Button>
      </div>
    </div>
  );
}
