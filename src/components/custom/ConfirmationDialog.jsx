import React from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, formData }) => {
  if (!isOpen) return null;

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-GB');
    } catch (error) {
      console.error("Error formatting date:", error);
      return date || '';
    }
  };

  // Format selected lines/roads
  const formatSelectedLines = () => {
    const lines = [];
    
    try {
      // Add station lines
      if (formData.selectedLine && formData.selectedLine.station) {
        formData.selectedLine.station.forEach(item => {
          if (item) {
            try {
              const parts = item.split(':');
              if (parts.length >= 2) {
                const block = parts[0];
                const line = parts[1];
                if (block && line) {
                  lines.push(`Line ${line} in block ${block}`);
                }
              }
            } catch (error) {
              console.error("Error processing station line:", error, item);
            }
          }
        });
      }
      
      // Add yard roads
      if (formData.selectedLine && formData.selectedLine.yard) {
        formData.selectedLine.yard.forEach(item => {
          if (item) {
            try {
              const parts = item.split(':');
              if (parts.length >= 2) {
                const block = parts[0];
                const road = parts[1];
                if (block && road) {
                  lines.push(`Road ${road} in yard ${block}`);
                }
              }
            } catch (error) {
              console.error("Error processing yard road:", error, item);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error in formatSelectedLines:", error);
      return "Error processing lines/roads";
    }
    
    return lines.length > 0 ? lines.join(', ') : 'None';
  };

  // Format other affected lines/roads
  const formatOtherAffectedLines = () => {
    const lines = [];
    
    // Add station lines
    if (formData.otherLinesAffected && formData.otherLinesAffected.station) {
      Object.entries(formData.otherLinesAffected.station).forEach(([block, lineArray]) => {
        if (lineArray && lineArray.length > 0) {
          // Ensure lineArray is an array before calling join
          const lineValues = Array.isArray(lineArray) ? lineArray.join(', ') : lineArray.toString();
          lines.push(`Lines ${lineValues} in block ${block}`);
        }
      });
    }
    
    // Add yard roads
    if (formData.otherLinesAffected && formData.otherLinesAffected.yard) {
      Object.entries(formData.otherLinesAffected.yard).forEach(([block, roadArray]) => {
        if (roadArray && roadArray.length > 0) {
          // Ensure roadArray is an array before calling join
          const roadValues = Array.isArray(roadArray) ? roadArray.join(', ') : roadArray.toString();
          lines.push(`Roads ${roadValues} in yard ${block}`);
        }
      });
    }
    
    return lines.length > 0 ? lines.join(', ') : 'None';
  };

  // Format work description
  const formatWorkDescription = (desc) => {
    if (!desc) return '';
    if (typeof desc === 'string' && desc.startsWith('Other Entry:')) {
      return desc.replace('Other Entry:', 'Other: ');
    }
    return desc;
  };

  // Safely get a value from formData
  const safeGet = (path) => {
    try {
      const parts = path.split('.');
      let value = formData;
      
      for (const part of parts) {
        if (value === undefined || value === null) return '';
        value = value[part];
      }
      
      return value || '';
    } catch (error) {
      console.error(`Error getting ${path} from formData:`, error);
      return '';
    }
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Confirm Your Request</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-lg font-semibold mb-2">
              Your request for {safeGet('missionBlock')} on {formatDate(safeGet('date'))} from {formatTime(safeGet('demandTimeFrom'))} to {formatTime(safeGet('demandTimeTo'))} in section {safeGet('selectedSection')} is ready to be submitted.
            </p>
            <p className="text-sm text-gray-600">
              Please review all details below before final submission.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold">Basic Information</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium pr-2">Date:</td>
                    <td>{formatDate(safeGet('date'))}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-2">Department:</td>
                    <td>{safeGet('selectedDepartment')}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-2">Section:</td>
                    <td>{safeGet('selectedSection')}</td>
                  </tr>
                  {safeGet('selectedDepo') && (
                    <tr>
                      <td className="font-medium pr-2">Depot/SSE:</td>
                      <td>{safeGet('selectedDepo')}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="font-medium pr-2">Mission Block:</td>
                    <td>{safeGet('missionBlock')}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-2">Work Type:</td>
                    <td>{safeGet('workType')}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-2">Work Description:</td>
                    <td>{formatWorkDescription(safeGet('workDescription'))}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-2">Demanded Time:</td>
                    <td>{formatTime(safeGet('demandTimeFrom'))} to {formatTime(safeGet('demandTimeTo'))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="font-semibold">Selected Lines/Roads</h3>
              <p className="text-sm">{formatSelectedLines()}</p>
              
              {safeGet('selectedStream') && (
                <div className="mt-2">
                  <h4 className="font-medium">Selected Stream:</h4>
                  <p className="text-sm">{safeGet('selectedStream')}</p>
                </div>
              )}
              
              <div className="mt-2">
                <h4 className="font-medium">Other Affected Lines/Roads:</h4>
                <p className="text-sm">{formatOtherAffectedLines()}</p>
              </div>
            </div>
          </div>
          
          {/* Work Location */}
          {(safeGet('workLocationFrom') || safeGet('workLocationTo')) && (
            <div className="mb-4">
              <h3 className="font-semibold">
                {safeGet('selectedDepartment') === "ENGG" ? "Work Location" : 
                 safeGet('selectedDepartment') === "SIG" ? "Route" : 
                 "Elementary Section"}
              </h3>
              <p className="text-sm">
                {safeGet('workLocationFrom') && safeGet('workLocationTo') 
                  ? `From ${safeGet('workLocationFrom')} to ${safeGet('workLocationTo')}`
                  : safeGet('workLocationTo') || "Not specified"}
              </p>
            </div>
          )}
          
          {/* Department-specific information */}
          {safeGet('selectedDepartment') === "TRD" ? (
            <div className="mb-4">
              <h3 className="font-semibold">TRD Specific Information</h3>
              <p className="text-sm">
                <span className="font-medium">Coaching Repercussions: </span>
                {safeGet('repercussions') || "None"}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <h3 className="font-semibold">Safety Information</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium pr-2">Caution Required:</td>
                    <td>{safeGet('cautionRequired') || "No"}</td>
                  </tr>
                  
                  {safeGet('cautionRequired') === "Yes" && (
                    <>
                      <tr>
                        <td className="font-medium pr-2">Caution Location:</td>
                        <td>
                          {safeGet('cautionLocationFrom') && safeGet('cautionLocationTo') 
                            ? `From ${safeGet('cautionLocationFrom')} to ${safeGet('cautionLocationTo')}`
                            : "Not specified"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium pr-2">Caution Speed:</td>
                        <td>{safeGet('cautionSpeed') || "Not specified"}</td>
                      </tr>
                    </>
                  )}
                  
                  <tr>
                    <td className="font-medium pr-2">OHE Disconnection:</td>
                    <td>{safeGet('ohDisconnection') || "No"}</td>
                  </tr>
                  
                  {safeGet('ohDisconnection') === "Yes" && (
                    <tr>
                      <td className="font-medium pr-2">Elementary Section:</td>
                      <td>
                        {safeGet('elementarySectionFrom') && safeGet('elementarySectionTo') 
                          ? `From ${safeGet('elementarySectionFrom')} to ${safeGet('elementarySectionTo')}`
                          : "Not specified"}
                      </td>
                    </tr>
                  )}
                  
                  <tr>
                    <td className="font-medium pr-2">SIG Disconnection:</td>
                    <td>{safeGet('sigDisconnection') || "No"}</td>
                  </tr>
                  
                  {safeGet('sigDisconnection') === "Yes" && (
                    <tr>
                      <td className="font-medium pr-2">
                        {safeGet('selectedDepartment') === "SIG" || safeGet('selectedDepartment') === "ENGG"
                          ? "Line:"
                          : "Elementary Section:"}
                      </td>
                      <td>
                        {safeGet('selectedDepartment') === "SIG" 
                          ? safeGet('sigElementarySectionFrom')
                          : safeGet('sigElementarySectionFrom') && safeGet('sigElementarySectionTo') 
                            ? `From ${safeGet('sigElementarySectionFrom')} to ${safeGet('sigElementarySectionTo')}`
                            : "Not specified"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Remarks */}
          {safeGet('requestremarks') && (
            <div className="mb-4">
              <h3 className="font-semibold">Remarks</h3>
              <p className="text-sm">{safeGet('requestremarks')}</p>
            </div>
          )}
          
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300"
            >
              Continue Editing
            </button>
            <button
              onClick={onConfirm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering confirmation dialog:", error);
    
    // Fallback simple dialog in case of errors
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-xl w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Confirm Your Request</h2>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-md mb-2">
              Your request is ready to be submitted. There was an issue displaying all details.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300"
            >
              Continue Editing
            </button>
            <button
              onClick={onConfirm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default ConfirmationDialog; 