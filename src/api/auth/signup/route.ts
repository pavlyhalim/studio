
import { NextResponse } from 'next/server';
import { mockUsersDb, createSampleUser, type User } from '@/lib/sample-data'; // Use mock DB and create helper

// IMPORTANT: This simulates a basic signup flow. Real apps need robust security.

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // --- Simulate Database Check ---
    const lowerCaseEmail = email.toLowerCase();
    if (mockUsersDb.has(lowerCaseEmail)) {
      console.log(`Signup attempt failed: Email ${lowerCaseEmail} already registered.`);
      return NextResponse.json({ message: 'Email address is already registered' }, { status: 409 }); // 409 Conflict
    }
    // ---------------------------------

    // --- Simulate User Creation ---
    // IMPORTANT: Real apps MUST hash passwords securely using bcrypt.
    // Use the helper to create a user object with a simulated hash
    const newUserObject = createSampleUser({ name, email: lowerCaseEmail, passwordPlain: password, role: 'student' }); // Default role

    // Add to mock DB
    mockUsersDb.set(lowerCaseEmail, newUserObject);
    console.log("Mock DB Updated (Signup):", { id: newUserObject.id, email: newUserObject.email, name: newUserObject.name, role: newUserObject.role }); // Don't log password/hash
    // -----------------------------

    // --- Simulate Session/Token Generation ---
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
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
