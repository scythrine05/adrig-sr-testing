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
} from "../../actions/optimisetable";

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
    weekLabel: `Week ${
      weekOffset === 0
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
      // Update final status for each request
      for (const request of filteredRequests) {
        await updateFinalStatus(request.requestId);
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

      localStorage.setItem("sanctionTableVisible", "true");
      setUpdate(!update);
    } catch (error) {
      console.error("Error in saveButtonHandler:", error);
      alert("An error occurred while saving changes. Please try again.");
    }
  };

  if (showPopup) {
    return <EditOptimised request={currentReq} setShowPopup={setShowPopup} />;
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
          <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Optimised Table
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              {/* Week Selection */}
              <div className="mb-6 flex flex-wrap items-center justify-center space-x-4">
                <button
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                >
                  &lt; Prev Week
                </button>

                <span className="px-4 py-2 bg-white border border-gray-300 rounded shadow">
                  {weekDates.weekLabel}: {formatDate(weekDates.start)} to{" "}
                  {formatDate(weekDates.end)}
                </span>

                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
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
              <div
                className={`hidden md:block ${
                  isFullScreen ? "fixed inset-0 z-50 bg-white p-4" : ""
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
                  className={`${
                    isFullScreen ? "h-[calc(100vh-120px)] overflow-auto" : ""
                  }`}
                >
                  <TableContainer
                    component={Paper}
                    sx={{
                      marginTop: isFullScreen ? 0 : 2,
                      position: "relative",
                      maxHeight: isFullScreen ? "none" : 600,
                      border: "solid 1px #e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <Table
                      sx={{ minWidth: 800 }}
                      aria-label="request table"
                      stickyHeader
                    >
                      <TableHead>
                        <TableRow>
                          {[
                            {
                              id: "requestId",
                              label: "Request ID",
                              filterable: false,
                            },
                            {
                              id: "corridorType",
                              label: "Corridor Type",
                              filterable: false,
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
                            {
                              id: "missionBlock",
                              label: "Block Section",
                              filterable: false,
                            },
                            {
                              id: "workType",
                              label: "Work Type Selected",
                              filterable: true,
                            },
                            {
                              id: "workDescription",
                              label: "Activity",
                              filterable: false,
                            },
                            {
                              id: "demandTimeFrom",
                              label: "Demand Time (From)",
                              filterable: false,
                            },
                            {
                              id: "demandTimeTo",
                              label: "Demand Time (To)",
                              filterable: false,
                            },
                            {
                              id: "Optimisedtimefrom",
                              label: "Optimised Time (From)",
                              filterable: false,
                            },
                            {
                              id: "Optimisedtimeto",
                              label: "Optimised Time (To)",
                              filterable: false,
                            },
                            {
                              id: "selectedLine",
                              label: "Line Selected",
                              filterable: false,
                            },
                            {
                              id: "cautionRequired",
                              label: "Caution Required",
                              filterable: false,
                            },
                            {
                              id: "cautionSpeed",
                              label: "Caution Speed",
                              filterable: false,
                            },
                            {
                              id: "cautionLocationFrom",
                              label: "Caution Location (From)",
                              filterable: false,
                            },
                            {
                              id: "cautionLocationTo",
                              label: "Caution Location (To)",
                              filterable: false,
                            },
                            {
                              id: "workLocationFrom",
                              label: "Work Location (From)",
                              filterable: false,
                            },
                            {
                              id: "workLocationTo",
                              label: "Work Location (To)",
                              filterable: false,
                            },
                            {
                              id: "optimization_details",
                              label: "Optimization Details",
                              filterable: false,
                            },
                            {
                              id: "sigDisconnection",
                              label: "SIG Disconnection",
                              filterable: false,
                            },
                            {
                              id: "ohDisconnection",
                              label: "Power Block Disconnection",
                              filterable: false,
                            },
                            {
                              id: "elementarySectionFrom",
                              label: "Elementary Section (From)",
                              filterable: false,
                            },
                            {
                              id: "elementarySectionTo",
                              label: "Elementary Section (To)",
                              filterable: false,
                            },
                            {
                              id: "otherLinesAffected",
                              label: "Other Lines Affected",
                              filterable: false,
                            },
                            {
                              id: "action",
                              label: "Action",
                              filterable: false,
                            },
                            {
                              id: "remarks",
                              label: "Remarks",
                              filterable: false,
                            },
                          ].map((column) => (
                            <TableCell key={column.id}>
                              <div className="flex items-center justify-between">
                              <strong>{column.label}</strong>
                                {column.filterable && (
                                  <>
                                    <span
                                      onClick={() => handleSort(column.id)}
                                      className="cursor-pointer"
                                    >
                                      {sortConfig.key === column.id
                                        ? sortConfig.direction === "ascending"
                                          ? "▲"
                                          : "▼"
                                        : ""}
                                    </span>
                                    <IconButton
                                      size="small"
                                      onClick={(e) =>
                                        handleFilterClick(e, column.id)
                                      }
                                    >
                                      <FilterListIcon />
                                    </IconButton>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAndSortedRequests.length > 0 ? (
                          filteredAndSortedRequests.map((request) => (
                            <TableRow key={request.requestId}>
                              <TableCell>{request.requestId}</TableCell>
                              <TableCell>{request.corridorType}</TableCell>
                              <TableCell>{request.date}</TableCell>
                              <TableCell>
                                {request.selectedDepartment}
                              </TableCell>
                              <TableCell>{request.selectedSection}</TableCell>
                              <TableCell>{request.missionBlock}</TableCell>
                              <TableCell>{request.workType}</TableCell>
                              <TableCell>{request.workDescription}</TableCell>
                              <TableCell>{request.demandTimeFrom}</TableCell>
                              <TableCell>{request.demandTimeTo}</TableCell>
                              <TableCell>{request.Optimisedtimefrom}</TableCell>
                              <TableCell>{request.Optimisedtimeto}</TableCell>
                              <TableCell>{request.selectedLine}</TableCell>
                              <TableCell>{request.cautionRequired}</TableCell>
                              <TableCell>{request.cautionSpeed}</TableCell>
                              <TableCell>
                                {request.cautionLocationFrom}
                              </TableCell>
                              <TableCell>{request.cautionLocationTo}</TableCell>
                              <TableCell>{request.workLocationFrom}</TableCell>
                              <TableCell>{request.workLocationTo}</TableCell>
                              <TableCell>
                                {request.optimization_details}
                              </TableCell>
                              <TableCell>{request.sigDisconnection}</TableCell>
                              <TableCell>{request.ohDisconnection}</TableCell>
                              <TableCell>
                                {request.elementarySectionFrom}
                              </TableCell>
                              <TableCell>
                                {request.elementarySectionTo}
                              </TableCell>
                              <TableCell>
                                {request.otherLinesAffected}
                              </TableCell>
                              <TableCell>{request.action}</TableCell>
                              <TableCell>{request.remarks}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={27} align="center">
                              No requests found for this week
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden mt-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="bg-white border border-gray-200 p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Request ID:
                          </strong>
                          <span className="pl-2">{request.requestId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Date of Request:
                          </strong>
                          <span className="pl-2">{request.date}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Department:
                          </strong>
                          <span className="pl-2">
                            {request.selectedDepartment}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Section:
                          </strong>
                          <span className="pl-2">
                            {request.selectedSection}
                          </span>
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
                            Work Description:
                          </strong>
                          <span className="pl-2">
                            {request.workDescription}
                          </span>
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
                            <span className="pl-2">
                              {request.cautionRequired}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <strong className="text-right pr-2 border-r border-gray-200">
                              Caution Speed:
                            </strong>
                            <span className="pl-2">{request.cautionSpeed}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <strong className="text-right pr-2 border-r border-gray-200">
                              Caution Location (From):
                            </strong>
                            <span className="pl-2">
                              {request.cautionLocationFrom}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <strong className="text-right pr-2 border-r border-gray-200">
                              Caution Location (To):
                            </strong>
                            <span className="pl-2">
                              {request.cautionLocationTo}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <strong className="text-right pr-2 border-r border-gray-200">
                              Work Location (From):
                            </strong>
                            <span className="pl-2">
                              {request.workLocationFrom}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <strong className="text-right pr-2 border-r border-gray-200">
                              Work Location (To):
                            </strong>
                            <span className="pl-2">
                              {request.workLocationTo}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Optimised Time (From):
                          </strong>
                          <span className="pl-2">
                            {request.Optimisedtimefrom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Optimised Time (To):
                          </strong>
                          <span className="pl-2">
                            {request.Optimisedtimeto}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Optimization Details:
                          </strong>
                          <span className="pl-2">
                            {request.optimization_details}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            SIG Disconnection:
                          </strong>
                          <span className="pl-2">
                            {request.sigDisconnection}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            OHE Disconnection:
                          </strong>
                          <span className="pl-2">
                            {request.ohDisconnection}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Elementary Section (From):
                          </strong>
                          <span className="pl-2">
                            {request.elementarySectionFrom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Elementary Section (To):
                          </strong>
                          <span className="pl-2">
                            {request.elementarySectionTo}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Other Lines Affected:
                          </strong>
                          <span className="pl-2">
                            {request.otherLinesAffected}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Action:
                          </strong>
                          <span className="pl-2">
                            {request.action === "none" ? (
                              "No Action Taken"
                            ) : request.action === "Accepted" ? (
                              <span>Accepted ✅</span>
                            ) : (
                              <span>Rejected❌ </span>
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Remarks:
                          </strong>
                          <span className="pl-2">
                            {request.remarks === null || request.remarks === ""
                              ? "No Remarks"
                              : request.remarks}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Status:
                          </strong>
                          <span className="pl-2">{request.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                          <strong className="text-right pr-2 border-r border-gray-200">
                            Availed:
                          </strong>
                          <span className="pl-2">
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
