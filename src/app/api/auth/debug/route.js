import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    return NextResponse.json({
      authenticated: !!token,
      token: token ? {
        name: token.name,
        email: token.email,
        role: token.role,
        uid: token.uid,
      } : null
    });
  } catch (error) {
    console.error("Auth debug error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
} 