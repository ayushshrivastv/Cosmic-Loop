'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="rounded-full px-4 py-2 bg-white text-black border border-gray-300 shadow-md hover:bg-black hover:text-white transition-colors duration-200"
          >
            Ask Anything
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white text-black border-gray-300 sm:max-w-md">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>Chat Support</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-4">
            <p>Welcome to Cosmic Loop! How can we help you today?</p>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-600">Our support team is available 24/7 to assist you with any questions.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
