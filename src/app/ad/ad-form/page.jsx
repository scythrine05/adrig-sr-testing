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

const SearchForm = () => {
  let timerfirst;
  const [searchType, setSearchType] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentReq, setCurrentReq] = useState(null);
  const [clear, setClear] = useState(true);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getFormDataAll();
        // setFilteredRequests(res.requestData);
        const formattedData = formatData(res.requestData);
        const finalData = formattedData.map((e) => {
          return {
            ...e,
            selectedLine:  e.selectedLine && e.selectedLine.split(":")[1],
          };
        });
        setFilteredRequests(finalData);
        setCurrentReq(formattedData);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
    localStorage.setItem("optimizedbuttonnotclicked", "true");
  }, [clear]);

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

    const formattedData = formatData(requests.res);
    setFilteredRequests(formattedData);
  };

  const handleClear = async () => {
    setSearchDepartment("");
    setDateRange({ from: "", to: "" });
    setClear((prev) => !prev);
  };

  const handleOptimize = async () => {
    localStorage.setItem("sanctionTableVisible", "false");
    console.log(localStorage["sanctionTableVisible"],"local")
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
    <div className="flex flex-col md:flex-row">
      <button
        className="bg-blue-500 p-2 md:p-3 mt-2 md:mt-0 md:ml-4 text-white rounded-lg text-center flex justify-center hover:bg-blue-700"
        onClick={handleSearch}
      >
        Search
      </button>
      <button
        className="border border-slate-950 py-2 md:py-3 px-3 md:px-4 mt-2 md:mt-0 md:ml-4 rounded-lg text-center flex justify-center hover:bg-slate-200"
        onClick={handleClear}
      >
        Clear
      </button>
    </div>
  </div>


  {/* Table Container */}
  <div className="overflow-x-auto">
    {/* Desktop Table */}
    <table className="w-full hidden md:table border-collapse border border-gray-300">
      <thead>
        <tr className="">
          <th className="border border-gray-300 p-2">Request ID</th>
          <th className="border border-gray-300 p-2">Date of Request</th>
          <th className="border border-gray-300 p-2">Department</th>
          <th className="border border-gray-300 p-2">Section</th>
          <th className="border border-gray-300 p-2">Depo/SSE</th>
          <th className="border border-gray-300 p-2">Block Section</th>
          <th className="border border-gray-300 p-2">Selected Block</th>
          <th className="border border-gray-300 p-2">Work Description</th>
          <th className="border border-gray-300 p-2">Work Type Selected</th>
          <th className="border border-gray-300 p-2">Line Selected</th>
          <th className="border border-gray-300 p-2">Caution Required</th>
          <th className="border border-gray-300 p-2">Caution Speed</th>
          <th className="border border-gray-300 p-2">Caution Location (From)</th>
          <th className="border border-gray-300 p-2">Caution Location (To)</th>
          <th className="border border-gray-300 p-2">Work Location (From)</th>
          <th className="border border-gray-300 p-2">Work Location (To)</th>
          <th className="border border-gray-300 p-2">Demand Time (From)</th>
          <th className="border border-gray-300 p-2">Demand Time (To)</th>
          <th className="border border-gray-300 p-2">SIG Disconnection</th>
          <th className="border border-gray-300 p-2">OHE Disconnection</th>
          <th className="border border-gray-300 p-2">Elementary Section (From)</th>
          <th className="border border-gray-300 p-2">Elementary Section (To)</th>
          <th className="border border-gray-300 p-2">Other Lines Affected</th>
        </tr>
      </thead>
      <tbody>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <tr key={request.requestId} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{request.requestId}</td>
              <td className="border border-gray-300 p-2">{request.date}</td>
              <td className="border border-gray-300 p-2">{request.selectedDepartment}</td>
              <td className="border border-gray-300 p-2">{request.selectedSection}</td>
              <td className="border border-gray-300 p-2">{request.selectedDepo}</td>
              <td className="border border-gray-300 p-2">{request.stationID}</td>
              <td className="border border-gray-300 p-2">{request.missionBlock}</td>
              <td className="border border-gray-300 p-2">{request.workDescription}</td>
              <td className="border border-gray-300 p-2">{request.workType}</td>
              <td className="border border-gray-300 p-2">{request.selectedLine}</td>
              <td className="border border-gray-300 p-2">{request.cautionRequired}</td>
              <td className="border border-gray-300 p-2">{request.cautionSpeed}</td>
              <td className="border border-gray-300 p-2">{request.cautionLocationFrom}</td>
              <td className="border border-gray-300 p-2">{request.cautionLocationTo}</td>
              <td className="border border-gray-300 p-2">{request.workLocationFrom}</td>
              <td className="border border-gray-300 p-2">{request.workLocationTo}</td>
              <td className="border border-gray-300 p-2">{request.demandTimeFrom}</td>
              <td className="border border-gray-300 p-2">{request.demandTimeTo}</td>
              <td className="border border-gray-300 p-2">{request.sigDisconnection}</td>
              <td className="border border-gray-300 p-2">{request.ohDisconnection}</td>
              <td className="border border-gray-300 p-2">{request.elementarySectionFrom}</td>
              <td className="border border-gray-300 p-2">{request.elementarySectionTo}</td>
              <td className="border border-gray-300 p-2">{request.otherLinesAffected}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={23} className="border border-gray-300 p-2 text-center">
              No requests found
            </td>
          </tr>
        )}
      </tbody>
    </table>

    {/* Mobile Table (Vertical Layout) */}
    <div className="md:hidden">
      {filteredRequests.length > 0 ? (
        filteredRequests.map((request) => (
          <div key={request.requestId} className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-300">
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-gray-300 p-2"><strong>Request ID:</strong></div>
              <div className="border border-gray-300 p-2">{request.requestId}</div>
              <div className="border border-gray-300 p-2"><strong>Date of Request:</strong></div>
              <div className="border border-gray-300 p-2">{request.date}</div>
              <div className="border border-gray-300 p-2"><strong>Department:</strong></div>
              <div className="border border-gray-300 p-2">{request.selectedDepartment}</div>
              <div className="border border-gray-300 p-2"><strong>Section:</strong></div>
              <div className="border border-gray-300 p-2">{request.selectedSection}</div>
              <div className="border border-gray-300 p-2"><strong>Depo/SSE:</strong></div>
              <div className="border border-gray-300 p-2">{request.selectedDepo}</div>
              <div className="border border-gray-300 p-2"><strong>Block Section:</strong></div>
              <div className="border border-gray-300 p-2">{request.stationID}</div>
              <div className="border border-gray-300 p-2"><strong>Selected Block:</strong></div>
              <div className="border border-gray-300 p-2">{request.missionBlock}</div>
              <div className="border border-gray-300 p-2"><strong>Work Description:</strong></div>
              <div className="border border-gray-300 p-2">{request.workDescription}</div>
              <div className="border border-gray-300 p-2"><strong>Work Type Selected:</strong></div>
              <div className="border border-gray-300 p-2">{request.workType}</div>
              <div className="border border-gray-300 p-2"><strong>Line Selected:</strong></div>
              <div className="border border-gray-300 p-2">{request.selectedLine}</div>
              <div className="border border-gray-300 p-2"><strong>Caution Required:</strong></div>
              <div className="border border-gray-300 p-2">{request.cautionRequired}</div>
              <div className="border border-gray-300 p-2"><strong>Caution Speed:</strong></div>
              <div className="border border-gray-300 p-2">{request.cautionSpeed}</div>
              <div className="border border-gray-300 p-2"><strong>Caution Location (From):</strong></div>
              <div className="border border-gray-300 p-2">{request.cautionLocationFrom}</div>
              <div className="border border-gray-300 p-2"><strong>Caution Location (To):</strong></div>
              <div className="border border-gray-300 p-2">{request.cautionLocationTo}</div>
              <div className="border border-gray-300 p-2"><strong>Work Location (From):</strong></div>
              <div className="border border-gray-300 p-2">{request.workLocationFrom}</div>
              <div className="border border-gray-300 p-2"><strong>Work Location (To):</strong></div>
              <div className="border border-gray-300 p-2">{request.workLocationTo}</div>
              <div className="border border-gray-300 p-2"><strong>Demand Time (From):</strong></div>
              <div className="border border-gray-300 p-2">{request.demandTimeFrom}</div>
              <div className="border border-gray-300 p-2"><strong>Demand Time (To):</strong></div>
              <div className="border border-gray-300 p-2">{request.demandTimeTo}</div>
              <div className="border border-gray-300 p-2"><strong>SIG Disconnection:</strong></div>
              <div className="border border-gray-300 p-2">{request.sigDisconnection}</div>
              <div className="border border-gray-300 p-2"><strong>OHE Disconnection:</strong></div>
              <div className="border border-gray-300 p-2">{request.ohDisconnection}</div>
              <div className="border border-gray-300 p-2"><strong>Elementary Section (From):</strong></div>
              <div className="border border-gray-300 p-2">{request.elementarySectionFrom}</div>
              <div className="border border-gray-300 p-2"><strong>Elementary Section (To):</strong></div>
              <div className="border border-gray-300 p-2">{request.elementarySectionTo}</div>
              <div className="border border-gray-300 p-2"><strong>Other Lines Affected:</strong></div>
              <div className="border border-gray-300 p-2">{request.otherLinesAffected}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center">No requests found</div>
      )}
    </div>
  </div>



  {filteredRequests.length > 0 && (
    <div className="flex flex-col md:flex-row justify-around">
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
      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2, marginBottom: 2 }}
        onClick={() => {
          localStorage.setItem("optimizedbuttonnotclicked", "false");
          clearTimeout(timerfirst);
          handleOptimize();
        }}
      >
        Optimise
      </Button>
    </div>
  )}
  {loading && (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 ">
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
