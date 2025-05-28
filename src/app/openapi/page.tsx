"use client";

import dynamic from 'next/dynamic';

// No need for AppleLayout as it's now in the root layout
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Code, Info, User } from 'lucide-react';
import React, { useState, useRef, useEffect, ReactNode, ChangeEvent, ComponentPropsWithoutRef } from 'react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { substreamsService } from '@/services/substreams-service';
import { substreamsGeminiService } from '@/services/substreams-gemini-service';
import { substreamsPerplexityService } from '@/services/substreams-perplexity-service';
import { enhancedAIService } from '@/services/enhanced-ai-service';
import { AIQueryType } from '@/services/ai-assistant-service';
import { promptEngineeringService } from '@/services/prompt-engineering-service';
import { ChatAIResponseFormatter } from '@/components/AISearch/ChatAIResponseFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import cross-chain components
import { CrossChainQueryForm } from '@/components/cross-chain/query-form';
import { MessageStatus } from '@/components/cross-chain/message-status';
import { TrackedMessages } from '@/components/cross-chain/tracked-messages';
import { CrossChainDashboard } from '@/components/cross-chain/dashboard-redirect';
import { ChatInput } from '@/components/chat-input';

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
  metadata?: {
    latency?: {
      total: number;
    };
    tokens?: {
      total: number;
    };
  };
};

// Define available AI models
type AIModel = 'gemini' | 'perplexity' | 'enhanced';
// Define a subset of models for specific operations
type SubsetAIModel = 'gemini' | 'perplexity';

// Add this to the ChatInput component props
interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  selectedModel: 'gemini' | 'perplexity'; // Match the imported component's prop type
}

// Define response format options
type ResponseFormat = 'standard' | 'concise';

// Import types from react-markdown
import type { Components } from 'react-markdown';

