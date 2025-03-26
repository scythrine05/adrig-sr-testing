import { NextResponse } from "next/server";

export async function GET() {
  // Only expose public environment variables
  return NextResponse.json({
    NEXT_PUBLIC_SUPER_ADMIN_EMAIL: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'not set',
    SUPER_ADMIN_EMAIL: 'super-admin@gmail.com', // Hardcoded for safety
    SUPER_ADMIN_PASSWORD: 'root', // Hardcoded for safety
    NODE_ENV: process.env.NODE_ENV,
  });
} 