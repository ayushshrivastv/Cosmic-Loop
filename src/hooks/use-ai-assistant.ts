import { useState, useCallback } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useToast } from './use-toast';
import { aiAssistantService } from '../services/ai-assistant-service';
import { substreamsService } from '../services/substreams-service';

// GraphQL queries and mutations
const ASK_ASSISTANT = gql`
  query AskAssistant($question: String!, $conversationId: ID) {
    askAssistant(question: $question, conversationId: $conversationId) {
      text
      components {
        type
        content
        data
        headers
        address
        url
      }
      error
    }
  }
`;

const GET_CHAT_CONVERSATIONS = gql`
  query GetChatConversations {
    getChatConversations {
      id
      title
      messages {
        id
        role
        content
        timestamp
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_CHAT_CONVERSATION = gql`
  query GetChatConversation($id: ID!) {
    getChatConversation(id: $id) {
      id
      title
      messages {
        id
        role
        content
        timestamp
        components {
          type
          content
          data
          headers
          address
          url
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CHAT_CONVERSATION = gql`
  mutation CreateChatConversation($title: String) {
    createChatConversation(title: $title) {
      id
      title
      createdAt
    }
  }
`;

const ADD_CHAT_MESSAGE = gql`
  mutation AddChatMessage($conversationId: ID!, $message: ChatMessageInput!) {
    addChatMessage(conversationId: $conversationId, message: $message) {
      id
      role
      content
      timestamp
    }
  }
`;

export interface AIComponent {
  type: 'TEXT' | 'CODE' | 'DATA' | 'TABLE' | 'CHART' | 'TOKEN' | 'LINK';
  content?: string;
  data?: any;
  headers?: string[];
  address?: string;
  url?: string;
}

export interface AIResponse {
  text: string;
  components?: AIComponent[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  components?: AIComponent[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const useAIAssistant = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Mock data for conversations until backend is ready
  const mockConversationsData = {
    getChatConversations: [] as Array<{id: string; title: string; createdAt: string; messages?: any[]}>
  };

  // Use state instead of query until Apollo Client is properly configured
  const [conversationsData, setConversationsData] = useState(mockConversationsData);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<any>(null);
  
  // Function to refetch conversations (mock implementation)
  const refetchConversations = useCallback(() => {
    console.log('Mock refetch conversations');
    return Promise.resolve({ data: mockConversationsData });
  }, []);

  // Mock data for a single conversation
  const mockConversationData = {
    getChatConversation: null
  };

  // Mock implementation for getting a single conversation
  const [conversationData, setConversationData] = useState(mockConversationData);
  const [conversationLoading, setConversationLoading] = useState(false);
  
  // Mock function to get conversation
  const getConversation = useCallback(({ variables }: { variables: { id: string } }) => {
    console.log('Mock get conversation:', variables.id);
    setConversationLoading(true);
    // Simulate API call
    setTimeout(() => {
      setConversationLoading(false);
    }, 500);
    return Promise.resolve({ data: mockConversationData });
  }, []);

  // Mock askAssistant implementation
  const [askLoading, setAskLoading] = useState(false);
  const askAssistant = useCallback(({ variables }: { variables: { question: string, conversationId?: string } }) => {
    console.log('Mock ask assistant:', variables);
    setAskLoading(true);
    
    // Simulate API call with a delay
    return new Promise<{ data: { askAssistant: AIResponse } }>((resolve) => {
      setTimeout(() => {
        setAskLoading(false);
        resolve({
          data: {
            askAssistant: {
              text: `Mock response to: ${variables.question}`,
              components: [{
                type: 'TEXT',
                content: 'This is a mock response from the AI assistant.'
              }]
            }
          }
        });
      }, 1000);
    });
  }, []);

  // Mock createConversation implementation
  const createConversation = useCallback(({ variables }: { variables: { title?: string } }) => {
    const newId = `conv-${Date.now()}`;
    const newConversation = {
      id: newId,
      title: variables.title || 'New Conversation',
      createdAt: new Date().toISOString()
    };
    
    console.log('Mock create conversation:', newConversation);
    
    // Update the conversations list
    setConversationsData(prev => ({
      getChatConversations: [
        ...prev.getChatConversations,
        newConversation
      ]
    }));
    
    setCurrentConversationId(newId);
    
    return Promise.resolve({
      data: {
        createChatConversation: newConversation
      }
    });
  }, []);

  // Mock addMessage implementation
  const addMessage = useCallback(({ variables }: { 
    variables: { 
      conversationId: string, 
      message: { role: string, content: string } 
    } 
  }) => {
    console.log('Mock add message:', variables);
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      role: variables.message.role,
      content: variables.message.content,
      timestamp: new Date().toISOString()
    };
    
    return Promise.resolve({
      data: {
        addChatMessage: newMessage
      }
    });
  }, []);

  /**
   * Send a message to the AI assistant
   */
  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    setIsLoading(true);

    try {
      // Create a new conversation if needed
      let activeConversationId = conversationId || currentConversationId;

      if (!activeConversationId) {
        const result = await createConversation({
          variables: { title: message.slice(0, 30) + (message.length > 30 ? '...' : '') }
        });
        activeConversationId = result.data.createChatConversation.id;
      }

      // Add the user message to the conversation
      await addMessage({
        variables: {
          conversationId: activeConversationId,
          message: {
            role: 'user',
            content: message
          }
        }
      });

      // Process the message using the AI assistant service that leverages Substreams data
      const aiResponse = await aiAssistantService.processQuery(message);
      
      // Convert the AI assistant response to the expected format
      const components: AIComponent[] = [];
      
      // Add related events as components if available
      if (aiResponse.relatedEvents && aiResponse.relatedEvents.length > 0) {
        // Add a data component with the events
        components.push({
          type: 'DATA',
          data: aiResponse.relatedEvents
        });
        
        // If we have NFT events with metadata and images, add them as components
        const nftEvents = aiResponse.relatedEvents.filter(event => 
          'metadata' in event && event.metadata?.image
        );
        
        if (nftEvents.length > 0) {
          // Add up to 3 NFT images as components
          nftEvents.slice(0, 3).forEach(event => {
            if ('metadata' in event && event.metadata?.image) {
              components.push({
                type: 'TOKEN',
                content: event.metadata.name || 'NFT',
                url: event.metadata.image
              });
            }
          });
        }
      }
      
      // Create a response object in the expected format
      const response: AIResponse = {
        text: aiResponse.text,
        components: components.length > 0 ? components : undefined
      };

      // Simulate adding the assistant's response to the conversation
      await addMessage({
        variables: {
          conversationId: activeConversationId,
          message: {
            role: 'assistant',
            content: response.text
          }
        }
      });

      // Load the updated conversation
      await getConversation({
        variables: { id: activeConversationId }
      });

      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return { text: 'Sorry, something went wrong. Please try again.', error: String(error) };
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, createConversation, currentConversationId, getConversation, toast]);

  /**
   * Load a specific conversation
   */
  const loadConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    return getConversation({
      variables: { id }
    });
  }, [getConversation]);

  /**
   * Create a new conversation
   */
  const startNewConversation = useCallback(async (title?: string) => {
    const result = await createConversation({
      variables: { title: title || 'New Conversation' }
    });

    return result.data.createChatConversation;
  }, [createConversation]);

  return {
    // Data
    conversations: conversationsData?.getChatConversations || [],
    currentConversation: conversationData?.getChatConversation,
    currentConversationId,

    // Loading states
    isLoading: isLoading || askLoading || conversationsLoading || conversationLoading,
    conversationsLoading,
    conversationLoading,

    // Error state
    conversationsError,

    // Actions
    sendMessage,
    loadConversation,
    setCurrentConversationId,
    startNewConversation,
    refetchConversations,
  };
};
