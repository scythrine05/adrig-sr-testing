"use server";

import prisma from "../../lib/prisma";

export async function getOtherRequests(department, depo) {
  try {
    console.log(`Fetching other requests for department: ${department}, depo: ${depo}`);
    
    let whereCondition = {};

    if (department === "SIG") {
      // SIG users see requests with SIG disconnection from their depo
      whereCondition = {
        AND: [
          { selectedDepo: depo },
          {
            OR: [
              { sigDisconnection: { in: ["Yes", "yes"] } },
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    } else if (department === "TRD") {
      // TRD users see requests with OHE disconnection from their depo
      whereCondition = {
        AND: [
          { selectedDepo: depo },
          {
            OR: [
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    } else if (department === "ENGG") {
      // ENGG users see their own requests with SIG disconnection
      whereCondition = {
        AND: [
          { selectedDepartment: "ENGG" },
          { selectedDepo: depo },
          {
            OR: [
              { sigDisconnection: { in: ["Yes", "yes"] } },
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    } else {
      // Other departments see requests with SIG disconnection from their depo
      whereCondition = {
        AND: [
          { selectedDepo: depo },
          {
            OR: [
              { sigDisconnection: { in: ["Yes", "yes"] } },
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    }

    console.log("Query condition:", JSON.stringify(whereCondition, null, 2));

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
        managerId: req.managerId
      });
    });

    return requests;
  } catch (error) {
    console.error("Error fetching other requests:", error);
    throw new Error("Failed to fetch other requests");
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
      },
    });

    console.log("Updated request:", updatedRequest);
    return updatedRequest;
  } catch (error) {
    console.error("Error updating OHE response:", error);
    throw new Error("Failed to update OHE response");
  }
} 