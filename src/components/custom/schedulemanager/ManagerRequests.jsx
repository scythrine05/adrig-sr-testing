"use client";
import { postFormData, postFormManagerData } from "../../../app/actions/formdata";
import {
  deleteStagingFormData,
  getStagingFormDataByDepartment,
} from "../../../app/actions/stagingform";
import React, { useEffect, useState } from "react";
import EditRequest from "../EditRequest";
import {
  getManagerId,
  getUserById,
  getUserByName,
  getUserId,
  getUserName,
  getUsersByDept,
  getUserUnderManager,
} from "../../../app/actions/user";
import { useSession } from "next-auth/react";

const RequestList = ({
  requests,
  onSelectRequest,
  users,
  selectedUser,
  setSelectedUser,
  selectedRequests,
  toggleRequestSelection,
  handleSubmitSelected,
  handleCancelSelected,
}) => {
  const filteredRequests = selectedUser
    ? requests.filter((request) => request.userId !== selectedUser)
    : requests;

  return (
    <div className="request-list h-screen p-4 md:p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 text-center">
        Request Table
      </h2>

      {/* User Filter */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <label htmlFor="userFilter" className="font-medium text-gray-700">
          Filter by User:
        </label>
        <select
          id="userFilter"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full md:w-2/5 px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Request Table */}
      {filteredRequests.length === 0 ? (
  <h1 className="p-4 md:p-10 text-center w-full max-w-5xl mx-auto bg-white rounded-lg overflow-hidden shadow">
    No Requests to Show
  </h1>
) : (
  <div className="w-full max-w-5xl mx-auto">
    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="table-auto w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal text-center">
            <th className="px-4 py-3"></th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Depo/SSE</th>
            <th className="px-4 py-3">Mission Block</th>
            <th className="px-4 py-3">DemandTime From</th>
            <th className="px-4 py-3">DemandTime To</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm font-medium">
          {filteredRequests.map((request) => (
            <tr
              key={request.requestId}
              className="border-b hover:bg-gray-100 transition-colors"
            >
              <td className="px-4 py-4 text-center align-middle">
                <input
                  type="checkbox"
                  checked={selectedRequests.includes(request.requestId)}
                  onChange={() => toggleRequestSelection(request.requestId)}
                />
              </td>
              <td className="px-4 py-4 text-center align-middle">
                {request.date}
              </td>
              <td className="px-4 py-4 text-center align-middle">
                {request.selectedDepo}
              </td>
              <td className="px-4 py-4 text-center align-middle">
                {request.missionBlock}
              </td>
              <td className="px-4 py-4 text-center align-middle">
                {request.demandTimeFrom}
              </td>
              <td className="px-4 py-4 text-center align-middle">
                {request.demandTimeTo}
              </td>
              <td className="px-4 py-4 text-center align-middle">
                <button
                  onClick={() => onSelectRequest(request)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:ring focus:ring-blue-300"
                >
                  View Request
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Layout (Vertical Cards) */}
    <div className="md:hidden space-y-4">
      {filteredRequests.map((request) => (
        <div
          key={request.requestId}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <input
              type="checkbox"
              checked={selectedRequests.includes(request.requestId)}
              onChange={() => toggleRequestSelection(request.requestId)}
              className="mr-2"
            />
            <button
              onClick={() => onSelectRequest(request)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              View Request
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Date:</span> {request.date}
            </div>
            <div>
              <span className="font-medium">Depo/SSE:</span> {request.selectedDepo}
            </div>
            <div>
              <span className="font-medium">Mission Block:</span> {request.missionBlock}
            </div>
            <div>
              <span className="font-medium">DemandTime From:</span> {request.demandTimeFrom}
            </div>
            <div>
              <span className="font-medium">DemandTime To:</span> {request.demandTimeTo}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Submit Selected Requests */}
      <div className="mt-4 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={handleSubmitSelected}
          disabled={selectedRequests.length === 0}
          className={`px-6 py-2 rounded-lg shadow ${
            selectedRequests.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 focus:ring focus:ring-green-300"
          }`}
        >
          Submit Selected
        </button>

        <button
          onClick={handleCancelSelected}
          disabled={selectedRequests.length === 0}
          className={`px-6 py-2 rounded-lg shadow ${
            selectedRequests.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700 focus:ring focus:ring-red-300"
          }`}
        >
          Cancel Selected
        </button>
      </div>
    </div>
  );
};

const RequestDetails = ({ request, onBack, onCancel, onConfirm, onEdit }) => {
  return (
    <div className="request-details p-4 md:p-6 bg-gray-100 rounded-lg shadow-lg w-full">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 text-center">
        Request Details
      </h2>
      <div className="flex items-center mb-6 justify-end">
        <button
          onClick={onBack}
          className="bg-white text-black px-4 py-2 rounded-lg shadow hover:bg-zinc-500 hover:text-white focus:ring focus:ring-red-300"
        >
          Go Back
        </button>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <ul className="divide-y divide-gray-200">
          {Object.entries(request).map(([key, value]) => (
            <li key={key} className="py-2">
              <span className="font-medium text-gray-700 capitalize">
                {key}:
              </span>{" "}
              <span className="text-gray-600">
                {typeof value === "object" && value !== null ? (
                  Array.isArray(value) ? (
                    <ul className="list-disc pl-5">
                      {value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc pl-5">
                      {Object.entries(value).map(([k, v]) => (
                        <li key={k}>
                          <span className="font-medium">{k}:</span> {v}
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  value || "N/A"
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={onBack}
          className="bg-white text-black px-4 py-2 rounded-lg shadow hover:bg-zinc-500 hover:text-white focus:ring focus:ring-red-300"
        >
          Go Back
        </button>
        <button
          onClick={onEdit}
          className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-slate-700 hover:text-white focus:ring focus:ring-red-300"
        >
          Edit Request
        </button>
        <button
          onClick={() => onCancel(request.requestId)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 focus:ring focus:ring-red-300"
        >
          Cancel Request
        </button>
        <button
          onClick={() => onConfirm(request)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 focus:ring focus:ring-green-300"
        >
          Confirm Request
        </button>
      </div>
    </div>
  );
};

const ManagerRequests = ({ id }) => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRequests, setSelectedRequests] = useState([]);

  const { data: session, status } = useSession();
  useEffect(() => {
    async function fetchData() {
      try {
        const formDataResponse = await getStagingFormDataByDepartment(
          id.toUpperCase()
        );

        const ManagerId = await getManagerId(session?.user?.email);

        const userIdUnderManager = await getUserUnderManager(ManagerId);

        const filteredRequests = formDataResponse?.filter(
          (e) => userIdUnderManager?.includes(e?.userId) || e?.userId == null
        );

        const userResponses = await Promise.all(
          userIdUnderManager.map((userId) => getUserById(userId))
        );

        const userList = userResponses.map((user) => ({
          id: user.id,
          name: user.name,
        }));

        setUsers(userList);
        setRequests(filteredRequests);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [id, status]);

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSubmitSelected = async () => {
    try {
      for (const requestId of selectedRequests) {
        const request = requests.find((req) => req.requestId === requestId);
        if (request.userId == null) {
          await postFormManagerData(request);
        } else {
          await postFormData(request);
        }
        await deleteStagingFormData(requestId);
      }

      setRequests((prev) =>
        prev.filter((req) => !selectedRequests.includes(req.requestId))
      );
      setSelectedRequests([]);
    } catch (error) {
      console.error("Error submitting selected requests:", error);
    }
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
  };

  const handleEditRequest = () => {
    setIsEditing(true);
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await deleteStagingFormData(requestId);
      setRequests((prev) => prev.filter((req) => req.requestId !== requestId));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error cancelling request:", error);
    }
  };
  const handleCancelSelected = async () => {
    try {
      for (const requestId of selectedRequests) {
        await deleteStagingFormData(requestId);
      }
      setRequests((prev) =>
        prev.filter((req) => !selectedRequests.includes(req.requestId))
      );
      setSelectedRequests([]);
    } catch (error) {
      console.error("Error canceling selected requests:", error);
    }
  };

  const handleConfirmRequest = async (request) => {
    try {
      if (request.userId == null) {
        await postFormManagerData(request);
      } else {
        await postFormData(request);
      }
      await deleteStagingFormData(request.requestId);
      setRequests((prev) =>
        prev.filter((req) => req.requestId !== request.requestId)
      );
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error confirming request:", error);
    }
  };

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setSelectedRequest(null);
    }
  };

  return (
    <div className="request-manager max-w-90 mx-auto my-10 p-4 md:p-6 bg-gray-50 rounded-lg shadow">
      {!selectedRequest && !isEditing && (
        <RequestList
          requests={requests}
          onSelectRequest={handleSelectRequest}
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedRequests={selectedRequests}
          toggleRequestSelection={toggleRequestSelection}
          handleSubmitSelected={handleSubmitSelected}
          handleCancelSelected={handleCancelSelected}
        />
      )}
      {selectedRequest && !isEditing && (
        <RequestDetails
          request={selectedRequest}
          onBack={handleBack}
          onCancel={handleCancelRequest}
          onConfirm={handleConfirmRequest}
          onEdit={handleEditRequest}
        />
      )}
      {isEditing && selectedRequest && (
        <EditRequest
          request={selectedRequest}
          setShowPopup={setIsEditing}
          flag={true}
        />
      )}
    </div>
  );
};

export default ManagerRequests;