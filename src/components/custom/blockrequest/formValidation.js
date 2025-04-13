export default function validateForm(values) {
  const errors = {};

  if (!values.date) {
    errors.date = "Date is required";
  }

  if (!values.selectedDepartment) {
    errors.selectedDepartment = "Department is required";
  }

  if (!values.selectedSection) {
    errors.selectedSection = "Section is required";
  }

  if(!values.selectedDepo || values.selectedDepo === "Select Depot/SSE") {
    errors.selectedDepo = "Depot is required";
  }

  if (!values.stationID) {
    errors.stationID = "Station ID is required";
  }

  if (!values.missionBlock) {
    errors.missionBlock = "Block Section/Yard is required";
  }

  if (!values.workType || values.workType === "") {
    errors.workType = "Work Type is required";
  }

  if (!values.workDescription) {
    errors.workDescription = "Work Description is required";
  }

  if (!values.selectedLine) {
    errors.selectedLine = "Selected Line is required";
  }

  if (values.cautionRequired === "" && values.selectedDepartment != "TRD") {
    errors.cautionRequired = "Caution Required is required";
  } else if (values.cautionRequired === "Yes") {
    if (!values.cautionSpeed || isNaN(values.cautionSpeed)) {
      errors.cautionSpeed = "Valid Caution Speed is required";
    }

    if (!values.cautionLocationFrom) {
      errors.cautionLocationFrom = "Caution Location From is required";
    }

    if (!values.cautionLocationTo) {
      errors.cautionLocationTo = "Caution Location To is required";
    }
  }

  if (!values.workLocationFrom && values.selectedDepartment != "TRD") {
    errors.workLocationFrom = "Work Location From is required";
  }

  if (!values.workLocationTo && values.selectedDepartment != "TRD") {
    errors.workLocationTo = "Work Location To is required";
  }

  if (!values.demandTimeFrom) {
    errors.demandTimeFrom = "Demand Time From is required";
  }

  if (!values.demandTimeTo) {
    errors.demandTimeTo = "Demand Time To is required";
  }

  if (values.sigDisconnection === "" && values.selectedDepartment != "TRD") {
    errors.sigDisconnection = "Signal Disconnection is required";
  } else if (values.sigDisconnection === "Yes") {
    if (!values.sigElementarySectionFrom) {
      errors.sigElementarySectionFrom = "Elementary Section From is required";
    }

    if (!values.sigElementarySectionTo) {
      errors.sigElementarySectionTo = "Elementary Section To is required";
    }
  }

  if (values.ohDisconnection === "" && values.selectedDepartment != "TRD") {
    errors.ohDisconnection = "O/H Disconnection is required";
  } else if (values.ohDisconnection === "Yes") {
    if (!values.elementarySectionFrom) {
      errors.elementarySectionFrom = "Elementary Section From is required";
    }

    if (!values.elementarySectionTo) {
      errors.elementarySectionTo = "Elementary Section To is required";
    }
  }

  if (!values.repercussions) {
    errors.repercussions = "repercussions are required";
  }

  if (!values.otherLinesAffected) {
    errors.otherLinesAffected = "Other Lines Affected is required";
  }

  return errors;
}
