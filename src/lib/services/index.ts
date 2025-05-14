/**
 * @file index.ts
 * @description Exports all service modules for easy importing
 */

// Export all API services
export * from './api-service';
export * from './chain-service';
export * from './nft-service';
export * from './event-service';
export * from './analytics-service';
export * from './ai-service';

// Re-export service instances
import { chainService } from './chain-service';
import { nftService } from './nft-service';
import { eventService } from './event-service';
import { analyticsService } from './analytics-service';
import { aiService } from './ai-service';

// Export service instances for convenience
export const services = {
  chain: chainService,
  nft: nftService,
  event: eventService,
  analytics: analyticsService,
  ai: aiService,
};
