import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request) {
  try {
    // Get the manager email from the query parameters
    const { searchParams } = new URL(request.url);
    const managerEmail = searchParams.get('email');
    
    if (!managerEmail) {
      return NextResponse.json(
        { error: "Manager email is required" },
        { status: 400 }
      );
    }
    
    // Get the manager
    const manager = await prisma.manager.findUnique({
      where: { email: managerEmail },
      select: {
        id: true,
        name: true,
        department: true
      }
    });
    
    if (!manager) {
      return NextResponse.json(
        { error: "Manager not found" },
        { status: 404 }
      );
    }
    
    // Get users in the same department
    const users = await prisma.user.findMany({
      where: { department: manager.department },
      select: {
        id: true,
        name: true,
        department: true,
        depot: true
      }
    });
    
    // Get staging requests for this manager
    const stagingRequests = await prisma.stagingRequests.findMany({
      where: {
        OR: [
          { managerId: manager.id },
          { 
            userId: { 
              in: users.map(user => user.id) 
            } 
          }
        ]
      },
      select: {
        requestId: true,
        selectedDepartment: true,
        userId: true,
        managerId: true,
        selectedDepo: true,
        createdAt: true
      }
    });
    
    // Get requests for this manager
    const requests = await prisma.requests.findMany({
      where: {
        OR: [
          { managerId: manager.id },
          { 
            userId: { 
              in: users.map(user => user.id) 
            } 
          }
        ]
      },
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
      manager,
      users: {
        count: users.length,
        data: users
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
    console.error("Error fetching manager-user relationship:", error);
    return NextResponse.json(
      { error: "Failed to fetch manager-user relationship" },
      { status: 500 }
    );
  }
} 