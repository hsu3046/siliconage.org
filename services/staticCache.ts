/**
 * Static Cache
 * 
 * Empty cache for fresh data generation.
 * Previously used for pre-cached AI responses.
 */

import { AIResponse } from '../types';

// Static pre-generated AI responses - cleared for fresh generation
export const staticCache: Record<string, AIResponse> = {};
