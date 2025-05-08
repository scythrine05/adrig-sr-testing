"use server";
import prisma from "../../lib/prisma";

// Function to post admin form data directly to the sanction table
export async function postAdminFormData(formData, adminId) {
  try {
    // Generate a unique requestId for admin submissions
    const currentDate = new Date();
    const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const adminRequestId = `${dateString}-${randomPart}`;

    const res = await prisma.sanctiontable.create({
      data: {
        requestId: adminRequestId,
        date: formData.date,
        selectedDepartment: formData.selectedDepartment,
        selectedSection: formData.selectedSection,
        stationID: formData.stationID,
        missionBlock: formData.missionBlock,
        workType: formData.workType,
        workDescription: formData.workDescription,
        selectedLine: JSON.stringify(formData.selectedLine),
        selectedStream: formData.selectedStream,
        cautionRequired: formData.cautionRequired,
        cautionSpeed: formData.cautionSpeed,
        cautionLocationFrom: formData.cautionLocationFrom,
        cautionLocationTo: formData.cautionLocationTo,
        adjacentLinesAffected: formData.adjacentLinesAffected,
        workLocationFrom: formData.workLocationFrom,
        workLocationTo: formData.workLocationTo,
        demandTimeFrom: formData.demandTimeFrom,
        demandTimeTo: formData.demandTimeTo,
        sigDisconnection: formData.sigDisconnection,
        oheDisconnection: formData.ohDisconnection,
        elementarySectionFrom: formData.elementarySectionFrom,
        elementarySectionTo: formData.elementarySectionTo,
        sigElementarySectionFrom: formData.sigElementarySectionFrom,
        sigElementarySectionTo: formData.sigElementarySectionTo,
        repercussions: formData.repercussions,
        otherLinesAffected: JSON.stringify(formData.otherLinesAffected),
        requestremarks: formData.requestremarks,
        selectedDepo: formData.selectedDepo,
        // Set the admin as the creator
        userId: adminId,
        // Set status as approved since it's coming from admin
        status: "in progress",
        // Set action to approved since it's directly going to sanction table
        action: "approved",
      },
      select: {
        requestId: true,
        userId: true,
      },
    });

    return res;
  } catch (error) {
    console.error("Error creating admin form:", error);
    throw new Error("Failed to create admin form");
  }
}

// Function to get all admin-created forms
export async function getAdminForms() {
  try {
    const res = await prisma.sanctiontable.findMany({
      where: {
        action: "approved",
      },
    });
    return res;
  } catch (error) {
    console.error("Error fetching admin forms:", error);
    throw new Error("Failed to fetch admin forms");
  }
} 