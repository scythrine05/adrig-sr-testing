import { getUser } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getUser();
  
  if (!session) {
    return NextResponse.json({ 
      authenticated: false,
      user: null 
    });
  }
  
  return NextResponse.json({ 
    authenticated: true,
    user: session.user 
  });
} 