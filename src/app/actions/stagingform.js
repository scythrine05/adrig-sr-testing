"use server";
import prisma from "../../lib/prisma";

export async function postStagingFormData(formData, userId) {
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
    select: {
      requestId: true,
      userId: true,
    },
  });

  return res;
}

export async function postStagingManagerFormData(formData, userId) {
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
    select: {
      requestId: true,
      managerId: true,
    },
  });

  return res;
}

export async function updateStagingFormData(formData, requestId) {
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

  return res;
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
  const res = await prisma.StagingRequests.findMany({
    where: { selectedDepartment: dept },
  });
  return res;
}

export async function getStagingFormDataAll() {
  const res = await prisma.StagingRequests.findMany();
  return { requestData: res };
}
