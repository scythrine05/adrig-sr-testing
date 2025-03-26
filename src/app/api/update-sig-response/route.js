import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const { requestId, sigResponse } = await request.json();

    // Update the request with the SIG response
    const updatedRequest = await prisma.requests.update({
      where: {
        requestId: requestId,
      },
      data: {
        sigResponse: sigResponse,
        sigActionsNeeded: "no"  // Set sigActionsNeeded to "no" when response is provided
      },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating SIG response:", error);
    return NextResponse.json(
      { error: "Failed to update SIG response" },
      { status: 500 }
    );
  }
} 