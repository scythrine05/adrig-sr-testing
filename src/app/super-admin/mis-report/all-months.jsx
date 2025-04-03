"use client";
import React, { useEffect, useState, useMemo } from "react";
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
import FilterListIcon from "@mui/icons-material/FilterList";
import { getDataOptimised } from "../../actions/optimisetable";
import { useSession } from "next-auth/react";
import Hq from "./hq";
// Utility Functions for Date Handling
const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(
    now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7
  );
  monday.setHours(0, 0, 0, 0);

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

const formatDate = (date) => date.toISOString().split("T")[0];

const parseRequestDate = (dateString) => {
  try {
    // If the input is already a Date object, return it
    if (dateString instanceof Date) {
      return dateString;
    }

    // If the input is a valid ISO string, parse it
    if (!isNaN(Date.parse(dateString))) {
      return new Date(dateString);
    }

    // Handle "YYYY-MM-DD" format
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  } catch (e) {
    console.error(`Error parsing date ${dateString}:`, e);
    return null; // Return null if parsing fails
  }
};

function calculateMinutesBetween(startTime, endTime) {
  // Validate input format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Invalid time format. Use HH:MM (24-hour format)");
  }

  // Split times into hours and minutes
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  // Calculate total minutes for both times
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Calculate difference, handling cases that cross midnight
  let minuteDifference = endTotalMinutes - startTotalMinutes;

  // If the result is negative, it means the end time is on the next day
  if (minuteDifference < 0) {
    minuteDifference += 24 * 60; // Add 24 hours worth of minutes
  }

  return minuteDifference;
}

