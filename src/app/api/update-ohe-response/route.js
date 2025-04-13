import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const { requestId, oheResponse } = await request.json();

    // Update the request with the OHE response
    const updatedRequest = await prisma.requests.update({
      where: {
        requestId: requestId,
      },
      data: {
        oheResponse: oheResponse,
        trdActionsNeeded: "no"  // Changed from trdActions to trdActionsNeeded
      },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating OHE response:", error);
    return NextResponse.json(
      { error: "Failed to update OHE response" },
      { status: 500 }
    );
  }
} 