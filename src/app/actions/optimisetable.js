"use server";

import prisma from "../../lib/prisma";
import { data } from "../../lib/store";

export async function postDataOptimisedFirst(request) {
  const res = await prisma.sanctiontable.create({
    data: {
      Optimisedtimefrom: request.Optimisedtimefrom,
      Optimisedtimeto: request.Optimisedtimeto,
      // optimization_details: request.optimization_details,
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
      sigElementarySectionFrom: request.sigElementarySectionFrom,
      sigElementarySectionTo: request.sigElementarySectionTo,
      repercussions: request.repercussions,
      otherLinesAffected: request.otherLinesAffected,
      requestremarks: request.requestremarks,
      userId: request.userId,
    },
  });

  return { result: res };
}

export async function postBulkOptimised(requestArray) {
  const filteredData = requestArray.map(
    ({ createdAt, duration, pushed, ...rest }) => rest
  );

  const updatedData = filteredData.map((item) => {
    const {
      // optimisation_details,
      optimisedTimeFrom,
      optimisedTimeTo,
      ...rest
    } = item;
    return {
      ...rest,
      // optimization_details: optimisation_details.join(" "),
      Optimisedtimefrom: optimisedTimeFrom,
      Optimisedtimeto: optimisedTimeTo,
    };
  });

  const res = await prisma.sanctiontable.createMany({
    data: [...updatedData],
  });
  return res;
}

export async function postDataOptimised(request, action, remarks) {
  const res = await prisma.sanctiontable.update({
    where: {
      requestId: request.requestId,
    },
    data: {
      action,
      remarks,
    },
  });

  return { result: res };
}

export async function updateOptimizedData(formData, requestId) {
  const res = await prisma.sanctiontable.update({
    where: {
      requestId: requestId,
    },
    data: {
      date: formData.date,
      Optimisedtimefrom: formData.Optimisedtimefrom,
      Optimisedtimeto: formData.Optimisedtimeto,
      action: formData.action,
      remarks: formData.remarks,
    },
  });
  return res;
}

export async function getDataOptimised() {
  const res = await prisma.sanctiontable.findMany({});
  return { result: res };
}

export async function updateFinalStatus(requestId) {
  const res = await prisma.sanctiontable.update({
    where: {
      requestId: requestId,
    },
    data: {
      final: "set",
    },
  });
  return res;
}

export async function currentOptimizedData(id) {
  const res = await prisma.sanctiontable.findMany({ where: { userId: id } });
  return res;
}

export async function currentApprovedData(id) {
  const res = await prisma.sanctiontable.findMany({ where: { userId: id } });
  let ans = 0;
  for (let i = 0; i < res.length; i++) {
    if (res[i].action != "none") {
      ans++;
    }
  }
  return ans;
}

export async function deleteOptimizedData(id) {
  const res = await prisma.sanctiontable.deleteMany({});
  return res;
}

export async function checkOptimizedData(requestId) {
  const res = await prisma.sanctiontable.findMany({ where: { requestId } });

  if (res.action == "none") {
    return null;
  } else {
    return res;
  }
}
