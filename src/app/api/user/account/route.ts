
import { NextResponse } from 'next/server';
import { mockUsersDb } from '@/lib/sample-data'; // Use mock DB

// IMPORTANT: Replace mockUsersDb with actual database logic in production.

export async function DELETE(request: Request) {
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
    let userEmailKey: string | null = null;
    for (const [emailKey, userEntry] of mockUsersDb.entries()) {
        if (userEntry.id === userIdFromToken) {
            userFromDb = userEntry;
            userEmailKey = emailKey; // Store the key (lowercase email)
            break;
        }
    }


    if (!userFromDb || !userEmailKey) {
      return NextResponse.json({ message: 'Unauthorized: User not found' }, { status: 401 });
    }
    // --- End of Simulated Authentication ---

    // 2. Perform Account Deletion in Database (Simulated)
    // IMPORTANT: Replace with actual database delete operation.
    // Also handle cascading deletes (enrollments, grades, etc.) in a real backend.
    const deleted = mockUsersDb.delete(userEmailKey);

    if (deleted) {
        console.log(`Account deleted for user ${userFromDb.email}`);
    } else {
        console.error(`Failed to delete account for user ${userFromDb.email} from mock DB.`);
        // Consider throwing an error if the deletion fails unexpectedly
        // throw new Error('Failed to delete user from database.');
    }
    // --- End of Simulated DB Deletion ---

    // Simulate a short delay
    await new Promise(res => setTimeout(res, 1000));

    // Return success even if DB delete failed in mock, as the user is gone from perspective
    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete Account API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
