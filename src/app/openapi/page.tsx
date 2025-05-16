"use client";

import dynamic from 'next/dynamic';

// No need for AppleLayout as it's now in the root layout
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, Code, Info, ArrowRightLeft } from 'lucide-react';
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import cross-chain components
import { CrossChainQueryForm } from '@/components/cross-chain/query-form';
import { MessageStatus } from '@/components/cross-chain/message-status';
import { TrackedMessages } from '@/components/cross-chain/tracked-messages';
import { CrossChainDashboard } from '@/components/cross-chain/dashboard-redirect';

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
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
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

  // Check for query parameter and start conversation
  useEffect(() => {
    const handleQueryParam = async () => {
      // Get the query parameter from the URL
      const params = new URLSearchParams(window.location.search);
      const query = params.get('query');

      if (query) {
        // Process the query and start a conversation
        const userMessage: Message = {
          id: Date.now().toString(),
          text: query,
          sender: 'user',
          timestamp: new Date()
        };

        setMessages([userMessage]);
        setIsLoading(true);

        try {
          // Create a new conversation and send the message
          const newConversation = await startNewConversation();
          await sendMessage(query, newConversation.id);

          // Add assistant response (simulated for now)
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'This is a simulated response. In a real implementation, this would come from the AI assistant API.',
            sender: 'assistant',
            timestamp: new Date()
          };

          setMessages((prev: Message[]) => [...prev, assistantMessage]);

          // Clear the URL parameter without refreshing the page
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error processing query parameter:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleQueryParam();
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

  // Disabled send message functionality
  const handleSendMessage = async () => {
    // Early return to prevent any message sending
    return;
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Store the input value before clearing it
    const currentInputValue = inputValue;

    // Clear input immediately for better UX
    setInputValue('');

    // Add user message to chat
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setIsLoading(true);

    // Scroll to bottom after adding user message
    scrollToBottom();

    // Create a placeholder message for the assistant that will be updated
    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      text: 'Thinking...',
      sender: 'assistant',
      timestamp: new Date()
    };

    // Add the initial assistant message
    setMessages((prev: Message[]) => [...prev, initialAssistantMessage]);

    try {
      // Create a new conversation
      const newConversation = await startNewConversation();

      // Send the message with streaming updates
      await sendMessage(
        currentInputValue, 
        newConversation.id, 
        (partialResponse: any) => {
          // Update the assistant message with each partial response
          setMessages((prev: Message[]) => {
            // Find the assistant message by ID and update it
            return prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  text: partialResponse.text || 'Processing...',
                  timestamp: new Date()
                };
              }
              return msg;
            });
          });

          // Scroll to bottom with each update
          scrollToBottom();
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);

      // Update the assistant message with an error
      setMessages((prev: Message[]) => {
        return prev.map(msg => {
          if (msg.id === assistantMessageId) {
            return {
              ...msg,
              text: 'Sorry, I encountered an error processing your request.',
              timestamp: new Date()
            };
          }
          return msg;
        });
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // Disabled key down handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Do nothing - functionality disabled
    return;
  };

  return (
    <div className="overflow-hidden">
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
            <div className="bg-gray-200 rounded-3xl shadow-md border border-gray-300 p-3 mx-auto" style={{ width: '80%' }}>
              <div className="relative">
                <input
                  className="w-full border-0 shadow-none pl-4 pr-16 py-3 text-base rounded-lg focus-visible:outline-none focus:outline-none text-gray-600 bg-transparent"
                  placeholder="Coming Soon.."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={true}
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
            {/* Add padding between header and chat container */}
            <div className="pt-6"></div>
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
                  {messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl break-words ${
                          message.sender === 'user'
                            ? 'bg-white text-black'
                            : 'bg-white text-black'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.sender === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-xs text-black">AI</span>
                            </div>
                          )}
                          {message.sender === 'user' && (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-blue-600" />
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {message.sender === 'assistant' ? (
                          <div className="markdown-content text-sm max-w-full overflow-hidden">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ ...props }) => <h1 className="text-lg font-bold my-2 text-black" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-md font-bold my-2 text-black" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-sm font-bold my-1 text-black" {...props} />,
                                p: ({ children, ...props }) => {
                                  // Check if any child is a React element (not just text)
                                  const hasComponentChildren = React.Children.toArray(children).some(
                                    child => React.isValidElement(child)
                                  );
                                  // If it has component children, use div instead of p to avoid nesting issues
                                  return hasComponentChildren ?
                                    <div className="my-2 text-black" {...props}>{children}</div> :
                                    <p className="my-2 text-black" {...props}>{children}</p>;
                                },
                                ul: ({ ...props }) => <ul className="list-disc pl-5 my-2 text-black" {...props} />,
                                ol: ({ ...props }) => <ol className="list-decimal pl-5 my-2 text-black" {...props} />,
                                li: ({ ...props }) => <li className="my-1 text-black" {...props} />,
                                a: ({ ...props }) => <a className="text-blue-600 hover:text-blue-800 underline break-words" target="_blank" rel="noopener noreferrer" {...props} />,
                                code: ({ node, ...props }: any) => {
                                  const isInline = props.inline || false;
                                  return isInline ? (
                                    <code className="bg-gray-700 text-blue-200 px-1 rounded text-xs font-medium" {...props} />
                                  ) : (
                                    <pre className="bg-gray-900 border border-gray-700 rounded-md p-3 my-3 overflow-x-auto w-full max-w-full">
                                      <div className="flex items-center mb-2">
                                        <Code className="h-4 w-4 mr-2 text-blue-400" />
                                        <span className="text-xs font-mono text-blue-400">Code</span>
                                      </div>
                                      <code className="block text-xs font-mono text-gray-200 whitespace-pre-wrap break-all" {...props} />
                                    </pre>
                                  );
                                },
                                blockquote: ({ ...props }) => (
                                  <aside className="border-l-2 border-blue-500 bg-gray-700 pl-3 my-3 py-2 rounded-r">
                                    <div className="flex items-center mb-1">
                                      <Info className="h-4 w-4 mr-2 text-blue-400" />
                                      <span className="text-xs text-blue-300 font-medium">Note</span>
                                    </div>
                                    <div className="text-gray-200">
                                      <blockquote {...props} />
                                    </div>
                                  </aside>
                                ),
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{message.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input area at bottom */}
            <div className="w-full mb-8">
              <div className="bg-gray-200 rounded-3xl shadow-md border border-gray-300 p-3 w-full">
                <div className="relative">
                  <input
                    className="w-full border-0 shadow-none pl-4 pr-16 py-3 text-base rounded-lg focus-visible:outline-none focus:outline-none text-gray-600 bg-transparent"
                    placeholder="Coming Soon.."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={true}
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

      {/* Empty space between chat and cross-chain section */}
      <div className="h-20" style={{ display: messages.length > 0 ? 'block' : 'none' }}></div>

      {/* Cross-Chain Section - Removed to avoid duplication with dedicated Cross-Chain page */}

      {/* Documentation Section */}
      <section className="py-8 md:py-16 bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col items-center max-w-3xl mx-auto px-6 md:px-8">
          <article className="space-y-6 text-left w-full">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Streaming the Chain: How Solana's Substreams Are Rewriting Web3 Infrastructure</h2>
              <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Technology Overview</div>
            </div>

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
          </article>
        </div>
      </section>
    </div>
  );
}
