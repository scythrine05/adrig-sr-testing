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
import { getFormData } from "../../../app/actions/formdata";
import {
  postDataOptimised,
  checkOptimizedData,
  currentOptimizedData,
} from "../../../app/actions/optimisetable";
import { useRouter } from "next/navigation";
import currentUser, { getUserId } from "../../../app/actions/user";

export default function OptimisedTable() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [currentRequest, setCurrentRequest] = useState(null);

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
        const formDataResponse = await currentOptimizedData(userIdResponse.id);
        setRequests(formDataResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [currentRequest]);

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
    <TableContainer
      component={Paper}
      sx={{
        marginTop: 4,
        maxHeight: 560,
        border: "solid 1px #ddd",
      }}
    >
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
              <strong>SIG Elementary Section (From)</strong>
            </TableCell>
            <TableCell>
              <strong>SIG Elementary Section (To)</strong>
            </TableCell>
            <TableCell>
              <strong>Other Lines Affected</strong>
            </TableCell>
            <TableCell>
              <strong>Accept The Optimised Requests</strong>
            </TableCell>
            <TableCell>
              <strong>Accept The Optimised Requests</strong>
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
                <TableCell>{request.Optimisedtimefrom}</TableCell>
                <TableCell>{request.Optimisedtimeto}</TableCell>
                <TableCell>{request.optimization_details}</TableCell>
                <TableCell>{request.sigDisconnection}</TableCell>
                <TableCell>{request.ohDisconnection}</TableCell>
                <TableCell>{request.elementarySectionFrom}</TableCell>
                <TableCell>{request.elementarySectionTo}</TableCell>
                <TableCell>{request.sigElementarySectionFrom}</TableCell>
                <TableCell>{request.sigElementarySectionTo}</TableCell>
                <TableCell>{request.otherLinesAffected}</TableCell>
                <TableCell>{request.selectedDepo}</TableCell>
                <TableCell>
                  {request.action === "none" ? (
                    <div className=" flex justify-around">
                      <button
                        className="bg-green-500 text-white p-1 rounded-lg mr-3"
                        onClick={() => optimisedYesHandler(request)}
                      >
                        Yes
                      </button>
                      <button
                        className="bg-red-500 text-white p-1 rounded-lg mr-3"
                        onClick={() => optimisedNoHandler(request)}
                      >
                        No
                      </button>
                    </div>
                  ) : request.action === "Accepted" ? (
                    <span>Accepted ✅</span>
                  ) : (
                    <span>Rejected❌ {request.remarks}</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={23} align="center">
                No requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
    </TableContainer>
  );
}
