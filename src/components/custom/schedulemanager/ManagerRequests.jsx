"use client";
import { postFormData, postFormManagerData } from "../../../app/actions/formdata";
import {
  deleteStagingFormData,
  getStagingFormDataByDepartment,
  updateStagingFormData,
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
  weekOffset,
  setWeekOffset,
  weekDates,
  toggleSelectAll
}) => {
  // Add console logging to debug requests
  console.log('All Requests:', requests);
  console.log('Week Date Range:', {start: weekDates.start, end: weekDates.end});
  console.log('Selected User:', selectedUser);

  // Filter requests by user and week, exclude archived requests
  const filteredRequests = requests.filter(request => {
    // Handle various date formats
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
    
    const isInSelectedWeek = requestDate >= weekDates.start && requestDate <= weekDates.end;
    const isMatchingUser = !selectedUser || request.userId === selectedUser;
    const isNotArchived = request.archived !== true;
    
    // Debug info for each request
    console.log(`Request ${request.requestId} filtering:`, {
      date: request.date,
      requestDate,
      isInSelectedWeek,
      isMatchingUser,
      isNotArchived,
      archived: request.archived,
      result: isInSelectedWeek && isMatchingUser && isNotArchived
    });
    
    return isInSelectedWeek && isMatchingUser && isNotArchived;
  });

  console.log('Filtered Requests:', filteredRequests);

  // Check if all filtered requests are selected
  const areAllSelected = filteredRequests.length > 0 && 
                        selectedRequests.length === filteredRequests.length;

  return (
    <div className="request-list h-screen p-4 md:p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 text-center">
        Summary of Block Requesitions
      </h2>

      {/* Week Selection */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2">
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
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none ml-2"
            >
              Current Week
            </button>
          )}
        </div>
      </div>

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
    No Requests to Show for This Week
  </h1>
) : (
  <div className="w-full max-w-5xl mx-auto">
    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="table-auto w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal text-center">
            <th className="px-4 py-3">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={areAllSelected}
                  onChange={() => toggleSelectAll(filteredRequests)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">All</span>
              </div>
            </th>
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
      {/* Mobile Select All option */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <input
          type="checkbox"
          checked={areAllSelected}
          onChange={() => toggleSelectAll(filteredRequests)}
          className="form-checkbox h-5 w-5 text-blue-600 mr-2"
        />
        <label className="font-medium">Select All Requests</label>
      </div>
      
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
  // Get status from ManagerResponse if it exists
  const requestStatus = request.ManagerResponse ? 
    (request.ManagerResponse === "yes" ? "Approved" : "Rejected") : 
    "Pending";
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Request Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Request Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Request ID:</div>
            <div>{request.requestId}</div>
            
            <div className="font-medium">Date of Block Request:</div>
            <div>{request.date}</div>
            
            <div className="font-medium">Department:</div>
            <div>{request.selectedDepartment}</div>
            
            <div className="font-medium">MajorSection:</div>
            <div>{request.selectedSection}</div>
            
            <div className="font-medium">Status:</div>
            <div className={request.ManagerResponse === "yes" ? "text-green-600 font-semibold" : 
                              request.ManagerResponse === "no" ? "text-red-600 font-semibold" : 
                              "text-yellow-600 font-semibold"}>
              {requestStatus}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Work Details</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Work Type:</div>
            <div>{request.workType}</div>
            
            <div className="font-medium">Activity:</div>
            <div>{request.workDescription}</div>
            
            <div className="font-medium">Block:</div>
            <div>{request.missionBlock}</div>
            
            <div className="font-medium">Line:</div>
            <div>{request.selectedLine?.toString() || "N/A"}</div>
            
            <div className="font-medium">Time From:</div>
            <div>{request.demandTimeFrom}</div>
            
            <div className="font-medium">Time To:</div>
            <div>{request.demandTimeTo}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={onBack}
          className="bg-white text-black px-4 py-2 rounded-lg shadow hover:bg-zinc-500 hover:text-white focus:ring focus:ring-red-300"
        >
          Go Back
        </button>
        
        {/* Only show edit/cancel/confirm buttons if the request is pending */}
        {!request.ManagerResponse && (
          <>
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
              Reject Request
            </button>
            <button
              onClick={() => onConfirm(request)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 focus:ring focus:ring-green-300"
            >
              Approve Request
            </button>
          </>
        )}
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
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const { data: session, status } = useSession();
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching data for department:", id.toUpperCase());
        const formDataResponse = await getStagingFormDataByDepartment(
          id.toUpperCase()
        );
        console.log("Staging requests:", formDataResponse);

        const ManagerId = await getManagerId(session?.user?.email);
        console.log("Manager ID:", ManagerId);

        const userIdUnderManager = await getUserUnderManager(ManagerId);
        console.log("Users under manager:", userIdUnderManager);

        // Log each request with detailed information
        formDataResponse?.forEach((request, index) => {
          console.log(`Request ${index + 1}:`, {
            requestId: request.requestId,
            userId: request.userId,
            managerId: request.managerId,
            department: request.selectedDepartment,
            depot: request.selectedDepo,
            userInfo: request.User,
            managerInfo: request.Manager
          });
        });

        // Enhanced filtering with detailed logging
        const filteredRequests = formDataResponse?.filter((request) => {
          const isUserUnderManager = request?.userId && userIdUnderManager?.includes(request?.userId);
          const isManagerRequest = request?.managerId === ManagerId;
          const isLegacyRequest = request?.userId == null && request?.managerId == null;
          
          console.log(`Request ${request.requestId} filtering:`, {
            isUserUnderManager,
            isManagerRequest,
            isLegacyRequest,
            result: isUserUnderManager || isManagerRequest || isLegacyRequest
          });
          
          return isUserUnderManager || isManagerRequest || isLegacyRequest;
        });
        
        console.log("Filtered requests:", filteredRequests);

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
    if (session?.user?.email) {
      fetchData();
    }
  }, [id, session, status]);

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Add the new toggleSelectAll function
  const toggleSelectAll = (filteredRequests) => {
    if (selectedRequests.length === filteredRequests.length) {
      // If all are selected, unselect all
      setSelectedRequests([]);
    } else {
      // Otherwise, select all
      const allRequestIds = filteredRequests.map(request => request.requestId);
      setSelectedRequests(allRequestIds);
    }
  };

  const handleSubmitSelected = async () => {
    try {
      for (const requestId of selectedRequests) {
        const request = requests.find((req) => req.requestId === requestId);
        
        // Add ManagerResponse field set to "yes" when submitting/confirming
        request.ManagerResponse = "yes";
        
        if (request.userId == null) {
          await postFormManagerData(request);
        } else {
          await postFormData(request);
        }
        await deleteStagingFormData(requestId);
      }

      // Refresh requests with proper id from session
      const stagingData = await getStagingFormDataByDepartment(id.toUpperCase());
      setRequests(stagingData);
      
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
      // Set ManagerResponse to "no" when canceling a request
      const request = requests.find((req) => req.requestId === requestId);
      if (request) {
        request.ManagerResponse = "no";
        await updateStagingFormData(request, requestId);
      }
      
      await deleteStagingFormData(requestId);
      
      // Refresh requests with proper id from session
      const stagingData = await getStagingFormDataByDepartment(id.toUpperCase());
      setRequests(stagingData);
      
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error cancelling request:", error);
    }
  };
  const handleCancelSelected = async () => {
    try {
      for (const requestId of selectedRequests) {
        // Set ManagerResponse to "no" when canceling selected requests
        const request = requests.find((req) => req.requestId === requestId);
        if (request) {
          request.ManagerResponse = "no";
          await updateStagingFormData(request, requestId);
        }
        
        await deleteStagingFormData(requestId);
      }
      
      // Refresh requests with proper id from session
      const stagingData = await getStagingFormDataByDepartment(id.toUpperCase());
      setRequests(stagingData);
      
      setSelectedRequests([]);
    } catch (error) {
      console.error("Error canceling selected requests:", error);
    }
  };

  const handleConfirmRequest = async (request) => {
    try {
      // Add ManagerResponse field set to "yes" when confirming
      request.ManagerResponse = "yes";
      
      if (request.userId == null) {
        await postFormManagerData(request);
      } else {
        await postFormData(request);
      }
      await deleteStagingFormData(request.requestId);
      
      // Refresh requests with proper id from session
      const stagingData = await getStagingFormDataByDepartment(id.toUpperCase());
      setRequests(stagingData);
      
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
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          weekDates={weekDates}
          toggleSelectAll={toggleSelectAll}
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