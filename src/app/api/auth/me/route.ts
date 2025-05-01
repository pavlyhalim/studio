
import { NextResponse } from 'next/server';
import { mockUsersDb, type User } from '@/lib/sample-data'; // Use mock DB

// IMPORTANT: This simulates validating a session token. Real apps need secure JWT/session validation.

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    const token = authorization?.split(' ')[1]; // Assumes "Bearer TOKEN"

    if (!token || !token.startsWith('simulated-token-for-')) {
      return NextResponse.json({ message: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    // --- Simulate Token Validation and User Lookup ---
    // Extract simulated user ID from the token
    const userIdMatch = token.match(/^simulated-token-for-(.*?)-\d+$/);
    const userIdFromToken = userIdMatch ? userIdMatch[1] : null;

    if (!userIdFromToken) {
         console.log("Unauthorized: Invalid token format", token);
         return NextResponse.json({ message: 'Unauthorized: Invalid token format' }, { status: 401 });
    }

    // Find user in mock DB by ID (replace with real DB lookup)
    // Use the imported mockUsersDb directly
    let userFromDb: User | undefined;
    for (const userEntry of mockUsersDb.values()) {
        if (userEntry.id === userIdFromToken) {
            userFromDb = userEntry;
            break;
        }
    }

    if (!userFromDb) {
      // Simulate token expired or user not found (e.g., user deleted after token issued)
      console.log(`Unauthorized: User not found for ID ${userIdFromToken} derived from token`);
      return NextResponse.json({ message: 'Unauthorized: User not found or token expired' }, { status: 401 });
    }
    // -----------------------------------------------

    // Return basic user info (exclude password hash)
    const userResponse: Omit<User, 'passwordHash'> = {
        id: userFromDb.id,
        email: userFromDb.email,
        name: userFromDb.name,
        role: userFromDb.role,
    };

    // Simulate a short delay
    await new Promise(res => setTimeout(res, 100));

    return NextResponse.json(userResponse, { status: 200 });

  } catch (error) {
    console.error('/api/auth/me Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

