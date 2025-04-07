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
    weekLabel: `For a period from ${weekOffset === 0 ? "" : weekOffset > 0 ? "+" + weekOffset : weekOffset
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

const Hq = () => {
  const { data: session } = useSession();
  const val = session?.user.email;
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

        // Convert the aggregated objects back to arrays
        const corridorAggregatedArray = Object.values(corridorAggregated);
        const nonCorridorAggregatedArray = Object.values(nonCorridorAggregated);

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
        <div className="flex justify-center">
          {" "}
          {/* Changed justify-between to justify-center */}
          <h1 className="mt-9 text-4xl font-bold">MIS Report for HQ</h1>
        </div>

        <div className="flex flex-wrap items-center justify-center mt-4 mb-6 space-x-4">
          <span className="px-4 py-2 bg-white border border-gray-300 rounded shadow">
            {weekDates.weekLabel}:{" "}
            <span style={{ textDecoration: "underline" }}>
              {formatDate(weekDates.start)}
            </span>{" "}
            to{" "}
            <span style={{ textDecoration: "underline" }}>
              {formatDate(weekDates.end)}
            </span>
          </span>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none"
            >
              Current Week
            </button>
          )}
        </div>

        <div className="overflow-auto rounded-lg shadow-md relative  max-h-screen">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  colSpan={2}
                  className="border border-gray-300 bg-gray-100 text-center p-2 font-medium"
                ></th>
                <th
                  colSpan={4}
                  className="border border-gray-300 bg-pink-200 text-center p-2 font-medium"
                >
                  Corridor
                </th>
                <th
                  colSpan={4}
                  className="border border-gray-300 bg-orange-300 text-center p-2 font-medium"
                >
                  Outside Corridor
                </th>
              </tr>

              <tr className="bg-orange-100">
                {[
                  {
                    id: "division",
                    label: "Division",
                    filterable: false,
                  },
                  {
                    id: "department",
                    label: "Department",
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
                  <th
                    key={column.id}
                    className="border border-gray-300 p-3 text-center font-medium"
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
                          <button
                            onClick={(e) => handleFilterClick(e, column.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <FilterListIcon fontSize="small" />
                          </button>
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
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
                            acc.optimisedMinutes +
                            (item.optimisedMinutes || 0),
                          availedMinutes:
                            acc.availedMinutes + (item.availedMinutes || 0),
                        }),
                        { minutes: 0, optimisedMinutes: 0, availedMinutes: 0 }
                      );

                    return (
                      <React.Fragment key={department}>
                        {/* Department Total Row */}
                        <tr>
                          <td className="border border-gray-300 p-3">
                            MAS
                          </td>
                          <td className="border border-gray-300 p-3">
                            {department}
                          </td>

                          {/* Corridor Totals */}
                          <td className="border border-gray-300 p-3">
                            {(deptData.totalMinutes / 60).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {(deptData.totalOptimisedMinutes / 60).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {deptData.totalMinutes > 0
                              ? (
                                (deptData.totalOptimisedMinutes /
                                  deptData.totalMinutes) *
                                100
                              ).toFixed(2)
                              : 0}
                            %
                          </td>
                          <td className="border border-gray-300 p-3">
                            {(deptData.totalAvailedMinutes / 60).toFixed(2)}
                          </td>

                          {/* Non-Corridor Totals */}
                          <td className="border border-gray-300 p-3">
                            {(nonCorridorTotals.minutes / 60).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {(
                              nonCorridorTotals.optimisedMinutes / 60
                            ).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {nonCorridorTotals.minutes > 0
                              ? (
                                (nonCorridorTotals.optimisedMinutes /
                                  nonCorridorTotals.minutes) *
                                100
                              ).toFixed(2)
                              : 0}
                            %
                          </td>
                          <td className="border border-gray-300 p-3">
                            {(nonCorridorTotals.availedMinutes / 60).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total Row */}
                  <tr className="bg-green-100">
                    <td className="border border-gray-300 p-3 font-bold" colSpan={2}>
                      Total
                    </td>

                    {/* Corridor Grand Totals */}
                    <td className="border border-gray-300 p-3 font-bold">
                      {(
                        Object.values(
                          groupByDepartment(filteredAndSortedRequests)
                        ).reduce((sum, dept) => sum + dept.totalMinutes, 0) /
                        60
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3 font-bold">
                      {(
                        Object.values(
                          groupByDepartment(filteredAndSortedRequests)
                        ).reduce(
                          (sum, dept) => sum + dept.totalOptimisedMinutes,
                          0
                        ) / 60
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3 font-bold">
                      {Object.values(
                        groupByDepartment(filteredAndSortedRequests)
                      ).reduce((sum, dept) => sum + dept.totalMinutes, 0) > 0
                        ? (
                          (Object.values(
                            groupByDepartment(filteredAndSortedRequests)
                          ).reduce(
                            (sum, dept) => sum + dept.totalOptimisedMinutes,
                            0
                          ) /
                            Object.values(
                              groupByDepartment(filteredAndSortedRequests)
                            ).reduce(
                              (sum, dept) => sum + dept.totalMinutes,
                              0
                            )) *
                          100
                        ).toFixed(2)
                        : 0}
                      %
                    </td>
                    <td className="border border-gray-300 p-3 font-bold">
                      {(
                        Object.values(
                          groupByDepartment(filteredAndSortedRequests)
                        ).reduce(
                          (sum, dept) => sum + dept.totalAvailedMinutes,
                          0
                        ) / 60
                      ).toFixed(2)}
                    </td>

                    {/* Non-Corridor Grand Totals */}
                    <td className="border border-gray-300 p-3 font-bold">
                      {(
                        aggregatedRequestsNonCorridor.reduce(
                          (sum, item) => sum + (item.minutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3 font-bold">
                      {(
                        aggregatedRequestsNonCorridor.reduce(
                          (sum, item) => sum + (item.optimisedMinutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3 font-bold">
                      {aggregatedRequestsNonCorridor.reduce(
                        (sum, item) => sum + (item.minutes || 0),
                        0
                      ) > 0
                        ? (
                          (aggregatedRequestsNonCorridor.reduce(
                            (sum, item) =>
                              sum + (item.optimisedMinutes || 0),
                            0
                          ) /
                            aggregatedRequestsNonCorridor.reduce(
                              (sum, item) => sum + (item.minutes || 0),
                              0
                            )) *
                          100
                        ).toFixed(2)
                        : 0}
                      %
                    </td>
                    <td className="border border-gray-300 p-3 font-bold">
                      {(
                        aggregatedRequestsNonCorridor.reduce(
                          (sum, item) => sum + (item.availedMinutes || 0),
                          0
                        ) / 60
                      ).toFixed(2)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="border border-gray-300 p-5 text-center"
                  >
                    No requests found for this week
                  </td>
                </tr>
              )}
            </TableBody>
          </table>
        </div>

      </div>
    </>
  );
};

export default Hq;
