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
  Popover,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { getDataOptimised } from "../../actions/optimisetable";
import FilterListIcon from "@mui/icons-material/FilterList";

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
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  //Filter States
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
        setAllRequests(res.result);
        // Filter requests for the selected week
        filterRequestsByWeek(res.result);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, [weekOffset]);

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

  //Filtered and Sorted Requests
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

  const isOpen = Boolean(filterAnchorEl);
  const filterId = isOpen ? "filter-popover" : undefined;

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
                          filters[currentFilterColumn]?.includes(value) || false
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

      <div className="bg-secondary p-4 rounded-xl m-10">
        <div className="flex justify-between">
          <h1 className="font-bold text-3xl mt-10">
            Traffic Admin Sanctioned Table
          </h1>
        </div>

        {/* Week Selection */}
        <div className="mb-6 flex flex-wrap items-center justify-center space-x-4 mt-4">
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

        {/* Table Container */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border-collapse border border-gray-300 mb-10">
            <thead>
              {/* First Row */}
              <tr>
                {[
                  { id: "requestId", label: "Request ID", filterable: true },
                  {
                    id: "date",
                    label: "Date of Block Request",
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
                  { id: "workType", label: "Work Type", filterable: true },
                  { id: "workDescription", label: "Activity", filterable: false, },
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
                  { id: "sigDisconnection", label: "SIG Disconnection" },
                  { id: "ohDisconnection", label: "Power Block Disconnection" },
                  {
                    id: "elementarySection",
                    label: "Elementary Section",
                    split: true,
                    children: [
                      { id: "elementarySectionFrom", label: "From" },
                      { id: "elementarySectionTo", label: "To" },
                    ],
                  },
                  { id: "otherLinesAffected", label: "Other Lines Affected" },
                  { id: "action", label: "Action", filterable: true },
                  { id: "remarks", label: "Remarks" },
                  { id: "availed", label: "Availed" },
                ].map((column) =>
                  column.split ? (
                    <th
                      key={column.id}
                      colSpan={column.children.length}
                      className="border border-gray-300 bg-gray-50 text-center p-2 font-semibold"
                    >
                      {column.label}
                    </th>
                  ) : (
                    <th
                      key={column.id}
                      rowSpan={2}
                      className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer align-top font-semibold"
                    >
                      <div className="flex items-center gap-1 justify-between">
                        <span>{column.label}</span>
                        {column.filterable && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, column.id)}
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
                      className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer font-semibold"
                    >
                      {child.label}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {/* Table body remains unchanged */}
              {filteredAndSortedRequests.length > 0 ? (
                filteredAndSortedRequests.map((request) => (
                  <tr key={request.requestId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.requestId}
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
                      {request.workDescription}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.workType}
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
                      {request.action === "none" ? (
                        "No Action Taken"
                      ) : request.action === "Accepted" ? (
                        <span>Accepted ✅</span>
                      ) : (
                        <span>Rejected❌</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.remarks === null || request.remarks === ""
                        ? "No Remarks"
                        : request.remarks}
                    </td>
                    <td className="border border-gray-300 p-3 whitespace-nowrap">
                      {request.availed ? (
                        (() => {
                          let availedData;
                          try {
                            availedData =
                              typeof request.availed === "string"
                                ? JSON.parse(request.availed)
                                : request.availed;
                          } catch (e) {
                            availedData = { status: "pending", reason: "" };
                          }

                          if (availedData.status === "yes") {
                            return (
                              <div>
                                <span className="text-green-600 font-medium">
                                  Availed ✅
                                </span>
                                {(availedData.fromTime ||
                                  availedData.toTime) && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    From: {availedData.fromTime || "N/A"} - To:{" "}
                                    {availedData.toTime || "N/A"}
                                  </p>
                                )}
                              </div>
                            );
                          } else if (availedData.status === "no") {
                            return (
                              <div>
                                <span className="text-red-600 font-medium">
                                  Not Availed
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                  Reason: {availedData.reason}
                                </p>
                              </div>
                            );
                          } else {
                            return (
                              <span className="text-gray-600">Pending</span>
                            );
                          }
                        })()
                      ) : (
                        <span className="text-gray-600">Pending</span>
                      )}
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
    </>
  );
};

export default SearchForm;
