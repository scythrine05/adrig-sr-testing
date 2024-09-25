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
  postDataOptimised,
  postDataOptimisedFirst,
} from "../../actions/optimisetable";
import { Oval } from "react-loader-spinner";

import { useToast } from "../../../components/ui/use-toast";

const SearchForm = () => {
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
        setFilteredRequests(res.requestData);
        setCurrentReq(res.requestData);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, [clear]);

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
    setFilteredRequests(requests.res);
  };

  const handleClear = async () => {
    setSearchDepartment("");
    setDateRange({ from: "", to: "" });
    setClear((prev) => !prev);
  };

  const handleOptimize = async () => {
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
          `https://sr.adrig.co.in/backend/optimize`,
          {
            requestData: currentReq,
          }
        );
        const data = res.data.optimizedData;
        const res1 = await deleteOptimizedData();

        data.forEach(async (e) => {
          try {
            const res1 = await postDataOptimisedFirst(e);
          } catch (e) {
            console.log(e);
          }
        });
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
    <div>
      <div>
        <div className="flex justify-between">
          <FormControl fullWidth margin="normal" sx={{ margin: 2 }}>
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
            sx={{ margin: 2 }}
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
            sx={{ margin: 2 }}
            label="Date To"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </div>
        <div className="flex">
          <button
            className="bg-blue-500 p-3 ml-4 text-white rounded-lg text-center flex justify-center hover:bg-blue-700"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="border border-slate-950 py-3 px-4 ml-4  rounded-lg text-center flex justify-center hover:bg-slate-200"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: 4,
          position: "relative",
          maxHeight: 550,
          border: "solid 1px #ddd",
        }}
      >
        <Table
          sx={{ minWidth: 800 }}
          aria-label="request table"
          stickyHeader={!loading}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Request ID</strong>
              </TableCell>
              <TableCell>
                <strong>Date of Request</strong>
              </TableCell>
              <TableCell>
                <strong>Department</strong>
              </TableCell>
              <TableCell>
                <strong>Section</strong>
              </TableCell>
              <TableCell>
                <strong>Block Section</strong>
              </TableCell>
              <TableCell>
                <strong>Selected Block</strong>
              </TableCell>
              <TableCell>
                <strong>Work Description</strong>
              </TableCell>
              <TableCell>
                <strong>Work Type Selected</strong>
              </TableCell>
              <TableCell>
                <strong>Line Selected</strong>
              </TableCell>
              <TableCell>
                <strong>Caution Required</strong>
              </TableCell>
              <TableCell>
                <strong>Caution Speed</strong>
              </TableCell>
              <TableCell>
                <strong>Caution Location (From)</strong>
              </TableCell>
              <TableCell>
                <strong>Caution Location (To)</strong>
              </TableCell>
              <TableCell>
                <strong>Work Location (From)</strong>
              </TableCell>
              <TableCell>
                <strong>Work Location (To)</strong>
              </TableCell>
              <TableCell>
                <strong>Demand Time (From)</strong>
              </TableCell>
              <TableCell>
                <strong>Demand Time (To)</strong>
              </TableCell>
              <TableCell>
                <strong>SIG Disconnection</strong>
              </TableCell>
              <TableCell>
                <strong>OHE Disconnection</strong>
              </TableCell>
              <TableCell>
                <strong>Elementary Section (From)</strong>
              </TableCell>
              <TableCell>
                <strong>Elementary Section (To)</strong>
              </TableCell>
              <TableCell>
                <strong>Other Lines Affected</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.requestId}>
                  <TableCell>{request.requestId}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{request.selectedDepartment}</TableCell>
                  <TableCell>{request.selectedSection}</TableCell>
                  <TableCell>{request.stationID}</TableCell>
                  <TableCell>{request.missionBlock}</TableCell>
                  <TableCell>{request.workDescription}</TableCell>
                  <TableCell>{request.workType}</TableCell>
                  <TableCell>{request.selectedLine}</TableCell>
                  <TableCell>{request.cautionRequired}</TableCell>
                  <TableCell>{request.cautionSpeed}</TableCell>
                  <TableCell>{request.cautionLocationFrom}</TableCell>
                  <TableCell>{request.cautionLocationTo}</TableCell>
                  <TableCell>{request.workLocationFrom}</TableCell>
                  <TableCell>{request.workLocationTo}</TableCell>
                  <TableCell>{request.demandTimeFrom}</TableCell>
                  <TableCell>{request.demandTimeTo}</TableCell>
                  <TableCell>{request.sigDisconnection}</TableCell>
                  <TableCell>{request.ohDisconnection}</TableCell>
                  <TableCell>{request.elementarySectionFrom}</TableCell>
                  <TableCell>{request.elementarySectionTo}</TableCell>
                  <TableCell>{request.otherLinesAffected}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={21} align="center">
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredRequests.length > 0 && (
        <div className="flex justify-around">
          <div>
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2, marginBottom: 4 }}
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
            sx={{ marginTop: 2, marginBottom: 4 }}
            onClick={handleOptimize}
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
