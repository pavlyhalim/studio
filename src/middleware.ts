import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * Middleware for handling authentication and security measures
 * - Adds security headers to all responses
 * - Verifies Firebase ID tokens for protected routes
 * - Implements basic CSRF protection
 */
export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add security headers to all responses
  // These headers help protect against common web vulnerabilities
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    // Add Content Security Policy as needed for your app
    // 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  };

  // Add security headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Basic CSRF protection for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Check for a valid referer header for all POST/PUT/DELETE requests
    // This is a basic CSRF protection measure
    const requestMethod = request.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(requestMethod)) {
      const referer = request.headers.get('referer');
      const origin = request.headers.get('origin');
      
      // Skip CSRF check in development mode
      if (process.env.NODE_ENV !== 'development') {
        // Check if referer is missing or from a different origin
        if (!referer || !origin) {
          return new NextResponse(
            JSON.stringify({ message: 'Missing referer or origin header' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
  
        try {
          const refererUrl = new URL(referer);
          const originUrl = new URL(origin);
          
          if (refererUrl.origin !== originUrl.origin) {
            return new NextResponse(
              JSON.stringify({ message: 'CSRF protection: invalid referer' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          return new NextResponse(
            JSON.stringify({ message: 'Invalid referer or origin format' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
  }

  // Authorization check for protected routes
  // These routes require a valid Firebase ID token
  const protectedRoutes = [
    '/api/user/',
    '/api/courses/',
    '/api/assignments/',
    '/api/grades/',
    '/api/announcements/',
    '/api/files/',
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized: Missing or invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Verify the Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Add user ID to request headers for use in API routes
      requestHeaders.set('X-User-ID', decodedToken.uid);
      
      // Add user role if available in token claims
      if (decodedToken.role) {
        requestHeaders.set('X-User-Role', decodedToken.role);
      }
      
      // Return the response with the updated headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token verification error:', error);
      
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Apply middleware to all API routes
    '/api/:path*',
    // Exclude auth API endpoints for login/signup
    '/((?!api/auth/:path*|_next/static|favicon.ico).*)',
  ],
};