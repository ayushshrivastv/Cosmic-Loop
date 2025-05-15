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
  mutation CreateChatConversation($title: String!) {
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

// Define component types
type AIComponent = {
  type: 'TEXT' | 'CODE' | 'DATA' | 'TABLE' | 'CHART' | 'TOKEN' | 'LINK';
  content?: string;
  data?: any;
  headers?: string[];
  address?: string;
  url?: string;
};

// Define AI response type
type AIResponse = {
  text: string;
  components?: AIComponent[];
  error?: string;
};

// Define chat message type
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  components?: AIComponent[];
};

// Define conversation type
type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

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

  // Mock askAssistant implementation with streaming support
  const [askLoading, setAskLoading] = useState(false);
  const askAssistant = useCallback(({ 
    variables, 
    onUpdate 
  }: { 
    variables: { question: string, conversationId?: string },
    onUpdate?: (partialResponse: AIResponse) => void 
  }) => {
    console.log('Mock ask assistant:', variables);
    setAskLoading(true);
    
    // If onUpdate callback is provided, use streaming response
    if (onUpdate) {
      // Send initial thinking state
      onUpdate({
        text: 'Thinking...',
        components: []
      });
      
      // Process the query with streaming updates
      // Using a separate function call for streaming to avoid type issues
      (async () => {
        try {
          const response = await aiAssistantService.processQuery(variables.question, (partialAIResponse) => {
            // This is a callback that will be called with partial responses
            onUpdate({
              text: partialAIResponse.text,
              components: partialAIResponse.data ? [{
                type: 'DATA',
                data: partialAIResponse.data
              }] : []
            });
            // Return nothing from the callback
            return undefined;
          });
        } catch (error) {
          console.error('Error in streaming response:', error);
        }
      })();
    }
    
    // Still return a promise for compatibility with existing code
    return new Promise<{ data: { askAssistant: AIResponse } }>((resolve) => {
      // Process the query and resolve when complete
      aiAssistantService.processQuery(variables.question).then(response => {
        setAskLoading(false);
        resolve({
          data: {
            askAssistant: {
              text: response.text,
              components: response.data ? [{
                type: 'DATA',
                data: response.data
              }] : [],
              error: undefined
            }
          }
        });
      }).catch(error => {
        console.error('Error in ask assistant:', error);
        setAskLoading(false);
        resolve({
          data: {
            askAssistant: {
              text: 'Sorry, I encountered an error. Please try again.',
              components: [],
              error: String(error)
            }
          }
        });
      });
    });
  }, []);

  // Mock createConversation implementation
  const [createLoading, setCreateLoading] = useState(false);
  const createConversation = useCallback(({ variables }: { variables: { title: string } }) => {
    console.log('Mock create conversation:', variables);
    setCreateLoading(true);
    
    // Simulate API call with a delay
    return new Promise<{ data: { createChatConversation: { id: string; title: string; createdAt: string } } }>((resolve) => {
      setTimeout(() => {
        setCreateLoading(false);
        const newConversation = {
          id: `conversation-${Date.now()}`,
          title: variables.title,
          createdAt: new Date().toISOString()
        };
        
        // Update the conversations data
        setConversationsData(prev => ({
          getChatConversations: [...prev.getChatConversations, newConversation]
        }));
        
        // Set as current conversation
        setCurrentConversationId(newConversation.id);
        
        resolve({
          data: {
            createChatConversation: newConversation
          }
        });
      }, 300);
    });
  }, []);

  // Mock addMessage implementation
  const [addMessageLoading, setAddMessageLoading] = useState(false);
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
   * Send a message to the AI assistant with support for streaming responses
   * @param message The message to send
   * @param conversationId Optional conversation ID
   * @param updateCallback Optional callback for streaming updates
   * @returns The final AI response
   */
  const sendMessage = useCallback(async (
    message: string, 
    conversationId?: string,
    updateCallback?: (partialResponse: AIResponse) => void
  ): Promise<AIResponse | null> => {
    setIsLoading(true);
    try {
      const activeConversationId = conversationId || currentConversationId;
      
      if (!activeConversationId) {
        throw new Error('No active conversation');
      }
      
      // Create a function to convert AI assistant responses to the expected format
      const createResponse = (aiResponse: any): AIResponse => {
        const components: AIComponent[] = [];
        
        // Add related events as components if available
        if (aiResponse.relatedEvents && aiResponse.relatedEvents.length > 0) {
          // Add a data component with the events
          components.push({
            type: 'DATA',
            data: aiResponse.relatedEvents
          });
          
          // If we have NFT events with metadata and images, add them as components
          const nftEvents = aiResponse.relatedEvents.filter((event: any) => 
            'metadata' in event && event.metadata?.image
          );
          
          if (nftEvents.length > 0) {
            // Add up to 3 NFT images as components
            nftEvents.slice(0, 3).forEach((event: any) => {
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
        return {
          text: aiResponse.text,
          components: components.length > 0 ? components : undefined
        };
      };
      
      let finalResponse: AIResponse;
      
      // Handle streaming or non-streaming response generation
      if (updateCallback) {
        // For streaming responses, we need to handle partial updates
        let lastResponse: any = null;
        
        // Create a wrapper function that captures the partial responses
        const streamHandler = (partialAIResponse: any) => {
          lastResponse = partialAIResponse;
          const formattedResponse = createResponse(partialAIResponse);
          updateCallback(formattedResponse);
          return undefined; // Explicitly return undefined to satisfy TypeScript
        };
        
        // Process the query with streaming updates
        await aiAssistantService.processQuery(message, streamHandler);
        
        // Use the last response as the final response
        finalResponse = lastResponse ? createResponse(lastResponse) : {
          text: 'Sorry, I encountered an error processing your request.'
        };
      } else {
        // For non-streaming responses, just wait for the complete response
        const aiResponse = await aiAssistantService.processQuery(message);
        finalResponse = createResponse(aiResponse);
      }
      
      // Simulate adding the assistant's response to the conversation
      await addMessage({
        variables: {
          conversationId: activeConversationId,
          message: {
            role: 'assistant',
            content: finalResponse.text
          }
        }
      });

      // Load the updated conversation
      await getConversation({
        variables: { id: activeConversationId }
      });

      return finalResponse;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, currentConversationId, getConversation, toast]);

  /**
   * Load a specific conversation
   * @param id The conversation ID to load
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
    startNewConversation,
    refetchConversations
  };
};
