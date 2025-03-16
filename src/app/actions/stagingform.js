"use server";
import prisma from "../../lib/prisma";

export async function postStagingFormData(formData, userId) {
  try {
    // Ensure both field names are set for compatibility
    if (formData.ohDisconnection) {
      formData.oheDisconnection = formData.ohDisconnection;
    } else if (formData.oheDisconnection) {
      formData.ohDisconnection = formData.oheDisconnection;
    }
    
    console.log("Creating staging request with userId:", userId);
    
    const res = await prisma.StagingRequests.create({
      data: {
        date: formData.date,
        selectedDepartment: formData.selectedDepartment,
        selectedSection: formData.selectedSection,
        stationID: formData.stationID,
        missionBlock: formData.missionBlock,
        workType: formData.workType,
        workDescription: formData.workDescription,
        selectedLine: formData.selectedLine,
        selectedStream: formData.selectedStream,
        cautionRequired: formData.cautionRequired,
        cautionSpeed: formData.cautionSpeed,
        cautionLocationFrom: formData.cautionLocationFrom,
        cautionLocationTo: formData.cautionLocationTo,
        workLocationFrom: formData.workLocationFrom,
        workLocationTo: formData.workLocationTo,
        demandTimeFrom: formData.demandTimeFrom,
        demandTimeTo: formData.demandTimeTo,
        sigDisconnection: formData.sigDisconnection,
        oheDisconnection: formData.oheDisconnection,
        ohDisconnection: formData.ohDisconnection,
        elementarySectionFrom: formData.elementarySectionFrom,
        elementarySectionTo: formData.elementarySectionTo,
        sigElementarySectionFrom: formData.sigElementarySectionFrom,
        sigElementarySectionTo: formData.sigElementarySectionTo,
        repercussions: formData.repercussions,
        otherLinesAffected: formData.otherLinesAffected,
        requestremarks: formData.requestremarks,
        selectedDepo: formData.selectedDepo,
        userId: userId,
      },
    });
    
    console.log("Created staging request:", res);
    return res;
  } catch (error) {
    console.error("Error creating staging request:", error);
    throw new Error("Failed to create staging request");
  }
}

export async function postStagingManagerFormData(formData, userId) {
  try {
    // Ensure both field names are set for compatibility
    if (formData.ohDisconnection) {
      formData.oheDisconnection = formData.ohDisconnection;
    } else if (formData.oheDisconnection) {
      formData.ohDisconnection = formData.oheDisconnection;
    }
    
    console.log("Creating manager staging request with managerId:", userId);
    
    const res = await prisma.StagingRequests.create({
      data: {
        date: formData.date,
        selectedDepartment: formData.selectedDepartment,
        selectedSection: formData.selectedSection,
        stationID: formData.stationID,
        missionBlock: formData.missionBlock,
        workType: formData.workType,
        workDescription: formData.workDescription,
        selectedLine: formData.selectedLine,
        selectedStream: formData.selectedStream,
        cautionRequired: formData.cautionRequired,
        cautionSpeed: formData.cautionSpeed,
        cautionLocationFrom: formData.cautionLocationFrom,
        cautionLocationTo: formData.cautionLocationTo,
        workLocationFrom: formData.workLocationFrom,
        workLocationTo: formData.workLocationTo,
        demandTimeFrom: formData.demandTimeFrom,
        demandTimeTo: formData.demandTimeTo,
        sigDisconnection: formData.sigDisconnection,
        oheDisconnection: formData.oheDisconnection,
        ohDisconnection: formData.ohDisconnection,
        elementarySectionFrom: formData.elementarySectionFrom,
        elementarySectionTo: formData.elementarySectionTo,
        sigElementarySectionFrom: formData.sigElementarySectionFrom,
        sigElementarySectionTo: formData.sigElementarySectionTo,
        repercussions: formData.repercussions,
        otherLinesAffected: formData.otherLinesAffected,
        requestremarks: formData.requestremarks,
        selectedDepo: formData.selectedDepo,
        managerId: userId,
      },
    });
    
    console.log("Created manager staging request:", res);
    return res;
  } catch (error) {
    console.error("Error creating manager staging request:", error);
    throw new Error("Failed to create manager staging request");
  }
}

