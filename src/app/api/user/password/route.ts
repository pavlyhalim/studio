
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { mockUsersDb } from '@/lib/sample-data'; // Use mock DB

// IMPORTANT: Replace mockUsersDb with actual database logic in production.
const saltRounds = 10;

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
    // Use the imported mockUsersDb directly
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

    // 2. Get Passwords from Request Body
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    // 3. Verify Current Password
    const currentPasswordMatches = await bcrypt.compare(currentPassword, userFromDb.passwordHash);

    if (!currentPasswordMatches) {
      return NextResponse.json({ message: 'Incorrect current password.' }, { status: 403 }); // 403 Forbidden or 400 Bad Request
    }

    // 4. Hash the New Password
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 5. Update Password in Database (Simulated)
    // IMPORTANT: Replace with actual database update operation.
    userFromDb.passwordHash = newPasswordHash;
    // Use the imported mockUsersDb directly
    mockUsersDb.set(userFromDb.email.toLowerCase(), userFromDb); // Update the mock DB entry
    console.log(`Password updated for user ${userFromDb.email}`);
    // --- End of Simulated DB Update ---

    // Simulate a short delay
    await new Promise(res => setTimeout(res, 500));

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Change Password API Error:', error);
     if (error instanceof Error && error.message.includes('data and hash arguments required')) {
        console.error('Bcrypt Error: Missing or invalid hash during comparison.');
        return NextResponse.json({ message: 'Password verification process error. Please contact support.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

