"use server";

import prisma from "../../lib/prisma";

export async function postDataOptimised(request, action, remarks) {
  const res = await prisma.sanctiontable.create({
    data: {
      requestId: request.requestId,
      date: request.date,
      selectedDepartment: request.selectedDepartment,
      selectedSection: request.selectedSection,
      stationID: request.stationID,
      missionBlock: request.missionBlock,
      workType: request.workType,
      workDescription: request.workDescription,
      selectedLine: request.selectedLine,
      cautionRequired: request.cautionRequired,
      cautionSpeed: request.cautionSpeed,
      cautionLocationFrom: request.cautionLocationFrom,
      cautionLocationTo: request.cautionLocationTo,
      workLocationFrom: request.workLocationFrom,
      workLocationTo: request.workLocationTo,
      demandTimeFrom: request.demandTimeFrom,
      demandTimeTo: request.demandTimeTo,
      sigDisconnection: request.sigDisconnection,
      ohDisconnection: request.ohDisconnection,
      elementarySectionFrom: request.elementarySectionFrom,
      elementarySectionTo: request.elementarySectionTo,
      otherLinesAffected: request.otherLinesAffected,
      userId: request.userId,
      action,
      remarks,
    },
  });

  return { result: res };
}

export async function getDataOptimised() {
  const res = await prisma.sanctiontable.findMany({});
  return { result: res };
}

export async function currentOptimizedData(id) {
  const res = await prisma.sanctiontable.findMany({ where: { userId: id } });
}

export async function checkOptimizedData(requestId) {
  const res = await prisma.sanctiontable.findMany({ where: { requestId } });

  if (res.length == 0) {
    return null;
  } else {
    return res;
  }
}
