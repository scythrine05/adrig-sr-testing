import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const { department, depo } = await request.json();

    let whereCondition = {};

    if (department === "SIG") {
      // SIG users see ENGG requests with SIG disconnection from their depo
      whereCondition = {
        AND: [
          {
            selectedDepartment: "ENGG",
            selectedDepo: depo,
            managerId: { not: null }, // Approved by manager
            OR: [
              { sigDisconnection: "Yes" },
              { oheDisconnection: "Yes" },
              { ohDisconnection: "Yes" }
            ]
          }
        ]
      };
    } else if (department === "ENGG") {
      // ENGG users see their own requests with SIG disconnection
      whereCondition = {
        AND: [
          {
            selectedDepartment: "ENGG",
            selectedDepo: depo,
            managerId: { not: null }, // Approved by manager
            OR: [
              { sigDisconnection: "Yes" },
              { oheDisconnection: "Yes" },
              { ohDisconnection: "Yes" }
            ]
          }
        ]
      };
    } else {
      // Other departments see requests with SIG disconnection from their depo
      whereCondition = {
        AND: [
          {
            selectedDepo: depo,
            managerId: { not: null }, // Approved by manager
            OR: [
              { sigDisconnection: "Yes" },
              { oheDisconnection: "Yes" },
              { ohDisconnection: "Yes" }
            ]
          }
        ]
      };
    }

    const requests = await prisma.requests.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching other requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch other requests" },
      { status: 500 }
    );
  }
} 