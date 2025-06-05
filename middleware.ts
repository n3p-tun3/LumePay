import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authOptions } from './app/auth/auth.config';

// Cache waitlist status for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let waitlistCache = {
  status: null as { enabled: boolean; message: string } | null,
  lastUpdated: 0
};

async function getWaitlistStatus(request: NextRequest) {
  const now = Date.now();
  // Return cached value if it's less than 5 minutes old
  if (waitlistCache.status && now - waitlistCache.lastUpdated < CACHE_DURATION) {
    return waitlistCache.status;
  }

  try {
    // Use the origin from the request to ensure we're calling the correct API endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/waitlist/status`, {
      headers: {
        'x-middleware-prefetch': '1' // Add header to indicate this is a middleware request
      },
      cache: 'no-store' // Disable caching for this request
    });

    if (!response.ok) {
      throw new Error('Failed to fetch waitlist status');
    }

    const status = await response.json();
    waitlistCache = {
      status,
      lastUpdated: now
    };
    return status;
  } catch (error) {
    console.error('Error fetching waitlist status:', error);
    // Return default status on error
    return {
      enabled: false,
      message: 'We are currently in private beta. Join our waitlist to get early access!'
    };
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow internal requests to admin settings API
  if (pathname === '/api/admin/settings' && request.headers.get('x-internal-request') === '1') {
    return NextResponse.next();
  }

  // Handle waitlist/registration routes first
  if (pathname === '/auth/register' || pathname === '/auth/waitlist' || pathname === '/api/register') {
    try {
      const { enabled } = await getWaitlistStatus(request);

      if (pathname === '/auth/register') {
        if (enabled) {
          const url = new URL('/auth/waitlist', request.url);
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }

      if (pathname === '/auth/waitlist') {
        if (!enabled) {
          const url = new URL('/auth/register', request.url);
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }

      if (pathname === '/api/register') {
        if (enabled) {
          return new NextResponse(
            JSON.stringify({ message: 'Registration is currently disabled. Please join the waitlist instead.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Error in waitlist/registration middleware:', error);
      // On error, allow registration as fallback
      if (pathname === '/auth/waitlist') {
        const url = new URL('/auth/register', request.url);
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
  }

  // Handle existing auth routes
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = pathname.startsWith('/auth/') && pathname !== '/auth/register' && pathname !== '/auth/waitlist';

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    if (!isAuth) {
      let from = pathname;
      if (request.nextUrl.search) {
        from += request.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, request.url)
      );
    }

    if (pathname.startsWith('/dashboard/admin')) {
      const isAdmin = token?.isAdmin === true;
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin')) {
    if (!isAuth) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = token?.isAdmin === true;
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({ message: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/register'
  ],
}; 