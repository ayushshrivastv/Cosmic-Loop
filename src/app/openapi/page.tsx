"use client";

import { AppleLayout } from '@/components/layouts/apple-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Globe, LightbulbIcon, Wand2, MoreHorizontal, Send } from 'lucide-react';
import { useState } from 'react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';

export default function OpenAPIPage() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage, startNewConversation } = useAIAssistant();
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      // Create a new conversation and send the message
      const newConversation = await startNewConversation();
      await sendMessage(inputValue, newConversation.id);
      setInputValue('');
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium mb-4">What can I help with?</h1>
        </div>
        
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-3">
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
            
            <div className="flex items-center justify-center space-x-4 mt-2 pt-2 border-t border-gray-100">
              <button className="rounded-full w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-100 text-gray-500">
                <Plus className="h-5 w-5" />
              </button>
              
              <button className="rounded-full w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-100 text-gray-500">
                <Globe className="h-5 w-5" />
              </button>
              
              <button className="rounded-full w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-100 text-gray-500">
                <LightbulbIcon className="h-5 w-5" />
              </button>
              
              <button className="rounded-full w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-100 text-gray-500">
                <Wand2 className="h-5 w-5" />
              </button>
              
              <button className="rounded-full w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-100 text-gray-500">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Empty space between hero and documentation */}
      <div className="h-40"></div>
      
      {/* Documentation Section */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">

          
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
