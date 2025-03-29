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
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    if (dateString.includes("/")) {
      const parts = dateString.split("/").map(Number);
      return parts[2] > 1000
        ? new Date(parts[2], parts[0] - 1, parts[1])
        : new Date(parts[2], parts[1] - 1, parts[0]);
    }

    return new Date(dateString);
  } catch (e) {
    console.error(`Error parsing date ${dateString}:`, e);
    return null;
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

const SearchForm = () => {
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
        let result = res.result;
        result = calculateDemandedHours(result);
        result = calculateOptimisedHours(result);
        result = calculateAvailedHours(result);
        console.log(result);

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
            };
          } else {
            acc[key].corridorType = curr.corridorType;
            acc[key].department = curr.selectedDepartment;
            acc[key].section = curr.selectedSection;
            acc[key].minutes += curr.minutes;
            acc[key].optimisedMinutes += curr.optimisedMinutes;
            acc[key].availedMinutes += curr.availedMinutes || 0;
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
            };
          } else {
            acc[key].corridorType = curr.corridorType;
            acc[key].department = curr.selectedDepartment;
            acc[key].section = curr.selectedSection;
            acc[key].minutes += curr.minutes;
            acc[key].optimisedMinutes += curr.optimisedMinutes;
            acc[key].availedMinutes += curr.availedMinutes || 0;
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
        return { ...request, minutes };
      }
      return request;
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
      return request;
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
      return request;
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
    return [...new Set(data.map((item) => item[key] || ""))]
      .filter(Boolean)
      .sort();
  };

  // Fix the useMemo to properly apply filters
  const filteredAndSortedRequests = useMemo(() => {
    let result = [...aggregatedRequestsCorridor];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length > 0) {
        result = result.filter((item) =>
          filters[key].includes(String(item[key] || ""))
        );
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
        <div className="flex justify-between ">
          <h1 className="mt-10 text-4xl font-bold">MIS Report</h1>
        </div>

        {/* Week Selection */}
        <div className="flex flex-wrap items-center justify-center mt-4 mb-6 space-x-4">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
          >
            &lt; Prev Week
          </button>

          <span className="px-4 py-2 bg-white border border-gray-300 rounded shadow">
            {weekDates.weekLabel}: {formatDate(weekDates.start)} to{" "}
            {formatDate(weekDates.end)}
          </span>

          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
          >
            Next Week &gt;
          </button>

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
                    id: "department",
                    label: "Department",
                    filterable: true,
                  },
                  {
                    id: "section",
                    label: "Section",
                    filterable: true,
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
                  {/* Department Rows */}
                  {Object.entries(
                    groupByDepartment(filteredAndSortedRequests)
                  ).map(([department, deptData]) => {
                    // Calculate non-corridor totals for the department
                    const nonCorridorTotals = aggregatedRequestsNonCorridor
                      .filter((d) => d.department === department)
                      .reduce(
                        (acc, item) => ({
                          minutes: acc.minutes + (item.minutes || 0),
                          optimisedMinutes:
                            acc.optimisedMinutes + (item.optimisedMinutes || 0),
                          availedMinutes:
                            acc.availedMinutes + (item.availedMinutes || 0),
                        }),
                        { minutes: 0, optimisedMinutes: 0, availedMinutes: 0 }
                      );

                    return (
                      <React.Fragment key={department}>
                        {/* Section Rows */}
                        {deptData.sections.map((request) => {
                          const nonCorridorData =
                            aggregatedRequestsNonCorridor.find(
                              (d) =>
                                d.department === department &&
                                d.section === request.section
                            ) || {};

                          return (
                            <TableRow
                              key={`${request.department}-${request.section}`}
                            >
                              <TableCell>{department}</TableCell>
                              <TableCell
                                style={{ borderRight: "1px solid gray" }}
                              >
                                {request.section}
                              </TableCell>

                              {/* Corridor Data */}
                              <TableCell>
                                {(request.minutes / 60).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {(request.optimisedMinutes / 60).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {request.minutes > 0
                                  ? (
                                      (request.optimisedMinutes /
                                        request.minutes) *
                                      100
                                    ).toFixed(2)
                                  : 0}
                                %
                              </TableCell>
                              <TableCell
                                style={{ borderRight: "1px solid gray" }}
                              >
                                {(request.availedMinutes / 60).toFixed(2)}
                              </TableCell>

                              {/* Non-Corridor Data */}
                              <TableCell>
                                {((nonCorridorData.minutes || 0) / 60).toFixed(
                                  2
                                )}
                              </TableCell>
                              <TableCell>
                                {(
                                  (nonCorridorData.optimisedMinutes || 0) / 60
                                ).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {(nonCorridorData.minutes || 0) > 0
                                  ? (
                                      ((nonCorridorData.optimisedMinutes || 0) /
                                        (nonCorridorData.minutes || 1)) *
                                      100
                                    ).toFixed(2)
                                  : 0}
                                %
                              </TableCell>
                              <TableCell>
                                {(
                                  (nonCorridorData.availedMinutes || 0) / 60
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {/* Department Total Row */}
                        <TableRow style={{ backgroundColor: "#BFF5BF" }}>
                          <TableCell style={{ fontWeight: "bold" }}>
                            Total
                          </TableCell>
                          <TableCell
                            style={{
                              fontWeight: "bold",
                              borderRight: "1px solid gray",
                            }}
                          ></TableCell>

                          {/* Corridor Totals */}
                          <TableCell style={{ fontWeight: "bold" }}>
                            {(deptData.totalMinutes / 60).toFixed(2)}
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {(deptData.totalOptimisedMinutes / 60).toFixed(2)}
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {deptData.totalMinutes > 0
                              ? (
                                  (deptData.totalOptimisedMinutes /
                                    deptData.totalMinutes) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </TableCell>
                          <TableCell
                            style={{
                              fontWeight: "bold",
                              borderRight: "1px solid gray",
                            }}
                          >
                            {(deptData.totalAvailedMinutes / 60).toFixed(2)}
                          </TableCell>

                          {/* Non-Corridor Totals */}
                          <TableCell style={{ fontWeight: "bold" }}>
                            {(nonCorridorTotals.minutes / 60).toFixed(2)}
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {(nonCorridorTotals.optimisedMinutes / 60).toFixed(
                              2
                            )}
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {nonCorridorTotals.minutes > 0
                              ? (
                                  (nonCorridorTotals.optimisedMinutes /
                                    nonCorridorTotals.minutes) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {(nonCorridorTotals.availedMinutes / 60).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total Row */}
                  <TableRow style={{ backgroundColor: "#40F740" }}>
                    <TableCell style={{ fontWeight: "bold" }} colSpan={2}>
                      Grand Total
                    </TableCell>

                    {/* Corridor Grand Totals */}
                    <TableCell style={{ fontWeight: "bold" }}>
                      {(
                        filteredAndSortedRequests.reduce(
                          (sum, item) => sum + (item.minutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {(
                        filteredAndSortedRequests.reduce(
                          (sum, item) => sum + (item.optimisedMinutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {filteredAndSortedRequests.reduce(
                        (sum, item) => sum + (item.minutes || 0),
                        0
                      ) > 0
                        ? (
                            (filteredAndSortedRequests.reduce(
                              (sum, item) => sum + (item.optimisedMinutes || 0),
                              0
                            ) /
                              filteredAndSortedRequests.reduce(
                                (sum, item) => sum + (item.minutes || 1),
                                0
                              )) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        borderRight: "1px solid gray",
                      }}
                    >
                      {(
                        filteredAndSortedRequests.reduce(
                          (sum, item) => sum + (item.availedMinutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </TableCell>

                    {/* Non-Corridor Grand Totals */}
                    <TableCell style={{ fontWeight: "bold" }}>
                      {(
                        aggregatedRequestsNonCorridor.reduce(
                          (sum, item) => sum + (item.minutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {(
                        aggregatedRequestsNonCorridor.reduce(
                          (sum, item) => sum + (item.optimisedMinutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {aggregatedRequestsNonCorridor.reduce(
                        (sum, item) => sum + (item.minutes || 0),
                        0
                      ) > 0
                        ? (
                            (aggregatedRequestsNonCorridor.reduce(
                              (sum, item) => sum + (item.optimisedMinutes || 0),
                              0
                            ) /
                              aggregatedRequestsNonCorridor.reduce(
                                (sum, item) => sum + (item.minutes || 1),
                                0
                              )) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {(
                        aggregatedRequestsNonCorridor.reduce(
                          (sum, item) => sum + (item.availedMinutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={21} align="center">
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

export default SearchForm;
