"use client";
import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  getDataOptimised,
  postDataOptimised,
} from "../../app/actions/optimisetable";

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
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const ManagerOptmisedTable = ({ id }) => {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getDataOptimised();
        const result = res.result.filter(
          (e) => e.selectedDepartment === id.toUpperCase()
        );
        setAllRequests(result);
        
        // Filter requests for the selected week
        filterRequestsByWeek(result);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, [currentRequest, weekOffset, id]);

  // Filter requests by week
  const filterRequestsByWeek = (requestData) => {
    if (!requestData) return;
    
    const filtered = requestData.filter(request => {
      let requestDate;
      try {
        // Try to parse the date in various formats
        if (request.date) {
          if (request.date.includes('-')) {
            // Format: YYYY-MM-DD
            const [year, month, day] = request.date.split('-').map(Number);
            requestDate = new Date(year, month - 1, day);
          } else if (request.date.includes('/')) {
            // Format: MM/DD/YYYY or DD/MM/YYYY
            const parts = request.date.split('/').map(Number);
            if (parts[2] > 1000) {
              // MM/DD/YYYY
              requestDate = new Date(parts[2], parts[0] - 1, parts[1]);
            } else {
              // DD/MM/YYYY
              requestDate = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          } else {
            // Try default parsing
            requestDate = new Date(request.date);
          }
        } else {
          // If no date, consider it outside the range
          return false;
        }
      } catch (e) {
        console.error(`Error parsing date ${request.date}:`, e);
        return false;
      }
      
      return requestDate >= weekDates.start && requestDate <= weekDates.end;
    });
    
    setFilteredRequests(filtered);
  };

  const optimisedYesHandler = async (requestdata) => {
    const res = await postDataOptimised(requestdata, "Accepted", "");
    setCurrentRequest(res);
  };

  const optimisedNoHandler = (requestdata) => {
    setCurrentRequest(requestdata);
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    try {
      if (remarks.trim() === "") {
        setError("Remarks are required");
        return;
      }
      const res = await postDataOptimised(currentRequest, "Rejected", remarks);
      setShowPopup(false);
      setCurrentRequest(res);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="container min-w-full p-4">
      {/* Week Selection */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <button 
          onClick={() => setWeekOffset(prev => prev - 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          &lt; Prev Week
        </button>
        
        <span className="px-4 py-2 bg-white border border-gray-300 rounded shadow">
          {weekDates.weekLabel}: {formatDate(weekDates.start)} to {formatDate(weekDates.end)}
        </span>
        
        <button 
          onClick={() => setWeekOffset(prev => prev + 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          Next Week &gt;
        </button>
        
        {weekOffset !== 0 && (
          <button 
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
          >
            Current Week
          </button>
        )}
      </div>

    {/* Table for Desktop */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Request ID</th>
            <th className="p-3 text-left">Date of Block Request</th>
            <th className="p-3 text-left">Department</th>
            <th className="p-3 text-left">MajorSection</th>
            <th className="p-3 text-left">Block Section</th>
            <th className="p-3 text-left">Selected Block</th>
            <th className="p-3 text-left">Work Type</th>
            <th className="p-3 text-left">Activity</th>
            <th className="p-3 text-left">Line Selected</th>
            <th className="p-3 text-left">Caution Required</th>
            <th className="p-3 text-left">Caution Speed</th>
            <th className="p-3 text-left">Caution Location (From)</th>
            <th className="p-3 text-left">Caution Location (To)</th>
            <th className="p-3 text-left">Work Location (From)</th>
            <th className="p-3 text-left">Work Location (To)</th>
            <th className="p-3 text-left">Demand Time (From)</th>
            <th className="p-3 text-left">Demand Time (To)</th>
            <th className="p-3 text-left">Optimised Time (From)</th>
            <th className="p-3 text-left">Optimised Time (To)</th>
            <th className="p-3 text-left">Optimization Details</th>
            <th className="p-3 text-left">SIG Disconnection</th>
            <th className="p-3 text-left">Power Block Disconnection</th>
            <th className="p-3 text-left">Elementary Section (From)</th>
            <th className="p-3 text-left">Elementary Section (To)</th>
            <th className="p-3 text-left">SIG Elementary Section (From)</th>
            <th className="p-3 text-left">SIG Elementary Section (To)</th>
            <th className="p-3 text-left">Other Lines Affected</th>
            <th className="p-3 text-left">Depot/SSE</th>
            <th className="p-3 text-left">Accept The Optimised Requests</th>
            <th className="p-3 text-left">Availed</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <tr key={request.requestId} className="border-b">
                <td className="p-3">{request.requestId}</td>
                <td className="p-3">{request.date}</td>
                <td className="p-3">{request.selectedDepartment}</td>
                <td className="p-3">{request.selectedSection}</td>
                <td className="p-3">{request.stationID}</td>
                <td className="p-3">{request.missionBlock}</td>
                <td className="p-3">{request.workType}</td>
                <td className="p-3">{request.workDescription}</td>
                <td className="p-3">{request.selectedLine}</td>
                <td className="p-3">{request.cautionRequired}</td>
                <td className="p-3">{request.cautionSpeed}</td>
                <td className="p-3">{request.cautionLocationFrom}</td>
                <td className="p-3">{request.cautionLocationTo}</td>
                <td className="p-3">{request.workLocationFrom}</td>
                <td className="p-3">{request.workLocationTo}</td>
                <td className="p-3">{request.demandTimeFrom}</td>
                <td className="p-3">{request.demandTimeTo}</td>
                <td className="p-3">{request.Optimisedtimefrom}</td>
                <td className="p-3">{request.Optimisedtimeto}</td>
                <td className="p-3">{request.optimization_details}</td>
                <td className="p-3">{request.sigDisconnection}</td>
                <td className="p-3">{request.ohDisconnection}</td>
                <td className="p-3">{request.elementarySectionFrom}</td>
                <td className="p-3">{request.elementarySectionTo}</td>
                <td className="p-3">{request.sigElementarySectionFrom}</td>
                <td className="p-3">{request.sigElementarySectionTo}</td>
                <td className="p-3">{request.otherLinesAffected}</td>
                <td className="p-3">{request.selectedDepo}</td>
                <td className="p-3">
                  {request.action === "none" ? (
                    <div className="flex justify-around">
                      "No action taken"
                    </div>
                  ) : request.action === "Accepted" ? (
                    <span>Accepted ✅</span>
                  ) : (
                    <span>Rejected❌ {request.remarks}</span>
                  )}
                </td>
                <td className="p-3">
                  {request.availed ? (
                    (() => {
                      let availedData;
                      try {
                        availedData = typeof request.availed === 'string' 
                          ? JSON.parse(request.availed) 
                          : request.availed;
                      } catch (e) {
                        availedData = { status: "pending", reason: "" };
                      }
                      
                      if (availedData.status === "yes") {
                        return <span className="text-green-600 font-medium">Availed ✅</span>;
                      } else if (availedData.status === "no") {
                        return (
                          <div>
                            <span className="text-red-600 font-medium">Not Availed ❌</span>
                            <p className="text-sm text-gray-600 mt-1">Reason: {availedData.reason}</p>
                          </div>
                        );
                      } else {
                        return <span className="text-gray-600">Pending</span>;
                      }
                    })()
                  ) : (
                    <span className="text-gray-600">Pending</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={29} className="p-3 text-center">
                No requests found for this week
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Table for Mobile */}
    <div className="block md:hidden">
      {filteredRequests.length > 0 ? (
        filteredRequests.map((request) => (
          <div
            key={request.requestId}
            className="bg-secondary border border-gray-300 p-4 mb-4 rounded-lg"
          >
            <div className="space-y-2">
              {/* Fixed-width columns with centered vertical line */}
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
                <span className="pl-2">{request.selectedLine}</span>
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
                <span className="pl-2">{request.cautionLocationFrom}</span>
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
                <span className="pl-2">{request.workLocationFrom}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Work Location (To):
                </strong>
                <span className="pl-2">{request.workLocationTo}</span>
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
                  Optimised Time (From):
                </strong>
                <span className="pl-2">{request.Optimisedtimefrom}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Optimised Time (To):
                </strong>
                <span className="pl-2">{request.Optimisedtimeto}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Optimization Details:
                </strong>
                <span className="pl-2">{request.optimization_details}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  SIG Disconnection:
                </strong>
                <span className="pl-2">{request.sigDisconnection}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  OHE Disconnection:
                </strong>
                <span className="pl-2">{request.ohDisconnection}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Elementary Section (From):
                </strong>
                <span className="pl-2">{request.elementarySectionFrom}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Elementary Section (To):
                </strong>
                <span className="pl-2">{request.elementarySectionTo}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  SIG Elementary Section (From):
                </strong>
                <span className="pl-2">
                  {request.sigElementarySectionFrom}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  SIG Elementary Section (To):
                </strong>
                <span className="pl-2">{request.sigElementarySectionTo}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Other Lines Affected:
                </strong>
                <span className="pl-2">{request.otherLinesAffected}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Depot/SSE:
                </strong>
                <span className="pl-2">{request.selectedDepo}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Accept The Optimised Requests:
                </strong>
                <span className="pl-2">
                  {request.action === "none" ? (
                    <div className="flex justify-around mt-2">
                      "No action taken"
                    </div>
                  ) : request.action === "Accepted" ? (
                    <span>Accepted ✅</span>
                  ) : (
                    <span>Rejected❌ {request.remarks}</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                <strong className="text-right pr-2 border-r border-gray-200">
                  Availed:
                </strong>
                <span className="pl-2">
                  {request.availed ? (
                    (() => {
                      let availedData;
                      try {
                        availedData = typeof request.availed === 'string' 
                          ? JSON.parse(request.availed) 
                          : request.availed;
                      } catch (e) {
                        availedData = { status: "pending", reason: "" };
                      }
                      
                      if (availedData.status === "yes") {
                        return <span className="text-green-600 font-medium">Availed ✅</span>;
                      } else if (availedData.status === "no") {
                        return (
                          <div>
                            <span className="text-red-600 font-medium">Not Availed ❌</span>
                            <p className="text-sm text-gray-600 mt-1">Reason: {availedData.reason}</p>
                          </div>
                        );
                      } else {
                        return <span className="text-gray-600">Pending</span>;
                      }
                    })()
                  ) : (
                    <span className="text-gray-600">Pending</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-4">No requests found</div>
      )}
    </div>

    {/* Popup for Remarks */}
    {showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-xl font-semibold mb-4">Remarks</h2>
          <label className="block mb-4">
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setError("");
              }}
              required
              rows="4"
              placeholder="Enter your remarks here..."
            />
          </label>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end">
            <button
              className="bg-red-500 text-white py-2 px-4 mr-3 rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => {
                setShowPopup(false);
              }}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default ManagerOptmisedTable;
