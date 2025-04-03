"use server";

import prisma from "../../lib/prisma";

export async function getOtherRequests(department, depo) {
  try {
    console.log(`Fetching other requests for department: ${department}, depo: ${depo}`);
    
    let whereCondition = {
      selectedDepo: depo
    };

    // For ENGG users, only show their own requests
    if (department === "ENGG") {
      whereCondition = {
        AND: [
          { selectedDepartment: "ENGG" },
          { selectedDepo: depo }
        ]
      };
    }

    console.log("Query condition:", JSON.stringify(whereCondition, null, 2));

    try {
      // Get all requests matching the conditions
      const requests = await prisma.requests.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`Found ${requests.length} requests`);
      
      // Log each request for debugging
      requests.forEach((req, index) => {
        console.log(`Request ${index + 1}:`, {
          requestId: req.requestId,
          department: req.selectedDepartment,
          depo: req.selectedDepo,
          sigDisconnection: req.sigDisconnection,
          oheDisconnection: req.oheDisconnection,
          ohDisconnection: req.ohDisconnection,
          sigActionsNeeded: req.sigActionsNeeded,
          trdActionsNeeded: req.trdActionsNeeded,
          managerId: req.managerId
        });
      });

      return requests;
    } catch (prismaError) {
      console.error("Prisma error details:", {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta
      });
      throw prismaError;
    }
  } catch (error) {
    console.error("Error fetching other requests:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    throw error;
  }
}

export async function updateSigResponse(requestId, sigResponse) {
  try {
    console.log(`Updating SIG response for request ${requestId} to ${sigResponse}`);
    
    const updatedRequest = await prisma.requests.update({
      where: {
        requestId: requestId,
      },
      data: {
        sigResponse: sigResponse,
        sigActionsNeeded: "no"
      },
    });

    console.log("Updated request:", updatedRequest);
    return updatedRequest;
  } catch (error) {
    console.error("Error updating SIG response:", error);
    throw new Error("Failed to update SIG response");
  }
}

export async function updateOheResponse(requestId, oheResponse) {
  try {
    console.log(`Updating OHE response for request ${requestId} to ${oheResponse}`);
    
    const updatedRequest = await prisma.requests.update({
      where: {
        requestId: requestId,
      },
      data: {
        oheResponse: oheResponse,
        trdActionsNeeded: "no"
      },
    });

    console.log("Updated request:", updatedRequest);
    return updatedRequest;
  } catch (error) {
    console.error("Error updating OHE response:", error);
    throw new Error("Failed to update OHE response");
  }
} 