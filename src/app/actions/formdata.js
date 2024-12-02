"use server";
import prisma from "../../lib/prisma";

export async function postFormData(formData) {
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
      ohDisconnection: formData.ohDisconnection,
      elementarySectionFrom: formData.elementarySectionFrom,
      elementarySectionTo: formData.elementarySectionTo,
      sigElementarySectionFrom: formData.sigElementarySectionFrom,
      sigElementarySectionTo: formData.sigElementarySectionTo,
      repercussions: formData.repercussions,
      otherLinesAffected: formData.otherLinesAffected,
      requestremarks: formData.requestremarks,
      userId: formData.userId,
    },
    select: {
      requestId: true,
      userId: true,
    },
  });

  return res;
}

export async function postFormManagerData(formData) {
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
      ohDisconnection: formData.ohDisconnection,
      elementarySectionFrom: formData.elementarySectionFrom,
      elementarySectionTo: formData.elementarySectionTo,
      sigElementarySectionFrom: formData.sigElementarySectionFrom,
      sigElementarySectionTo: formData.sigElementarySectionTo,
      repercussions: formData.repercussions,
      otherLinesAffected: formData.otherLinesAffected,
      requestremarks: formData.requestremarks,
      managerId: formData.managerId,
    },
    select: {
      requestId: true,
      managerId: true,
    },
  });

  return res;
}

export async function updateFormData(formData, requestId) {
  const res = await prisma.requests.update({
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
      ohDisconnection: formData.ohDisconnection,
      elementarySectionFrom: formData.elementarySectionFrom,
      elementarySectionTo: formData.elementarySectionTo,
      sigElementarySectionFrom: formData.sigElementarySectionFrom,
      sigElementarySectionTo: formData.sigElementarySectionTo,
      repercussions: formData.repercussions,
      otherLinesAffected: formData.otherLinesAffected,
      requestremarks: formData.requestremarks,
    },
  });

  return res;
}

export async function getFormData(id) {
  const res = await prisma.requests.findMany({ where: { userId: id } });
  return { requestData: res };
}

export async function getFormDataByRequestId(id) {
  const res = await prisma.requests.findMany({ where: { requestId: id } });
  return { requestData: res };
}

export async function getFormDataByDepartment(dept) {
  const res = await prisma.requests.findMany({
    where: { selectedDepartment: dept },
  });
  return res;
}

export async function getFormDataAll() {
  const res = await prisma.requests.findMany();
  return { requestData: res };
}

export async function getAdminFormData(
  selectedSection,
  searchDepartment,
  dateRange
) {
  try {
    const filters = {};
    if (selectedSection) {
      filters.stationID = selectedSection;
    }
    if (searchDepartment) {
      filters.selectedDepartment = searchDepartment;
    }
    if (dateRange?.from && dateRange?.to) {
      filters.date = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }
    const requestData = await prisma.requests.findMany({
      where: filters,
    });

    return { res: requestData };
  } catch (e) {
    console.log(e);
    return { error: "failed" };
  }
}
