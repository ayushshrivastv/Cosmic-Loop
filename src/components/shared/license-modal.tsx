"use client";

import { FC } from 'react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: FC<LicenseModalProps> = ({ isOpen, onClose }: LicenseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
        {/* Header with close button */}
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">MIT License</h2>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* License content with whiteboard style */}
        <div className="p-6 bg-white text-black font-mono overflow-y-auto max-h-[70vh] whitespace-pre-wrap">
          <div className="border-l-4 border-gray-900 pl-4 py-1">
            <pre className="whitespace-pre-wrap">
MIT License

Copyright (c) 2025 Ayush Srivastava

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
