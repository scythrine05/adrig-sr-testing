"use client";
import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Menu,
  InputLabel,
  FormControl,
} from "@mui/material";
import { CSVLink } from "react-csv";
import { getAdminFormData, getFormDataAll } from "../../actions/formdata";
import { getUsersAll, setOptimised } from "../../actions/user";
import axios from "axios";
import {
  deleteOptimizedData,
  postBulkOptimised,
} from "../../actions/optimisetable";
import { Oval } from "react-loader-spinner";
import { useToast } from "../../../components/ui/use-toast";
import { formatData } from "../../../lib/utils";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import FilterPopover from "../../../components/custom/FilterPopover";
import { defaultColumns, emergencyColumns } from "../../data/columns/ad/requestData";
import TableComponent from "../../../templates/table/StandardTable";

const SearchForm = () => {
  let timerfirst;
  const [searchType, setSearchType] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [corridorRequests, setCorridorRequests] = useState([]);
  const [nonCorridorRequests, setNonCorridorRequests] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [currentReq, setCurrentReq] = useState(null);
  const [clear, setClear] = useState(true);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState("");
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Separate filter states for each table
  const [currentTable, setCurrentTable] = useState("");
  const [corridorFilters, setCorridorFilters] = useState({});
  const [nonCorridorFilters, setNonCorridorFilters] = useState({});

  const { toast } = useToast();

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getFormDataAll();
        // setFilteredRequests(res.requestData);
        const formattedData = await formatData(res.requestData);
        const finalData = formattedData.map((e) => {
          return {
            ...e,
            selectedLine: e.selectedLine && e.selectedLine.split(":")[1],
          };
        });
        setFilteredRequests(finalData);

        // Separate data based on corridorType
        separateRequestsByCorridorType(finalData);

        setCurrentReq(formattedData);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
    localStorage.setItem("optimizedbuttonnotclicked", "true");
  }, [clear]);

  // Function to separate requests by corridor type
  const separateRequestsByCorridorType = (requests) => {
    const corridor = requests.filter((req) => req.corridorType === "corridor");
    const nonCorridor = requests.filter(
      (req) => req.corridorType === "non-corridor"
    );
    const emergency = requests.filter(
      (req) => req.corridorType === "emergency"
    );

    setCorridorRequests(corridor);
    setNonCorridorRequests(nonCorridor);
    setEmergencyRequests(emergency);
  };

  useEffect(() => {
    const runFunction = () => {
      timerfirst = setTimeout(() => {
        if (localStorage.getItem("optimizedbuttonnotclicked") === "true") {
          handleOptimize();
        }
        clearTimeout(timerfirst);
      }, 2000);
    };

    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 0);

    const timeUntilNextDay = nextDay - now;

    const timer = setTimeout(
      runFunction,
      timeUntilNextDay + 30 * 60 * 60 * 1000
    );
    return () => {
      clearTimeout(timer);
      clearTimeout(timerfirst);
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = async () => {
    const requests = await getAdminFormData(
      searchType,
      searchDepartment,
      dateRange
    );

    const formattedData = await formatData(requests.res);
    setFilteredRequests(formattedData);

    // Separate search results by corridor type
    separateRequestsByCorridorType(formattedData);
  };

  const handleClear = async () => {
    setSearchDepartment("");
    setDateRange({ from: "", to: "" });
    setFilters({});
    setSortConfig({ key: null, direction: "ascending" });
    setClear((prev) => !prev);
  };

  const handleOptimize = async () => {
    localStorage.setItem("sanctionTableVisible", "false");
    console.log(localStorage["sanctionTableVisible"], "local");
    let timer;
    clearTimeout(timer);
    setLoading(true);
    toast({
      title: "Optimization In progress",
      description: "Your Request Is Under Process! Please Wait",
    });

    //Test Code Start
    const filteredBySection = filteredRequests.filter(
      (request) => request.selectedSection !== "MSB-VLCY"
    );
    const msbVlcyRequests = filteredRequests.filter(
      (request) => request.selectedSection === "MSB-VLCY"
    );
    //Test Code End

    try {
      if (currentReq != null) {
        const res = await axios.post(
          `https://sr-optimization.vercel.app/backend/optimize`,
          {
            requestData: filteredBySection, //Test Code
          }
        );

        const data = filteredRequests;
        const res1 = await deleteOptimizedData();
        const res2 = await postBulkOptimised(res.data.optimizedData);
        //Test Code Start
        if (msbVlcyRequests.length > 0) await postBulkOptimised(msbVlcyRequests);
        //Test Code End
      } else {
        throw Error("the admin data didnt came");
      }
      const requests = await getUsersAll();
      requests.forEach(async (e) => {
        const res = await setOptimised("set", e.id);
      });
      timer = setTimeout(() => {
        toast({
          title: "Optimization Done",
          description: "Your Optimization Request Is Successfully Completed",
        });
      }, 1000);
    } catch (e) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        variant: "destructive",
      });
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (event, columnName, table) => {
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnName);
    setCurrentTable(table);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // const handleFilterChange = (value) => {
  //   const newFilters = { ...filters };

  //   if (!newFilters[currentFilterColumn]) {
  //     newFilters[currentFilterColumn] = [value];
  //   } else if (newFilters[currentFilterColumn].includes(value)) {
  //     newFilters[currentFilterColumn] = newFilters[currentFilterColumn].filter(item => item !== value);
  //     if (newFilters[currentFilterColumn].length === 0) {
  //       delete newFilters[currentFilterColumn];
  //     }
  //   } else {
  //     newFilters[currentFilterColumn].push(value);
  //   }

  //   setFilters(newFilters);
  // };

  // Function to handle filter changes for Corridor Requests
  const handleFilterChange = (value, columnName, filters, setFilters) => {
    const newFilters = { ...filters };

    if (!newFilters[columnName]) {
      newFilters[columnName] = [value];
    } else if (newFilters[columnName].includes(value)) {
      newFilters[columnName] = newFilters[columnName].filter(
        (item) => item !== value
      );
      if (newFilters[columnName].length === 0) {
        delete newFilters[columnName];
      }
    } else {
      newFilters[columnName].push(value);
    }
    console.log("Updated Filters:", newFilters);
    setFilters(newFilters);
  };


  const handleSelectAllFilters = (values) => {
    const newFilters = { ...filters };
    delete newFilters[currentFilterColumn];
    setFilters(newFilters);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getUniqueValues = (data, key) => {
    return [...new Set(data.map((item) => item[key] || ""))]
      .filter(Boolean)
      .sort();
  };

  // const filteredAndSortedRequests = React.useMemo(() => {
  //   // First filter the data
  //   let result = [...filteredRequests];

  //   // Apply filters
  //   Object.keys(filters).forEach((key) => {
  //     if (filters[key] && filters[key].length > 0) {
  //       result = result.filter((item) =>
  //         filters[key].includes(item[key] || "")
  //       );
  //     }
  //   });

  //   // Apply sorting
  //   if (sortConfig.key) {
  //     result.sort((a, b) => {
  //       const valueA = (a[sortConfig.key] || "").toString().toLowerCase();
  //       const valueB = (b[sortConfig.key] || "").toString().toLowerCase();

  //       if (valueA < valueB) {
  //         return sortConfig.direction === "ascending" ? -1 : 1;
  //       }
  //       if (valueA > valueB) {
  //         return sortConfig.direction === "ascending" ? 1 : -1;
  //       }
  //       return 0;
  //     });
  //   }

  //   // Separate requests by corridor type
  //   const corridor = result.filter((req) => req.corridorType === "corridor");
  //   const nonCorridor = result.filter(
  //     (req) => req.corridorType === "non-corridor"
  //   );
  //   const emergency = result.filter((req) => req.corridorType === "emergency");

  //   // Update state with filtered and sorted data
  //   setCorridorRequests(corridor);
  //   setNonCorridorRequests(nonCorridor);
  //   setEmergencyRequests(emergency);

  //   return result;
  // }, [filteredRequests, filters, sortConfig]);

  // Filtered data for Corridor Requests
  const filteredCorridorRequests = React.useMemo(() => {
    let result = [...corridorRequests];

    Object.keys(corridorFilters).forEach((key) => {
      if (corridorFilters[key] && corridorFilters[key].length > 0) {
        result = result.filter((item) =>
          corridorFilters[key].includes(item[key] || "")
        );
      }
    });

    return result;
  }, [corridorRequests, corridorFilters]);

  // Filtered data for Non-Corridor Requests
  const filteredNonCorridorRequests = React.useMemo(() => {
    let result = [...nonCorridorRequests];

    Object.keys(nonCorridorFilters).forEach((key) => {
      if (nonCorridorFilters[key] && nonCorridorFilters[key].length > 0) {
        result = result.filter((item) =>
          nonCorridorFilters[key].includes(item[key] || "")
        );
      }
    });

    return result;
  }, [nonCorridorRequests, nonCorridorFilters]);

  const getFilterIcon = (columnName) => {
    const isFiltered =
      currentTable === "corridor"
        ? corridorFilters[columnName]?.length > 0
        : nonCorridorFilters[columnName]?.length > 0;

    if (sortConfig.key === columnName) {
      return sortConfig.direction === "ascending" ? (
        <ArrowUpwardIcon fontSize="small" color={isFiltered ? "primary" : "inherit"} />
      ) : (
        <ArrowDownwardIcon fontSize="small" color={isFiltered ? "primary" : "inherit"} />
      );
    }

    if (isFiltered) {
      return <FilterListIcon fontSize="small" color="primary" />;
    }

    return <FilterListIcon fontSize="small" color="inherit" />;
  };

  const isOpen = Boolean(filterAnchorEl);
  const filterId = isOpen ? "filter-popover" : undefined;

  const handleSortFromFilter = (direction) => {
    setSortConfig({ key: currentFilterColumn, direction });
    // Don't close the popover so users can also apply filters
  };

  return (
    <div className="bg-white md:bg-secondary m-auto md:m-10 rounded-sm pt-14 lg:pt-0 md:p-5 w-full md:w-[97%]">
      <div className="p-2">
        {/* Form Controls */}
        <div className="flex flex-wrap lg:flex-nowrap md:flex-row gap-4 justify-between">
          <FormControl fullWidth margin="normal" sx={{ margin: 1 }}>
            <InputLabel id="search-Line-label">Department</InputLabel>
            <Select
              labelId="search-Line-label"
              value={searchDepartment}
              onChange={(e) => setSearchDepartment(e.target.value)}
              label="Department"
            >
              <MenuItem value="ENGG">ENGG</MenuItem>
              <MenuItem value="SIG">SIG</MenuItem>
              <MenuItem value="TRD">TRD</MenuItem>
            </Select>
          </FormControl>

          <TextField
            sx={{ margin: 1 }}
            label="Date From"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            sx={{ margin: 1 }}
            label="Date To"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-4">
          <button
            className="bg-blue-500 p-2 text-white rounded-lg text-center flex justify-center hover:bg-blue-700"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="border border-slate-950 py-2 px-3 rounded-lg text-center flex justify-center hover:bg-slate-200"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="bg-purple-600 p-2 text-white rounded-lg text-center flex justify-center hover:bg-purple-700"
            onClick={() => {
              localStorage.setItem("optimizedbuttonnotclicked", "false");
              clearTimeout(timerfirst);
              handleOptimize();
            }}
          >
            Optimize
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
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
                Full Screen
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {/* Desktop Table */}
        <div
          className={`hidden md:block ${isFullScreen ? "fixed inset-0 z-50 bg-white p-4" : ""
            }`}
        >

          <div className="table-container">
            {/* Corridor Requests Table */}
            <TableComponent
              title={{ text: "Corridor Requests", color: "text-blue-700" }}
              columns={defaultColumns}
              data={filteredCorridorRequests}
              onFilterClick={(e, columnId) => handleFilterClick(e, columnId, "corridor")}
              getFilterIcon={getFilterIcon}
            />

            {/* Non-Corridor Requests Table */}
            <TableComponent
              title={{ text: "Outside Corridor Requests", color: "text-green-700" }}
              columns={defaultColumns}
              data={filteredNonCorridorRequests}
              onFilterClick={(e, columnId) =>
                handleFilterClick(e, columnId, "nonCorridor")
              }
              getFilterIcon={getFilterIcon}
            />

            {/* Emergency Requests Table */}
            {emergencyRequests.length > 0 && (
              <TableComponent
                title={{ text: "Emergency Block Requests", color: "text-red-600" }}
                columns={emergencyColumns}
                data={emergencyRequests}
                onFilterClick={(e, columnId) => handleFilterClick(e, columnId, "emergency")}
                getFilterIcon={getFilterIcon}
              />
            )}
          </div>
          );
        </div>
        {/* Filter Popover */}
        <FilterPopover
          isOpen={isOpen}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          currentFilterColumn={currentFilterColumn}
          currentTable={currentTable}
          filters={currentTable === "corridor" ? corridorFilters : nonCorridorFilters}
          onClearFilters={() => {
            if (currentTable === "corridor") {
              setCorridorFilters({});
            } else {
              setNonCorridorFilters({});
            }
          }}
          onFilterChange={(value, columnName) => {
            if (currentTable === "corridor") {
              console.log(currentTable)
              handleFilterChange(value, columnName, corridorFilters, setCorridorFilters);
            } else {
              handleFilterChange(value, columnName, nonCorridorFilters, setNonCorridorFilters);
            }
          }}
          getUniqueValues={getUniqueValues}
          data={
            currentTable === "corridor"
              ? filteredCorridorRequests
              : filteredNonCorridorRequests
          }
        />

        {/* Mobile Table (Vertical Layout) */}
        <div className="md:hidden p-px">
          {/* Corridor Requests Mobile View */}
          <h2 className="text-xl font-bold text-blue-700 my-3 text-center">
            Corridor Requests
          </h2>
          {corridorRequests.length > 0 ? (
            corridorRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white mb-5 border border-gray-400 text-sm p-1"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-300 p-2">
                    <strong>Request ID:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.requestId}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Date of Request:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.date}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Department:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedDepartment}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Section:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedSection}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Depo/SSE:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedDepo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Block Section/Yard:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.stationID}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Selected Block:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.missionBlock}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Corridor Type:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.corridorType}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Type Selected:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workType}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Description:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workDescription}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Demand Time (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.demandTimeFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Demand Time (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.demandTimeTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Line Selected:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedLine}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Required:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionRequired}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Speed:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionSpeed}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Location (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionLocationFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Location (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionLocationTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Location (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workLocationFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Location (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workLocationTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>SIG Disconnection:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.sigDisconnection}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>OHE Disconnection:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.ohDisconnection}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Elementary Section (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.elementarySectionFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Elementary Section (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.elementarySectionTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Other Lines Affected:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.otherLinesAffected}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center mb-5">No corridor requests found</div>
          )}

          {/* Non-Corridor Requests Mobile View */}
          <h2 className="text-xl font-bold text-green-700 my-3 text-center">
            Outside Corridor Requests
          </h2>
          {nonCorridorRequests.length > 0 ? (
            nonCorridorRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white mb-5 border border-gray-400 text-sm p-1"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-300 p-2">
                    <strong>Request ID:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.requestId}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Date of Request:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.date}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Department:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedDepartment}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Section:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedSection}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Depo/SSE:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedDepo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Block Section/Yard:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.stationID}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Selected Block:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.missionBlock}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Corridor Type:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.corridorType}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Type Selected:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workType}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Description:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workDescription}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Demand Time (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.demandTimeFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Demand Time (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.demandTimeTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Line Selected:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.selectedLine}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Required:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionRequired}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Speed:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionSpeed}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Location (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionLocationFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Caution Location (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.cautionLocationTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Location (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workLocationFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Work Location (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.workLocationTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>SIG Disconnection:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.sigDisconnection}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>OHE Disconnection:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.ohDisconnection}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Elementary Section (From):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.elementarySectionFrom}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Elementary Section (To):</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.elementarySectionTo}
                  </div>
                  <div className="border border-gray-300 p-2">
                    <strong>Other Lines Affected:</strong>
                  </div>
                  <div className="border border-gray-300 p-2">
                    {request.otherLinesAffected}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center mb-5">
              No outside corridor requests found
            </div>
          )}

          {/* Emergency Requests Mobile View */}
          {emergencyRequests.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-red-600 my-3 text-center">
                Emergency Block Requests
              </h2>
              {emergencyRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="bg-white mb-5 border border-gray-400 text-sm p-1"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-300 p-2">
                      <strong>Request ID:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.requestId}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Date of Request:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.date}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Department:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.selectedDepartment}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Section:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.selectedSection}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Depo/SSE:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.selectedDepo}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Block Section/Yard:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.stationID}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Selected Block:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.missionBlock}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Corridor Type:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.corridorType}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Work Type Selected:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.workType}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Work Description:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.workDescription}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Demand Time (From):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.demandTimeFrom}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Demand Time (To):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.demandTimeTo}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Line Selected:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.selectedLine}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Caution Required:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.cautionRequired}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Caution Speed:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.cautionSpeed}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Caution Location (From):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.cautionLocationFrom}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Caution Location (To):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.cautionLocationTo}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Work Location (From):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.workLocationFrom}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Work Location (To):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.workLocationTo}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>SIG Disconnection:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.sigDisconnection}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>OHE Disconnection:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.ohDisconnection}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Elementary Section (From):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.elementarySectionFrom}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Elementary Section (To):</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.elementarySectionTo}
                    </div>
                    <div className="border border-gray-300 p-2">
                      <strong>Other Lines Affected:</strong>
                    </div>
                    <div className="border border-gray-300 p-2">
                      {request.otherLinesAffected}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Download CSV section */}
      {filteredRequests.length > 0 && (
        <div
          className={`flex flex-col md:flex-row justify-around ${isFullScreen ? "fixed bottom-4 left-0 right-0" : ""
            }`}
        >
          <div>
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2, marginBottom: 2 }}
              onClick={handleClick}
            >
              Download CSV
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <CSVLink
                  data={currentReq}
                  filename={"all_requests.csv"}
                  style={{ textDecoration: "none", color: "black" }}
                >
                  Download All Data
                </CSVLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <CSVLink
                  data={filteredRequests}
                  filename={"filtered_requests.csv"}
                  style={{ textDecoration: "none", color: "black" }}
                >
                  Download Filtered Data
                </CSVLink>
              </MenuItem>
            </Menu>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[100]">
          <Oval
            visible={true}
            height="80"
            width="80"
            color="#0000FF"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
    </div>
  );
};

export default SearchForm;
