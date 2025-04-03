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
//const formatDate = (date) => date.toISOString().split("T")[0];

const parseRequestDate = (dateString) => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  } catch (e) {
    console.error(`Error parsing date ${dateString}:`, e);
    return null;
  }
};

const calculateTotals = (groupedData) => {
  const totals = {
    corridor: {
      totalMinutes: 0,
      totalOptimisedMinutes: 0,
      totalAvailedMinutes: 0,
    },
    nonCorridor: {
      totalMinutes: 0,
      totalOptimisedMinutes: 0,
      totalAvailedMinutes: 0,
    },
  };

  Object.values(groupedData).forEach((data) => {
    totals.corridor.totalMinutes += data.corridor.totalMinutes;
    totals.corridor.totalOptimisedMinutes +=
      data.corridor.totalOptimisedMinutes;
    totals.corridor.totalAvailedMinutes += data.corridor.totalAvailedMinutes;

    totals.nonCorridor.totalMinutes += data.nonCorridor.totalMinutes;
    totals.nonCorridor.totalOptimisedMinutes +=
      data.nonCorridor.totalOptimisedMinutes;
    totals.nonCorridor.totalAvailedMinutes +=
      data.nonCorridor.totalAvailedMinutes;
  });

  return totals;
};

const AllMonths = () => {
  // State Management
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState("");

  // Fetch and Aggregate Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDataOptimised();
        const result = res.result.map((item) => ({
          ...item,
          date: parseRequestDate(item.date),
        }));
        setAllRequests(result);
        setFilteredRequests(result);
      } catch (e) {
        console.error("Data fetch error:", e);
      }
    };
    fetchData();
  }, []);

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

  const handleFilterClick = (event, columnName) => {
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnName);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getUniqueValues = (data, key) => {
    if (key === "Month") {
      return [
        ...new Set(
          data.map((item) =>
            item.date.toLocaleString("en-US", { month: "long" })
          )
        ),
      ]
        .filter(Boolean)
        .sort();
    }
    return [...new Set(data.map((item) => item[key] || ""))]
      .filter(Boolean)
      .sort();
  };

  // Group Data by Month
  const groupByMonth = (data) => {
    return data.reduce((acc, item) => {
      if (!item.date || isNaN(item.date)) {
        console.warn("Invalid or missing date:", item);
        return acc; // Skip items with invalid dates
      }

      const month = item.date.toLocaleString("en-IN", { month: "long" });

      if (!acc[month]) {
        acc[month] = {
          corridor: {
            totalMinutes: 0,
            totalOptimisedMinutes: 0,
            totalAvailedMinutes: 0,
          },
          nonCorridor: {
            totalMinutes: 0,
            totalOptimisedMinutes: 0,
            totalAvailedMinutes: 0,
          },
        };
      }

      const target =
        item.corridorType === "corridor"
          ? acc[month].corridor
          : acc[month].nonCorridor;

      target.totalMinutes += item.minutes || 0;
      target.totalOptimisedMinutes += item.optimisedMinutes || 0;
      target.totalAvailedMinutes += item.availedMinutes || 0;

      return acc;
    }, {});
  };

  const groupedData = useMemo(() => {
    const filteredData = filters.Month
      ? allRequests.filter((item) =>
          filters.Month.includes(
            item.date.toLocaleString("en-IN", { month: "long" })
          )
        )
      : allRequests;
    return groupByMonth(filteredData);
  }, [allRequests, filters]);

  return (
    <>
      <Popover
        id="filter-popover"
        open={Boolean(filterAnchorEl)}
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
            getUniqueValues(allRequests, currentFilterColumn).map((value) => (
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
          <h1 className="mt-10 text-4xl font-bold">
            MIS for DRM for 12 months of Blocks
          </h1>
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
          <Table sx={{ minWidth: 800 }} aria-label="monthly table" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  rowSpan={2}
                  style={{ fontWeight: "bold", backgroundColor: "#FDE8D9" }}
                >
                  <div className="flex items-center justify-between">
                    <strong>Month</strong>
                    <IconButton
                      size="small"
                      onClick={(e) => handleFilterClick(e, "Month")}
                    >
                      <FilterListIcon />
                    </IconButton>
                  </div>
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={4}
                  style={{ backgroundColor: "#FDD9EE", fontWeight: "bold" }}
                >
                  Corridor
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={4}
                  style={{ backgroundColor: "#FDE8D9", fontWeight: "bold" }}
                >
                  Outside Corridor
                </TableCell>
              </TableRow>
              <TableRow>
                {[
                  "Total Block Hours Demanded",
                  "Total Block Hours Sanctioned",
                  "Percentage of Blocks Sanctioned",
                  "Total Block Hours Availed",
                ].map((label, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    style={{ fontWeight: "bold", backgroundColor: "#FDE8D9" }}
                  >
                    {label}
                  </TableCell>
                ))}
                {[
                  "Total Block Hours Demanded",
                  "Total Block Hours Sanctioned",
                  "Percentage of Blocks Sanctioned",
                  "Total Block Hours Availed",
                ].map((label, index) => (
                  <TableCell
                    key={`non-${index}`}
                    align="center"
                    style={{ fontWeight: "bold", backgroundColor: "#FDE8D9" }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedData).length > 0 ? (
                <>
                  {Object.entries(groupedData).map(([month, data]) => (
                    <TableRow key={month}>
                      <TableCell>{month}</TableCell>

                      {/* Corridor Data */}
                      <TableCell>
                        {(data.corridor.totalMinutes / 60).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {(data.corridor.totalOptimisedMinutes / 60).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {data.corridor.totalMinutes > 0
                          ? (
                              (data.corridor.totalOptimisedMinutes /
                                data.corridor.totalMinutes) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </TableCell>
                      <TableCell>
                        {(data.corridor.totalAvailedMinutes / 60).toFixed(2)}
                      </TableCell>

                      {/* Non-Corridor Data */}
                      <TableCell>
                        {(data.nonCorridor.totalMinutes / 60).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {(data.nonCorridor.totalOptimisedMinutes / 60).toFixed(
                          2
                        )}
                      </TableCell>
                      <TableCell>
                        {data.nonCorridor.totalMinutes > 0
                          ? (
                              (data.nonCorridor.totalOptimisedMinutes /
                                data.nonCorridor.totalMinutes) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </TableCell>
                      <TableCell>
                        {(data.nonCorridor.totalAvailedMinutes / 60).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Total Row */}
                  {(() => {
                    const totals = calculateTotals(groupedData);
                    return (
                      <TableRow style={{ backgroundColor: "#BFF5BF" }}>
                        <TableCell style={{ fontWeight: "bold" }}>
                          Total
                        </TableCell>

                        {/* Corridor Totals */}
                        <TableCell style={{ fontWeight: "bold" }}>
                          {(totals.corridor.totalMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {(totals.corridor.totalOptimisedMinutes / 60).toFixed(
                            2
                          )}
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {totals.corridor.totalMinutes > 0
                            ? (
                                (totals.corridor.totalOptimisedMinutes /
                                  totals.corridor.totalMinutes) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {(totals.corridor.totalAvailedMinutes / 60).toFixed(
                            2
                          )}
                        </TableCell>

                        {/* Non-Corridor Totals */}
                        <TableCell style={{ fontWeight: "bold" }}>
                          {(totals.nonCorridor.totalMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {(
                            totals.nonCorridor.totalOptimisedMinutes / 60
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {totals.nonCorridor.totalMinutes > 0
                            ? (
                                (totals.nonCorridor.totalOptimisedMinutes /
                                  totals.nonCorridor.totalMinutes) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {(
                            totals.nonCorridor.totalAvailedMinutes / 60
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })()}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No requests found for this month
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
