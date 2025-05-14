'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAIAssistant, type ChatMessage, type Conversation } from '@/hooks/use-ai-assistant';
import { ArrowUp, X, RefreshCw, Image, FileText, BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function ChatPopup() {
  const { toast } = useToast();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/home';
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [expandedInputValue, setExpandedInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const expandedInputRef = useRef<HTMLInputElement>(null);
  const expandedButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState('chat');

  // AI Assistant hook
  const {
    sendMessage,
    currentConversation,
    isLoading,
    startNewConversation,
    loadConversation,
    conversations,
  } = useAIAssistant();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [(currentConversation as Conversation | null | undefined)?.messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to collapse expanded input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        expandedInputRef.current &&
        !expandedInputRef.current.contains(event.target as Node) &&
        expandedButtonRef.current &&
        !expandedButtonRef.current.contains(event.target as Node) &&
        document.querySelector('form[data-chat-popup="true"]') &&
        !(document.querySelector('form[data-chat-popup="true"]') as HTMLElement).contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');

    // If no current conversation, create one first
    if (!currentConversation) {
      const newConversation = await startNewConversation();
      await sendMessage(message, newConversation.id);
    } else {
      await sendMessage(message, (currentConversation as Conversation).id);
    }
  };

  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render a message component
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`px-4 py-3 rounded-lg max-w-[80%] ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {/* Message text content */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Render additional components if available */}
          {message.components?.map((component, index) => {
            switch (component.type) {
              case 'CODE':
                return (
                  <pre key={index} className="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
                    <code>{component.content}</code>
                  </pre>
                );
              case 'DATA':
                return (
                  <div key={index} className="bg-gray-700 text-gray-100 p-3 rounded mt-2">
                    <pre className="overflow-x-auto">{JSON.stringify(component.data, null, 2)}</pre>
                  </div>
                );
              case 'TABLE':
                return (
                  <div key={index} className="mt-2 overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          {component.headers?.map((header, i) => (
                            <th key={i} className="py-2 px-4 border-b text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {component.data?.map((row: any, i: number) => (
                          <tr key={i}>
                            {component.headers?.map((header, j) => (
                              <td key={j} className="py-2 px-4 border-b">
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              case 'TOKEN':
                return (
                  <div key={index} className="mt-2 p-3 bg-blue-100 text-blue-800 rounded flex items-center">
                    <FileText size={16} className="mr-2" />
                    Token Address: {component.address}
                  </div>
                );
              case 'LINK':
                return (
                  <a
                    key={index}
                    href={component.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-blue-500 hover:underline flex items-center"
                  >
                    <Image size={16} className="mr-2" />
                    {component.content || component.url}
                  </a>
                );
              case 'CHART':
                return (
                  <div key={index} className="mt-2 p-3 bg-gray-100 rounded">
                    <div className="flex items-center text-gray-700 mb-2">
                      <BarChart2 size={16} className="mr-2" />
                      {component.data?.title || 'Chart Data'}
                    </div>
                    {/* Placeholder for chart - would render with Recharts in a real implementation */}
                    <div className="h-40 bg-gray-200 rounded flex items-center justify-center">
                      Chart Visualization Would Appear Here
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    );
  };

  // Handle expanding the input field
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        expandedInputRef.current?.focus();
      }, 300);
    }
  };

  // Handle submitting the expanded input
  const handleExpandedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expandedInputValue.trim()) {
      setIsExpanded(false);
      setIsOpen(true);
      setInputValue(expandedInputValue);
      setExpandedInputValue('');
      // After dialog opens, we'll send the message
      // Store the message to send after dialog is open
      const messageToSend = expandedInputValue.trim();
      setExpandedInputValue('');
      
      // Wait for dialog to open before sending message
      setTimeout(() => {
        sendMessage(messageToSend, currentConversation ? (currentConversation as Conversation).id : undefined);
      }, 500);
    }
  };

  return (
    <div className="fixed z-50" style={{
      bottom: '1.5rem',
      right: '1.5rem'
    }}>
      <div className="relative">
        <form onSubmit={handleExpandedSubmit} data-chat-popup="true" className="shadow-black-4 bg-tertiary-60 relative flex w-full rounded-[20px] px-1 shadow-sm backdrop-blur-xl" style={{
          padding: '6px',
          width: isExpanded ? '300px' : '180px',
          maxWidth: '90vw',
          backgroundColor: '#F7F7F8',
          transition: 'all 0.3s ease'
        }}>
          {isExpanded ? (
            <input
              ref={expandedInputRef}
              value={expandedInputValue}
              onChange={(e) => setExpandedInputValue(e.target.value)}
              className="ml-3 w-full bg-transparent focus:outline-none text-[14px] text-black placeholder:text-gray-500 placeholder:opacity-80"
              placeholder="Ask Anything"
              aria-label="Ask Anything"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleExpandedSubmit(e);
                }
              }}
            />
          ) : (
            <div className="ml-2 w-full flex items-center justify-start h-full" onClick={handleExpandClick}>
              <span className="text-[14px] text-[#303030] opacity-75 py-1">Ask Anything</span>
            </div>
          )}
          <button 
            ref={expandedButtonRef}
            className="bg-primary-100 text-secondary-100 disabled:bg-primary-44 disabled:text-secondary-60 relative h-7 w-7 flex-none rounded-full p-0 hover:opacity-70 disabled:hover:opacity-100 flex items-center justify-center"
            type="submit"
            aria-label="Send prompt to Cosmic AI"
            style={{
              backgroundColor: '#303030',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={isExpanded && !expandedInputValue.trim()}
            onClick={(e) => {
              e.preventDefault();
              if (!isExpanded) {
                handleExpandClick(e);
              } else if (expandedInputValue.trim()) {
                handleExpandedSubmit(e as unknown as React.FormEvent);
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform translate-y-0">
              <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </form>
      </div>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-white text-black sm:max-w-md md:max-w-2xl max-h-[80vh] flex flex-col">

          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>Cosmic AI Assistant</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mb-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              {/* Chat messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4 max-h-[50vh]">
                {!currentConversation || !(currentConversation as Conversation | undefined)?.messages || (currentConversation as Conversation).messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Welcome to Cosmic AI Assistant!</h3>
                    <p className="mb-4">
                      I can help you with information about Solana NFTs, cross-chain bridging,
                      and marketplace activities. What would you like to know?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
                      {[
                        "What NFT collections are trending on Solana?",
                        "How do I bridge my NFTs from Ethereum to Solana?",
                        "Show me recent marketplace sales for a collection",
                        "What are compressed NFTs on Solana?"
                      ].map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="text-left"
                          onClick={() => {
                            setInputValue(suggestion);
                            inputRef.current?.focus();
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  (currentConversation as Conversation).messages?.map(renderMessage)
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-center items-center py-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                )}

                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t p-4 flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about NFTs, bridging, or marketplace activities..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Your Conversations</h3>

                {!conversations || conversations.length === 0 ? (
                  <p className="text-gray-500">No conversation history yet.</p>
                ) : (
                  <div className="space-y-2">
                    {conversations?.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                          (currentConversation as Conversation | null | undefined)?.id === conversation.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => {
                          loadConversation(conversation.id);
                          setActiveTab('chat');
                        }}
                      >
                        <h4 className="font-medium truncate">{conversation.title}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          {new Date((conversation as any).updatedAt || conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    onClick={() => {
                      startNewConversation();
                      setActiveTab('chat');
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    Start New Conversation
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="px-4 py-2 border-t">
            <p className="text-xs text-gray-500">
              Powered by The Graph Substreams on Solana • Get real-time insights about NFTs, bridging & marketplaces
            </p>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
