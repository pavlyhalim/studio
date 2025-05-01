import { NextResponse } from 'next/server';
import { initialSampleUsers } from '@/lib/sample-data'; // Use initial data for simulation

// --- Mock Users (Assume shared state or DB in real app) ---
// This map should ideally be shared or use a DB connection
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
      return NextResponse.json({ message: 'Email address is already registered' }, { status: 409 }); // 409 Conflict
    }
    // ---------------------------------

    // --- Simulate User Creation ---
    // IMPORTANT: Real apps MUST hash passwords securely using bcrypt.
    const simulatedPasswordHash = `hashed_${email}_${Date.now()}`;
    const newUser = {
        id: `user-${Date.now().toString().slice(-6)}`, // Simple unique ID for demo
        name: name,
        email: lowerCaseEmail,
        passwordHash: simulatedPasswordHash,
        role: 'student' as const, // Default role
    };
    mockUsersDb.set(lowerCaseEmail, newUser); // Add to mock DB
    console.log("Mock DB Updated (Signup):", newUser);
    // -----------------------------

    // --- Simulate Session/Token Generation ---
    // IMPORTANT: Real apps need secure JWT or session management.
    const token = `simulated-token-for-${newUser.id}-${Date.now()}`;
    // -----------------------------------------

    // Return token and basic user info (exclude password hash)
    const userResponse = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
    };

    // Simulate a short delay
    await new Promise(res => setTimeout(res, 500));

    return NextResponse.json({ token, user: userResponse }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
