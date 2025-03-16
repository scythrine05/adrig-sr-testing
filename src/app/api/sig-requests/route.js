import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const { depo } = await request.json();

    // Fetch requests that:
    // 1. Are from ENGG department
    // 2. Have sigDisconnection or oheDisconnection as "Yes"
    // 3. Match the user's depo
    // 4. Have been approved by manager
    const requests = await prisma.requests.findMany({
      where: {
        AND: [
          {
            selectedDepartment: "ENGG",
            selectedDepo: depo,
            managerId: { not: null }, // Approved by manager
            OR: [
              { sigDisconnection: "Yes" },
              { oheDisconnection: "Yes" }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching SIG requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch SIG requests" },
      { status: 500 }
    );
  }
} 