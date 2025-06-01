import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export async function middleware(request: NextRequest) {
  // Only apply to payment verification endpoints
  if (!request.nextUrl.pathname.startsWith('/api/payments/intent/')) {
    return NextResponse.next();
  }

  // Skip for GET requests (public intent details)
  if (request.method === 'GET') {
    return NextResponse.next();
  }

  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is required" },
      { status: 401 }
    );
  }

  try {
    // Find and validate API key
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!key) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (!key.enabled) {
      return NextResponse.json(
        { error: "API key is disabled" },
        { status: 401 }
      );
    }

    if (key.remainingCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Check rate limit if enabled
    if (key.rateLimitEnabled) {
      const now = new Date();
      const windowStart = new Date(now.getTime() - key.rateLimitTimeWindow);
      
      const usageCount = await prisma.payment.count({
        where: {
          userId: key.userId,
          createdAt: {
            gte: windowStart
          }
        }
      });

      if (usageCount >= key.rateLimitMax) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
    }

    // Deduct credit and update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        remainingCredits: key.remainingCredits - 1,
        lastUsedAt: new Date()
      }
    });

    // Add user info to request headers for the route handler
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', key.userId);
    requestHeaders.set('x-user-email', key.user.email || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("API key verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: '/api/payments/intent/:path*',
}; 