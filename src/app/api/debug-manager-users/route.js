import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Get all managers
    const managers = await prisma.user.findMany({
      where: {
        role: "MANAGER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        depot: true
      }
    });

    // For each manager, find users under them
    const managersWithUsers = await Promise.all(
      managers.map(async (manager) => {
        const users = await prisma.user.findMany({
          where: {
            department: manager.department,
            role: "USER"
          },
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            depot: true
          }
        });

        return {
          ...manager,
          users: users
        };
      })
    );

    return NextResponse.json({ 
      managersCount: managers.length,
      managers: managersWithUsers
    });
  } catch (error) {
    console.error("Error fetching manager-user relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch manager-user relationships" },
      { status: 500 }
    );
  }
} 