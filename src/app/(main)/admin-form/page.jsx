"use client";
import React, { useState } from "react";
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
  InputLabel,
  FormControl,
} from "@mui/material";
import { CSVLink } from "react-csv";
import { getAdminFormData } from "../../actions/formdata";

const SearchForm = () => {
  const [searchType, setSearchType] = useState("");
  const [searchLine, setSearchLine] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filteredRequests, setFilteredRequests] = useState([]);

  const handleSearch = async () => {
    console.log({ searchType, searchLine, dateRange });
    const requests = await getAdminFormData(searchType, searchLine, dateRange);
    setFilteredRequests(requests.requestData);
  };

  return (
    <div>
      <div>
        <div className="flex justify-between">
          <FormControl fullWidth margin="normal" sx={{ margin: 2 }}>
            <InputLabel id="search-type-label">Search By</InputLabel>
            <Select
              labelId="search-type-label"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              label="Search By"
            >
              <MenuItem value="section">Section</MenuItem>
              <MenuItem value="station">Station</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" sx={{ margin: 2 }}>
            <InputLabel id="search-Line-label">Search By Line</InputLabel>
            <Select
              labelId="search-Line-label"
              value={searchLine}
              onChange={(e) => setSearchLine(e.target.value)}
              label="Select Line "
            >
              <MenuItem value="Up">Up</MenuItem>
              <MenuItem value="Up Fast">Up Fast</MenuItem>
              <MenuItem value="Up Slow">Up Slow</MenuItem>
              <MenuItem value="Up Suburban">Up Suburban</MenuItem>
              <MenuItem value="down">Down</MenuItem>
              <MenuItem value="down Fast">Down Fast</MenuItem>
              <MenuItem value="down Slow">Down Slow</MenuItem>
              <MenuItem value="down Suburban">Down Suburban</MenuItem>
              <MenuItem value="A Line">A Line</MenuItem>
              <MenuItem value="B Line">B Line</MenuItem>
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
        <button
          className="bg-cyan-500 p-3 ml-4 text-white rounded-lg text-center flex justify-center"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        <Table sx={{ minWidth: 800 }} aria-label="request table">
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

      {/* {filteredRequests.length > 0 && ( */}
      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2, marginBottom: 4 }}
      >
        <CSVLink
          data={filteredRequests}
          filename={"requests.csv"}
          style={{ textDecoration: "none", color: "white" }}
        >
          Download CSV
        </CSVLink>
      </Button>
      {/* )} */}
    </div>
  );
};

export default SearchForm;
