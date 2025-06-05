import { NextResponse } from 'next/server';
import waitlistConfig from '@/app/config/waitlist.json';

// Add edge runtime
export const runtime = 'edge';

// Cache waitlist status for 5 minutes
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

export async function GET() {
  // Return the static config with caching headers
  return NextResponse.json(waitlistConfig, {
    headers: {
      'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    }
  });
} 