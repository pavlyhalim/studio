
import { NextResponse } from 'next/server';
import { mockUsersDb, type User } from '@/lib/sample-data'; // Use mock DB

// IMPORTANT: Replace mockUsersDb with actual database logic in production.

export async function PUT(request: Request) {
  try {
    // 1. Authentication Check (Simulated)
    // IMPORTANT: In a real app, you MUST verify the user's session/token securely.
    const authorization = request.headers.get('Authorization');
    const token = authorization?.split(' ')[1];
    const userIdMatch = token?.match(/^simulated-token-for-(.*?)-\d+$/);
    const userIdFromToken = userIdMatch ? userIdMatch[1] : null;

    if (!userIdFromToken) {
      return NextResponse.json({ message: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    // Find user in mock DB by ID (replace with real DB lookup)
    let userFromDb;
    for (const userEntry of mockUsersDb.values()) {
        if (userEntry.id === userIdFromToken) {
            userFromDb = userEntry;
            break;
        }
    }

    if (!userFromDb) {
      return NextResponse.json({ message: 'Unauthorized: User not found' }, { status: 401 });
    }
    // --- End of Simulated Authentication ---

    // 2. Get Updated Profile Data from Request Body
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Valid name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // 3. Update Profile in Database (Simulated)
    // IMPORTANT: Replace with actual database update operation.
    userFromDb.name = trimmedName;
    mockUsersDb.set(userFromDb.email.toLowerCase(), userFromDb); // Update the mock DB entry
    console.log(`Profile name updated for user ${userFromDb.email} to "${trimmedName}"`);
    // --- End of Simulated DB Update ---

    // 4. Return Updated User Data (Excluding Sensitive Info)
    const updatedUserResponse: Omit<User, 'passwordHash'> = {
        id: userFromDb.id,
        email: userFromDb.email,
        name: userFromDb.name,
        role: userFromDb.role,
    };

    // Simulate a short delay
    await new Promise(res => setTimeout(res, 500));

    return NextResponse.json(updatedUserResponse, { status: 200 });

  } catch (error) {
    console.error('Update Profile API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
