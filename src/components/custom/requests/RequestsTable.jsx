"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Link from "next/link";
import { Button } from "../../ui/button";

const createData = (
  id,
  section,
  station,
  line,
  workType,
  blockType,
  date,
  startTime,
  endTime,
  remarks,
  status
) => {
  return {
    id,
    section,
    station,
    line,
    workType,
    blockType,
    date,
    startTime,
    endTime,
    remarks,
    status,
  };
};

const requests = [
  createData(
    1,
    "RU-AJJ",
    "AJN-AJJ",
    "UP",
    "TEX",
    "Rolling Block",
    "2024-06-06",
    "3:0",
    "3:30",
    "oho",
    "Not Reviewed"
  ),
  createData(
    2,
    "RU-AJJ",
    "TDK-PUT",
    "UP",
    "SBCM",
    "NON-Rolling Block",
    "2024-06-08",
    "4:0",
    "5:0",
    "opk",
    "Not Reviewed"
  ),
  // Add more rows as needed
];

// Helper function to get week dates
const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the date of Monday (start of week)
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);
  
  // Calculate the date of Sunday (end of week)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday,
    end: sunday,
    weekLabel: `Week ${weekOffset === 0 ? '(Current)' : weekOffset > 0 ? '+' + weekOffset : weekOffset}`
  };
};

// Format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const RequestTable = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [requestList, SetRequestList] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    async function fetchData() {
      await axios
        .get(process.env.REACT_APP_API_URI + "/editlineblock")
        .then((res) => {
          SetRequestList(res.data.data.request);
        })
        .catch((error) => console.error(error));
    }
    fetchData();
  }, []);

  // Filter requests by week
  const filteredRequests = requests.filter(request => {
    const requestDate = new Date(request.date);
    return requestDate >= weekDates.start && requestDate <= weekDates.end;
  });

  return (
    <div>
      {/* Week Selection */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            &lt; Prev Week
          </button>
          
          <span className="px-4 py-2 bg-white border border-gray-300 rounded shadow">
            {weekDates.weekLabel}: {formatDate(weekDates.start)} to {formatDate(weekDates.end)}
          </span>
          
          <button 
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            Next Week &gt;
          </button>
          
          {weekOffset !== 0 && (
            <button 
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none ml-2"
            >
              Current Week
            </button>
          )}
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-md border-t shadow-lg">
        {filteredRequests.length === 0 ? (
          <div className="p-4 text-center bg-white">
            No requests to show for this week
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Major Section</TableHead>
                <TableHead className="text-center">Stations</TableHead>
                <TableHead className="text-center">Line</TableHead>
                <TableHead className="text-center">Work Type</TableHead>
                <TableHead className="text-center">Block Type</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Start Time</TableHead>
                <TableHead className="text-center">End Time</TableHead>
                <TableHead className="text-center">Remarks</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Edit</TableHead>
                <TableHead className="text-center">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="text-center">{request.section}</TableCell>
                  <TableCell className="text-center">{request.station}</TableCell>
                  <TableCell className="text-center">{request.line}</TableCell>
                  <TableCell className="text-center">{request.workType}</TableCell>
                  <TableCell className="text-center">{request.blockType}</TableCell>
                  <TableCell className="text-center">{request.date}</TableCell>
                  <TableCell className="text-center">{request.startTime}</TableCell>
                  <TableCell className="text-center">{request.endTime}</TableCell>
                  <TableCell className="text-center">{request.remarks}</TableCell>
                  <TableCell className="text-center">{request.status}</TableCell>
                  <TableCell>
                      <Link href={`/edit/${request.id}`} className="flex items-center">
                      <Button className="bg-blue-500 h-10 w-10" ><Pencil className="bg-transparent w-6 h-6" /></Button></Link>
                  </TableCell>
                  <TableCell><Link  href={`/edit/${request.id}`}>
                  <Button className="bg-red-500 h-10 w-10"><Trash2 className="bg-transparent w-6 h-6" /></Button></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default RequestTable;
