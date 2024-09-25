import React, { useEffect, useState } from "react";

const DataCard = ({ requests }) => {
  const [classifiedData, setClassifiedData] = useState({
    ENGG: [],
    SIG: [],
    TRD: [],
    Other: [],
  });

  useEffect(() => {
    if (requests.length > 0) {
      const classified = requests.reduce(
        (acc, curr) => {
          if (curr.selectedDepartment === "ENGG") {
            acc.ENGG.push(curr);
          } else if (curr.selectedDepartment === "SIG") {
            acc.SIG.push(curr);
          } else if (curr.selectedDepartment === "TRD") {
            acc.TRD.push(curr);
          } else {
            acc.Other.push(curr); // Classify anything else under 'Other'
          }
          return acc;
        },
        { ENGG: [], SIG: [], TRD: [], Other: [] }
      );

      setClassifiedData(classified);
    }
  }, [requests]);

  return (
    <div className="w-full mx-auto px-8 py-3 bg-white shadow-lg rounded-xl border border-gray-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Work Request Overview
      </h2>

      <div className="max-h-[400px]">
        {requests.length > 0 ? (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <DataField
                label="Engg Requests"
                value={classifiedData.ENGG.length}
              />
              <DataField
                label="Sig Requests"
                value={classifiedData.SIG.length}
              />
              <DataField
                label="Trd Requests"
                value={classifiedData.TRD.length}
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No requests available.</p>
        )}
      </div>
    </div>
  );
};

const DataField = ({ label, value }) => {
  return (
    <div>
      <span className="block text-sm font-semibold text-gray-500">{label}</span>
      <span className="block text-lg font-medium text-gray-900">
        {value || "N/A"}
      </span>
    </div>
  );
};

export default DataCard;
