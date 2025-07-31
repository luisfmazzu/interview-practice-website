import { NextRequest, NextResponse } from 'next/server';

// Hardcoded users as per PRD
const VALID_USERS = [
  { username: 'luis', password: 'cadeado' },
  { username: 'henrique', password: 'tartaruga' },
  { username: 'erick', password: 'ericklindo' }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check credentials against hardcoded users
    const user = VALID_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Return success with user info (no actual token needed for client-side auth)
    return NextResponse.json({
      success: true,
      user: username,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}