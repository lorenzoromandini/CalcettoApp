/**
 * RSVP React Hooks - Stub for DB Restructure
 * 
 * RSVP functionality has been removed in the new schema.
 * This stub maintains API compatibility while the feature is being redesigned.
 * FormationPosition with 'played' flag replaces RSVP functionality.
 */

import { useState, useCallback } from 'react';

export type RSVPStatus = 'in' | 'out' | 'maybe';

export interface RSVPCounts {
  in: number;
  out: number;
  maybe: number;
  total: number;
}

export interface MatchRSVP {
  id: string;
  matchId: string;
  clubMemberId: string;
  rsvpStatus: RSVPStatus;
  rsvpAt: string;
  clubMember: {
    user: {
      firstName: string;
      lastName: string;
      nickname: string | null;
      image: string | null;
    };
  };
}

// Stub functions - RSVP not available in new schema
export async function getMatchRSVPs(_matchId: string): Promise<MatchRSVP[]> {
  return [];
}

export async function getRSVPCounts(_matchId: string): Promise<RSVPCounts> {
  return { in: 0, out: 0, maybe: 0, total: 0 };
}

export async function updateRSVP(_matchId: string, _clubMemberId: string, _status: RSVPStatus): Promise<void> {
  console.warn('RSVP functionality removed in DB restructure');
}

export async function getMyRSVP(_matchId: string, _clubMemberId: string): Promise<MatchRSVP | null> {
  return null;
}

export function subscribeToRSVPs(_matchId: string, _callback: (rsvps: MatchRSVP[]) => void): () => void {
  return () => {};
}

// ============================================================================
// useRSVPs Hook - Returns empty data
// ============================================================================

interface UseRSVPsReturn {
  rsvps: MatchRSVP[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRSVPs(_matchId: string): UseRSVPsReturn {
  return {
    rsvps: [],
    isLoading: false,
    error: null,
    refetch: async () => {},
  };
}

// ============================================================================
// useRSVPCounts Hook - Returns zero counts
// ============================================================================

interface UseRSVPCountsReturn {
  counts: RSVPCounts;
  isLoading: boolean;
  error: Error | null;
}

export function useRSVPCounts(_matchId: string): UseRSVPCountsReturn {
  return {
    counts: { in: 0, out: 0, maybe: 0, total: 0 },
    isLoading: false,
    error: null,
  };
}

// ============================================================================
// useMyRSVP Hook - Returns null (no RSVP)
// ============================================================================

interface UseMyRSVPReturn {
  rsvp: MatchRSVP | null;
  isLoading: boolean;
  updateRSVP: (_status: RSVPStatus) => Promise<void>;
}

export function useMyRSVP(_matchId: string, _userId?: string): UseMyRSVPReturn {
  return {
    rsvp: null,
    isLoading: false,
    updateRSVP: async () => {
      console.warn('RSVP functionality removed in DB restructure');
    },
  };
}
