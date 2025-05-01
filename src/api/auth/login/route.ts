
import { NextResponse } from 'next/server';
import { mockUsersDb, type User } from '@/lib/sample-data'; // Use mock DB

// IMPORTANT: This simulates a basic login flow. Real apps need robust security.

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // --- Simulate Database Check ---
    const lowerCaseEmail = email.toLowerCase();
    const existingUser = mockUsersDb.get(lowerCaseEmail);

    if (!existingUser) {
        console.log(`Login attempt failed: User not found for email ${lowerCaseEmail}`);
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // --- Simulate Password Check ---
    // IMPORTANT: This is NOT secure. Real apps MUST use bcrypt.compareSync() or similar.
    // Compare the provided password against the *simulated* hash stored in mockUsersDb.
    // The stored hash is generated as `simulated_hash_for_${originalPassword}` in sample-data.
    // We simulate the check by generating the hash for the provided password and comparing.
    const simulatedHashForProvidedPassword = `simulated_hash_for_${password}`;
    const passwordMatches = simulatedHashForProvidedPassword === existingUser.passwordHash;


    if (!passwordMatches) {
        console.log(`Login attempt failed: Password mismatch for user ${existingUser.email}`);
         // Log the expected vs provided hash for debugging (REMOVE IN PRODUCTION)
         console.log(`Expected hash: ${existingUser.passwordHash}`);
         console.log(`Generated hash from provided password: ${simulatedHashForProvidedPassword}`);
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    // ---------------------------------

    // --- Simulate Session/Token Generation ---
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
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
