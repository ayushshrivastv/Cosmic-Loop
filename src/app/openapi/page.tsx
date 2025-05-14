"use client";

import dynamic from 'next/dynamic';

// Import the AppleLayout component
const AppleLayout = dynamic(() => import('@/components/layouts/apple-layout').then(mod => mod.AppleLayout), {
  ssr: false
});
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';

// Custom CSS for the chat container scrollbar
const scrollbarStyles = `
  .chat-container::-webkit-scrollbar {
    width: 6px;
  }
  .chat-container::-webkit-scrollbar-track {
    background: #1F2937;
    border-radius: 3px;
  }
  .chat-container::-webkit-scrollbar-thumb {
    background-color: #4B5563;
    border-radius: 3px;
  }
`;

// Define message type
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

export default function OpenAPIPage() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage, startNewConversation } = useAIAssistant();
  
  // Add the custom scrollbar styles to the document
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = scrollbarStyles;
    document.head.appendChild(styleElement);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Scroll to bottom of chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      // Use setTimeout to ensure scrolling happens after DOM update
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      
      // Set up a MutationObserver to detect when content is added to the chat container
      const observer = new MutationObserver(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
      
      // Start observing the chat container for changes
      observer.observe(chatContainerRef.current, {
        childList: true, // Watch for changes to the direct children
        subtree: true,   // Watch for changes to the entire subtree
        characterData: true // Watch for changes to text content
      });
      
      // Clean up the observer when the component unmounts
      return () => observer.disconnect();
    }
  }, [messages]);
  
  // Additional scroll handler for when new content is added
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    // Scroll to bottom after adding user message
    scrollToBottom();
    
    try {
      // Create a new conversation and send the message
      const newConversation = await startNewConversation();
      await sendMessage(inputValue, newConversation.id);
      
      // Add assistant response (simulated for now)
      // In a real implementation, you would get this from the API response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'This is a simulated response. In a real implementation, this would come from the AI assistant API.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setInputValue('');
      // Scroll to bottom after adding assistant message
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <AppleLayout>
      <div className="flex flex-col min-h-[80vh] bg-background px-4">
        {/* Empty space when messages exist to maintain spacing */}
        {messages.length > 0 && (
          <div className="w-full max-w-2xl mx-auto pt-12"></div>
        )}
        
        {messages.length === 0 ? (
          /* Layout for when no messages exist */
          <div className="w-full max-w-2xl mx-auto flex-grow flex flex-col justify-center">
            {/* Heading inside the container */}
            <h1 className="text-4xl font-medium text-center mb-8">What can I help with?</h1>
            
            {/* Input area - centered in page */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-3 mx-auto" style={{ width: '80%' }}>
              <div className="relative">
                <input 
                  className="w-full border-0 shadow-none pl-4 pr-16 py-3 text-base rounded-lg focus-visible:outline-none focus:outline-none text-gray-900 bg-transparent" 
                  placeholder="Ask anything about Solana..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button 
                    className={`rounded-full w-8 h-8 flex items-center justify-center ${
                      inputValue.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent text-gray-300'
                    }`}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Layout for when messages exist */
          <div className="w-full max-w-2xl mx-auto flex-grow flex flex-col">
            {/* Chat container with scrolling - starts after header */}
            <div className="w-full">
              <div 
                ref={chatContainerRef}
                className="w-full mb-4 p-4 bg-black rounded-t-2xl chat-container"
                style={{ 
                  maxHeight: '400px', 
                  minHeight: '400px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4B5563 #1F2937',
                  position: 'relative',
                  display: 'block',
                  boxSizing: 'border-box'
                }}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.sender === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                              <span className="text-xs">AI</span>
                            </div>
                          )}
                          {message.sender === 'user' && (
                            <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center mr-2">
                              <User className="h-3 w-3" />
                            </div>
                          )}
                          <span className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Input area at bottom */}
            <div className="w-full mb-8">
              <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-3 w-full">
                <div className="relative">
                  <input 
                    className="w-full border-0 shadow-none pl-4 pr-16 py-3 text-base rounded-lg focus-visible:outline-none focus:outline-none text-gray-900 bg-transparent" 
                    placeholder="Ask anything about Solana..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button 
                      className={`rounded-full w-8 h-8 flex items-center justify-center ${
                        inputValue.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent text-gray-300'
                      }`}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Empty space between chat and documentation */}
      <div className="h-20" style={{ display: messages.length > 0 ? 'block' : 'none' }}></div>
      
      {/* Documentation Section */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Additional spacing before the heading */}
          <div className="h-20"></div>
          
          <h2 className="text-2xl font-medium mb-6">Streaming the Chain: How Solana's Substreams Are Rewriting Web3 Infrastructure</h2>
          
          <div className="space-y-6 text-gray-300">
            <p>
              In the ever-accelerating world of blockchain development, speed, scale, and access to real-time data can make or break an application. For developers building on Solana—the high-performance blockchain known for its lightning-fast transactions—those demands are even more acute. Enter Substreams, a cutting-edge data streaming framework that's quietly transforming the way developers interact with on-chain data.
            </p>
            
            <p>
              Developed by StreamingFast and recently integrated into Solana's tooling ecosystem, Substreams offers something that traditional RPC endpoints and indexers never could: modular, composable, and parallelised access to real-time blockchain data—without the latency or overhead.
            </p>
            
            <p>
              For Solana developers, this is a game-changer.
            </p>
            
            <p>
              Traditionally, building decentralised applications that rely on historical or live data has required setting up and maintaining full nodes, writing custom indexing code, or relying on third-party APIs. These systems often buckle under Solana's throughput—more than 65,000 transactions per second—and its rapid block finality. Substreams solves this by allowing developers to define custom "modules" in Rust, which transform raw blockchain data into clean, usable streams. These modules can be combined and reused, reducing duplication and increasing speed dramatically.
            </p>
            
            <p>
              More importantly, Substreams run in parallel, leveraging the scale of cloud and decentralised infrastructure to deliver blazing-fast performance. A DeFi protocol, for instance, can use Substreams to track every swap or liquidity pool update in near real time, then feed that into analytics, dashboards, or on-chain logic—all without maintaining a heavy backend.
            </p>
            
            <p>
              The tooling is already being embraced across Solana's ecosystem. Projects in gaming, NFTs, and decentralised social are using Substreams to power live feeds, rankings, and user stats—all streamed directly from the blockchain itself.
            </p>
            
            <p>
              Substreams also help bridge the gap between developers and decentralisation. By running on services like Pinax, developers no longer need to centralise data processing; they can build lighter, faster, and more open applications.
            </p>
            
            <p>
              For Solana developers focused on performance, composability, and scale, Substreams isn't just another tool—it's becoming the new foundation. In a network built for speed, Substreams finally offers a data layer that can keep up.
            </p>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