export async function updateStagingFormData(formData, requestId) {
  try {
    // Ensure both field names are set for compatibility
    if (formData.ohDisconnection) {
      formData.oheDisconnection = formData.ohDisconnection;
    } else if (formData.oheDisconnection) {
      formData.ohDisconnection = formData.oheDisconnection;
    }
    
    const res = await prisma.StagingRequests.update({
      where: {
        requestId: requestId,
      },
      data: {
        date: formData.date,
        selectedDepartment: formData.selectedDepartment,
        selectedSection: formData.selectedSection,
        stationID: formData.stationID,
        missionBlock: formData.missionBlock,
        workType: formData.workType,
        workDescription: formData.workDescription,
        selectedLine: formData.selectedLine,
        selectedStream: formData.selectedStream,
        cautionRequired: formData.cautionRequired,
        cautionSpeed: formData.cautionSpeed,
        cautionLocationFrom: formData.cautionLocationFrom,
        cautionLocationTo: formData.cautionLocationTo,
        workLocationFrom: formData.workLocationFrom,
        workLocationTo: formData.workLocationTo,
        demandTimeFrom: formData.demandTimeFrom,
        demandTimeTo: formData.demandTimeTo,
        sigDisconnection: formData.sigDisconnection,
        oheDisconnection: formData.oheDisconnection,
        ohDisconnection: formData.ohDisconnection,
        elementarySectionFrom: formData.elementarySectionFrom,
        elementarySectionTo: formData.elementarySectionTo,
        sigElementarySectionFrom: formData.sigElementarySectionFrom,
        sigElementarySectionTo: formData.sigElementarySectionTo,
        repercussions: formData.repercussions,
        otherLinesAffected: formData.otherLinesAffected,
        requestremarks: formData.requestremarks,
        selectedDepo: formData.selectedDepo,
      },
    });
    
    console.log("Updated staging request:", res);
    return res;
  } catch (error) {
    console.error("Error updating staging request:", error);
    throw new Error("Failed to update staging request");
  }
}

export async function getStagingFormData(id) {
  const res = await prisma.StagingRequests.findMany({ where: { userId: id } });
  return { requestData: res };
}

export async function getStagingFormDataByRequestId(id) {
  const res = await prisma.StagingRequests.findMany({
    where: { requestId: id },
  });
  return { requestData: res };
}

export async function deleteStagingFormData(id) {
  const res = await prisma.StagingRequests.delete({
    where: { requestId: id },
  });
  return { requestData: res };
}

export async function getStagingFormDataByDepartment(dept) {
  try {
    console.log("Fetching staging requests for department:", dept);
    
    const res = await prisma.StagingRequests.findMany({
      where: { selectedDepartment: dept },
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
    
    console.log("Fetched staging requests for department:", dept, "Count:", res.length);
    
    // Log detailed information about each request
    res.forEach((request, index) => {
      console.log(`Request ${index + 1} (${request.requestId}):`, {
        userId: request.userId,
        managerId: request.managerId,
        department: request.selectedDepartment,
        depot: request.selectedDepo,
        date: request.date,
        createdAt: request.createdAt,
        user: request.User ? {
          id: request.User.id,
          name: request.User.name,
          department: request.User.department,
          depot: request.User.depot
        } : null,
        manager: request.Manager ? {
          id: request.Manager.id,
          name: request.Manager.name,
          department: request.Manager.department
        } : null
      });
    });
    
    return res;
  } catch (error) {
    console.error("Error fetching staging requests by department:", error);
    throw new Error("Failed to fetch staging requests by department");
  }
}

export async function getStagingFormDataAll() {
  const res = await prisma.StagingRequests.findMany();
  return { requestData: res };
}
