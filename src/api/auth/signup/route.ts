
import { NextResponse } from 'next/server';
import { mockUsersDb, createSampleUser, type User } from '@/lib/sample-data'; // Use mock DB and create helper
import bcrypt from 'bcrypt';

// IMPORTANT: This is now closer to production, but still uses a mock DB. Replace with real DB logic.
const saltRounds = 10; // Standard salt rounds for bcrypt

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // --- Database Check ---
    const lowerCaseEmail = email.toLowerCase();
    if (mockUsersDb.has(lowerCaseEmail)) {
      console.log(`Signup attempt failed: Email ${lowerCaseEmail} already registered.`);
      return NextResponse.json({ message: 'Email address is already registered' }, { status: 409 }); // 409 Conflict
    }
    // ---------------------------------

    // --- User Creation with Secure Hashing ---
    // Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(password, saltRounds); // Use await for async hashing

    // Use the helper, but provide the hash directly
    // Note: createSampleUser modified to accept hash directly or generate one if passwordPlain is given
    const newUserObject = createSampleUser({
        name,
        email: lowerCaseEmail,
        role: 'student', // Default role
        passwordHash: passwordHash, // Pass the generated hash
    });

    // Add to mock DB
    mockUsersDb.set(lowerCaseEmail, newUserObject);
    console.log("Mock DB Updated (Signup):", { id: newUserObject.id, email: newUserObject.email, name: newUserObject.name, role: newUserObject.role }); // Don't log hash
    // -----------------------------

    // --- Session/Token Generation ---
    // IMPORTANT: Real apps need secure JWT or session management.
    const token = `simulated-token-for-${newUserObject.id}-${Date.now()}`;
    // -----------------------------------------

    // Return token and basic user info (exclude password hash)
    const userResponse: Omit<User, 'passwordHash'> = {
        id: newUserObject.id,
        email: newUserObject.email,
        name: newUserObject.name,
        role: newUserObject.role,
    };

    // Simulate a short delay
    await new Promise(res => setTimeout(res, 500));

    return NextResponse.json({ token, user: userResponse }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Signup API Error:', error);
    // Check if it's a bcrypt error or other type
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message || 'An internal server error occurred during hashing.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
