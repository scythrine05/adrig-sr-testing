"use server";

import prisma from "../../lib/prisma";

export async function getStagingRequests() {
  try {
    const stagingRequests = await prisma.stagingRequests.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: {
            name: true,
            username: true,
          },
        },
        Manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return stagingRequests;
  } catch (error) {
    console.error("Error fetching staging requests:", error);
    return [];
  }
}

export async function getRequests() {
  try {
    const requests = await prisma.requests.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: {
            name: true,
            username: true,
          },
        },
        Manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return requests;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}

export async function getSanctionedRequests() {
  try {
    const sanctionedRequests = await prisma.sanctiontable.findMany({
      orderBy: { date: 'desc' },
    });
    return sanctionedRequests;
  } catch (error) {
    console.error("Error fetching sanctioned requests:", error);
    return [];
  }
} 