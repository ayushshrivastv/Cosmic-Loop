import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  selectedModel: 'gemini' | 'perplexity';
}

export function ChatInput({
  inputValue,
  setInputValue,
  handleKeyDown,
  handleSendMessage,
  isLoading,
  selectedModel
}: ChatInputProps) {
  const [placeholder, setPlaceholder] = useState("Ask anything");
  
  useEffect(() => {
    // Set up the interval to alternate between placeholders every 0.2 seconds
    const placeholders = ["Ask anything", "Perplexity Sonar API"];
    let index = 0;
    
    const intervalId = setInterval(() => {
      index = (index + 1) % placeholders.length;
      setPlaceholder(placeholders[index]);
    }, 1000); // 1 second
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="w-full">
      {/* Form-based input with no extra buttons */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full">
        <div className="relative w-full">
          <input
            className="w-full h-14 bg-white rounded-full shadow-md border border-gray-200 pl-6 pr-16 px-6 text-base focus:outline-none focus:ring-2 focus:ring-black/20 text-gray-700"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Send button */}
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full ${inputValue.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400'}`}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
      
    </div>
  );
}
