/**
 * @file event-service.ts
 * @description Service for event-related API operations
 */

import { ApiService } from './api-service';
import { SupportedChain } from '../utils/layer-zero';
import { NFT, NFTCollection } from './nft-service';

/**
 * Event interface
 */
export interface Event {
  id: string;
  name: string;
  description: string;
  targetChains: SupportedChain[];
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  maxParticipants?: number;
  nftCollection: NFTCollection;
  createdAt: string;
  participantCount?: number;
  claimCount?: number;
}

/**
 * Event participant interface
 */
export interface EventParticipant {
  id: string;
  walletAddress: string;
  hasClaimed: boolean;
  claimedAt?: string;
  claimTransactionHash?: string;
  claimedNft?: NFT;
  event: Event;
  createdAt: string;
}

/**
 * Event analytics interface
 */
export interface EventAnalytics {
  totalEvents: number;
  totalTokensCreated: number;
  totalTokensClaimed: number;
  conversionRate: number;
  claimsByHour: {
    hour: number;
    count: number;
  }[];
  claimsByDay: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topEvents: {
    name: string;
    tokensIssued: number;
    tokensClaimed: number;
    conversionRate: number;
  }[];
  recentActivity: {
    time: string;
    action: string;
    recipient: string;
    event: string;
  }[];
}

/**
 * Service for event-related operations
 */
export class EventService extends ApiService {
  /**
   * Get active events
   * @param chain - Filter by blockchain
   * @param limit - Maximum number of events to return
   * @param offset - Pagination offset
   * @returns Array of active events
   */
  async getActiveEvents(
    chain?: SupportedChain,
    limit = 10,
    offset = 0
  ): Promise<Event[]> {
    const query = `
      query GetActiveEvents($chain: Chain, $limit: Int, $offset: Int) {
        activeEvents(chain: $chain, limit: $limit, offset: $offset) {
          id
          name
          description
          targetChains
          startDate
          endDate
          status
          maxParticipants
          participantCount
          claimCount
          nftCollection {
            id
            name
            symbol
            description
            image
          }
          createdAt
        }
      }
    `;

    const variables = {
      chain: chain ? chain.toUpperCase() : undefined,
      limit,
      offset,
    };

    try {
      const result = await this.executeQuery<{ activeEvents: Event[] }>(query, variables);
      return result.activeEvents;
    } catch (error) {
      console.error('Error fetching active events:', error);
      return [];
    }
  }

