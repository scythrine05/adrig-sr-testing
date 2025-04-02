"use client";
import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Menu,
  InputLabel,
  FormControl,
  Popover,
  Checkbox,
  FormControlLabel,
  IconButton,
  Divider,
} from "@mui/material";
import { CSVLink } from "react-csv";
import { getAdminFormData, getFormDataAll } from "../../actions/formdata";
import { getUsersAll, setOptimised } from "../../actions/user";
import axios from "axios";
import {
  deleteOptimizedData,
  postBulkOptimised,
  postDataOptimised,
  postDataOptimisedFirst,
} from "../../actions/optimisetable";
import { Oval } from "react-loader-spinner";
import { useToast } from "../../../components/ui/use-toast";
import { formatData } from "../../../lib/utils";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

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
    try {
      if (currentReq != null) {
        const res = await axios.post(
          `https://sr-optimization.vercel.app/backend/optimize`,
          {
            requestData: filteredRequests,
          }
        );

        const data = filteredRequests;
        const res1 = await deleteOptimizedData();
        const res2 = await postBulkOptimised(res.data.optimizedData);
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
  const handleCorridorFilterChange = (value, columnName) => {
    const newFilters = { ...corridorFilters };

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

    setCorridorFilters(newFilters);
  };

  // Function to handle filter changes for Non-Corridor Requests
  const handleNonCorridorFilterChange = (value, columnName) => {
    const newFilters = { ...nonCorridorFilters };

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

    setNonCorridorFilters(newFilters);
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
    if (sortConfig.key === columnName) {
      return sortConfig.direction === "ascending" ? (
        <ArrowUpwardIcon fontSize="small" />
      ) : (
        <ArrowDownwardIcon fontSize="small" />
      );
    }
    return null;
  };

  const isOpen = Boolean(filterAnchorEl);
  const filterId = isOpen ? "filter-popover" : undefined;

  const handleSortFromFilter = (direction) => {
    setSortConfig({ key: currentFilterColumn, direction });
    // Don't close the popover so users can also apply filters
  };

  return (
    <div className="bg-secondary m-2 md:m-10 rounded-xl p-3 md:p-5 w-full md:w-[97%]">
      <div>
        <div className="flex flex-col md:flex-row justify-between">
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
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
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
        <div className="flex flex-col md:flex-row">
          <button
            className="bg-blue-500 p-2 md:p-3 md:mt-0 md:ml-4 text-white rounded-lg text-center flex justify-center hover:bg-blue-700 my-2"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="border border-slate-950 py-2 md:py-3 px-3 md:px-4 my-2 md:mt-0 md:ml-4 rounded-lg text-center flex justify-center hover:bg-slate-200"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="bg-purple-600 p-2 md:p-3 md:mt-0 md:ml-4 text-white rounded-lg text-center flex justify-center hover:bg-purple-700 my-2"
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
            className="hidden md:flex items-center gap-2 my-2 md:mt-0 md:ml-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
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

      {/* Table Container */}
      <div className="overflow-x-auto relative">
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
            {/* Corridor Requests Table */}
            <h2 className="text-2xl font-bold text-blue-700 my-5">
              Corridor Requests
            </h2>
            <table className="w-full border-collapse border border-gray-300 mb-10">
              <thead>
                <tr className="">
                  {[
                    { id: "requestId", label: "Request ID" },
                    { id: "corridorType", label: "Corridor Type" },
                    { id: "date", label: "Date of Block Request" },
                    { id: "selectedDepartment", label: "Department" },
                    { id: "selectedSection", label: "MajorSection" },
                    { id: "selectedDepo", label: "Depo/SSE" },
                    // { id: 'stationID', label: 'Block Section' },
                    { id: "missionBlock", label: "Block Section/Yard" },

                    { id: "workType", label: "Work Type" },
                    { id: "workDescription", label: "Activity" },
                    { id: "demandTimeFrom", label: "Demand Time (From)" },
                    { id: "demandTimeTo", label: "Demand Time (To)" },
                    { id: "selectedLine", label: "Line Selected" },
                    { id: "cautionRequired", label: "Caution Required" },
                    { id: "cautionSpeed", label: "Caution Speed" },
                    {
                      id: "cautionLocationFrom",
                      label: "Caution Location (From)",
                    },
                    { id: "cautionLocationTo", label: "Caution Location (To)" },
                    { id: "workLocationFrom", label: "Work Location (From)" },
                    { id: "workLocationTo", label: "Work Location (To)" },
                    { id: "sigDisconnection", label: "SIG Disconnection" },
                    {
                      id: "ohDisconnection",
                      label: "Power Block Disconnection",
                    },
                    {
                      id: "elementarySectionFrom",
                      label: "Elementary Section (From)",
                    },
                    {
                      id: "elementarySectionTo",
                      label: "Elementary Section (To)",
                    },
                    { id: "otherLinesAffected", label: "Other Lines Affected" },
                  ].map((column) => (
                    <th
                      key={column.id}
                      className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-1 justify-between">
                        <div
                          className="flex-grow"
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label} {getFilterIcon(column.id)}
                        </div>
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleFilterClick(e, column.id, "corridor")
                          }
                          className="p-0.5"
                        >
                          <FilterListIcon
                            fontSize="small"
                            color={
                              corridorFilters[column.id] ? "primary" : "inherit"
                            }
                          />
                        </IconButton>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCorridorRequests.length > 0 ? (
                  filteredCorridorRequests.map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 whitespace-nowrap">
                        {request.requestId}
                      </td>
                      <td className="border border-gray-300 p-3 whitespace-nowrap">
                        {request.corridorType}
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
                        {request.selectedDepo}
                      </td>
                      {/* <td className="border border-gray-300 p-3 whitespace-nowrap">{request.stationID}</td> */}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={23}
                      className="border border-gray-300 p-3 text-center"
                    >
                      No corridor requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Non-Corridor Requests Table */}
            <h2 className="text-2xl font-bold text-green-700 my-5">
              Non-Corridor Requests
            </h2>
            <table className="w-full border-collapse border border-gray-300 mb-10">
              <thead>
                <tr className="">
                  {[
                    { id: "requestId", label: "Request ID" },
                    { id: "date", label: "Date of Block Request" },
                    { id: "selectedDepartment", label: "Department" },
                    { id: "selectedSection", label: "MajorSection" },
                    { id: "selectedDepo", label: "Depo/SSE" },
                    // { id: 'stationID', label: 'Block Section' },
                    { id: "missionBlock", label: "Block Section/Yard" },
                    // { id: "corridorType", label: "Corridor Type" },
                    { id: "workType", label: "Work Type" },
                    { id: "workDescription", label: "Activity" },
                    { id: "demandTimeFrom", label: "Demand Time (From)" },
                    { id: "demandTimeTo", label: "Demand Time (To)" },
                    { id: "selectedLine", label: "Line Selected" },
                    { id: "cautionRequired", label: "Caution Required" },
                    { id: "cautionSpeed", label: "Caution Speed" },
                    {
                      id: "cautionLocationFrom",
                      label: "Caution Location (From)",
                    },
                    { id: "cautionLocationTo", label: "Caution Location (To)" },
                    { id: "workLocationFrom", label: "Work Location (From)" },
                    { id: "workLocationTo", label: "Work Location (To)" },
                    { id: "sigDisconnection", label: "SIG Disconnection" },
                    {
                      id: "ohDisconnection",
                      label: "Power Block Disconnection",
                    },
                    {
                      id: "elementarySectionFrom",
                      label: "Elementary Section (From)",
                    },
                    {
                      id: "elementarySectionTo",
                      label: "Elementary Section (To)",
                    },
                    { id: "otherLinesAffected", label: "Other Lines Affected" },
                  ].map((column) => (
                    <th
                      key={column.id}
                      className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-1 justify-between">
                        <div
                          className="flex-grow"
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label} {getFilterIcon(column.id)}
                        </div>
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleFilterClick(e, column.id, "nonCorridor")
                          }
                          className="p-0.5"
                        >
                          <FilterListIcon
                            fontSize="small"
                            color={
                              nonCorridorFilters[column.id]
                                ? "primary"
                                : "inherit"
                            }
                          />
                        </IconButton>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredNonCorridorRequests.length > 0 ? (
                  filteredNonCorridorRequests.map((request) => (
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
                        {request.selectedDepo}
                      </td>
                      {/* <td className="border border-gray-300 p-3 whitespace-nowrap">{request.stationID}</td> */}
                      <td className="border border-gray-300 p-3 whitespace-nowrap">
                        {request.missionBlock}
                      </td>
                      {/* <td className="border border-gray-300 p-3 whitespace-nowrap">
                        {request.corridorType}
                      </td> */}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={23}
                      className="border border-gray-300 p-3 text-center"
                    >
                      No non-corridor requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Emergency Requests Table */}
            {emergencyRequests.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-red-600 my-5">
                  Emergency Block Requests
                </h2>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="">
                      {[
                        { id: "requestId", label: "Request ID" },
                        { id: "date", label: "Date of Block Request" },
                        { id: "selectedDepartment", label: "Department" },
                        { id: "selectedSection", label: "MajorSection" },
                        { id: "selectedDepo", label: "Depo/SSE" },
                        // { id: 'stationID', label: 'Block Section' },
                        { id: "missionBlock", label: "Block Section/Yard" },
                        { id: "corridorType", label: "Corridor Type" },
                        { id: "workType", label: "Work Type" },
                        { id: "workDescription", label: "Activity" },
                        { id: "demandTimeFrom", label: "Demand Time (From)" },
                        { id: "demandTimeTo", label: "Demand Time (To)" },
                        { id: "selectedLine", label: "Line Selected" },
                        { id: "cautionRequired", label: "Caution Required" },
                        { id: "cautionSpeed", label: "Caution Speed" },
                        {
                          id: "cautionLocationFrom",
                          label: "Caution Location (From)",
                        },
                        {
                          id: "cautionLocationTo",
                          label: "Caution Location (To)",
                        },
                        {
                          id: "workLocationFrom",
                          label: "Work Location (From)",
                        },
                        { id: "workLocationTo", label: "Work Location (To)" },
                        { id: "sigDisconnection", label: "SIG Disconnection" },
                        {
                          id: "ohDisconnection",
                          label: "Power Block Disconnection",
                        },
                        {
                          id: "elementarySectionFrom",
                          label: "Elementary Section (From)",
                        },
                        {
                          id: "elementarySectionTo",
                          label: "Elementary Section (To)",
                        },
                        {
                          id: "otherLinesAffected",
                          label: "Other Lines Affected",
                        },
                      ].map((column) => (
                        <th
                          key={column.id}
                          className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-1 justify-between">
                            <div
                              className="flex-grow"
                              onClick={() => handleSort(column.id)}
                            >
                              {column.label} {getFilterIcon(column.id)}
                            </div>
                            <IconButton
                              size="small"
                              onClick={(e) => handleFilterClick(e, column.id)}
                              className="p-0.5"
                            >
                              <FilterListIcon
                                fontSize="small"
                                color={
                                  filters[column.id] ? "primary" : "inherit"
                                }
                              />
                            </IconButton>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyRequests.map((request) => (
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
                          {request.selectedDepo}
                        </td>
                        {/* <td className="border border-gray-300 p-3 whitespace-nowrap">{request.stationID}</td> */}
                        <td className="border border-gray-300 p-3 whitespace-nowrap">
                          {request.missionBlock}
                        </td>
                        <td className="border border-gray-300 p-3 whitespace-nowrap">
                          {request.corridorType}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Filter Popover */}
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
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Filter {currentFilterColumn}</h3>
              <button
                className="text-blue-600 text-sm"
                onClick={() => {
                  if (currentTable === "corridor") {
                    setCorridorFilters({});
                  } else if (currentTable === "nonCorridor") {
                    setNonCorridorFilters({});
                  }
                }}
              >
                Clear Filter
              </button>
            </div>

            {currentFilterColumn &&
              getUniqueValues(
                currentTable === "corridor"
                  ? filteredCorridorRequests
                  : filteredNonCorridorRequests,
                currentFilterColumn
              ).map((value) => (
                <div key={value} className="my-1">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          currentTable === "corridor"
                            ? corridorFilters[currentFilterColumn]?.includes(
                                value
                              ) || false
                            : nonCorridorFilters[currentFilterColumn]?.includes(
                                value
                              ) || false
                        }
                        onChange={() => {
                          if (currentTable === "corridor") {
                            handleCorridorFilterChange(
                              value,
                              currentFilterColumn
                            );
                          } else if (currentTable === "nonCorridor") {
                            handleNonCorridorFilterChange(
                              value,
                              currentFilterColumn
                            );
                          }
                        }}
                        size="small"
                      />
                    }
                    label={<span className="text-sm">{value}</span>}
                  />
                </div>
              ))}
          </div>
        </Popover>

        {/* Mobile Table (Vertical Layout) */}
        <div className="md:hidden">
          {/* Corridor Requests Mobile View */}
          <h2 className="text-xl font-bold text-blue-700 my-3">
            Corridor Requests
          </h2>
          {corridorRequests.length > 0 ? (
            corridorRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-300"
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
          <h2 className="text-xl font-bold text-green-700 my-3">
            Non-Corridor Requests
          </h2>
          {nonCorridorRequests.length > 0 ? (
            nonCorridorRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-300"
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
              No non-corridor requests found
            </div>
          )}

          {/* Emergency Requests Mobile View */}
          {emergencyRequests.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-red-600 my-3">
                Emergency Block Requests
              </h2>
              {emergencyRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-300"
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
          className={`flex flex-col md:flex-row justify-around ${
            isFullScreen ? "fixed bottom-4 left-0 right-0" : ""
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