const AllMonths = () => {
  // State Management
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState("");
  const [aggregatedRequestsCorridor, setAggregatedRequestsCorridor] = useState(
    []
  );
  const [aggregatedRequestsNonCorridor, setAggregatedRequestsNonCorridor] =
    useState([]);
  // Fetch and Filter Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDataOptimised();
        let result = res.result.map((item) => ({
          ...item,
          date: parseRequestDate(item.date),
        }));
        result = calculateDemandedHours(result);
        result = calculateOptimisedHours(result);
        result = calculateAvailedHours(result);
        console.log("12 months : ", result);

        // res.result is an array of objects that will have "corridorType" that will either have values "non-corridor" or "corridor"
        // now based on this value i need to aggregate into two arrays, one corridor and one non-corridor with demanded,optimised, availed values summed and grouped based on section value
        const corridorData = result.filter(
          (item) => item.corridorType === "corridor"
        );
        const nonCorridorData = result.filter(
          (item) => item.corridorType === "non-corridor"
        );

        const corridorAggregated = corridorData.reduce((acc, curr) => {
          const key = `${curr.selectedDepartment}-${curr.selectedSection}`;

          if (!acc[key]) {
            acc[key] = {
              corridorType: curr.corridorType,
              department: curr.selectedDepartment,
              section: curr.selectedSection,
              minutes: curr.minutes,
              optimisedMinutes: curr.optimisedMinutes,
              availedMinutes: curr.availedMinutes || 0,
              date: curr.date,
            };
          } else {
            acc[key].corridorType = curr.corridorType;
            acc[key].department = curr.selectedDepartment;
            acc[key].section = curr.selectedSection;
            acc[key].minutes += curr.minutes;
            acc[key].optimisedMinutes += curr.optimisedMinutes;
            acc[key].availedMinutes += curr.availedMinutes || 0;
            acc[key].date = curr.date || acc[key].date;
          }
          return acc;
        }, {});

        const nonCorridorAggregated = nonCorridorData.reduce((acc, curr) => {
          const key = `${curr.selectedDepartment}-${curr.selectedSection}`;

          if (!acc[key]) {
            acc[key] = {
              corridorType: curr.corridorType,
              department: curr.selectedDepartment,
              section: curr.selectedSection,
              minutes: curr.minutes,
              optimisedMinutes: curr.optimisedMinutes,
              availedMinutes: curr.availedMinutes || 0,
              date: curr.date,
            };
          } else {
            acc[key].corridorType = curr.corridorType;
            acc[key].department = curr.selectedDepartment;
            acc[key].section = curr.selectedSection;
            acc[key].minutes += curr.minutes;
            acc[key].optimisedMinutes += curr.optimisedMinutes;
            acc[key].availedMinutes += curr.availedMinutes || 0;
            acc[key].date = curr.date || acc[key].date;
          }
          return acc;
        }, {});

        console.log("Corridor Data:", corridorAggregated);
        console.log("Non-Corridor Data:", corridorAggregated);

        // Convert the aggregated objects back to arrays
        const corridorAggregatedArray = Object.values(corridorAggregated);
        const nonCorridorAggregatedArray = Object.values(nonCorridorAggregated);
        // Set the state with the aggregated data
        console.log("Corridor Aggregated Data:", corridorAggregatedArray);
        console.log(
          "Non-Corridor Aggregated Data:",
          nonCorridorAggregatedArray
        );

        setAllRequests(result);
        filterRequestsByWeek(corridorAggregatedArray);
        setAggregatedRequestsCorridor(corridorAggregatedArray);
        setAggregatedRequestsNonCorridor(nonCorridorAggregatedArray);
      } catch (e) {
        console.error("Data fetch error:", e);
      }
    };
    fetchData();
  }, [weekOffset]);

  const calculateDemandedHours = (requestData) => {
    if (!requestData) return;

    const updatedData = requestData.map((request) => {
      const fromTime = request.demandTimeFrom;
      const toTime = request.demandTimeTo;

      if (fromTime && toTime) {
        const minutes = calculateMinutesBetween(fromTime, toTime);
        return { ...request, minutes, date: request.date };
      }
      return { ...request, date: request.date };
    });

    return updatedData;
  };

  const calculateOptimisedHours = (requestData) => {
    if (!requestData) return;

    const updatedData = requestData.map((request) => {
      const fromTime = request.Optimisedtimefrom;
      const toTime = request.Optimisedtimeto;

      if (fromTime && toTime) {
        const minutes = calculateMinutesBetween(fromTime, toTime);
        return { ...request, optimisedMinutes: minutes };
      }
      return { ...request, date: request.date };
    });

    return updatedData;
  };

  const calculateAvailedHours = (requestData) => {
    if (!requestData) return;

    const updatedData = requestData.map((request) => {
      const availedData = request.availed;
      if (availedData) {
        const fromTime = availedData.fromTime;
        const toTime = availedData.toTime;
        if (fromTime && toTime) {
          const minutes = calculateMinutesBetween(fromTime, toTime);
          return { ...request, availedMinutes: minutes };
        }
      }
      return { ...request, date: request.date };
    });
    return updatedData;
  };

  // Week Filtering
  const filterRequestsByWeek = (requestData) => {
    if (!requestData) return;

    const filtered = requestData.filter((request) => {
      const requestDate = parseRequestDate(request.date);
      return (
        requestDate &&
        requestDate >= weekDates.start &&
        requestDate <= weekDates.end
      );
    });

    setFilteredRequests(filtered);
  };

  // Filter Handling
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
    // Close the popover after selection to improve UX
    // handleFilterClose();
  };

  // Filter Click Handlers
  const handleFilterClick = (event, columnName) => {
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnName);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Sorting Handler
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Unique Values for Filtering
  const getUniqueValues = (data, key) => {
    if (key === "month") {
      // Extract unique month names from the date field
      return [...new Set(data.map((item) => getMonthName(item.date)))]
        .filter(Boolean)
        .sort();
    }

    // Default behavior for other keys
    return [...new Set(data.map((item) => item[key] || ""))]
      .filter(Boolean)
      .sort();
  };

  const getMonthName = (dateString) => {
    const date = parseRequestDate(dateString);
    if (!date || isNaN(date.getTime())) {
      return "Unknown";
    }
    return date.toLocaleString("default", { month: "long" });
  };

  // Fix the useMemo to properly apply filters
  const filteredAndSortedRequests = useMemo(() => {
    let result = [...aggregatedRequestsCorridor];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length > 0) {
        result = result.filter((item) => {
          if (key === "month") {
            // Handle month filtering by deriving the month name from the date
            const monthName = getMonthName(item.date);
            return filters[key].includes(monthName);
          }
          // Default filtering for other keys
          return filters[key].includes(String(item[key] || ""));
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valueA = String(a[sortConfig.key] || "").toLowerCase();
        const valueB = String(b[sortConfig.key] || "").toLowerCase();

        if (valueA < valueB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    console.log("Filtered and Sorted Requests with Filters Applied:", result); // Debugging
    return result;
  }, [aggregatedRequestsCorridor, filters, sortConfig]);

  // Group data by department
  const groupByDepartment = (data) => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = {
          sections: [],
          totalMinutes: 0,
          totalOptimisedMinutes: 0,
          totalAvailedMinutes: 0,
        };
      }

      acc[item.department].sections.push(item);
      acc[item.department].totalMinutes += item.minutes;
      acc[item.department].totalOptimisedMinutes += item.optimisedMinutes;
      acc[item.department].totalAvailedMinutes += item.availedMinutes || 0;

      return acc;
    }, {});

    return grouped;
  };

  // Group data by month
  const groupByMonth = (data) => {
    const grouped = data.reduce((acc, item) => {
      const month = getMonthName(item.date);
      if (!acc[month]) {
        acc[month] = {
          totalMinutes: 0,
          totalOptimisedMinutes: 0,
          totalAvailedMinutes: 0,
        };
      }

      acc[month].totalMinutes += item.minutes || 0;
      acc[month].totalOptimisedMinutes += item.optimisedMinutes || 0;
      acc[month].totalAvailedMinutes += item.availedMinutes || 0;

      return acc;
    }, {});

    return grouped;
  };

  // Then update the original filtered requests
  useEffect(() => {
    setFilteredRequests(filteredAndSortedRequests);
  }, [filteredAndSortedRequests]);

  // Popover and Rendering Preparations
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
          <h4 className="mb-2 text-sm font-medium">
            Filter by {currentFilterColumn}
          </h4>
          {currentFilterColumn &&
            getUniqueValues(
              aggregatedRequestsCorridor,
              currentFilterColumn
            ).map((value) => (
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
            ))}
        </div>
      </Popover>
      <div className="p-4 m-10 bg-secondary rounded-xl">
        <div className="flex justify-center">
          <h1 className="mt-10 text-4xl font-bold">MIS for DRM for 12 months of Blocks</h1>
        </div>

        {/* Week Selection */}
        <div className="flex flex-wrap items-center justify-center mt-4 mb-6 space-x-4">
          {/* <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
          >
            &lt; Prev Week
          </button> */}

          <span className="p-5 bg-white border border-gray-300 rounded shadow">
            {"For a period from"} <u> {formatDate(weekDates.start)}</u>{" "}
            {"and to "}
            <u>{formatDate(weekDates.end)}</u>
          </span>

          {/* <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
          >
            Next Week &gt;
          </button> */}

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none"
            >
              Current Week
            </button>
          )}
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
                <TableCell
                  style={{ borderRight: "1px solid gray" }}
                  colSpan={2}
                ></TableCell>
                <TableCell
                  style={{
                    borderRight: "1px solid gray",
                    backgroundColor: "#FDD9EE",
                  }}
                  colSpan={4}
                  align="center"
                >
                  Corridor
                </TableCell>
                <TableCell
                  style={{
                    borderRight: "1px solid gray",
                    backgroundColor: "#FDE8D9",
                  }}
                  colSpan={4}
                  align="center"
                >
                  Outside Corridor
                </TableCell>
              </TableRow>

              <TableRow>
                {[
                  {
                    id: "month",
                    label: "Month",
                    filterable: true,
                  },
                  {
                    id: "minutes",
                    label: "Total Block Hours Demanded",
                    filterable: false,
                  },
                  {
                    id: "optimisedMinutes",
                    label: "Total Block Hours Sanctioned",
                    filterable: false,
                  },
                  {
                    id: "optimisedMinutes",
                    label: "Percentage of Blocks Sanctioned",
                    filterable: false,
                  },
                  {
                    id: "availedMinutes",
                    label: "Total Block Hours Availed",
                    filterable: false,
                    style: { borderRight: "1px solid gray" },
                  },
                  {
                    id: "minutes",
                    label: "Total Block Hours Demanded",
                    filterable: false,
                  },
                  {
                    id: "optimisedMinutes",
                    label: "Total Block Hours Sanctioned",
                    filterable: false,
                  },
                  {
                    id: "optimisedMinutes",
                    label: "Percentage of Blocks Sanctioned",
                    filterable: false,
                  },
                  {
                    id: "availedMinutes",
                    label: "Total Block Hours Availed",
                    filterable: false,
                  },
                ].map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ backgroundColor: "#FDE8D9", ...column.style }}
                    align="center"
                  >
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
                            onClick={(e) => handleFilterClick(e, column.id)}
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
                <>
                  {/* Month Rows */}
                  {Object.entries(groupByMonth(filteredAndSortedRequests)).map(
                    ([month, monthData]) => (
                      <TableRow key={month}>
                        <TableCell>{month}</TableCell>

                        {/* Corridor Data */}
                        <TableCell>
                          {(monthData.totalMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {(monthData.totalOptimisedMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {monthData.totalMinutes > 0
                            ? (
                                (monthData.totalOptimisedMinutes /
                                  monthData.totalMinutes) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </TableCell>
                        <TableCell>
                          {(monthData.totalAvailedMinutes / 60).toFixed(2)}
                        </TableCell>

                        {/* Non-Corridor Data */}
                        <TableCell>
                          {(monthData.totalMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {(monthData.totalOptimisedMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {monthData.totalMinutes > 0
                            ? (
                                (monthData.totalOptimisedMinutes /
                                  monthData.totalMinutes) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </TableCell>
                        <TableCell>
                          {(monthData.totalAvailedMinutes / 60).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  )}

                  {/* Total Row */}
                  <TableRow style={{ backgroundColor: "#BFF5BF" }}>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>

                    {/* Corridor Total */}
                    <TableCell>
                      <strong>
                        {(
                          filteredAndSortedRequests.reduce(
                            (sum, item) => sum + (item.minutes || 0),
                            0
                          ) / 60
                        ).toFixed(2)}
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {(
                          filteredAndSortedRequests.reduce(
                            (sum, item) => sum + (item.optimisedMinutes || 0),
                            0
                          ) / 60
                        ).toFixed(2)}
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {filteredAndSortedRequests.reduce(
                          (sum, item) => sum + (item.minutes || 0),
                          0
                        ) > 0
                          ? (
                              (filteredAndSortedRequests.reduce(
                                (sum, item) =>
                                  sum + (item.optimisedMinutes || 0),
                                0
                              ) /
                                filteredAndSortedRequests.reduce(
                                  (sum, item) => sum + (item.minutes || 0),
                                  0
                                )) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {(
                          filteredAndSortedRequests.reduce(
                            (sum, item) => sum + (item.availedMinutes || 0),
                            0
                          ) / 60
                        ).toFixed(2)}
                      </strong>
                    </TableCell>

                    {/* Non-Corridor Total */}
                    <TableCell>
                      <strong>
                        {(
                          filteredAndSortedRequests.reduce(
                            (sum, item) => sum + (item.minutes || 0),
                            0
                          ) / 60
                        ).toFixed(2)}
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {(
                          filteredAndSortedRequests.reduce(
                            (sum, item) => sum + (item.optimisedMinutes || 0),
                            0
                          ) / 60
                        ).toFixed(2)}
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {filteredAndSortedRequests.reduce(
                          (sum, item) => sum + (item.minutes || 0),
                          0
                        ) > 0
                          ? (
                              (filteredAndSortedRequests.reduce(
                                (sum, item) =>
                                  sum + (item.optimisedMinutes || 0),
                                0
                              ) /
                                filteredAndSortedRequests.reduce(
                                  (sum, item) => sum + (item.minutes || 0),
                                  0
                                )) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {(
                          filteredAndSortedRequests.reduce(
                            (sum, item) => sum + (item.availedMinutes || 0),
                            0
                          ) / 60
                        ).toFixed(2)}
                      </strong>
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No requests found for this week
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default AllMonths;
