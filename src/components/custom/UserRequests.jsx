"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { getFormData } from "../../app/actions/formdata";
import currentUser, { getUserId } from "../../app/actions/user";

export default function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUserResult = await currentUser();
        if (!currentUserResult || !currentUserResult.user) {
          return;
        }
        setUser(currentUserResult.user);

        const userIdResponse = await getUserId(currentUserResult.user);
        if (!userIdResponse) {
          return;
        }
        const formDataResponse = await getFormData(userIdResponse.id);
        setRequests(formDataResponse.requestData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="request table">
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
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <TableRow key={request.requestId}>
                <TableCell>{request.requestId}</TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell>{request.selectedDepartment}</TableCell>
                <TableCell>{request.selectedSection}</TableCell>
                <TableCell>{request.stationID}</TableCell>
                <TableCell>{request.missionBlock}</TableCell>
                <TableCell>{request.workType}</TableCell>
                <TableCell>{request.workDescription}</TableCell>
                <TableCell>{request.selectedLine}</TableCell>
                <TableCell>{request.cautionRequired}</TableCell>
                <TableCell>{request.cautionSpeed}</TableCell>
                <TableCell>{request.cautionLocationFrom}</TableCell>
                <TableCell>{request.cautionLocationTo}</TableCell>
                <TableCell>{request.workLocationFrom}</TableCell>
                <TableCell>{request.workLocationTo}</TableCell>
                <TableCell>{request.demandTimeFrom}</TableCell>
                <TableCell>{request.demandTimeTo}</TableCell>
                <TableCell>{request.sigDisconnection}</TableCell>
                <TableCell>{request.ohDisconnection}</TableCell>
                <TableCell>{request.elementarySectionFrom}</TableCell>
                <TableCell>{request.elementarySectionTo}</TableCell>
                <TableCell>{request.otherLinesAffected}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={18} align="center">
                No requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
