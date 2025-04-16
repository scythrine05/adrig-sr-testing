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
  IconButton,
  Popover,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { CSVLink } from "react-csv";

import { setOptimised } from "../../actions/user";
import EditOptimised from "./EditOptimised";
import {
  getDataOptimised,
  updateFinalStatus,
  updateAdSavedStatus,
  deleteOptimizedDataByRequestId,
} from "../../actions/optimisetable";

import { updateRequestsSanctionedStatus } from "../../actions/formdata";
import { capitalizeFirstLetter } from "../../../lib/utils";

// Helper function to get week dates
const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate the date of Monday (start of week)
  const monday = new Date(now);
  monday.setDate(
    now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7
  );
  monday.setHours(0, 0, 0, 0);

  // Calculate the date of Sunday (end of week)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday,
    end: sunday,
    weekLabel: `Week ${weekOffset === 0
      ? "(Current)"
      : weekOffset > 0
        ? "+" + weekOffset
        : weekOffset
      }`,
  };
};

// Format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const SearchForm = () => {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentReq, setCurrentReq] = useState([]);
  const [update, setUpdate] = useState(true);
  const [edit, setEdit] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const [showAvailedColumn, setShowAvailedColumn] = useState(false);

  const [rejectedRequests, setRejectedRequests] = useState([]);

  //Filtering states
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState("");

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getDataOptimised();
        console.log(
          "Optimised requests:",
          res.result.map((req) => ({ id: req.requestId, final: req.final }))
        );
        setAllRequests(res.result);

        // Check if any request has adSaved="yes"
        const hasAdSavedYes = res.result.some((request) => {
          const adSavedValue = request.adSaved;
          console.log(
            `RequestID ${request.requestId} has adSaved value: "${adSavedValue}"`
          );
          return (
            adSavedValue &&
            adSavedValue.toString().toLowerCase().trim() === "yes"
          );
        });

        console.log("Has any request with adSaved=yes?", hasAdSavedYes);
        setShowAvailedColumn(hasAdSavedYes);

        // Filter requests for the selected week
        filterRequestsByWeek(res.result);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, [showPopup, update, weekOffset]);

  // Filter requests by week
  const filterRequestsByWeek = (requestData) => {
    if (!requestData) return;

    const filtered = requestData.filter((request) => {
      let requestDate;
      try {
        // Try to parse the date in various formats
        if (request.date) {
          if (request.date.includes("-")) {
            // Format: YYYY-MM-DD
            const [year, month, day] = request.date.split("-").map(Number);
            requestDate = new Date(year, month - 1, day);
          } else if (request.date.includes("/")) {
            // Format: MM/DD/YYYY or DD/MM/YYYY
            const parts = request.date.split("/").map(Number);
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

  //Filter Handler
  const handleFilterChange = (value) => {
    const newFilters = { ...filters };

    if (!newFilters[currentFilterColumn]) {
      newFilters[currentFilterColumn] = [value];
    } else if (newFilters[currentFilterColumn].includes(value)) {
      newFilters[currentFilterColumn] = newFilters[currentFilterColumn].filter(
        (item) => item !== value
      );
      if (newFilters[currentFilterColumn].length === 0) {
        delete newFilters[currentFilterColumn];
      }
    } else {
      newFilters[currentFilterColumn].push(value);
    }

    setFilters(newFilters);
  };

  const handleFilterClick = (event, columnName) => {
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnName);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const isOpen = Boolean(filterAnchorEl);
  const filterId = isOpen ? "filter-popover" : undefined;

  //Sort Handler
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  //Get Unique Values
  const getUniqueValues = (data, key) => {
    return [...new Set(data.map((item) => item[key] || ""))]
      .filter(Boolean)
      .sort();
  };

  //Filter and Sort Data
  const filteredAndSortedRequests = React.useMemo(() => {
    let result = [...filteredRequests];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length > 0) {
        result = result.filter((item) =>
          filters[key].includes(item[key] || "")
        );
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valueA = (a[sortConfig.key] || "").toString().toLowerCase();
        const valueB = (b[sortConfig.key] || "").toString().toLowerCase();

        if (valueA < valueB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [filteredRequests, filters, sortConfig]);

  const editRequestHandler = (request) => {
    setCurrentReq(request);
    setShowPopup(true);
  };

  const saveButtonHandler = async () => {
    try {
      // Normalize rejectedRequests by removing '-0' from the end of each requestId
      const normalizedRejectedRequests = rejectedRequests.map((requestId) => {
        const parts = requestId.split("-");
        if (parts[parts.length - 1] === "0") {
          parts.pop(); // Remove the last part if it's '0'
        }
        return parts.join("-"); // Rejoin the remaining parts
      });

      console.log(
        "Updating SanctionedStatus to 'R' for normalized rejected requests:",
        normalizedRejectedRequests
      );

      // Update SanctionedStatus to "R" for rejected requests
      if (normalizedRejectedRequests.length > 0) {
        const updateRejectedStatusResult = await updateRequestsSanctionedStatus(
          normalizedRejectedRequests,
          "R"
        );
        if (!updateRejectedStatusResult.success) {
          console.error(
            "Failed to update SanctionedStatus for rejected requests:",
            updateRejectedStatusResult.message
          );
          alert(
            "Failed to update SanctionedStatus for rejected requests. Please try again."
          );
          return;
        }
      }

      // Delete requests that are in the rejectedRequests array
      for (const requestId of rejectedRequests) {
        console.log(`Deleting request with ID: ${requestId}`);
        await deleteOptimizedDataByRequestId(requestId);
      }

      // Update final status for each request
      for (const request of filteredRequests) {
        if (!rejectedRequests.includes(request.requestId)) {
          console.log(
            `Updating final status for request ID: ${request.requestId}`
          );
          await updateFinalStatus(request.requestId);
        }
      }

      // Update adSaved status to "yes"
      console.log("Updating adSaved status to yes...");
      const adSavedResult = await updateAdSavedStatus();

      console.log("adSaved update result:", adSavedResult);

      if (adSavedResult.success) {
        console.log(
          `adSaved status updated to yes for ${adSavedResult.count} records`
        );
        // Show a visual confirmation to the user
        alert(
          `Save successful! adSaved status updated to "yes" for ${adSavedResult.count} records.`
        );
      } else {
        console.error(
          "Failed to update adSaved status:",
          adSavedResult.message
        );
        alert(
          "Warning: Failed to update adSaved status. Some features may not work as expected."
        );
      }

      // Clear rejectedRequests after processing
      setRejectedRequests([]);

      localStorage.setItem("sanctionTableVisible", "true");
      setUpdate(!update);
    } catch (error) {
      console.error("Error in saveButtonHandler:", error);
      alert("An error occurred while saving changes. Please try again.");
    }
  };

  const handleRejectRequest = (requestId, isRejected) => {
    setRejectedRequests((prev) =>
      isRejected ? [...prev, requestId] : prev.filter((id) => id !== requestId)
    );
  };

  const getFilterIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === "ascending" ? (
        <ArrowUpwardIcon fontSize="small" />
      ) : (
        <ArrowDownwardIcon fontSize="small" />
      );
    }
    return null;
  };

  if (showPopup) {
    return (
      <EditOptimised
        request={currentReq}
        setShowPopup={setShowPopup}
        handleRejectRequest={handleRejectRequest}
        rejectedRequests={rejectedRequests}
      />
    );
  } else {
    return (
      <>
        <Popover
          id={filterId}
          open={isOpen}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <div
            className="p-3 max-h-[300px] overflow-y-auto"
            style={{ minWidth: "200px" }}
          >
            <h4 className="text-sm font-medium mb-2">
              Filter by {currentFilterColumn}
            </h4>
            {currentFilterColumn &&
              getUniqueValues(filteredRequests, currentFilterColumn).map(
                (value) => (
                  <div key={value} className="my-1">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            filters[currentFilterColumn]?.includes(value) ||
                            false
                          }
                          onChange={() => handleFilterChange(value)}
                        />
                      }
                      label={value}
                    />
                  </div>
                )
              )}
          </div>
        </Popover>
        <div className="min-h-screen bg-gray-50">
          {/* Header Section */}
          <div className="bg-white shadow-md mt-14 md:mt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Traffic Admin Optimised Table
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    View and manage optimised requests
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={saveButtonHandler}
                    className="w-full sm:w-auto bg-slate-950 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-200 shadow-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    {isFullScreen ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 9L4 4m0 0l5-5M4 4h16m0 0l-5 5m5-5v16m0 0l-5-5m5 5l-5-5"
                          />
                        </svg>
                        Exit Full Screen
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                          />
                        </svg>
                        Full Screen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white md:bg-secondary m-auto md:m-10 rounded-sm pt-14 lg:pt-0 md:p-5 w-full md:w-[97%]">
            <div className="rounded-xl shadow-sm p-2 sm:p-6">
              {/* Week Selection */}
              <div className="mb-6 flex flex-wrap items-center justify-center space-x-4">
                <button
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="px-3 py-1 my-2 lg:my-0 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                >
                  &lt; Prev Week
                </button>

                <span className="px-4 py-2 my-2 lg:my-0 text-sm md:text-base bg-white border border-gray-300 rounded shadow">
                  {weekDates.weekLabel}: {formatDate(weekDates.start)} to{" "}
                  {formatDate(weekDates.end)}
                </span>

                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="px-3 py-1  my-2 lg:my-0 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
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

              {/* Desktop Table */}
              <div className="overflow-x-auto relative">
                <div
                  className={`hidden md:block ${isFullScreen ? "fixed inset-0 z-50 bg-white p-4" : ""
                    }`}
                >
                  {isFullScreen && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setIsFullScreen(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 9L4 4m0 0l5-5M4 4h16m0 0l-5 5m5-5v16m0 0l-5-5m5 5l-5-5"
                          />
                        </svg>
                        Exit Full Screen
                      </button>
                    </div>
                  )}
                  <div
                    className={`${isFullScreen ? "h-[calc(100vh-120px)] overflow-auto" : ""
                      }`}
                  >
                    <table className="w-full border-collapse border border-gray-300 mb-10">
                      <thead>
                        {/* First Row */}
                        <tr>
                          {[
                            {
                              id: "requestId",
                              label: "Request ID",
                              filterable: true,
                            },
                            {
                              id: "corridorType",
                              label: "Corridor Type",
                              filterable: true,
                            },
                            {
                              id: "date",
                              label: "Date of Request",
                              filterable: true,
                            },
                            {
                              id: "selectedDepartment",
                              label: "Department",
                              filterable: true,
                            },
                            {
                              id: "selectedSection",
                              label: "Major Section",
                              filterable: true,
                            },
                            { id: "missionBlock", label: "Block Section/Yard" },
                            {
                              id: "workType",
                              label: "Work Type Selected",
                              filterable: true,
                            },
                            { id: "workDescription", label: "Activity" },
                            {
                              id: "demandTime",
                              label: "Demand Time",
                              split: true,
                              children: [
                                { id: "demandTimeFrom", label: "From" },
                                { id: "demandTimeTo", label: "To" },
                              ],
                            },
                            {
                              id: "optimisedTime",
                              label: "Optimised Time",
                              split: true,
                              children: [
                                { id: "Optimisedtimefrom", label: "From" },
                                { id: "Optimisedtimeto", label: "To" },
                              ],
                            },
                            { id: "selectedLine", label: "Line Selected" },
                            {
                              id: "cautionRequired",
                              label: "Caution Required",
                            },
                            { id: "cautionSpeed", label: "Caution Speed" },
                            {
                              id: "cautionLocation",
                              label: "Caution Location",
                              split: true,
                              children: [
                                { id: "cautionLocationFrom", label: "From" },
                                { id: "cautionLocationTo", label: "To" },
                              ],
                            },
                            {
                              id: "workLocation",
                              label: "Work Location",
                              split: true,
                              children: [
                                { id: "workLocationFrom", label: "From" },
                                { id: "workLocationTo", label: "To" },
                              ],
                            },
                            {
                              id: "optimization_details",
                              label: "Optimization Details",
                            },
                            {
                              id: "sigDisconnection",
                              label: "S&T Disconnection",
                            },
                            {
                              id: "ohDisconnection",
                              label: "Power Block",
                            },
                            {
                              id: "elementarySection",
                              label: "Elementary Section",
                              split: true,
                              children: [
                                { id: "elementarySectionFrom", label: "From" },
                                { id: "elementarySectionTo", label: "To" },
                              ],
                            },
                            {
                              id: "otherLinesAffected",
                              label: "Other Lines Affected",
                            },
                            { id: "action", label: "Action", filterable: true },
                            { id: "remarks", label: "Remarks" },
                          ].map((column) =>
                            column.split ? (
                              <th
                                key={column.id}
                                colSpan={column.children.length}
                                className="border border-gray-300 bg-gray-50 text-center p-2"
                              >
                                {column.label}
                              </th>
                            ) : (
                              <th
                                key={column.id}
                                rowSpan={2}
                                className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer align-top"
                              >
                                <div className="flex items-center gap-1 justify-between">
                                  <div
                                    className="flex-grow"
                                    onClick={() => handleSort(column.id)}
                                  >
                                    {column.label}{" "}
                                    {getFilterIcon && getFilterIcon(column.id)}
                                  </div>
                                  {column.filterable && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) =>
                                        handleFilterClick(e, column.id)
                                      }
                                      className="p-0.5"
                                    >
                                      <FilterListIcon />
                                    </IconButton>
                                  )}
                                </div>
                              </th>
                            )
                          )}
                        </tr>

                        {/* Second Row - only for split columns */}
                        <tr>
                          {[
                            {
                              id: "demandTime",
                              children: [
                                { id: "demandTimeFrom", label: "From" },
                                { id: "demandTimeTo", label: "To" },
                              ],
                            },
                            {
                              id: "optimisedTime",
                              children: [
                                { id: "Optimisedtimefrom", label: "From" },
                                { id: "Optimisedtimeto", label: "To" },
                              ],
                            },
                            {
                              id: "cautionLocation",
                              children: [
                                { id: "cautionLocationFrom", label: "From" },
                                { id: "cautionLocationTo", label: "To" },
                              ],
                            },
                            {
                              id: "workLocation",
                              children: [
                                { id: "workLocationFrom", label: "From" },
                                { id: "workLocationTo", label: "To" },
                              ],
                            },
                            {
                              id: "elementarySection",
                              children: [
                                { id: "elementarySectionFrom", label: "From" },
                                { id: "elementarySectionTo", label: "To" },
                              ],
                            },
                          ].flatMap((column) =>
                            column.children.map((child) => (
                              <th
                                key={child.id}
                                className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer"
                              >
                                {child.label}
                              </th>
                            ))
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedRequests.length > 0 ? (
                          filteredAndSortedRequests.map((request) => (
                            <tr
                              key={request.requestId}
                              className="hover:bg-gray-50"
                            >
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.requestId}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {capitalizeFirstLetter(request.corridorType)}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.date}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.selectedDepartment}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.selectedSection}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.missionBlock}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.workType}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.workDescription}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.demandTimeFrom}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.demandTimeTo}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.Optimisedtimefrom}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.Optimisedtimeto}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.selectedLine}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.cautionRequired}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.cautionSpeed}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.cautionLocationFrom}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.cautionLocationTo}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.workLocationFrom}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.workLocationTo}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.optimization_details}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.sigDisconnection}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.ohDisconnection}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.elementarySectionFrom}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.elementarySectionTo}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.otherLinesAffected}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.action}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                {request.remarks}
                              </td>
                              <td className="border border-gray-300 p-3 whitespace-nowrap">
                                <button
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                  onClick={() => editRequestHandler(request)}
                                >
                                  Edit Request
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={27}
                              className="border border-gray-300 p-3"
                            >
                              No requests found for this week
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-px">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="bg-white mb-5 border border-gray-400 text-sm p-1"
                    >
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Request ID:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.requestId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Date of Request:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.date}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Department:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.selectedDepartment}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Section:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.selectedSection}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Block Section/Yard:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.stationID}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Selected Block:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.missionBlock}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Work Type:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.workType}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Work Description:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.workDescription}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Demand Time (From):
                          </strong>
                          <span className="border border-gray-300 p-2">{request.demandTimeFrom}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Demand Time (To):
                          </strong>
                          <span className="border border-gray-300 p-2">{request.demandTimeTo}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Line Selected:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.selectedLine}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Caution Required:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.cautionRequired}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Caution Speed:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.cautionSpeed}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Caution Location (From):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.cautionLocationFrom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Caution Location (To):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.cautionLocationTo}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Work Location (From):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.workLocationFrom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Work Location (To):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.workLocationTo}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Optimised Time (From):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.Optimisedtimefrom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Optimised Time (To):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.Optimisedtimeto}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Optimization Details:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.optimization_details}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            SIG Disconnection:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.sigDisconnection}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            OHE Disconnection:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.ohDisconnection}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Elementary Section (From):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.elementarySectionFrom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Elementary Section (To):
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.elementarySectionTo}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Other Lines Affected:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.otherLinesAffected}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Action:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.action === "none" ? (
                              "No Action Taken"
                            ) : request.action === "Accepted" ? (
                              <span>Accepted ✅</span>
                            ) : (
                              <span>Rejected❌ </span>
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Remarks:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.remarks === null || request.remarks === ""
                              ? "No Remarks"
                              : request.remarks}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Status:
                          </strong>
                          <span className="border border-gray-300 p-2">{request.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <strong className="border border-gray-300 p-2">
                            Availed:
                          </strong>
                          <span className="border border-gray-300 p-2">
                            {request.availed ? (
                              (() => {
                                let availedData;
                                try {
                                  availedData =
                                    typeof request.availed === "string"
                                      ? JSON.parse(request.availed)
                                      : request.availed;
                                } catch (e) {
                                  availedData = {
                                    status: "pending",
                                    reason: "",
                                  };
                                }

                                if (request.adSaved === "yes") {
                                  if (availedData.status === "yes") {
                                    return (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Availed ✅
                                        </span>
                                        {(availedData.fromTime ||
                                          availedData.toTime) && (
                                            <p className="text-sm text-gray-600 mt-1">
                                              From:{" "}
                                              {availedData.fromTime || "N/A"} -
                                              To: {availedData.toTime || "N/A"}
                                            </p>
                                          )}
                                      </div>
                                    );
                                  } else if (availedData.status === "no") {
                                    return (
                                      <div>
                                        <span className="text-red-600 font-medium">
                                          Not Availed ❌
                                        </span>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Reason: {availedData.reason}
                                        </p>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <span className="text-gray-600">
                                        Pending User Response
                                      </span>
                                    );
                                  }
                                } else {
                                  return (
                                    <span className="italic text-gray-600">
                                      Awaiting Finalization
                                    </span>
                                  );
                                }
                              })()
                            ) : request.adSaved === "yes" ? (
                              <span className="text-gray-600">
                                Pending User Response
                              </span>
                            ) : (
                              <span className="italic text-gray-600">
                                Awaiting Finalization
                              </span>
                            )}
                          </span>
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
                  <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm text-center">
                    No requests found for this week
                  </div>
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
                      "&:hover": {
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      },
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
      </>
    );
  }
};

export default SearchForm;
