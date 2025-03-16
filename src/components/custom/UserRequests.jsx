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

// Helper function to get week dates
const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the date of Monday (start of week)
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);
  
  // Calculate the date of Sunday (end of week)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday,
    end: sunday,
    weekLabel: `Week ${weekOffset === 0 ? '(Current)' : weekOffset > 0 ? '+' + weekOffset : weekOffset}`
  };
};

// Format date as YYYY-MM-DD
const formatDateToString = (date) => {
  return date.toISOString().split('T')[0];
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
        const formDataResponse = await getFormData(userIdResponse.id);
        const stagingFormData = await getStagingFormData(userIdResponse.id);
        const finalData = formDataResponse.requestData.concat(
          stagingFormData.requestData
        );
        const formattedData = formatData(finalData);
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
  const filteredRequests = date 
    ? requests.filter(item => item.date === date)
    : requests.filter(item => {
        const requestDate = new Date(item.date);
        return requestDate >= weekDates.start && requestDate <= weekDates.end;
      });

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
                onClick={() => setWeekOffset(prev => prev - 1)}
                style={{ minWidth: 'auto', padding: '4px 8px' }}
              >
                &lt; Prev Week
              </Button>
              
              <span style={{ padding: '8px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}>
                {weekDates.weekLabel}: {formatDateToString(weekDates.start)} to {formatDateToString(weekDates.end)}
              </span>
              
              <Button 
                variant="contained"
                onClick={() => setWeekOffset(prev => prev + 1)}
                style={{ minWidth: 'auto', padding: '4px 8px' }}
              >
                Next Week &gt;
              </Button>
              
              {weekOffset !== 0 && (
                <Button 
                  variant="outlined"
                  onClick={() => setWeekOffset(0)}
                  style={{ minWidth: 'auto', padding: '4px 8px', marginLeft: '8px' }}
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
                    <strong>Department</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Major Section</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Block Section</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Selected Block</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Work Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Activity</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Line Selected</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Stream Selected</strong>
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
                    <strong>Demand Time (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Demand Time (To)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>SIG Disconnection</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Power Block Disconnection</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Elementary Section (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Elementary Section (To)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>SIG Elementary Section (From)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>SIG Elementary Section (To)</strong>
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
                    <strong>Depot/SSE</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#E8DEF8",
                      position: "sticky",
                      right: 0,
                      zIndex: 10,
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
                      <TableCell>{request.selectedDepartment}</TableCell>
                      <TableCell>{request.selectedSection}</TableCell>
                      <TableCell>{request.stationID}</TableCell>
                      <TableCell>{request.missionBlock}</TableCell>
                      <TableCell>{request.workType}</TableCell>
                      <TableCell>{request.workDescription}</TableCell>
                      <TableCell>
                        {request.selectedLine?.split(":")[1]}
                      </TableCell>
                      <TableCell>{request.selectedStream}</TableCell>
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
                      <TableCell>{request.demandTimeFrom}</TableCell>
                      <TableCell>{request.demandTimeTo}</TableCell>
                      <TableCell>
                        {request.selectedDepartment !== "TRD"
                          ? request.sigDisconnection
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment !== "TRD"
                          ? request.ohDisconnection
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment !== "TRD"
                          ? request.elementarySectionFrom
                          : request.workLocationFrom}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment !== "TRD"
                          ? request.elementarySectionTo
                          : request.workLocationTo}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment !== "TRD"
                          ? request.sigElementarySectionFrom
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment !== "TRD"
                          ? request.sigElementarySectionTo
                          : ""}
                      </TableCell>
                      <TableCell>
                        {request.selectedDepartment === "TRD"
                          ? request.repercussions
                          : ""}
                      </TableCell>
                      <TableCell>{request.otherLinesAffected}</TableCell>
                      <TableCell>{request.requestremarks}</TableCell>
                      <TableCell>{request.selectedDepo}</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFEFF4",
                          position: "sticky",
                          right: 0,
                          zIndex: 1,
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
                    <TableCell colSpan={31} align="center">
                      No requests found for {date ? `date ${date}` : 'this week'}
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
                        Block Section:
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
                        {request.selectedLine?.split(":")[1]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Stream Selected:
                      </strong>
                      <span className="pl-2">{request.selectedStream}</span>
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
                        SIG Disconnection:
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment !== "TRD"
                          ? request.sigDisconnection
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        OHE Disconnection:
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment !== "TRD"
                          ? request.ohDisconnection
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Elementary Section (From):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment !== "TRD"
                          ? request.elementarySectionFrom
                          : request.workLocationFrom}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        Elementary Section (To):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment !== "TRD"
                          ? request.elementarySectionTo
                          : request.workLocationTo}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        SIG Elementary Section (From):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment !== "TRD"
                          ? request.sigElementarySectionFrom
                          : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                      <strong className="text-right pr-2 border-r border-gray-200">
                        SIG Elementary Section (To):
                      </strong>
                      <span className="pl-2">
                        {request.selectedDepartment !== "TRD"
                          ? request.sigElementarySectionTo
                          : ""}
                      </span>
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
                        Depot/SSE:
                      </strong>
                      <span className="pl-2">{request.selectedDepo}</span>
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
              <div className="text-center p-4">No requests found for {date ? `date ${date}` : 'this week'}</div>
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
