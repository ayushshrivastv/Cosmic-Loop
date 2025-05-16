// Type declarations for UI components
import { ReactNode } from 'react';

// Layout components
declare module '@/components/layouts/apple-layout' {
  export interface AppleLayoutProps {
    children: ReactNode;
  }
  
  export const AppleLayout: React.FC<AppleLayoutProps>;
}

// UI components
declare module '@/components/ui/input' {
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
  
  export const Input: React.FC<InputProps>;
}

declare module '@/components/ui/button' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
  
  export const Button: React.FC<ButtonProps>;
}

// Cross-chain components
declare module '@/components/cross-chain/query-form' {
  export interface QueryFormProps {
    onQuerySubmit: (messageId: string) => void;
  }
  
  export const CrossChainQueryForm: React.FC<QueryFormProps>;
}

declare module '@/components/cross-chain/message-status' {
  export interface MessageStatusProps {
    messageId: string;
    onComplete: () => void;
  }
  
  export const MessageStatus: React.FC<MessageStatusProps>;
}

declare module '@/components/cross-chain/tracked-messages' {
  export interface TrackedMessagesProps {}
  
  export const TrackedMessages: React.FC<TrackedMessagesProps>;
}

// Hooks
declare module '@/hooks/use-ai-assistant' {
  export interface AIResponse {
    text: string;
    components?: any[];
    error?: string;
  }
  
  export function useAIAssistant(): {
    sendMessage: (
      message: string, 
      conversationId?: string,
      updateCallback?: (partialResponse: AIResponse) => void
    ) => Promise<AIResponse | null>;
    startNewConversation: () => Promise<{ id: string }>;
    loadConversation: (id: string) => Promise<any>;
    refetchConversations: () => Promise<any>;
    conversations: any[];
    currentConversation: any;
    currentConversationId: string | null;
    isLoading: boolean;
  };
}
