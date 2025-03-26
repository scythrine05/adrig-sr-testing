"use client";
import { useState, useEffect } from "react";
import { getRequests } from "../../actions/superAdmin";

export default function RequestTablePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRequests();
        setRequests(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const filteredRequests = requests.filter((request) =>
    request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (request.User?.name && request.User.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (request.User?.username && request.User.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleRowExpansion = (requestId) => {
    if (expandedRow === requestId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(requestId);
    }
  };

  // Extract column names from the first request
  const getColumnNames = () => {
    if (filteredRequests.length === 0) return [];
    
    // Get all keys and filter out relationship objects
    const columns = Object.keys(filteredRequests[0]).filter(
      key => typeof filteredRequests[0][key] !== 'object' || filteredRequests[0][key] === null
    );
    
    // Add important columns at the beginning
    const priorityColumns = ['requestId', 'date', 'selectedDepartment', 'workDescription', 'workType'];
    
    // Sort columns to show priority columns first
    return [
      ...priorityColumns,
      ...columns.filter(col => !priorityColumns.includes(col))
    ];
  };
  
  // Format header text to be more readable
  const formatHeaderText = (text) => {
    // Handle special cases first
    if (text === 'requestId') return 'Request ID';
    if (text === 'selectedDepartment') return 'Department';
    if (text === 'workDescription') return 'Description';
    if (text === 'workType') return 'Work Type';
    if (text === 'userId') return 'User ID';
    if (text === 'createdAt') return 'Created At';
    if (text === 'updatedAt') return 'Updated At';
    
    // For other cases, capitalize each word and add spaces
    return text
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim(); // Remove any extra spaces
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4 text-black" style={{ color: '#1e3a8a' }}>Request Table</h1>
      
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by ID, description, or user..."
          className="w-full md:w-2/3 p-2 border rounded-md focus:outline-none focus:ring-2 text-black"
          style={{ borderColor: '#1e3a8a', boxShadow: 'focus ? 0 0 0 3px rgba(30, 58, 138, 0.3) : none' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {expandedRow ? (
          <button 
            onClick={() => setExpandedRow(null)}
            className="p-2 rounded hover:opacity-80 text-white"
            style={{ backgroundColor: '#1e3a8a' }}
          >
            Collapse All Details
          </button>
        ) : filteredRequests.length > 0 && (
          <button 
            onClick={() => setExpandedRow(filteredRequests[0].requestId)}
            className="p-2 text-white rounded hover:opacity-80"
            style={{ backgroundColor: '#1e3a8a' }}
          >
            View Details
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-black">Loading...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-black">No requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border" style={{ borderColor: '#1e3a8a' }}>
            <thead style={{ backgroundColor: 'rgba(30, 58, 138, 0.1)' }}>
              <tr>
                {getColumnNames().map(column => (
                  <th key={column} className="py-2 px-4 border-b text-left whitespace-nowrap text-black" 
                      style={{ borderColor: '#1e3a8a' }}>
                    {formatHeaderText(column)}
                  </th>
                ))}
                <th className="py-2 px-4 border-b text-left text-black" style={{ borderColor: '#1e3a8a' }}>
                  Created By
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.requestId} 
                    style={{ 
                      backgroundColor: expandedRow === request.requestId ? 'rgba(30, 58, 138, 0.1)' : 'white'
                    }}
                    className="cursor-pointer hover:bg-opacity-5"
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = expandedRow === request.requestId ? 'rgba(30, 58, 138, 0.1)' : 'white'}
                    onClick={() => toggleRowExpansion(request.requestId)}>
                  {getColumnNames().map(column => (
                    <td key={column} className="py-2 px-4 border-b overflow-hidden text-ellipsis max-w-xs text-black">
                      {column === 'availed' ? (
                        <span 
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ 
                            backgroundColor: request[column] === true ? '#1e3a8a' : 'gray'
                          }}
                        >
                          {request[column] === true ? "Yes" : request[column] === false ? "No" : "N/A"}
                        </span>
                      ) : typeof request[column] === 'object' && request[column] !== null
                        ? JSON.stringify(request[column]).substring(0, 50) + '...'
                        : String(request[column] !== null && request[column] !== undefined ? request[column] : 'N/A')}
                    </td>
                  ))}
                  
                  <td className="py-2 px-4 border-b text-black">{request.User?.name || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {expandedRow && (
            <div className="mt-4 p-4 rounded-lg border bg-white" 
                 style={{ borderColor: '#1e3a8a' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-black">Full Request Details</h3>
                <button 
                  onClick={() => setExpandedRow(null)}
                  className="px-2 py-1 rounded text-sm text-white"
                  style={{ backgroundColor: '#1e3a8a' }}
                >
                  Close
                </button>
              </div>
              <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm border text-black" 
                   style={{ borderColor: '#1e3a8a' }}>
                {JSON.stringify(filteredRequests.find(r => r.requestId === expandedRow), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 