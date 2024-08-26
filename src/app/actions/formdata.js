"use server";
import prisma from "../../lib/prisma";

export async function postFormData(formData, userId) {
  const res = await prisma.requests.create({
    data: {
      date: formData.date,
      selectedDepartment: formData.selectedDepartment,
      selectedSection: formData.selectedSection,
      stationID: formData.stationID,
      missionBlock: formData.missionBlock,
      workType: formData.workType,
      workDescription: formData.workDescription,
      selectedLine: formData.selectedLine,
      cautionRequired: formData.cautionRequired,
      cautionSpeed: formData.cautionSpeed,
      cautionLocationFrom: formData.cautionLocationFrom,
      cautionLocationTo: formData.cautionLocationTo,
      workLocationFrom: formData.workLocationFrom,
      workLocationTo: formData.workLocationTo,
      demandTimeFrom: formData.demandTimeFrom,
      demandTimeTo: formData.demandTimeTo,
      sigDisconnection: formData.sigDisconnection,
      ohDisconnection: formData.ohDisconnection,
      elementarySectionFrom: formData.elementarySectionFrom,
      elementarySectionTo: formData.elementarySectionTo,
      otherLinesAffected: formData.otherLinesAffected,
      userId: userId,
    },
    select: {
      requestId: true,
      userId: true,
    },
  });

  return res;
}

export async function getFormData(id) {
  const res = await prisma.requests.findMany({ where: { userId: id } });
  return { requestData: res };
}

export async function getFormDataAll() {
  const res = await prisma.requests.findMany();
  return { requestData: res };
}

export async function getAdminFormData(
  selectedSection,
  selectedLine,
  dateRange
) {
  try {
    const filters = {};
    if (selectedSection) {
      filters.stationID = selectedSection;
    }
    if (selectedLine) {
      filters.selectedLine = selectedLine;
    }
    if (dateRange?.from && dateRange?.to) {
      filters.date = {
        gte: new Date(dateRange.from),
        lte: new Date(dateRange.to),
      };
    }
    const requestData = await prisma.requests.findMany({
      where: filters,
    });
    console.log(requestData);
    console.log("ediuwiudhwiuhn");
    return { res: requestData };
  } catch (e) {
    return { error: "failed" };
  }
}
