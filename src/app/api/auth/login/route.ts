
import { NextResponse } from 'next/server';
import { mockUsersDb, type User } from '@/lib/sample-data'; // Use mock DB
import bcrypt from 'bcrypt';

// IMPORTANT: This uses bcrypt for comparison but still uses a mock DB. Replace with real DB logic.

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // --- Database Check ---
    const lowerCaseEmail = email.toLowerCase();
    // Use the imported mockUsersDb directly
    const existingUser = mockUsersDb.get(lowerCaseEmail);

    if (!existingUser) {
        console.log(`Login attempt failed: User not found for email ${lowerCaseEmail}`);
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // --- Secure Password Check ---
    // Compare the provided password with the stored hash using bcrypt
    const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);

    if (!passwordMatches) {
        console.log(`Login attempt failed: Password mismatch for user ${existingUser.email}`);
        // Avoid logging hashes in production
        // console.log(`Expected hash: ${existingUser.passwordHash}`); // For debugging ONLY
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    // ---------------------------------

    // --- Session/Token Generation ---
    // IMPORTANT: Real apps need secure JWT or session management.
    const token = `simulated-token-for-${existingUser.id}-${Date.now()}`;
    // -----------------------------------------

    // Return token and basic user info (exclude password hash)
    const userResponse: Omit<User, 'passwordHash'> = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
    };

    console.log(`Login successful for user ${userResponse.email}`);
    // Simulate a short delay
    await new Promise(res => setTimeout(res, 500));

    return NextResponse.json({ token, user: userResponse }, { status: 200 });

  } catch (error) {
    console.error('Login API Error:', error);
    if (error instanceof Error && error.message.includes('data and hash arguments required')) {
        // Specific bcrypt error if hash is missing/invalid in DB
         console.error('Bcrypt Error: Missing or invalid hash for user.');
         return NextResponse.json({ message: 'Login process error. Please contact support.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
