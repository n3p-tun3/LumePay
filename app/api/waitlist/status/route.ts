import { NextResponse } from 'next/server';
import waitlistConfig from '@/app/config/waitlist.json';

// Add edge runtime
export const runtime = 'edge';

// Cache waitlist status for 5 minutes
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

export async function GET() {
  // Simply return the static config
  // In a real app, you would update this file through your admin interface
  return NextResponse.json(waitlistConfig, {
    headers: {
      'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    }
  });
} 