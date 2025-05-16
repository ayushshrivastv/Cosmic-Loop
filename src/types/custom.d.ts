// Type declarations for custom modules
declare module '@/components/layouts/apple-layout' {
  export const AppleLayout: React.FC<{ children: React.ReactNode }>;
}

declare module '@/components/ui/input' {
  export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
}

declare module '@/components/ui/button' {
  export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }>;
}

declare module '@/hooks/use-ai-assistant' {
  export function useAIAssistant(): {
    sendMessage: (message: string, conversationId: string) => Promise<any>;
    startNewConversation: () => Promise<{ id: string }>;
  };
}

declare module '@/components/cross-chain/query-form' {
  export const CrossChainQueryForm: React.FC<{
    onQuerySubmit: (messageId: string) => void;
  }>;
}

declare module '@/components/cross-chain/message-status' {
  export const MessageStatus: React.FC<{
    messageId: string;
    onComplete: () => void;
  }>;
}

declare module '@/components/cross-chain/tracked-messages' {
  export const TrackedMessages: React.FC;
}
