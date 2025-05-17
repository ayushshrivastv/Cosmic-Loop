'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { ArrowUp, X, RefreshCw, Image, FileText, BarChart2, Send } from 'lucide-react';

// Define types based on the AI assistant hook
interface AIComponent {
  type: 'TEXT' | 'CODE' | 'DATA' | 'TABLE' | 'CHART' | 'TOKEN' | 'LINK';
  content?: string;
  data?: any;
  headers?: string[];
  address?: string;
  url?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  components?: AIComponent[];
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Helper function to check if we're on the OpenAPI page
function useIsOpenAPIPage() {
  const pathname = usePathname();
  return pathname === '/openapi';
}

export default function ChatPopup() {
  // Check if we're on the OpenAPI page - if so, don't render the chat popup
  const isOpenAPIPage = useIsOpenAPIPage();
  
  // Early return if we're on the OpenAPI page
  if (isOpenAPIPage) {
    return null;
  }
  
  // If we're not on the OpenAPI page, render the normal chat popup
  return <ChatPopupContent />;
}

// Separate component for the chat popup content to avoid hooks issues
function ChatPopupContent() {
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
        // Focus the input element using document.querySelector instead of ref
        const inputElement = document.querySelector('input[data-chat-input="true"]');
        if (inputElement instanceof HTMLInputElement) {
          inputElement.focus();
        }
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
          {message.components?.map((component: AIComponent, index: number) => {
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
                          {component.headers?.map((header: string, i: number) => (
                            <th key={i} className="py-2 px-4 border-b text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {component.data?.map((row: any, i: number) => (
                          <tr key={i}>
                            {component.headers?.map((header: string, j: number) => (
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

  // Handle clicking on the Ask Anything form
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(true);
    setTimeout(() => {
      const expandedInput = document.querySelector('input[data-expanded-input="true"]');
      if (expandedInput instanceof HTMLInputElement) {
        expandedInput.focus();
      }
    }, 100);
  };

  // Handle submitting the form
  const handleExpandedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's input, use it as the query
    if (expandedInputValue.trim()) {
      const messageToSend = expandedInputValue.trim();
      const encodedMessage = encodeURIComponent(messageToSend);
      window.location.href = `/openapi?query=${encodedMessage}`;
    } else {
      // If no input, just redirect to the OpenAPI page
      window.location.href = '/openapi';
    }
  };

  return (
    <div className="fixed z-50 bottom-6 right-6">
      <div className="relative">
        <form 
          data-chat-popup="true" 
          className="shadow-black-4 bg-tertiary-60 relative flex w-full rounded-[20px] px-1 shadow-sm backdrop-blur-xl" 
          style={{
            padding: '6px',
            width: '180px',
            maxWidth: '90vw',
            backgroundColor: '#F7F7F8',
            transition: 'all 0.3s ease'
          }}
          onClick={() => {
            // Immediately redirect to OpenAPI page when clicked
            window.location.href = '/openapi';
          }}
        >
          <div className="ml-2 w-full flex items-center justify-start h-full bg-gray-200 rounded-md">
            <span className="text-[14px] text-[#505050] opacity-90 py-1 px-2" data-component-name="ChatPopupContent">Ask Anything</span>
          </div>
          <button 
            className="bg-primary-100 text-secondary-100 relative h-7 w-7 flex-none rounded-full p-0 hover:opacity-70 flex items-center justify-center"
            type="button"
            aria-label="Go to Solana OpenAPI"
            style={{
              backgroundColor: '#303030',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Immediately redirect to OpenAPI page
              window.location.href = '/openapi';
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
          <DialogContent className="bg-white text-black sm:max-w-md md:max-w-2xl max-h-[70vh] flex flex-col">

          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>Solana OpenAPI Assistant</DialogTitle>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4 max-h-[40vh]">
                {!currentConversation || !(currentConversation as Conversation | undefined)?.messages || (currentConversation as Conversation).messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Welcome to Solana OpenAPI Assistant!</h3>
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

                {/* Loading indicator with 'Thinking...' message */}
                {isLoading && (
                  <div className="flex flex-col justify-center items-center py-2 gap-1">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                )}

                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t p-4">
                <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-3 relative">
                  <div className="relative">
                    <Input
                      data-chat-input="true"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about NFTs, bridging, or marketplace activities..."
                      className="w-full border-0 shadow-none pl-4 pr-16 py-3 text-base rounded-lg focus-visible:outline-none focus:outline-none text-gray-900 bg-transparent"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className={`rounded-full w-8 h-8 flex items-center justify-center ${inputValue.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent text-gray-300'}`}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
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
