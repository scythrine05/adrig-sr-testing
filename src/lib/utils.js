import { clsx } from "clsx";
import { split } from "postcss/lib/list";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const weekday = date.toLocaleString("default", { weekday: "long" });

  return `${day} ${month} ${year} (${weekday})`;
}

export const formatData = (requestData) => {
  const newRequests = [];

  // Iterate over the existing data array
  requestData.forEach((request) => {
    const selectedLineData = request.selectedLine;

    let subRequestCounter = 0;

    selectedLineData.station.forEach((station) => {
      const subRequest = { ...request };
      subRequest.requestId = `${request.requestId}-${subRequestCounter++}`;
      subRequest.selectedLine = station;
      subRequest.selectedStream = "Not Applicable";
      subRequest.missionBlock = station.split(":")[0];

      const otherLines = request.otherLinesAffected?.station?.map((e) => {
        const key = e?.split(":")[0];
        if (key == subRequest.missionBlock) {
          return e?.split(":")[1];
        }
      });

      subRequest.otherLinesAffected =
        otherLines != undefined ? otherLines.join(", ") : otherLines;

      newRequests.push(subRequest);
    });

    selectedLineData.yard.forEach((yard) => {
      const subRequest = { ...request };
      subRequest.missionBlock = yard.split(":")[0];
      subRequest.requestId = `${request.requestId}-${subRequestCounter++}`;
      subRequest.selectedLine = yard;

      const otherLines = request.otherLinesAffected?.yard?.map((e) => {
        const key = e?.split(":")[0];
        if (key == subRequest.missionBlock) {
          return e?.split(":")[1];
        }
      });

      subRequest.otherLinesAffected =
        otherLines != undefined ? otherLines.join(", ") : otherLines;

      newRequests.push(subRequest);
    });
  });

  const updatedData = [...newRequests];
  return updatedData;
};