export default function OpenAPIPage() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('enhanced');
  const [responseFormat, setResponseFormat] = useState<ResponseFormat>('concise');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const { sendMessage, startNewConversation } = useAIAssistant();
  
  // Handle model selection change
  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as AIModel);
  };

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

  // Handle click outside to close model dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && 
          !modelDropdownRef.current.contains(event.target as Node) &&
          showModelDropdown) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelDropdown]);

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
  }, [sendMessage, startNewConversation]);

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

  // Enabled send message functionality with substreams and Perplexity Sonar API integration
  const handleSendMessage = async () => {
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

      // Use our enhanced AI service if selected
      if (selectedModel === 'enhanced') {
        try {
          // Update the assistant message to show we're processing
          setMessages((prev: Message[]) => {
            return prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  text: 'Thinking...',
                  timestamp: new Date()
                };
              }
              return msg;
            });
          });
          
          // Start timing for response latency
          const startTime = Date.now();
          
          // Use the enhanced AI service with the correct method
          const enhancedResponse = await enhancedAIService.generateResponse(currentInputValue, responseFormat === 'concise');
          
          // Calculate latency
          const latency = Date.now() - startTime;
          
          // Update the assistant message with the enhanced response
          setMessages((prev: Message[]) => {
            return prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  text: enhancedResponse,
                  timestamp: new Date(),
                  metadata: {
                    latency: { total: latency }
                  }
                };
              }
              return msg;
            });
          });
          
          // Scroll to bottom with the update
          scrollToBottom();
          return; // Exit early as we've handled the response
        } catch (enhancedError) {
          console.error('Error processing with Enhanced AI Service:', enhancedError);
          // Fall back to other processing methods
        }
      }
      
      // Determine if we should use Perplexity based on model selection or query content
      // Only proceed with this logic if we're not using the enhanced model
      const usePerplexity = selectedModel !== 'enhanced' && (
        selectedModel === 'perplexity' || 
        (selectedModel === 'gemini' && currentInputValue.toLowerCase().match(/financ|invest|stock|market|asset|portfolio|fund|return|roi|analysis|trend|forecast|predict/i))
      );
      
      if (usePerplexity) {
        // Process with Perplexity's Sonar API for financial analysis
        try {
          // Update the assistant message to show we're processing with Perplexity
          setMessages((prev: Message[]) => {
            return prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  text: 'Thinking...',
                  timestamp: new Date()
                };
              }
              return msg;
            });
          });
          
          // Detect the query type
          const queryType: AIQueryType = 'financial_analysis';
          
          // Process the query with Perplexity and Substreams integration
          const perplexityResponse = await substreamsPerplexityService.processFinancialQuery(currentInputValue);
          
          // Update the assistant message with the Perplexity response
          setMessages((prev: Message[]) => {
            return prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  text: perplexityResponse.text || 'I analyzed your financial query but couldn\'t generate a response.',
                  timestamp: new Date()
                };
              }
              return msg;
            });
          });
          
          // Scroll to bottom with the update
          scrollToBottom();
          return; // Exit early as we've handled the response
        } catch (perplexityError) {
          console.error('Error processing with Perplexity:', perplexityError);
          // Fall back to enhanced prompts or regular AI processing
        }
      }
      
      // If not a financial query or Perplexity processing failed, try enhanced prompts
      let useEnhancedPrompts = false;
      let enhancedResponse: string | null = null;
      
      try {
        // Set a flag to indicate we're using enhanced prompts
        useEnhancedPrompts = true;
        
        // Update the assistant message to show we're processing
        setMessages((prev: Message[]) => {
          return prev.map(msg => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                text: 'Thinking...',
                timestamp: new Date()
              };
            }
            return msg;
          });
        });
        
        // Detect the query type using the prompt engineering service
        const queryType = promptEngineeringService.detectQueryType(currentInputValue);
        
        // Fetch blockchain data if it's a blockchain-related query
        let blockchainData = null;
        if (queryType !== 'general') {
          // Determine if we should use Perplexity or Gemini for blockchain data
          const usePerplexityForBlockchain = currentInputValue.toLowerCase().match(/financ|invest|market|asset|portfolio|return|analysis|trend/i);
          
          if (usePerplexityForBlockchain) {
            // Process the query with Perplexity for blockchain financial analysis
            const substreamsResponse = await substreamsPerplexityService.processBlockchainQuery(
              currentInputValue,
              queryType as AIQueryType
            );
            
            blockchainData = substreamsResponse.data || substreamsResponse.relatedEvents;
          } else {
            // Process the query with Gemini for general blockchain analysis
            const substreamsResponse = await substreamsGeminiService.processBlockchainQuery(
              currentInputValue,
              queryType as AIQueryType
            );
            
            blockchainData = substreamsResponse.data || substreamsResponse.relatedEvents;
          }
        }
        
        // Generate enhanced response using prompt engineering
        enhancedResponse = await promptEngineeringService.generateResponse(
          currentInputValue,
          queryType,
          blockchainData
        );
        
        // Update the assistant message with the enhanced response
        setMessages((prev: Message[]) => {
          return prev.map(msg => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                text: enhancedResponse || 'I processed your query but couldn\'t generate a response.',
                timestamp: new Date()
              };
            }
            return msg;
          });
        });
        
        // Scroll to bottom with the update
        scrollToBottom();
      } catch (enhancedError) {
        console.error('Error processing with enhanced prompts:', enhancedError);
        useEnhancedPrompts = false; // Fall back to regular AI processing
      }
      
      // If we didn't use enhanced prompts or it failed, use the regular AI assistant
      if (!useEnhancedPrompts) {
        // Send the message with streaming updates
        await sendMessage(
          currentInputValue, 
          newConversation.id, 
          (partialResponse: { text?: string }) => {
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
      }
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

  // Enable key down handler for Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col min-h-[75vh] bg-background px-4">
        {/* Empty space when messages exist to maintain spacing */}
        {messages.length > 0 && (
          <div className="w-full max-w-2xl mx-auto pt-12"></div>
        )}

        {messages.length === 0 ? (
          /* Layout for when no messages exist */
          <div className="w-full max-w-2xl mx-auto flex-grow flex flex-col justify-center" style={{ paddingBottom: '8vh' }}>
            {/* Heading inside the container */}
            <h1 className="text-4xl font-medium text-center mb-8">What can I help with?</h1>

            {/* Input area - centered in page with modern design */}
            <div className="mx-auto" style={{ width: '80%', maxWidth: '800px' }}>
              <ChatInput 
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleKeyDown={handleKeyDown}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
                selectedModel={selectedModel !== 'enhanced' ? (selectedModel as 'gemini' | 'perplexity') : 'gemini'}
              />
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
                  maxHeight: '380px',
                  minHeight: '380px',
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
                        <div className="flex items-center space-x-2 mb-2">
                          {message.sender === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-xs text-black">AI</span>
                            </div>
                          )}
                          {message.sender === 'assistant' && message.text.includes('Thinking...') && (
                            <div className="px-2 py-0.5 bg-blue-100 rounded-full text-xs text-blue-700 ml-1 flex items-center">
                              <span>Sonar</span>
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
                          message.text.includes('Thinking...') ? (
                            <div className="whitespace-pre-wrap text-sm">
                              {message.text}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">
                              <ChatAIResponseFormatter 
                                content={message.text} 
                                metadata={message.metadata}
                              />
                            </div>
                          )
                        ) : (
                          <div className="whitespace-pre-wrap text-sm">
                            {message.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat input component */}
            <div className="w-full mb-8">
              <ChatInput 
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleKeyDown={handleKeyDown}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
                selectedModel={selectedModel !== 'enhanced' ? (selectedModel as 'gemini' | 'perplexity') : 'gemini'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty space between chat and cross-chain section */}
      <div className="h-20" style={{ display: messages.length > 0 ? 'block' : 'none' }}></div>

      {/* Cross-Chain Section - Removed to avoid duplication with dedicated Cross-Chain page */}

      {/* Documentation Section */}
      <section className="py-12 md:py-20 bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col items-center max-w-3xl mx-auto px-6 md:px-8">
          <article className="space-y-6 text-left w-full">
            <div className="space-y-3 mt-8">
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
            
            <div className="space-y-3 mt-12">
              <h3 className="text-2xl md:text-3xl font-semibold text-blue-100">AI's New Search Paradigm: How Perplexity Sonar is Revolutionizing Blockchain Analysis</h3>
              <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Technology Report</div>
            </div>

            <div className="space-y-6 text-gray-300">
              <p>
                As blockchain networks grow more complex and interconnected, a quiet revolution is taking shape in how data is analyzed and understood. At the center of this shift is Perplexity's Sonar API—a technology that represents a fundamental departure from traditional search paradigms.
              </p>

              <p>
                "We've moved beyond the era of keyword matching and link retrieval," explains a senior developer at the company. "What users need is contextual understanding of blockchain activity across multiple networks, synthesized in real-time."
              </p>

              <p>
                The Sonar approach stands apart from conventional search engines by focusing on answer synthesis rather than document retrieval. For blockchain applications, where data exists in siloed networks and disparate formats, this capability has proven transformative.
              </p>

              <p>
                Industry analysts point to three distinctive capabilities that make Sonar particularly valuable for blockchain intelligence: its web-scale information retrieval, its ability to maintain factual accuracy even with rapidly changing data, and its natural language interface that democratizes access to complex blockchain metrics.
              </p>

              <p>
                In practical applications, Sonar API acts as the connective tissue between raw on-chain data—streamed through technologies like Substreams—and the summarization capabilities of models like Google's Gemini. This creates what developers call an "intelligence pipeline" that flows from raw blockchain events to actionable insights.
              </p>

              <p>
                The integration is especially powerful when examining cross-chain activity. As capital and data flow between Solana, Ethereum, and emerging Layer 2 networks via protocols like LayerZero, Sonar can track and contextualize these movements in ways traditional analytics platforms cannot.
              </p>

              <p>
                "Before this integration, users had to manually piece together information from multiple block explorers, Twitter feeds, and developer forums," notes a DeFi researcher who requested anonymity. "Now they can simply ask natural language questions about complex cross-chain interactions and receive synthesized answers."
              </p>

              <p>
                As blockchain ecosystems continue to evolve toward greater interconnectivity, technologies like Sonar that can seamlessly traverse network boundaries while maintaining coherent narratives about on-chain activity are likely to become essential infrastructure for both developers and users.
              </p>
              
              <p>
                Early adopters can experience this capability by querying the platform about recent Solana developments, cross-chain transactions, or specific protocols—revealing a glimpse of how AI is reshaping our understanding of decentralized networks.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
