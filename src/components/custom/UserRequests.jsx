"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import { getFormData } from "../../app/actions/formdata";
import EditRequest from "../custom/EditRequest";
import currentUser, {
  getUserId,
  currentOptimizedValue,
  setOptimised,
} from "../../app/actions/user";
import { formatData } from "../../lib/utils";
import { getStagingFormData } from "../../app/actions/stagingform";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";

// Helper function to get week dates
const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate the date of Monday (start of week)
  const monday = new Date(now);
  monday.setDate(
    now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7
  );
  monday.setHours(0, 0, 0, 0);

  // Calculate the date of Sunday (end of week)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday,
    end: sunday,
    weekLabel: `Week ${
      weekOffset === 0
        ? "(Current)"
        : weekOffset > 0
        ? "+" + weekOffset
        : weekOffset
    }`,
  };
};

// Format date as YYYY-MM-DD
const formatDateToString = (date) => {
  return date.toISOString().split("T")[0];
};

// Add a new component for the disconnection details
const DisconnectionDetails = ({ request }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? "disconnection-popover" : undefined;

  const hasSigDisconnection = request.sigDisconnection === "Yes";
  const hasPowerBlockDisconnection =
    request.ohDisconnection === "Yes" || request.oheDisconnection === "Yes";
  const hasAnyDisconnection = hasSigDisconnection || hasPowerBlockDisconnection;

  if (!hasAnyDisconnection) {
    return <span>No Disconnections</span>;
  }

  // Set chip color based on status
  const getSigChipColor = () => {
    if (
      (String(request.ManagerResponse).toLowerCase() === "yes" ||
        request.ManagerResponse === true) &&
      request.sigDisconnection === "Yes"
    ) {
      return request.sigResponse ? "success" : "warning";
    } else if (
      String(request.ManagerResponse).toLowerCase() === "no" ||
      request.ManagerResponse === false
    ) {
      return "error";
    } else {
      return "default";
    }
  };

  const getPowerChipColor = () => {
    if (
      (String(request.ManagerResponse).toLowerCase() === "yes" ||
        request.ManagerResponse === true) &&
      (request.ohDisconnection === "Yes" || request.oheDisconnection === "Yes")
    ) {
      return request.oheResponse ? "success" : "warning";
    } else if (
      String(request.ManagerResponse).toLowerCase() === "no" ||
      request.ManagerResponse === false
    ) {
      return "error";
    } else {
      return "default";
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        {hasAnyDisconnection && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleClick}
            endIcon={
              popoverOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
            }
            color="primary"
          >
            Disconnections
          </Button>
        )}
        {hasSigDisconnection && (
          <Chip
            label="SIG"
            size="small"
            color={getSigChipColor()}
            variant="outlined"
          />
        )}
        {hasPowerBlockDisconnection && (
          <Chip
            label="Power Block"
            size="small"
            color={getPowerChipColor()}
            variant="outlined"
          />
        )}
      </div>

      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 500 }}>
          <h4 className="font-semibold mb-2">Disconnection Details</h4>
          <div className="space-y-2">
            {hasSigDisconnection && (
              <div>
                <h5 className="font-medium">Signal Disconnection</h5>
                <div className="grid grid-cols-2 gap-1 ml-2">
                  <div className="text-sm text-gray-600">Status:</div>
                  <div className="text-sm">
                    {String(request.ManagerResponse).toLowerCase() === "yes" ||
                    request.ManagerResponse === true
                      ? request.sigResponse || "Pending SIG Response"
                      : String(request.ManagerResponse).toLowerCase() ===
                          "no" || request.ManagerResponse === false
                      ? "Manager Rejected"
                      : "Awaiting Manager Approval"}
                  </div>
                  <div className="text-sm text-gray-600">Requirements:</div>
                  <div className="text-sm">
                    {request.sigDisconnectionRequirements || "None specified"}
                  </div>
                  <div className="text-sm text-gray-600">SIG Response:</div>
                  <div className="text-sm">
                    {request.sigResponse || "No response yet"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Elementary Section (From):
                  </div>
                  <div className="text-sm">
                    {request.sigElementarySectionFrom || "Not specified"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Elementary Section (To):
                  </div>
                  <div className="text-sm">
                    {request.sigElementarySectionTo || "Not specified"}
                  </div>
                </div>
              </div>
            )}

            {hasPowerBlockDisconnection && (
              <div>
                <h5 className="font-medium mt-2">Power Block Disconnection</h5>
                <div className="grid grid-cols-2 gap-1 ml-2">
                  <div className="text-sm text-gray-600">Status:</div>
                  <div className="text-sm">
                    {String(request.ManagerResponse).toLowerCase() === "yes" ||
                    request.ManagerResponse === true
                      ? request.oheResponse || "Pending Power Block Response"
                      : String(request.ManagerResponse).toLowerCase() ===
                          "no" || request.ManagerResponse === false
                      ? "Manager Rejected"
                      : "Awaiting Manager Approval"}
                  </div>
                  <div className="text-sm text-gray-600">Requirements:</div>
                  <div className="text-sm">
                    {request.trdDisconnectionRequirements || "None specified"}
                  </div>
                  <div className="text-sm text-gray-600">OHE Response:</div>
                  <div className="text-sm">
                    {request.oheResponse || "No response yet"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Elementary Section (From):
                  </div>
                  <div className="text-sm">
                    {request.elementarySectionFrom || "Not specified"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Elementary Section (To):
                  </div>
                  <div className="text-sm">
                    {request.elementarySectionTo || "Not specified"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Box>
      </Popover>
    </div>
  );
};

export default function UserRequests({ date }) {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [currentoptvalue, setCurrentOptValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [currentReq, setCurrentReq] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUserResult = await currentUser();
        if (!currentUserResult || !currentUserResult.user) {
          return;
        }
        const optimisedValue = await currentOptimizedValue(
          currentUserResult.user
        );
        setUser(currentUserResult.user);
        setCurrentOptValue(optimisedValue);

        const userIdResponse = await getUserId(currentUserResult.user);
        if (!userIdResponse) {
          return;
        }

        // Get both staging and approved requests
        const formDataResponse = await getFormData(userIdResponse.id);
        const stagingFormData = await getStagingFormData(userIdResponse.id);

        // Create a map to track which staging requests have been approved
        const approvedRequestIds = new Set(
          formDataResponse.requestData.map((req) => req.requestId)
        );

        // Filter out staging requests that have already been approved
        const filteredStagingData = stagingFormData.requestData.filter(
          (req) => !approvedRequestIds.has(req.requestId)
        );

        const finalData =
          formDataResponse.requestData.concat(filteredStagingData);
        const formattedData = Array.isArray(await formatData(finalData))
          ? await formatData(finalData)
          : [];
        setRequests(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [currentoptvalue, showPopup, date]);

  const filterByRecentDates = (requestData) => {
    const today = new Date();
    const pastDate1 = new Date(today);
    pastDate1.setDate(today.getDate() - 1);
    const pastDate2 = new Date(today);
    pastDate2.setDate(today.getDate() - 2);

    const formatDate = (date) => date.toISOString().slice(0, 10);

    const todayFormatted = formatDate(today);
    const pastDate1Formatted = formatDate(pastDate1);
    const pastDate2Formatted = formatDate(pastDate2);

    return requestData.filter((item) => {
      return (
        item.date === todayFormatted ||
        item.date === pastDate1Formatted ||
        item.date === pastDate2Formatted
      );
    });
  };

  const filterByToday = (requestData) => {
    return requestData.filter((item) => {
      return item.date === date;
    });
  };

  const editRequestHandler = (request) => {
    setCurrentReq(request);
    setShowPopup(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Filter requests by week if no specific date is selected
  console.log("All Requests:", requests);
  console.log("Week Date Range:", {
    start: weekDates.start,
    end: weekDates.end,
  });
  console.log("Selected Date:", date);

  const filteredRequests = date
    ? requests.filter((item) => {
        const matches = item.date === date && item.archived !== true;
        console.log(`Request ${item.requestId} date filtering:`, {
          itemDate: item.date,
          selectedDate: date,
          isArchived: item.archived,
          matches,
        });
        return matches;
      })
    : requests.filter((item) => {
        // Handle various date formats
        let requestDate;
        try {
          // Try to parse the date in various formats
          if (item.date) {
            if (item.date.includes("-")) {
              // Format: YYYY-MM-DD
              const [year, month, day] = item.date.split("-").map(Number);
              requestDate = new Date(year, month - 1, day);
            } else if (item.date.includes("/")) {
              // Format: MM/DD/YYYY or DD/MM/YYYY
              const parts = item.date.split("/").map(Number);
              if (parts[2] > 1000) {
                // MM/DD/YYYY
                requestDate = new Date(parts[2], parts[0] - 1, parts[1]);
              } else {
                // DD/MM/YYYY
                requestDate = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            } else {
              // Try default parsing
              requestDate = new Date(item.date);
            }
          } else {
            // If no date, consider it outside the range
            return false;
          }
        } catch (e) {
          console.error(`Error parsing date ${item.date}:`, e);
          return false;
        }

        const isInSelectedWeek =
          requestDate >= weekDates.start && requestDate <= weekDates.end;
        const isNotArchived = item.archived !== true;

        console.log(`Request ${item.requestId} week filtering:`, {
          itemDate: item.date,
          requestDate,
          isInSelectedWeek,
          isNotArchived,
          matches: isInSelectedWeek && isNotArchived,
        });

        return isInSelectedWeek && isNotArchived;
      });

  // Debug log for requests with mismatched status
  filteredRequests.forEach((request) => {
    if (
      String(request.ManagerResponse).toLowerCase() === "yes" &&
      (request.sigDisconnection === "Yes" ||
        request.ohDisconnection === "Yes" ||
        request.oheDisconnection === "Yes")
    ) {
      console.log(`Request ${request.requestId} status check:`, {
        ManagerResponse: request.ManagerResponse,
        sigDisconnection: request.sigDisconnection,
        ohDisconnection: request.ohDisconnection,
        oheDisconnection: request.oheDisconnection,
        sigResponse: request.sigResponse,
        oheResponse: request.oheResponse,
      });
    }
  });

  console.log("Filtered Requests:", filteredRequests);

  if (showPopup) {
    return (
      <EditRequest
        request={currentReq}
        setShowPopup={setShowPopup}
        flag={false}
      />
    );
  } else {
    return (
      <div
        style={{
          position: isFullscreen ? "fixed" : "relative",
          top: 0,
          left: 0,
          width: "100%",
          height: isFullscreen ? "100%" : "auto",
          zIndex: isFullscreen ? 1000 : "auto",
          backgroundColor: isFullscreen ? "white" : "transparent",
        }}
      >
        {/* Week Selection - Only show if no specific date is selected */}
        {!date && (
          <div className="mb-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="contained"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                style={{ minWidth: "auto", padding: "4px 8px" }}
              >
                &lt; Prev Week
              </Button>

              <span
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                {weekDates.weekLabel}: {formatDateToString(weekDates.start)} to{" "}
                {formatDateToString(weekDates.end)}
              </span>

              <Button
                variant="contained"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                style={{ minWidth: "auto", padding: "4px 8px" }}
              >
                Next Week &gt;
              </Button>

              {weekOffset !== 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setWeekOffset(0)}
                  style={{
                    minWidth: "auto",
                    padding: "4px 8px",
                    marginLeft: "8px",
                  }}
                >
                  Current Week
                </Button>
              )}
            </div>
          </div>
        )}

        <TableContainer
          sx={{ position: "relative", maxHeight: 500 }}
          component={Paper}
        >
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table
              sx={{ minWidth: 650 }}
              aria-label="request table"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Request ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Date of Block Request</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Major Section</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Depot/SSE</strong>
                  </TableCell>
                  {/* <TableCell>
                    <strong>Block Section</strong>
                  </TableCell> */}
                  <TableCell>
                    <strong>Block Section/Yard</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Line Selected</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Demand Time (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Demand Time (To)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Work Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Activity</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Disconnections</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Caution Required</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Caution Speed</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Approximate Caution Location (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Approximate Caution Location (To)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Work Location (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Work Location (To)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Route (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Route (To)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Coaching repercussions</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Other Lines Affected</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Remarks</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Corridor Type</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#F3E8FF",
                      position: "sticky",
                      right: "80px",
                      top: 0,
                      zIndex: 1200,
                      boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>Manager Response</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#F3E8FF",
                      position: "sticky",
                      right: "80px",
                      top: 0,
                      zIndex: 1200,
                      boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>Sanctioned Status</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#E8DEF8",
                      position: "sticky",
                      right: 0,
                      top: 0,
                      zIndex: 1201,
                      boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>Edit The Request</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.requestId}>
                      <TableCell>{request.requestId}</TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>{request.selectedSection}</TableCell>
                      <TableCell>{request.selectedDepo}</TableCell>
                      {/* <TableCell>{request.stationID}</TableCell> */}
                      <TableCell>{request.missionBlock}</TableCell>
                      <TableCell>
                        {
                          typeof request.selectedLine === "string" &&
                          request.selectedLine.startsWith("{")
                            ? (() => {
                                try {
                                  const lineData = JSON.parse(
                                    request.selectedLine
                                  );
                                  const stationLines = lineData.station || [];
                                  const yardLines = lineData.yard || [];

                                  return (
                                    <div>
                                      {stationLines.length > 0 && (
                                        <div>
                                          <strong>Station:</strong>{" "}
                                          {stationLines.join(", ")}
                                        </div>
                                      )}
                                      {yardLines.length > 0 && (
                                        <div>
                                          <strong>Yard:</strong>{" "}
                                          {yardLines.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (e) {
                                  return request.selectedLine; // Fallback to original value if JSON parsing fails
                                }
                              })()
                            : request.selectedLine // Display as is if not JSON
                        }
                      </TableCell>
                      <TableCell>{request.demandTimeFrom}</TableCell>
                      <TableCell>{request.demandTimeTo}</TableCell>
                      <TableCell>{request.workType}</TableCell>
                      <TableCell>{request.workDescription}</TableCell>
                      <TableCell>
                        <DisconnectionDetails request={request} />
                      </TableCell>
                      <TableCell>{request.cautionRequired}</TableCell>
                      <TableCell>{request.cautionSpeed}</TableCell>
                      <TableCell>{request.cautionLocationFrom}</TableCell>
                      <TableCell>{request.cautionLocationTo}</TableCell>
                      <TableCell>
                        {request.selectedDepartment === "ENGG"
                          ? request.workLocationFrom
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment === "ENGG"
                          ? request.workLocationTo
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment === "SIG"
                          ? request.workLocationFrom
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment === "SIG"
                          ? request.workLocationTo
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment === "TRD"
                          ? request.repercussions
                          : ""}
                      </TableCell>
                      <TableCell>{request.otherLinesAffected}</TableCell>
                      <TableCell>{request.requestremarks}</TableCell>
                      <TableCell>{request.corridorType}</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#F3E8FF",
                          position: "sticky",
                          right: "80px",
                          zIndex: 8,
                          boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                        }}
                      >
                        {request.ManagerResponse || "Pending"}
                      </TableCell>
                      <Tooltip
                        title={
                          request.sanctionedStatus
                            ? "Yes"
                            : "Under Progress"
                        }
                        arrow 
                        sx={{
                         backgroundColor: 'red',
                        }}
                      >
                        <TableCell
                          sx={{
                            backgroundColor: "#F3E8FF",
                            position: "sticky",
                            right: "80px",
                            zIndex: 8,
                            boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                            color: request.sanctionedStatus ? "green" : "red",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          <span>{request.sanctionedStatus ? "Y" : "UP"}</span>{" "}
                          {/* Display abbreviation */}
                        </TableCell>
                      </Tooltip>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFEFF4",
                          position: "sticky",
                          right: 0,
                          zIndex: 8,
                          boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                        }}
                      >
                        <button
                          className="bg-blue-500 text-white p-2 rounded-lg"
                          onClick={() => editRequestHandler(request)}
                        >
                          Edit
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={22} align="center">
                      No requests found for{" "}
                      {date ? `date ${date}` : "this week"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Table */}
          <div className="block md:hidden">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="bg-white border border-gray-300 p-4 mb-4 rounded-lg"
                >
                  <div className="space-y-2">
                    {/* Header-Value Pairs with Vertical Line */}
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Request ID:
                      </strong>
                      <span className="pl-2">{request.requestId}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Date of Request:
                      </strong>
                      <span className="pl-2">{request.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Department:
                      </strong>
                      <span className="pl-2">{request.selectedDepartment}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Section:
                      </strong>
                      <span className="pl-2">{request.selectedSection}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Depot/SSE:
                      </strong>
                      <span className="pl-2">{request.selectedDepo}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Block Section/Yard:
                      </strong>
                      <span className="pl-2">{request.stationID}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Selected Block:
                      </strong>
                      <span className="pl-2">{request.missionBlock}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Work Description:
                      </strong>
                      <span className="pl-2">{request.workType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Work Type Selected:
                      </strong>
                      <span className="pl-2">{request.workDescription}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Line Selected:
                      </strong>
                      <span className="pl-2">
                        {
                          typeof request.selectedLine === "string" &&
                          request.selectedLine.startsWith("{")
                            ? (() => {
                                try {
                                  const lineData = JSON.parse(
                                    request.selectedLine
                                  );
                                  const stationLines = lineData.station || [];
                                  const yardLines = lineData.yard || [];

                                  return (
                                    <div>
                                      {stationLines.length > 0 && (
                                        <div>
                                          <strong>Station:</strong>{" "}
                                          {stationLines.join(", ")}
                                        </div>
                                      )}
                                      {yardLines.length > 0 && (
                                        <div>
                                          <strong>Yard:</strong>{" "}
                                          {yardLines.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (e) {
                                  return request.selectedLine; // Fallback to original value if JSON parsing fails
                                }
                              })()
                            : request.selectedLine // Display as is if not JSON
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Caution Required:
                      </strong>
                      <span className="pl-2">{request.cautionRequired}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Caution Speed:
                      </strong>
                      <span className="pl-2">{request.cautionSpeed}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Caution Location (From):
                      </strong>
                      <span className="pl-2">
                        {request.cautionLocationFrom}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Caution Location (To):
                      </strong>
                      <span className="pl-2">{request.cautionLocationTo}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Work Location (From):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment === "ENGG"
                          ? request.workLocationFrom
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Work Location (To):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment === "ENGG"
                          ? request.workLocationTo
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Route (From):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment === "SIG"
                          ? request.workLocationFrom
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Route (To):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment === "SIG"
                          ? request.workLocationTo
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Demand Time (From):
                      </strong>
                      <span className="pl-2">{request.demandTimeFrom}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Demand Time (To):
                      </strong>
                      <span className="pl-2">{request.demandTimeTo}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Coaching Repercussions:
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment === "TRD"
                          ? request.repercussions
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Other Lines Affected:
                      </strong>
                      <span className="pl-2">{request.otherLinesAffected}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Remarks:
                      </strong>
                      <span className="pl-2">{request.requestremarks}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Corridor Type
                      </strong>
                      <span className="pl-2">{request.corridorType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Manager Response
                      </strong>
                      <span className="pl-2">
                        {request.ManagerResponse || "Pending"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Disconnections
                      </strong>
                      <span className="pl-2">
                        <DisconnectionDetails request={request} />
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Edit The Request:
                      </strong>
                      <span className="pl-2">
                        <button
                          className="bg-blue-500 text-white p-2 rounded-lg"
                          onClick={() => editRequestHandler(request)}
                        >
                          Edit
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                No requests found for {date ? `date ${date}` : "this week"}
              </div>
            )}
          </div>
          <Button onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </Button>
        </TableContainer>
      </div>
    );
  }
}
