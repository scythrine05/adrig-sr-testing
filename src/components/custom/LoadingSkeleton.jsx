import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-bounce mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-24 h-24 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M6 6h12m-4 8h4m-5 4v1a1 1 0 001 1h3a1 1 0 001-1v-1M5 18H4a1 1 0 01-1-1v-5a1 1 0 011-1h16a1 1 0 011 1v5a1 1 0 01-1 1h-1m-5-4H9m0 0H7v-2h10v2h-2"
            />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-700 mb-2">Loading...</div>
        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
