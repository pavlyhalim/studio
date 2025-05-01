
import { NextResponse } from 'next/server';
import { initialSampleUsers } from '@/lib/sample-data'; // Use initial data for simulation

// --- Mock Users (Replace with actual DB in real backend) ---
const mockUsersDb = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: 'student' | 'professor' | 'admin' | null }>();
initialSampleUsers.forEach(u => {
    mockUsersDb.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email,
        // Simulate storing the password the login route expects
        passwordHash: `${u.id}_password`,
        role: u.role,
    });
});
// ------------------------------------------------------------


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
    // Compare the provided password with the stored simulated password ('passwordHash' field)
    const simulatedPasswordMatches = password === existingUser.passwordHash;

    if (!simulatedPasswordMatches) {
        console.log(`Login attempt failed: Password mismatch for user ${existingUser.email}`);
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    // ---------------------------------

    // --- Simulate Session/Token Generation ---
    // IMPORTANT: Real apps need secure JWT or session management.
    const token = `simulated-token-for-${existingUser.id}-${Date.now()}`;
    // -----------------------------------------

    // Return token and basic user info (exclude password hash)
    const userResponse = {
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
