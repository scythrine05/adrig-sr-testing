"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugRequestsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    depo: '',
    sigDisconnection: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.depo) queryParams.append('depo', filters.depo);
        if (filters.sigDisconnection) queryParams.append('sigDisconnection', filters.sigDisconnection);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`/api/debug-requests-table${queryString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Requests</h1>
      
      {session && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Current Session</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-2">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Departments</option>
              <option value="ENGG">ENGG</option>
              <option value="SIG">SIG</option>
              <option value="TRD">TRD</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Depo</label>
            <input
              type="text"
              name="depo"
              value={filters.depo}
              onChange={handleFilterChange}
              placeholder="Enter depo"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">SIG Disconnection</label>
            <select
              name="sigDisconnection"
              value={filters.sigDisconnection}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>
      
      {data && (
        <div>
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-lg font-medium">Total Requests</div>
                <div className="text-3xl font-bold">{data.totalCount}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-lg font-medium">SIG Disconnection</div>
                <div className="text-3xl font-bold">{data.sigDisconnectionCount}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-lg font-medium">OHE Disconnection</div>
                <div className="text-3xl font-bold">{data.oheDisconnectionCount}</div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Requests ({data.totalCount})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">Request ID</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Depo</th>
                  <th className="border p-2">SIG Disconnection</th>
                  <th className="border p-2">OHE Disconnection</th>
                  <th className="border p-2">Manager ID</th>
                  <th className="border p-2">User ID</th>
                  <th className="border p-2">SIG Response</th>
                  <th className="border p-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map(req => (
                  <tr key={req.requestId}>
                    <td className="border p-2">{req.requestId}</td>
                    <td className="border p-2">{req.date}</td>
                    <td className="border p-2">{req.selectedDepartment}</td>
                    <td className="border p-2">{req.selectedDepo}</td>
                    <td className="border p-2">{req.sigDisconnection}</td>
                    <td className="border p-2">{req.oheDisconnection || req.ohDisconnection || "No"}</td>
                    <td className="border p-2">{req.managerId || "N/A"}</td>
                    <td className="border p-2">{req.userId || "N/A"}</td>
                    <td className="border p-2">{req.sigResponse || "N/A"}</td>
                    <td className="border p-2">{new Date(req.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 