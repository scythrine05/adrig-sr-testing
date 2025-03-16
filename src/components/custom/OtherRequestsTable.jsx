import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { getOtherRequests, updateSigResponse, updateOheResponse } from "../../app/actions/otherRequests";

export default function OtherRequestsTable({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    requestId: null,
    response: null,
    responseType: null
  });

  useEffect(() => {
    const fetchOtherRequests = async () => {
      try {
        console.log("Fetching other requests for user:", {
          department: user.department,
          depot: user.depot,
          id: user.id,
          name: user.name
        });
        
        if (!user.department || !user.depot) {
          console.error("User is missing department or depot:", user);
          setError("User is missing department or depot");
          setLoading(false);
          return;
        }
        
        const data = await getOtherRequests(user.department, user.depot);
        console.log("Received other requests:", data);
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid data received:", data);
          setError("Invalid data received from server");
          setLoading(false);
          return;
        }

        data.forEach((req, index) => {
          console.log(`Request ${index + 1}:`, {
            requestId: req.requestId,
            department: req.selectedDepartment,
            depo: req.selectedDepo,
            sigDisconnection: req.sigDisconnection,
            oheDisconnection: req.oheDisconnection,
            ohDisconnection: req.ohDisconnection
          });
        });
        
        setRequests(data);
      } catch (error) {
        console.error("Error fetching other requests:", error);
        setError("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOtherRequests();
    }
  }, [user]);

  const handleSigResponse = async (requestId, response) => {
    try {
      console.log(`Updating SIG response for request ${requestId} to ${response}`);
      await updateSigResponse(requestId, response);
      
      setRequests(
        requests.map((req) =>
          req.requestId === requestId
            ? { ...req, sigResponse: response }
            : req
        )
      );
      
      console.log("SIG response updated successfully");
    } catch (error) {
      console.error("Error updating SIG response:", error);
    }
  };

  const handleOheResponse = async (requestId, response) => {
    try {
      console.log(`Updating OHE response for request ${requestId} to ${response}`);
      await updateOheResponse(requestId, response);
      
      setRequests(
        requests.map((req) =>
          req.requestId === requestId
            ? { ...req, oheResponse: response }
            : req
        )
      );
      
      console.log("OHE response updated successfully");
    } catch (error) {
      console.error("Error updating OHE response:", error);
    }
  };

  const openConfirmDialog = (requestId, response, responseType) => {
    setConfirmDialog({
      open: true,
      requestId,
      response,
      responseType
    });
  };

  const handleConfirmResponse = () => {
    const { requestId, response, responseType } = confirmDialog;
    
    if (responseType === 'sig') {
      handleSigResponse(requestId, response);
    } else if (responseType === 'ohe') {
      handleOheResponse(requestId, response);
    }
    
    setConfirmDialog({
      open: false,
      requestId: null,
      response: null,
      responseType: null
    });
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      requestId: null,
      response: null,
      responseType: null
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold">Debug Info</h3>
        <p>Department: {user.department}</p>
        <p>Depot: {user.depot}</p>
        <p>Found Requests: {requests.length}</p>
      </div>
      
      {(user.department === "SIG" || user.department === "TRD") && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            <span className="mr-2">⚠️</span>
            Important: Once you accept or reject a request, your decision is final and cannot be changed.
          </p>
        </div>
      )}
      
      <TableContainer sx={{ position: "relative", maxHeight: 500 }} component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="other requests table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Request ID</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Section</strong></TableCell>
              <TableCell><strong>Station ID</strong></TableCell>
              <TableCell><strong>Work Type</strong></TableCell>
              <TableCell><strong>SIG Disconnection</strong></TableCell>
              <TableCell><strong>OHE Disconnection</strong></TableCell>
              <TableCell><strong>Depo</strong></TableCell>
              <TableCell><strong>SIG Response</strong></TableCell>
              <TableCell><strong>OHE Response</strong></TableCell>
              {user.department === "SIG" && (
                <TableCell><strong>SIG Actions</strong></TableCell>
              )}
              {user.department === "TRD" && (
                <TableCell><strong>TRD Actions</strong></TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((request) => {
                const needsTrdApproval = request.oheDisconnection?.toLowerCase() === "yes" || request.ohDisconnection?.toLowerCase() === "yes";
                const needsSigApproval = request.sigDisconnection?.toLowerCase() === "yes";
                
                return (
                  <TableRow 
                    key={request.requestId}
                    sx={{ 
                      backgroundColor: 
                        (user.department === "TRD" && needsTrdApproval && !request.oheResponse) ? 
                          "rgba(255, 244, 229, 0.5)" :  // Needs TRD attention
                        (user.department === "SIG" && needsSigApproval && !request.sigResponse) ? 
                          "rgba(229, 246, 253, 0.5)" :  // Needs SIG attention
                        (user.department === "TRD" && needsTrdApproval && request.oheResponse) ?
                          "rgba(236, 253, 245, 0.4)" :  // TRD responded
                        (user.department === "SIG" && needsSigApproval && request.sigResponse) ?
                          "rgba(236, 253, 245, 0.4)" :  // SIG responded
                          "inherit" 
                    }}
                  >
                    <TableCell>{request.requestId}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.selectedDepartment}</TableCell>
                    <TableCell>{request.selectedSection}</TableCell>
                    <TableCell>{request.stationID}</TableCell>
                    <TableCell>{request.workType}</TableCell>
                    <TableCell>{request.sigDisconnection}</TableCell>
                    <TableCell>{request.oheDisconnection || request.ohDisconnection || "No"}</TableCell>
                    <TableCell>{request.selectedDepo}</TableCell>
                    <TableCell>
                      {request.sigResponse ? (
                        <span className={`font-medium ${request.sigResponse === "yes" ? "text-green-600" : "text-red-600"}`}>
                          {request.sigResponse === "yes" ? "Accepted" : "Rejected"}
                        </span>
                      ) : (
                        needsSigApproval ? (
                          <span className="text-amber-600">Pending</span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {request.oheResponse ? (
                        <span className={`font-medium ${request.oheResponse === "yes" ? "text-green-600" : "text-red-600"}`}>
                          {request.oheResponse === "yes" ? "Accepted" : "Rejected"}
                        </span>
                      ) : (
                        needsTrdApproval ? (
                          <span className="text-amber-600">Pending</span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )
                      )}
                    </TableCell>
                    {user.department === "SIG" && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {request.sigResponse ? (
                            <span className="text-blue-600 font-medium">
                              Response: {request.sigResponse === "yes" ? "Accepted" : "Rejected"}
                            </span>
                          ) : (
                            <>
                              <button
                                className="bg-green-500 text-white px-3 py-1 rounded"
                                onClick={() => openConfirmDialog(request.requestId, "yes", "sig")}
                                disabled={!needsSigApproval}
                              >
                                Accept
                              </button>
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded"
                                onClick={() => openConfirmDialog(request.requestId, "no", "sig")}
                                disabled={!needsSigApproval}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {user.department === "TRD" && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {request.oheResponse ? (
                            <span className="text-blue-600 font-medium">
                              Response: {request.oheResponse === "yes" ? "Accepted" : "Rejected"}
                            </span>
                          ) : (
                            <>
                              {needsTrdApproval ? (
                                <>
                                  <button
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                    onClick={() => openConfirmDialog(request.requestId, "yes", "ohe")}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                    onClick={() => openConfirmDialog(request.requestId, "no", "ohe")}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-500">No action needed</span>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={user.department === "SIG" || user.department === "TRD" ? 12 : 11} align="center">
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Your Response"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to {confirmDialog.response === "yes" ? "accept" : "reject"} this request? 
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmResponse} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Confirm {confirmDialog.response === "yes" ? "Accept" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 