"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugOtherRequestsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [userInfo, setUserInfo] = useState({
    department: '',
    depo: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!userInfo.department || !userInfo.depo) {
        setError("Department and depo are required");
        setLoading(false);
        return;
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('department', userInfo.department);
      queryParams.append('depo', userInfo.depo);
      if (userInfo.email) {
        queryParams.append('email', userInfo.email);
      }
      
      const response = await fetch(`/api/debug-other-requests?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      setUserInfo(prev => ({
        ...prev,
        email: session.user.email
      }));
    }
  }, [session]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Other Requests</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-2">Department</label>
            <select
              name="department"
              value={userInfo.department}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Department</option>
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
              value={userInfo.depo}
              onChange={handleInputChange}
              placeholder="Enter depo"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Email (optional)</label>
            <input
              type="email"
              name="email"
              value={userInfo.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Test Other Requests'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {data && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Query Information</h2>
            <div className="mb-4">
              <h3 className="font-bold">Parameters</h3>
              <p>Department: {data.parameters.department}</p>
              <p>Depo: {data.parameters.depo}</p>
            </div>
            
            {data.user && (
              <div className="mb-4">
                <h3 className="font-bold">User</h3>
                <p>ID: {data.user.id}</p>
                <p>Name: {data.user.name}</p>
                <p>Department: {data.user.department}</p>
                <p>Depot: {data.user.depot}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-bold">Query Condition</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data.query.condition, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-lg font-medium">Filtered Requests</div>
                <div className="text-3xl font-bold">{data.results.filteredRequests.count}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-lg font-medium">All SIG Disconnection</div>
                <div className="text-3xl font-bold">{data.results.allSigRequests.count}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-lg font-medium">ENGG SIG Disconnection</div>
                <div className="text-3xl font-bold">{data.results.enggSigRequests.count}</div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Filtered Requests ({data.results.filteredRequests.count})</h2>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">Request ID</th>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Depo</th>
                  <th className="border p-2">SIG Disconnection</th>
                  <th className="border p-2">OHE Disconnection</th>
                  <th className="border p-2">Manager ID</th>
                </tr>
              </thead>
              <tbody>
                {data.results.filteredRequests.data.length > 0 ? (
                  data.results.filteredRequests.data.map(req => (
                    <tr key={req.requestId}>
                      <td className="border p-2">{req.requestId}</td>
                      <td className="border p-2">{req.selectedDepartment}</td>
                      <td className="border p-2">{req.selectedDepo}</td>
                      <td className="border p-2">{req.sigDisconnection}</td>
                      <td className="border p-2">{req.oheDisconnection || req.ohDisconnection || "No"}</td>
                      <td className="border p-2">{req.managerId || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="border p-2 text-center">No requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">All SIG Disconnection Requests ({data.results.allSigRequests.count})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">Request ID</th>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Depo</th>
                  <th className="border p-2">SIG Disconnection</th>
                  <th className="border p-2">OHE Disconnection</th>
                  <th className="border p-2">Manager ID</th>
                </tr>
              </thead>
              <tbody>
                {data.results.allSigRequests.data.length > 0 ? (
                  data.results.allSigRequests.data.map(req => (
                    <tr key={req.requestId}>
                      <td className="border p-2">{req.requestId}</td>
                      <td className="border p-2">{req.selectedDepartment}</td>
                      <td className="border p-2">{req.selectedDepo}</td>
                      <td className="border p-2">{req.sigDisconnection}</td>
                      <td className="border p-2">{req.oheDisconnection || req.ohDisconnection || "No"}</td>
                      <td className="border p-2">{req.managerId || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="border p-2 text-center">No requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 