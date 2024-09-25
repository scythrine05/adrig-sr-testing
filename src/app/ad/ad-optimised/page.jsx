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
    setUpdate(!update);
  };

  if (showPopup) {
    return <EditOptimised request={currentReq} setShowPopup={setShowPopup} />;
  } else {
    return (
      <div>
        <div className="flex justify-between ">
          <h1 className="font-bold text-4xl mt-10">Optimised Table</h1>
          <button
            onClick={saveButtonHandler}
            className=" mt-5  bg-slate-950 text-white pr-5 pl-5 rounded-3xl w-[200 px] hover:bg-slate-300 hover:text-slate-900"
          >
            Save Changes
          </button>
        </div>
        <TableContainer
          component={Paper}
          sx={{
            marginTop: 4,
            position: "relative",
            maxHeight: 500,
            border: "solid 1px #ddd",
          }}
        >
          <Table sx={{ minWidth: 800 }} aria-label="request table" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Request ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Date of Request</strong>
                </TableCell>
                <TableCell>
                  <strong>Department</strong>
                </TableCell>
                <TableCell>
                  <strong>Section</strong>
                </TableCell>
                <TableCell>
                  <strong>Block Section</strong>
                </TableCell>
                <TableCell>
                  <strong>Selected Block</strong>
                </TableCell>
                <TableCell>
                  <strong>Work Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Work Type Selected</strong>
                </TableCell>
                <TableCell>
                  <strong>Line Selected</strong>
                </TableCell>
                <TableCell>
                  <strong>Caution Required</strong>
                </TableCell>
                <TableCell>
                  <strong>Caution Speed</strong>
                </TableCell>
                <TableCell>
                  <strong>Caution Location (From)</strong>
                </TableCell>
                <TableCell>
                  <strong>Caution Location (To)</strong>
                </TableCell>
                <TableCell>
                  <strong>Work Location (From)</strong>
                </TableCell>
                <TableCell>
                  <strong>Work Location (To)</strong>
                </TableCell>
                <TableCell>
                  <strong>Demand Time (From)</strong>
                </TableCell>
                <TableCell>
                  <strong>Demand Time (To)</strong>
                </TableCell>
                <TableCell>
                  <strong>Optimised Time (From)</strong>
                </TableCell>
                <TableCell>
                  <strong>Optimised Time (To)</strong>
                </TableCell>
                <TableCell>
                  <strong>Optimization Details</strong>
                </TableCell>
                <TableCell>
                  <strong>SIG Disconnection</strong>
                </TableCell>
                <TableCell>
                  <strong>OHE Disconnection</strong>
                </TableCell>
                <TableCell>
                  <strong>Elementary Section (From)</strong>
                </TableCell>
                <TableCell>
                  <strong>Elementary Section (To)</strong>
                </TableCell>
                <TableCell>
                  <strong>Other Lines Affected</strong>
                </TableCell>
                <TableCell>
                  <strong>Action</strong>
                </TableCell>
                <TableCell>
                  <strong>Remarks</strong>
                </TableCell>
                {filteredRequests &&
                  filteredRequests[0] &&
                  (filteredRequests[0].final == null ||
                    filteredRequests[0].final !== "set") && (
                    <TableCell
                      sx={{
                        backgroundColor: "#E8DEF8",
                        position: "sticky",
                        right: 0,
                        zIndex: 100,
                      }}
                    >
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
                      {request.action === "none" ? (
                        "No Action Taken"
                      ) : request.action === "Accepted" ? (
                        <span>Accepted ✅</span>
                      ) : (
                        <span>Rejected❌ </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.remarks === null || request.remarks === ""
                        ? "No Remarks"
                        : request.remarks}
                    </TableCell>
                    {request.final === "" ||
                      (request.final !== "set" && (
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
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={21} align="center">
                    No requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredRequests.length > 0 && (
          <div>
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2, marginBottom: 4 }}
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
    );
  }
};

export default SearchForm;
