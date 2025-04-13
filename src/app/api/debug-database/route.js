import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        department: true,
        depot: true
      }
    });

    // Get all managers
    const managers = await prisma.manager.findMany({
      select: {
        id: true,
        name: true,
        department: true
      }
    });

    // Get all staging requests
    const stagingRequests = await prisma.stagingRequests.findMany({
      select: {
        requestId: true,
        selectedDepartment: true,
        userId: true,
        managerId: true,
        selectedDepo: true,
        createdAt: true
      }
    });

    // Get all requests
    const requests = await prisma.requests.findMany({
      select: {
        requestId: true,
        selectedDepartment: true,
        userId: true,
        managerId: true,
        selectedDepo: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      users: {
        count: users.length,
        data: users
      },
      managers: {
        count: managers.length,
        data: managers
      },
      stagingRequests: {
        count: stagingRequests.length,
        data: stagingRequests
      },
      requests: {
        count: requests.length,
        data: requests
      }
    });
  } catch (error) {
    console.error("Error fetching database data:", error);
    return NextResponse.json(
      { error: "Failed to fetch database data" },
      { status: 500 }
    );
  }
} 