  /**
   * Get event details
   * @param eventId - Event ID
   * @returns Event details or null if not found
   */
  async getEventDetails(eventId: string): Promise<Event | null> {
    const query = `
      query GetEventDetails($eventId: ID!) {
        eventDetails(eventId: $eventId) {
          id
          name
          description
          targetChains
          startDate
          endDate
          status
          maxParticipants
          participantCount
          claimCount
          nftCollection {
            id
            name
            symbol
            description
            image
          }
          createdAt
        }
      }
    `;

    const variables = {
      eventId,
    };

    try {
      const result = await this.executeQuery<{ eventDetails: Event }>(query, variables);
      return result.eventDetails;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  }

  /**
   * Register for an event to receive an NFT
   * @param eventId - Event ID
   * @param walletAddress - Participant wallet address
   * @returns Event participation details
   */
  async registerForEvent(
    eventId: string,
    walletAddress: string
  ): Promise<EventParticipant> {
    const mutation = `
      mutation RegisterForEvent($eventId: ID!, $walletAddress: String!) {
        registerForEvent(eventId: $eventId, walletAddress: $walletAddress) {
          id
          walletAddress
          hasClaimed
          createdAt
          event {
            id
            name
          }
        }
      }
    `;

    const variables = {
      eventId,
      walletAddress,
    };

    try {
      // Invalidate active events on successful registration
      const result = await this.executeMutation<{ registerForEvent: EventParticipant }>(mutation, variables, undefined, {
        invalidateCache: /activeEvents/
      });

      return result.registerForEvent;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  /**
   * Claim an NFT from an event
   * @param eventId - Event ID
   * @param walletAddress - Participant wallet address
   * @param chain - Blockchain to receive the NFT
   * @returns Event participation details with claimed NFT
   */
  async claimEventNFT(
    eventId: string,
    walletAddress: string,
    chain: SupportedChain
  ): Promise<EventParticipant> {
    const mutation = `
      mutation ClaimEventNFT($eventId: ID!, $walletAddress: String!, $chain: Chain!) {
        claimEventNFT(eventId: $eventId, walletAddress: $walletAddress, chain: $chain) {
          id
          walletAddress
          hasClaimed
          claimedAt
          claimTransactionHash
          claimedNft {
            id
            tokenId
            chain
            contractAddress
            metadata
            isCompressed
          }
        }
      }
    `;

    const variables = {
      eventId,
      walletAddress,
      chain: chain.toUpperCase(),
    };

    try {
      // Invalidate NFTs cache for this wallet after claiming
      const nftCachePattern = new RegExp(`GetNFTsByOwner.*${walletAddress}`);
      const result = await this.executeMutation<{ claimEventNFT: EventParticipant }>(mutation, variables, undefined, {
        invalidateCache: [nftCachePattern, /activeEvents/]
      });

      return result.claimEventNFT;
    } catch (error) {
      console.error('Error claiming event NFT:', error);
      throw error;
    }
  }

  /**
   * Get participants for an event
   * @param eventId - Event ID
   * @param hasClaimed - Filter by claim status
   * @param limit - Maximum number of participants to return
   * @param offset - Pagination offset
   * @returns Array of event participants
   */
  async getEventParticipants(
    eventId: string,
    hasClaimed?: boolean,
    limit = 10,
    offset = 0
  ): Promise<EventParticipant[]> {
    const query = `
      query GetEventParticipants($eventId: ID!, $hasClaimed: Boolean, $limit: Int, $offset: Int) {
        eventParticipants(eventId: $eventId, hasClaimed: $hasClaimed, limit: $limit, offset: $offset) {
          id
          walletAddress
          hasClaimed
          claimedAt
          claimTransactionHash
          createdAt
        }
      }
    `;

    const variables = {
      eventId,
      hasClaimed,
      limit,
      offset,
    };

    try {
      const result = await this.executeQuery<{ eventParticipants: EventParticipant[] }>(query, variables);
      return result.eventParticipants;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      return [];
    }
  }

  /**
   * Get event analytics data
   * @param timeframe - Time period for analytics
   * @param organizerId - Filter by organizer ID
   * @returns Event analytics data
   */
  async getEventAnalytics(
    timeframe: 'day' | 'week' | 'month' = 'week',
    organizerId?: string
  ): Promise<EventAnalytics> {
    const query = `
      query GetEventAnalytics($timeframe: String!, $organizerId: ID) {
        eventAnalytics(timeframe: $timeframe, organizerId: $organizerId) {
          totalEvents
          totalTokensCreated
          totalTokensClaimed
          conversionRate
          claimsByHour {
            hour
            count
          }
          claimsByDay {
            date
            count
          }
          deviceBreakdown {
            type
            count
            percentage
          }
          topEvents {
            name
            tokensIssued
            tokensClaimed
            conversionRate
          }
          recentActivity {
            time
            action
            recipient
            event
          }
        }
      }
    `;

    const variables = {
      timeframe,
      organizerId,
    };

    try {
      const result = await this.executeQuery<{ eventAnalytics: EventAnalytics }>(query, variables, undefined, {
        cacheTtl: 60000 // 1 minute cache for analytics
      });
      return result.eventAnalytics;
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      // Return empty data structure instead of throwing
      return {
        totalEvents: 0,
        totalTokensCreated: 0,
        totalTokensClaimed: 0,
        conversionRate: 0,
        claimsByHour: [],
        claimsByDay: [],
        deviceBreakdown: [],
        topEvents: [],
        recentActivity: []
      };
    }
  }

  /**
   * Subscribe to event updates
   * @param eventId - Event ID to monitor
   * @param onUpdate - Callback for event updates
   * @returns Unsubscribe function
   */
  subscribeToEventUpdates(
    eventId: string,
    onUpdate: (data: Event) => void
  ) {
    const subscription = `
      subscription EventUpdated($eventId: ID!) {
        eventUpdated(eventId: $eventId) {
          id
          name
          description
          targetChains
          startDate
          endDate
          status
          maxParticipants
          participantCount
          claimCount
          createdAt
        }
      }
    `;

    const variables = {
      eventId,
    };

    return this.createSubscription(subscription, variables, onUpdate);
  }

  /**
   * Subscribe to claim events
   * @param eventId - Event ID to monitor
   * @param onUpdate - Callback for claim updates
   * @returns Unsubscribe function
   */
  subscribeToClaimEvents(
    eventId: string,
    onUpdate: (data: { participant: EventParticipant; eventName: string }) => void
  ) {
    const subscription = `
      subscription NFTClaimed($eventId: ID!) {
        nftClaimed(eventId: $eventId) {
          participant {
            id
            walletAddress
            hasClaimed
            claimedAt
            claimTransactionHash
          }
          eventName
        }
      }
    `;

    const variables = {
      eventId,
    };

    return this.createSubscription(subscription, variables, onUpdate);
  }
}

// Export singleton instance
export const eventService = new EventService();
