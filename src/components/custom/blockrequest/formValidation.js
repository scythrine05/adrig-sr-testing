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

  if (!values.stationID) {
    errors.stationID = "Station ID is required";
  }

  if (!values.missionBlock) {
    errors.missionBlock = "Mission Block is required";
  }

  if (!values.workType) {
    errors.workType = "Work Type is required";
  }

  if (!values.workDescription) {
    errors.workDescription = "Work Description is required";
  }

  if (!values.selectedLine) {
    errors.selectedLine = "Selected Line is required";
  }

  if (values.cautionRequired === "") {
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

  if (!values.workLocationFrom) {
    errors.workLocationFrom = "Work Location From is required";
  }

  if (!values.workLocationTo) {
    errors.workLocationTo = "Work Location To is required";
  }

  if (!values.demandTimeFrom) {
    errors.demandTimeFrom = "Demand Time From is required";
  }

  if (!values.demandTimeTo) {
    errors.demandTimeTo = "Demand Time To is required";
  }

  if (values.sigDisconnection === "") {
    errors.sigDisconnection = "Signal Disconnection is required";
  }

  if (values.ohDisconnection === "") {
    errors.ohDisconnection = "O/H Disconnection is required";
  }

  if (!values.elementarySectionFrom) {
    errors.elementarySectionFrom = "Elementary Section From is required";
  }

  if (!values.elementarySectionTo) {
    errors.elementarySectionTo = "Elementary Section To is required";
  }

  if (!values.sigElementarySectionFrom) {
    errors.sigElementarySectionFrom = "Elementary Section From is required";
  }

  if (!values.sigElementarySectionTo) {
    errors.sigElementarySectionTo = "Elementary Section To is required";
  }

  if (!values.repercussions) {
    errors.repercussions = "repercussions are required";
  }

  if (!values.otherLinesAffected) {
    errors.otherLinesAffected = "Other Lines Affected is required";
  }

  return errors;
}
