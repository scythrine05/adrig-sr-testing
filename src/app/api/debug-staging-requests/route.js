import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const stagingRequests = await prisma.StagingRequests.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            department: true,
            depot: true
          }
        },
        Manager: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      }
    });

    return NextResponse.json({ 
      count: stagingRequests.length,
      requests: stagingRequests.map(req => ({
        requestId: req.requestId,
        date: req.date,
        selectedDepartment: req.selectedDepartment,
        selectedDepo: req.selectedDepo,
        userId: req.userId,
        managerId: req.managerId,
        user: req.User,
        manager: req.Manager
      }))
    });
  } catch (error) {
    console.error("Error fetching staging requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch staging requests" },
      { status: 500 }
    );
  }
} 