"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import { CSVLink } from "react-csv";

import { setOptimised } from "../../actions/user";
import EditOptimised from "./EditOptimised";
import {
  getDataOptimised,
  updateFinalStatus,
} from "../../actions/optimisetable";

const SearchForm = () => {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentReq, setCurrentReq] = useState([]);
  const [update, setUpdate] = useState(true);
  const [edit, setEdit] = useState(true);

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getDataOptimised();
        setFilteredRequests(res.result);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, [showPopup, update]);

  const editRequestHandler = (request) => {
    setCurrentReq(request);
    setShowPopup(true);
  };

  const saveButtonHandler = () => {
    filteredRequests.forEach(async (request) => {
      const res = await updateFinalStatus(request.requestId);
    });

    localStorage.setItem("sanctionTableVisible", "true");

    setUpdate(!update);
  };

  if (showPopup) {
    return <EditOptimised request={currentReq} setShowPopup={setShowPopup} />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Optimised Table</h1>
                <p className="text-sm sm:text-base text-gray-600">View and manage optimised requests</p>
              </div>
              <button
                onClick={saveButtonHandler}
                className="w-full sm:w-auto bg-slate-950 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-200 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <TableContainer
                component={Paper}
                sx={{
                  marginTop: 2,
                  position: "relative",
                  maxHeight: 600,
                  border: "solid 1px #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <Table sx={{ minWidth: 800 }} aria-label="request table" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Request ID</strong></TableCell>
                      <TableCell><strong>Date of Request</strong></TableCell>
                      <TableCell><strong>Department</strong></TableCell>
                      <TableCell><strong>Section</strong></TableCell>
                      <TableCell><strong>Block Section</strong></TableCell>
                      <TableCell><strong>Selected Block</strong></TableCell>
                      <TableCell><strong>Work Description</strong></TableCell>
                      <TableCell><strong>Work Type Selected</strong></TableCell>
                      <TableCell><strong>Line Selected</strong></TableCell>
                      <TableCell><strong>Caution Required</strong></TableCell>
                      <TableCell><strong>Caution Speed</strong></TableCell>
                      <TableCell><strong>Caution Location (From)</strong></TableCell>
                      <TableCell><strong>Caution Location (To)</strong></TableCell>
                      <TableCell><strong>Work Location (From)</strong></TableCell>
                      <TableCell><strong>Work Location (To)</strong></TableCell>
                      <TableCell><strong>Demand Time (From)</strong></TableCell>
                      <TableCell><strong>Demand Time (To)</strong></TableCell>
                      <TableCell><strong>Optimised Time (From)</strong></TableCell>
                      <TableCell><strong>Optimised Time (To)</strong></TableCell>
                      <TableCell><strong>Optimization Details</strong></TableCell>
                      <TableCell><strong>SIG Disconnection</strong></TableCell>
                      <TableCell><strong>OHE Disconnection</strong></TableCell>
                      <TableCell><strong>Elementary Section (From)</strong></TableCell>
                      <TableCell><strong>Elementary Section (To)</strong></TableCell>
                      <TableCell><strong>Other Lines Affected</strong></TableCell>
                      <TableCell><strong>Action</strong></TableCell>
                      <TableCell><strong>Remarks</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      {filteredRequests && filteredRequests[0] && (filteredRequests[0].final == null || filteredRequests[0].final !== "set") && (
                        <TableCell sx={{ backgroundColor: "#E8DEF8", position: "sticky", right: 0, zIndex: 100 }}>
                          <strong>Edit The Request</strong>
                        </TableCell>
                      )}
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
                          <TableCell>{request.workDescription}</TableCell>
                          <TableCell>{request.workType}</TableCell>
                          <TableCell>{request.selectedLine}</TableCell>
                          <TableCell>{request.cautionRequired}</TableCell>
                          <TableCell>{request.cautionSpeed}</TableCell>
                          <TableCell>{request.cautionLocationFrom}</TableCell>
                          <TableCell>{request.cautionLocationTo}</TableCell>
                          <TableCell>{request.workLocationFrom}</TableCell>
                          <TableCell>{request.workLocationTo}</TableCell>
                          <TableCell>{request.demandTimeFrom}</TableCell>
                          <TableCell>{request.demandTimeTo}</TableCell>
                          <TableCell>{request.Optimisedtimefrom}</TableCell>
                          <TableCell>{request.Optimisedtimeto}</TableCell>
                          <TableCell>{request.optimization_details}</TableCell>
                          <TableCell>{request.sigDisconnection}</TableCell>
                          <TableCell>{request.ohDisconnection}</TableCell>
                          <TableCell>{request.elementarySectionFrom}</TableCell>
                          <TableCell>{request.elementarySectionTo}</TableCell>
                          <TableCell>{request.otherLinesAffected}</TableCell>
                          <TableCell>
                            {request.action === "none" ? "No Action Taken" : request.action === "Accepted" ? <span>Accepted ✅</span> : <span>Rejected❌ </span>}
                          </TableCell>
                          <TableCell>
                            {request.remarks === null || request.remarks === "" ? "No Remarks" : request.remarks}
                          </TableCell>
                          <TableCell>{request.status}</TableCell>
                          {request.final === "" || (request.final !== "set" && (
                            <TableCell sx={{ backgroundColor: "#FFEFF4", position: "sticky", right: 0, zIndex: 1 }}>
                              <button className="bg-blue-500 text-white p-2 rounded-lg" onClick={() => editRequestHandler(request)}>
                                Edit
                              </button>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={21} align="center">No requests found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden mt-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div key={request.requestId} className="bg-white border border-gray-200 p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Request ID:</strong>
                        <span className="pl-2">{request.requestId}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Date of Request:</strong>
                        <span className="pl-2">{request.date}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Department:</strong>
                        <span className="pl-2">{request.selectedDepartment}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Section:</strong>
                        <span className="pl-2">{request.selectedSection}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Block Section:</strong>
                        <span className="pl-2">{request.stationID}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Selected Block:</strong>
                        <span className="pl-2">{request.missionBlock}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Work Description:</strong>
                        <span className="pl-2">{request.workDescription}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Work Type:</strong>
                        <span className="pl-2">{request.workType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Line Selected:</strong>
                        <span className="pl-2">{request.selectedLine}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Caution Required:</strong>
                        <span className="pl-2">{request.cautionRequired}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Caution Speed:</strong>
                        <span className="pl-2">{request.cautionSpeed}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Caution Location (From):</strong>
                        <span className="pl-2">{request.cautionLocationFrom}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Caution Location (To):</strong>
                        <span className="pl-2">{request.cautionLocationTo}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Work Location (From):</strong>
                        <span className="pl-2">{request.workLocationFrom}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Work Location (To):</strong>
                        <span className="pl-2">{request.workLocationTo}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Demand Time (From):</strong>
                        <span className="pl-2">{request.demandTimeFrom}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Demand Time (To):</strong>
                        <span className="pl-2">{request.demandTimeTo}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Optimised Time (From):</strong>
                        <span className="pl-2">{request.Optimisedtimefrom}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Optimised Time (To):</strong>
                        <span className="pl-2">{request.Optimisedtimeto}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Optimization Details:</strong>
                        <span className="pl-2">{request.optimization_details}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">SIG Disconnection:</strong>
                        <span className="pl-2">{request.sigDisconnection}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">OHE Disconnection:</strong>
                        <span className="pl-2">{request.ohDisconnection}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Elementary Section (From):</strong>
                        <span className="pl-2">{request.elementarySectionFrom}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Elementary Section (To):</strong>
                        <span className="pl-2">{request.elementarySectionTo}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Other Lines Affected:</strong>
                        <span className="pl-2">{request.otherLinesAffected}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Action:</strong>
                        <span className="pl-2">
                          {request.action === "none" ? "No Action Taken" : request.action === "Accepted" ? <span>Accepted ✅</span> : <span>Rejected❌ </span>}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Remarks:</strong>
                        <span className="pl-2">{request.remarks === null || request.remarks === "" ? "No Remarks" : request.remarks}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                        <strong className="text-right pr-2 border-r border-gray-200">Status:</strong>
                        <span className="pl-2">{request.status}</span>
                      </div>
                      {(request.final === "" || request.final !== "set") && (
                        <div className="pt-2">
                          <button 
                            className="w-full bg-blue-500 text-white p-2 rounded-lg" 
                            onClick={() => editRequestHandler(request)}
                          >
                            Edit Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">No requests found</div>
              )}
            </div>

            {/* Download Button */}
            {filteredRequests.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="contained" 
                  color="secondary" 
                  sx={{ 
                    padding: "8px 24px",
                    borderRadius: "0.5rem",
                    textTransform: "none",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    '&:hover': {
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }
                  }}
                >
                  <CSVLink 
                    data={filteredRequests} 
                    filename={"optimised_filtered_requests.csv"} 
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    Download Optimised Data
                  </CSVLink>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default SearchForm;
