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
    //Create the staging request
    const res = await prisma.StagingRequests.create({
      data: {
        requestId: formData.requestId,
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
        corridorType: formData.corridorType,
        sigDisconnectionRequirements: formData.sigDisconnectionRequirements,
        trdDisconnectionRequirements: formData.trdDisconnectionRequirements,
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
        corridorType: formData.corridorType,
        sigDisconnectionRequirements: formData.sigDisconnectionRequirements,
        trdDisconnectionRequirements: formData.trdDisconnectionRequirements,
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
        corridorType: formData.corridorType,
        ManagerResponse: formData.ManagerResponse,
        sigDisconnectionRequirements: formData.sigDisconnectionRequirements,
        trdDisconnectionRequirements: formData.trdDisconnectionRequirements,
      },
    });

    console.log("Updated staging request:", res);
    return res;
  } catch (error) {
    console.error("Error updating staging request:", error);
    throw new Error("Failed to update staging request");
  }
}

export async function getStagingFormData(id, includeArchived = false) {
  const whereClause = { userId: id };

  // By default, exclude archived requests
  if (!includeArchived) {
    whereClause.archived = false;
  }

  const res = await prisma.StagingRequests.findMany({ where: whereClause });
  return { requestData: res };
}

export async function getStagingFormDataByRequestId(
  id,
  includeArchived = false
) {
  const whereClause = { requestId: id };

  // By default, exclude archived requests
  if (!includeArchived) {
    whereClause.archived = false;
  }

  const res = await prisma.StagingRequests.findMany({
    where: whereClause,
  });
  return { requestData: res };
}

export async function deleteStagingFormData(id) {
  // Instead of deleting, update the request with an 'archived' flag
  const res = await prisma.StagingRequests.update({
    where: { requestId: id },
    data: { archived: true },
  });
  return { requestData: res };
}

export async function getStagingFormDataByDepartment(
  dept,
  includeArchived = false
) {
  const whereClause = {
    selectedDepartment: dept,
  };

  // By default, exclude archived requests unless specifically requested
  if (!includeArchived) {
    whereClause.archived = false;
  }

  const res = await prisma.StagingRequests.findMany({
    where: whereClause,
  });

  return res;
}

export async function getStagingFormDataAll(includeArchived = false) {
  const whereClause = {};

  // By default, exclude archived requests
  if (!includeArchived) {
    whereClause.archived = false;
  }

  const res = await prisma.StagingRequests.findMany({ where: whereClause });
  return { requestData: res };
}

//Request Count from StagingRequests table

export async function getRequestCount() {
  try {
    const count = await prisma.StagingRequests.count();
    return count;
  } catch (error) {
    console.error("Error fetching request count:", error);
    throw new Error("Failed to fetch request count");
  }
}
