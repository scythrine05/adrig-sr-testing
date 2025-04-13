'use client';

import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import { getFormDataAll } from '../../actions/formdata';

export default function AdVisualizationPage() {
  const initialData = [
    ["Line", "Task", "Start", "End"],
    ["Loading", "Loading...", new Date(), new Date()]
  ];

  const [data, setData] = useState(initialData);
  const [allRequests, setAllRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const departmentColors = {
    'SIG': '#FF6B6B',
    'ENGG': '#4ECDC4',
    'TRD': '#45B7D1',
  };

  const departments = ['all', 'SIG', 'ENGG', 'TRD'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (allRequests.length > 0) {
      filterAndUpdateChart();
    }
  }, [selectedDate, selectedDepartment]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getFormDataAll();
      if (response.requestData) {
        console.log("All Requests:", response.requestData);
        setAllRequests(response.requestData);
        filterAndUpdateChart(response.requestData);
      }
    } catch (err) {
      setError('Failed to fetch requests');
      console.error('Error fetching requests:', err);
      setData(initialData);
    } finally {
      setLoading(false);
    }
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return { hours, minutes };
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const filterAndUpdateChart = (requests = allRequests) => {
    try {
      setLoading(true);
      console.log("Current selected date:", selectedDate);
      console.log("Current selected department:", selectedDepartment);
      
      if (!requests.length) {
        console.log("No requests available");
        setData(initialData);
        return;
      }

      const filteredRequests = requests.filter(request => {
        // Format both dates to ensure consistent comparison
        const requestDate = formatDate(request.date);
        const filterDate = formatDate(selectedDate);
        
        const dateMatch = requestDate === filterDate;
        const deptMatch = selectedDepartment === 'all' || request.selectedDepartment === selectedDepartment;
        
        console.log("Request:", {
          requestDate,
          filterDate,
          dateMatch,
          deptMatch,
          department: request.selectedDepartment
        });
        
        return dateMatch && deptMatch;
      });

      console.log("Filtered Requests:", filteredRequests);

      if (filteredRequests.length === 0) {
        console.log("No matching requests found");
        const baseDate = new Date(selectedDate + 'T00:00:00');
        setData([
          ["Line", "Task", "Start", "End"],
          ["No Data", "No requests found", baseDate, new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)]
        ]);
        return;
      }

      const validRows = filteredRequests.map(request => {
        let lineName = 'Unknown Line';
        try {
          const lines = typeof request.selectedLine === 'string' 
            ? JSON.parse(request.selectedLine) 
            : request.selectedLine;
          
          // Handle the complex line object structure
          if (typeof lines === 'object') {
            if (lines.station && lines.station.length > 0) {
              lineName = lines.station[0];
            } else if (lines.yard && lines.yard.length > 0) {
              lineName = lines.yard[0];
            }
          } else if (Array.isArray(lines)) {
            lineName = lines[0];
          } else if (lines) {
            lineName = String(lines);
          }
          
          console.log("Parsed line name:", lineName);
        } catch (err) {
          console.error('Error parsing line:', err);
        }

        const startTime = parseTime(request.demandTimeFrom);
        const endTime = parseTime(request.demandTimeTo);

        if (!startTime || !endTime) {
          console.log("Invalid time format for request:", request);
          return null;
        }

        // Create dates in local timezone
        const startDate = new Date(selectedDate);
        startDate.setHours(startTime.hours, startTime.minutes, 0);

        const endDate = new Date(selectedDate);
        endDate.setHours(endTime.hours, endTime.minutes, 0);

        // Handle case where end time is before start time
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        const row = [
          lineName,
          `[${request.selectedDepartment}] ${request.workDescription || 'No description'}`,
          startDate,
          endDate,
        ];

        console.log("Created row:", {
          line: lineName,
          task: `[${request.selectedDepartment}] ${request.workDescription || 'No description'}`,
          start: startDate.toLocaleString(),
          end: endDate.toLocaleString()
        });

        return row;
      }).filter(Boolean);

      console.log("Valid rows:", validRows);

      if (validRows.length === 0) {
        console.log("No valid rows after processing");
        const baseDate = new Date(selectedDate);
        baseDate.setHours(0, 0, 0, 0);
        setData([
          ["Line", "Task", "Start", "End"],
          ["Error", "Invalid data format", baseDate, new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)]
        ]);
        return;
      }

      const chartData = [
        ["Line", "Task", "Start", "End"],
        ...validRows
      ];

      console.log("Final chart data:", chartData);
      setData(chartData);
      setError(null);
    } catch (err) {
      setError('Error updating chart');
      console.error('Error in filterAndUpdateChart:', err);
      const baseDate = new Date(selectedDate);
      baseDate.setHours(0, 0, 0, 0);
      setData([
        ["Line", "Task", "Start", "End"],
        ["Error", "Error processing data", baseDate, new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)]
      ]);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    height: 500,
    timeline: {
      showRowLabels: true,
      groupByRowLabel: true,
      showBarLabels: true,
      barLabelStyle: { fontName: 'Arial', fontSize: 10 }
    },
    hAxis: {
      format: 'HH:mm',
      minValue: new Date(selectedDate + 'T00:00:00'),
      maxValue: new Date(selectedDate + 'T23:59:59')
    },
    avoidOverlappingGridLines: false,
    backgroundColor: '#ffffff',
    colors: [departmentColors['SIG'], departmentColors['ENGG'], departmentColors['TRD']],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Request Visualization</h1>
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-md px-3 py-2"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="border rounded-md px-3 py-2"
                  disabled={loading}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              {Object.entries(departmentColors).map(([dept, color]) => (
                <div key={dept} className="flex items-center">
                  <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }}></div>
                  <span>{dept}</span>
                </div>
              ))}
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <Chart
            chartType="Timeline"
            width="100%"
            height="600px"
            data={data}
            options={options}
          />
        </div>
      </div>
    </div>
  );
}
