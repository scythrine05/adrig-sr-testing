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

export const formatData = async (requestData) => {
  const newRequests = [];
  for (const request of requestData) {
    const selectedLineData = request.selectedLine;

    // If selectedLine is not in the expected format, create a single request
    if (
      !selectedLineData ||
      (!selectedLineData.station && !selectedLineData.yard)
    ) {
      newRequests.push({
        ...request,
        selectedLine: request.selectedLine || "Not Specified",
        selectedStream: "Not Applicable",
        missionBlock: request.missionBlock || "Not Specified",
        otherLinesAffected: request.otherLinesAffected || "None",
      });
      continue;
    }

    let subRequestCounter = 0;

    // Process station data if it exists
    if (selectedLineData.station && Array.isArray(selectedLineData.station)) {
      for (const station of selectedLineData.station) {
        const subRequest = { ...request };

        subRequest.requestId = `${request.requestId}-${subRequestCounter++}`;
        subRequest.selectedLine = station && station.split(":")[1];
        subRequest.selectedStream = "Not Applicable";
        subRequest.missionBlock = station && station.split(":")[0];

        const otherLines = request.otherLinesAffected?.station?.map((e) => {
          const key = e?.split(":")[0];
          if (key == subRequest.missionBlock) {
            return e?.split(":")[1];
          }
        });

        subRequest.otherLinesAffected =
          otherLines != undefined ? otherLines.join(", ") : otherLines;
        newRequests.push(subRequest);
      }
    }

    // Process yard data if it exists
    if (selectedLineData.yard && Array.isArray(selectedLineData.yard)) {
      for (const yard of selectedLineData.yard) {
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
      }
    }
  }

  const updatedData = [...newRequests];
  return updatedData;
};

import validateForm from "../components/custom/blockrequest/formValidation";
import { useState } from "react";

export const useFormState = () => {
  const [formData, setFormData] = useState({
    date: "",
    selectedDepartment: "",
    selectedSection: "",
    stationID: "",
    workType: "",
    workDescription: "",
    selectedLine: {
      station: [],
      yard: [],
    },
    selectedStream: "",
    missionBlock: "",
    cautionRequired: "",
    cautionSpeed: "",
    cautionLocationFrom: "",
    cautionLocationTo: "",
    workLocationFrom: "",
    workLocationTo: "",
    demandTimeFrom: "",
    demandTimeTo: "",
    sigDisconnection: "",
    ohDisconnection: "",
    elementarySectionFrom: "",
    elementarySectionTo: "",
    sigElementarySectionFrom: "",
    sigElementarySectionTo: "",
    repercussions: "",
    otherLinesAffected: {
      station: [],
      yard: [],
    },
    requestremarks: "",
    selectedDepo: "",
  });
  return [formData, setFormData];
};

export const handleKeyDown = (e, index) => {
  const { key, target } = e;
  const isDropdown = target.tagName === "SELECT";

  if (isDropdown) {
    if (key === "ArrowUp" || key === "ArrowDown") {
      return;
    }
  }

  if (key === "ArrowRight" || key === "ArrowLeft") {
    e.preventDefault();
    const nextIndex = index + (key === "ArrowRight" ? 1 : -1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  }
};

export const formValidation = (value) => {
  let res = validateForm(value);
  if (
    res.date ||
    res.selectedDepartment ||
    res.stationID ||
    res.workType ||
    res.workDescription ||
    res.selectedLine ||
    res.missionBlock ||
    res.demandTimeFrom ||
    res.demandTimeTo ||
    res.sigDisconnection ||
    res.ohDisconnection ||
    res.cautionRequired ||
    res.cautionLocationFrom ||
    res.cautionLocationTo ||
    res.cautionSpeed ||
    res.elementarySectionFrom ||
    res.elementarySectionTo ||
    res.sigElementarySectionFrom ||
    res.selectedDepo ||
    (value.selectedDepartment === "ENGG" &&
      value.sigDisconnection === "Yes" &&
      res.sigElementarySectionTo)
  ) {
    return false;
  } else {
    return true;
  }
};

export function revertCategoryFormat(formattedCategory) {
  if (formattedCategory === "Gear") {
    return formattedCategory;
  }
  return formattedCategory.split(" ").join("_");
}

export const handleMoveToNext = (index) => (e) => {
  if (e.target.value.length > 0 && inputRefs.current[index + 1]) {
    inputRefs.current[index + 1].focus();
  }
};

//------------------------------------------------------------------------------------------

// SignIn and SignUp
// fn list -> handleVerifyOtp, formatTime

export const handleVerifyOtp = async () => {
  const res = await verifyHandler(formValues.username, otp, code);
  if (res.success != true) {
    return false;
  } else {
    return true;
  }
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// ----------------------------------------------------------------------------------------------------------

export const formatVisualizationData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    // Ensure date is in correct format
    const date = new Date(item.date).toISOString().split("T")[0];

    // Format time strings to ensure they are in HH:mm format
    const formatTime = (timeStr) => {
      if (!timeStr) return "00:00";
      // If time is in 12-hour format, convert to 24-hour
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      if (modifier) {
        if (modifier.toLowerCase() === "pm" && hours < 12) {
          hours = parseInt(hours) + 12;
        }
        if (modifier.toLowerCase() === "am" && hours === "12") {
          hours = "00";
        }
      }

      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    };

    return {
      ...item,
      date,
      demandTimeFrom: formatTime(item.demandTimeFrom),
      demandTimeTo: formatTime(item.demandTimeTo),
    };
  });
};

//RequestId Generator

export const generateRequestId = ({
  date,
  division,
  department,
  section,
  sequence,
}) => {
  if (!date || !division || !department || !section || sequence == null) {
    throw new Error(
      "All parameters (date, division, department, section, sequence) are required."
    );
  }

  const departmentAbbreviation = {
    ENGG: "C",
    TRD: "E",
    SIG: "S",
  };

  const departmentCode = departmentAbbreviation[department] || department;

  // Format the sequence to always be 4 digits (e.g., 0001, 0002)
  const formattedSequence = sequence.toString().padStart(4, "0");

  // Combine the parts into the desired format
  return `${date}/${division}/${departmentCode}/${section}/${formattedSequence}`;
};
