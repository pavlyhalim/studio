// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware only for API routes.
 * - Adds basic CSRF protection
 * - Adds security headers on API responses
 * 
 * Actual auth token verification lives inside your
 * Node.js API handlers (where firebase-admin works).
 */
export async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers)
  const response = NextResponse.next({ request: { headers } })

  // Security headers for API responses
  for (const [key, value] of Object.entries({
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
  })) {
    response.headers.set(key, value)
  }

  // Basic CSRF for non‐GET API requests
  if (request.method !== 'GET') {
    const referer = request.headers.get('referer')
    const origin  = request.headers.get('origin')
    if (process.env.NODE_ENV !== 'development') {
      if (!referer || !origin) {
        return new NextResponse(
          JSON.stringify({ message: 'Missing referer or origin header' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
      try {
        if (new URL(referer).origin !== new URL(origin).origin) {
          return new NextResponse(
            JSON.stringify({ message: 'CSRF protection: invalid referer' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ message: 'Invalid referer or origin format' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  return response
}

export const config = {
  // Only intercept API routes — middleware won't run on pages
  matcher: ['/api/:path*'],
}
