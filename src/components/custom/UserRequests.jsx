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
import { getFormData, deleteFormData } from "../../app/actions/formdata";
import EditRequest from "../custom/EditRequest";
import currentUser, {
  getUserId,
  currentOptimizedValue,
  setOptimised,
} from "../../app/actions/user";
import { formatData, capitalizeFirstLetter } from "../../lib/utils";
import {
  getStagingFormData,
  deleteStagingFormData,
} from "../../app/actions/stagingform";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

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
    weekLabel: `Current${weekOffset === 0
      ? "(Week)"
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
      <div className="flex items-center space-x-2 flex-col md:flex-row">
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
        <div className="my-2 md:my-0">
          {hasSigDisconnection && (
            <Chip
              label="S&T"
              size="small"
              color={getSigChipColor()}
              variant="outlined"
            />
          )}
        </div>
        <div className="my-2 md:my-0">
          {hasPowerBlockDisconnection && (
            <Chip
              label="Power Block"
              size="small"
              color={getPowerChipColor()}
              variant="outlined"
            />
          )}
        </div>
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
                  <div className="text-sm text-gray-600">S&T Response:</div>
                  <div className="text-sm">
                    {request.sigResponse || "No response yet"}
                  </div>
                  <div className="text-sm text-gray-600">Line (From):</div>
                  <div className="text-sm">
                    {request.sigElementarySectionFrom || "Not specified"}
                  </div>
                  <div className="text-sm text-gray-600">Line (To):</div>
                  <div className="text-sm">
                    {request.sigElementarySectionTo || "Not specified"}
                  </div>
                </div>
              </div>
            )}

            {hasPowerBlockDisconnection && (
              <div>
                <h5 className="font-medium mt-2">Power Block</h5>
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

const EditOptions = ({ request, editRequestHandler, removeRequest }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  function removeAfterLastDash(input) {
    return input.includes("-") ? input.slice(0, input.lastIndexOf("-")) : input;
  }

  const deleteRequest = async (request) => {
    const requestId = removeAfterLastDash(request.requestId);
    try {
      if (request.ManagerResponse) {
        toast({
          title: "Deletion not allowed",
          description: `This request cannot be deleted because it has been ${request.ManagerResponse === "yes" ? "approved" : "rejected"
            } by a manager.`,
          variant: "destructive",
        });
        return;
      }

      if (confirmDelete) {
        const res = await deleteStagingFormData(requestId);
        toast({
          title: "Success",
          description: "Request deleted successfully",
        });
        removeRequest(request.requestId);
        router.refresh();
      } else {
        setConfirmDelete(true);
        toast({
          title: "Confirm deletion",
          description: "Click the delete button again to confirm deletion",
        });
        setTimeout(() => {
          setConfirmDelete(false);
        }, 5000);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModify = () => {
    editRequestHandler(request);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "edit-options-popover" : undefined;

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        size="medium"
      >
        Edit
      </Button>
      <Popover
        id={id}
        open={open}
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
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Button variant="contained" color="primary" onClick={handleModify}>
            Modify
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteRequest(request)}
          >
            {confirmDelete ? "Confirm" : "Delete"}
          </Button>
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

  const removeRequest = (requestId) => {
    setRequests((prevRequests) =>
      prevRequests.filter((request) => request.requestId !== requestId)
    );
  };

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
          <div className="mb-6 flex flex-wrap items-center justify-center space-x-2">
            <button
              variant="contained"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="px-3 py-1 my-2 lg:my-0 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              &lt; Prev Week
            </button>

            <span className="px-2 py-2 my-2 lg:my-0 text-sm md:text-base bg-white border border-gray-300 rounded shadow">
              {weekDates.weekLabel}: {formatDateToString(weekDates.start)} to{" "}
              {formatDateToString(weekDates.end)}
            </span>

            <button
              variant="contained"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="px-3 py-1 my-2 lg:my-0 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              Next Week &gt;
            </button>

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
        )}

        {/* Desktop Table */}
        <div className="overflow-x-auto rounded-lg shadow-md hidden md:block">
          <table className="w-full border-collapse border border-gray-300 mb-10 table">
            <thead className="relative">
              {/* First Row */}
              <tr>
                {[
                  { id: "requestId", label: "Request ID" },
                  { id: "date", label: "Date of Block Request" },
                  { id: "selectedSection", label: "Major Section" },
                  { id: "selectedDepo", label: "Depot/SSE" },
                  { id: "missionBlock", label: "Block Section/Yard" },
                  { id: "selectedLine", label: "Line Selected" },
                  {
                    id: "demandTime",
                    label: "Demand Time",
                    split: true,
                    children: [
                      { id: "demandTimeFrom", label: "From" },
                      { id: "demandTimeTo", label: "To" },
                    ],
                  },
                  { id: "workType", label: "Work Type" },
                  { id: "workDescription", label: "Activity" },
                  { id: "disconnections", label: "Disconnections" },
                  { id: "cautionRequired", label: "Caution Required" },
                  { id: "cautionSpeed", label: "Caution Speed" },
                  {
                    id: "cautionLocation",
                    label: "Approximate Caution Location",
                    split: true,
                    children: [
                      { id: "cautionLocationFrom", label: "From" },
                      { id: "cautionLocationTo", label: "To" },
                    ],
                  },
                  {
                    id: "workLocation",
                    label: "Work Location",
                    split: true,
                    children: [
                      { id: "workLocationFrom", label: "From" },
                      { id: "workLocationTo", label: "To" },
                    ],
                  },
                  {
                    id: "route",
                    label: "Route",
                    split: true,
                    children: [
                      { id: "routeFrom", label: "From" },
                      { id: "routeTo", label: "To" },
                    ],
                  },
                  { id: "coachingRepercussions", label: "Coaching Repercussions" },
                  { id: "otherLinesAffected", label: "Other Lines Affected" },
                  { id: "remarks", label: "Remarks" },
                  { id: "corridorType", label: "Corridor Type" },
                  { id: "managerResponse", label: "Manager Response" },
                  {
                    id: "sanctionedStatus",
                    label: "Sanctioned Status",
                    fixed: true,
                    right: 154,
                  },
                  {
                    id: "editRequest",
                    label: "Edit The Request",
                    fixed: true,
                    right: 0,
                  },
                ].map((column) =>
                  column.split ? (
                    <th
                      key={column.id}
                      colSpan={column.children.length}
                      className="border border-gray-300 bg-gray-50 text-center p-2 font-medium"
                    >
                      {column.label}
                    </th>
                  ) : (
                    <th
                      key={column.id}
                      rowSpan={2}
                      className={`border border-gray-300 p-3 min-w-[150px] whitespace-nowrap align-top font-medium ${column.fixed
                        ? "sticky bg-slate-200 z-30"
                        : " bg-gray-50"
                        }`}
                      style={{
                        right: column.fixed ? `${column.right}px` : "auto",
                        zIndex: column.fixed ? 10 : "auto",
                      }}
                    >
                      {column.label}
                    </th>
                  )
                )}
              </tr>

              {/* Second Row - only for split columns */}
              <tr>
                {[
                  {
                    id: "demandTime",
                    children: [
                      { id: "demandTimeFrom", label: "From" },
                      { id: "demandTimeTo", label: "To" },
                    ],
                  },
                  {
                    id: "cautionLocation",
                    children: [
                      { id: "cautionLocationFrom", label: "From" },
                      { id: "cautionLocationTo", label: "To" },
                    ],
                  },
                  {
                    id: "workLocation",
                    children: [
                      { id: "workLocationFrom", label: "From" },
                      { id: "workLocationTo", label: "To" },
                    ],
                  },
                  {
                    id: "route",
                    label: "Route",
                    children: [
                      { id: "routeFrom", label: "From" },
                      { id: "routeTo", label: "To" },
                    ],
                  },
                ].flatMap((column) =>
                  column.children.map((child) => (
                    <th
                      key={child.id}
                      className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 font-medium"
                    >
                      {child.label}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.requestId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.requestId}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.date}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedSection}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedDepo}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.missionBlock}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
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
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.demandTimeFrom}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.demandTimeTo}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.workType}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.workDescription}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      <DisconnectionDetails request={request} />
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.cautionRequired}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.cautionSpeed}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.cautionLocationFrom}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.cautionLocationTo}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedDepartment === "ENGG"
                        ? request.workLocationFrom
                        : ""}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedDepartment === "ENGG"
                        ? request.workLocationTo
                        : ""}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedDepartment === "SIG"
                        ? request.workLocationFrom
                        : ""}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedDepartment === "SIG"
                        ? request.workLocationTo
                        : ""}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.selectedDepartment === "TRD"
                        ? request.repercussions
                        : ""}
                    </td>

                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.otherLinesAffected}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.requestremarks || "No Remarks"}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {capitalizeFirstLetter(request.corridorType)}
                    </td>

                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {capitalizeFirstLetter(request.ManagerResponse) ||
                        "Pending"}
                    </td>
                    <Tooltip
                      title={
                        request.SanctionedStatus === "Y" ? (
                          <span className="text-sm">Yes</span>
                        ) : request.SanctionedStatus === "R" ? (
                          <span className="text-sm">Rejected</span>
                        ) : (
                          <span className="text-sm">Under Progress</span>
                        )
                      }
                      arrow
                    >
                      <td
                        className={`border border-gray-300 p-3 whitespace-nowrap font-bold cursor-pointer ${request.SanctionedStatus === "Y"
                          ? "bg-green-100 text-green-700"
                          : request.SanctionedStatus === "R"
                            ? "bg-red-300 text-red-700"
                            : "bg-pink-100 text-pink-700"
                          } sticky`}
                        style={{
                          right: "150px",
                          zIndex: 8,
                        }}
                      >
                        <span>
                          {request.SanctionedStatus === "Y"
                            ? "Y"
                            : request.SanctionedStatus === "R"
                              ? "R"
                              : "UP"}
                        </span>
                      </td>
                    </Tooltip>
                    <td className="border border-gray-300 p-3 whitespace-nowrap text-center sticky right-0 z-10 bg-slate-300">
                      <EditOptions
                        request={request}
                        editRequestHandler={editRequestHandler}
                        removeRequest={removeRequest}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={30} className="border border-gray-300 p-5">
                    No requests found for this week
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Table */}
        <div className="block md:hidden">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white mb-5 border border-gray-400 text-sm p-1"
              >
                <div className="space-y-2">
                  {/* Header-Value Pairs with Vertical Line */}
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Request ID:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.requestId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Date of Request:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.date}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Section:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.selectedSection}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Depot/SSE:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.selectedDepo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Block Section/Yard:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.missionBlock}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Line Selected:
                    </strong>
                    <span className="border border-gray-300 p-2">
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
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Demand Time (From):
                    </strong>
                    <span className="border border-gray-300 p-2">{request.demandTimeFrom}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Demand Time (To):
                    </strong>
                    <span className="border border-gray-300 p-2">{request.demandTimeTo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Work Type:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.workType}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Activity:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.workDescription}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Caution Required:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.cautionRequired}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Caution Speed:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.cautionSpeed}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Caution Location (From):
                    </strong>
                    <span className="border border-gray-300 p-2">{request.cautionLocationFrom}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Caution Location (To):
                    </strong>
                    <span className="border border-gray-300 p-2">{request.cautionLocationTo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Work Location (From):
                    </strong>
                    <span className="border border-gray-300 p-2">
                      {request.selectedDepartment === "ENGG"
                        ? request.workLocationFrom
                        : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Work Location (To):
                    </strong>
                    <span className="border border-gray-300 p-2">
                      {request.selectedDepartment === "ENGG"
                        ? request.workLocationTo
                        : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Route (From):
                    </strong>
                    <span className="border border-gray-300 p-2">
                      {request.selectedDepartment === "SIG"
                        ? request.workLocationFrom
                        : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Route (To):
                    </strong>
                    <span className="border border-gray-300 p-2">
                      {request.selectedDepartment === "SIG"
                        ? request.workLocationTo
                        : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Coaching Repercussions:
                    </strong>
                    <span className="border border-gray-300 p-2">
                      {request.selectedDepartment === "TRD"
                        ? request.repercussions
                        : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Other Lines Affected:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.otherLinesAffected}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Remarks:
                    </strong>
                    <span className="border border-gray-300 p-2">{request.requestremarks ? request.requestremarks : "None"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Corridor Type
                    </strong>
                    <span className="border border-gray-300 p-2">{capitalizeFirstLetter(request.corridorType)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Manager Response
                    </strong>
                    <span className="border border-gray-300 p-2">
                      {capitalizeFirstLetter(request.ManagerResponse || "Pending")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Disconnections
                    </strong>
                    <span className="border border-gray-300 p-2">
                      <DisconnectionDetails request={request} />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Sanctioned Status
                    </strong>
                    <span className={`${request.SanctionedStatus === "Y"
                      ? "bg-green-100 text-green-700"
                      : request.SanctionedStatus === "R"
                        ? "bg-red-300 text-red-700"
                        : "bg-pink-100 text-pink-700"
                      } border border-gray-300 p-2`}>
                      <span>
                        {request.SanctionedStatus === "Y"
                          ? "Yes"
                          : request.SanctionedStatus === "R"
                            ? "Rejected"
                            : "Under Process"}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <strong className="border border-gray-300 p-2">
                      Edit The Request:
                    </strong>
                    <span className="border border-gray-300 p-2">
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
        <button onClick={toggleFullscreen} className="hidden md:block p-px">
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </button>
      </div>
    );
  }
}
