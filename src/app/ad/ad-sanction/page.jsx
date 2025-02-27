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
import { getDataOptimised } from "../../actions/optimisetable";

const SearchForm = () => {
  const [filteredRequests, setFilteredRequests] = useState([]);

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
  }, []);

  return (
    <div className="bg-secondary p-4 rounded-xl m-10">
      <div className="flex justify-between ">
        <h1 className="font-bold text-4xl mt-10">Sanctioned Table</h1>
      </div>
      <TableContainer
        component={Paper}
        sx={{
          marginTop: 4,
          position: "relative",
          maxHeight: 560,
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
              {/* <TableCell>
                <strong>Optimization Details</strong>
              </TableCell> */}
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
                  {/* <TableCell>{request.optimization_details}</TableCell> */}
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
    </div>
  );
};

export default SearchForm;
