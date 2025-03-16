"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import currentUser, { getUserId } from "../../../app/actions/user";
import {
  postDataOptimised,
  currentOptimizedData,
} from "../../../app/actions/optimisetable";

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
    <div className="container min-w-full p-4">
      {/* Table for Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Request ID</th>
              <th className="p-3 text-left">Date of Block Request</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Major Section</th>
              <th className="p-3 text-left">Block Section</th>
              <th className="p-3 text-left">Selected Block</th>
              <th className="p-3 text-left">Work Type</th>
              <th className="p-3 text-left">Activity</th>
              <th className="p-3 text-left">Line Selected</th>
              <th className="p-3 text-left">Caution Required</th>
              <th className="p-3 text-left">Caution Speed</th>
              <th className="p-3 text-left">Approximate Caution Location (From)</th>
              <th className="p-3 text-left">Approximate Caution Location (To)</th>
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
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={29} className="p-3 text-center">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table for Mobile */}
      <div className="block md:hidden">
        {requests.length > 0 ? (
          requests.map((request) => (
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
                    Date of Block Request:
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
                    Major Section:
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
                    Work Type:
                  </strong>
                  <span className="pl-2">{request.workType}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                  <strong className="text-right pr-2 border-r border-gray-200">
                    Activity:
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
                    Approximate Caution Location (From):
                  </strong>
                  <span className="pl-2">{request.cautionLocationFrom}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                  <strong className="text-right pr-2 border-r border-gray-200">
                    Approximate Caution Location (To):
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
                    Power Block Disconnection:
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
                <div className="pt-2">
                  <strong>Accept The Optimised Requests:</strong>
                  {request.action === "none" ? (
                    <div className="flex justify-around mt-2">
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
}
