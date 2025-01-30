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

// to be reviewed ---------------------------------------------------------------------------------------------------------


// For RequestForm and ManagerForm---------------------------------------------------------

import validateForm from "../components/custom/blockrequest/formValidation";
import { useState } from "react";


export const useFormState = () =>{
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
}


export const handleKeyDown = (e, index) => {
  const { key, target } = e;
  const isDropdown = target.tagName === "SELECT";

  if (isDropdown) {
    if (key === "ArrowUp" || key === "ArrowDown") {
      return; // Let dropdown navigation work normally
    }
  }

  // Move focus between input fields & dropdowns
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
  console.log(validateForm(value));
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

