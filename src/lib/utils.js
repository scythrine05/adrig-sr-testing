import { clsx } from "clsx";
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

    console.log(request);

    selectedLineData.station.forEach((station) => {
      const subRequest = { ...request };
      subRequest.requestId = `${request.requestId}-${subRequestCounter++}`;
      subRequest.selectedLine = station;
      subRequest.missionBlock = station.split(":")[0];
      newRequests.push(subRequest);
    });

    selectedLineData.yard.forEach((yard) => {
      const subRequest = { ...request };
      subRequest.missionBlock = yard.split(":")[0];
      subRequest.requestId = `${request.requestId}-${subRequestCounter++}`;
      subRequest.selectedLine = yard;
      newRequests.push(subRequest);
    });
  });

  const updatedData = [...newRequests];
  return updatedData;
};
