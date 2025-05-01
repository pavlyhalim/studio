import { NextResponse } from 'next/server';
import { initialSampleUsers } from '@/lib/sample-data'; // Use initial data for simulation

// --- Mock Users (Assume shared state or DB in real app) ---
const mockUsersDb = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: 'student' | 'professor' | 'admin' | null }>();
initialSampleUsers.forEach(u => {
    mockUsersDb.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: `hashed_${u.id}_password`, // Simulate hash
        role: u.role,
    });
});
// ------------------------------------------------------------

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
         return NextResponse.json({ message: 'Unauthorized: Invalid token format' }, { status: 401 });
    }

    // Find user in mock DB by ID
    let userFromDb: { id: string; name: string; email: string; role: 'student' | 'professor' | 'admin' | null } | undefined;
    for (const userEntry of mockUsersDb.values()) {
        if (userEntry.id === userIdFromToken) {
            userFromDb = userEntry;
            break;
        }
    }


    if (!userFromDb) {
      // Simulate token expired or user not found
      return NextResponse.json({ message: 'Unauthorized: User not found or token expired' }, { status: 401 });
    }
    // -----------------------------------------------

    // Return basic user info (exclude password hash)
    const userResponse = {
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
