import React from "react";
import { Check } from "lucide-react";

const ViewSelector = ({ viewState, setViewState }) => {
  return (
    <div className="flex rounded-full border border-gray-300 bg-[#f5effc] font-semibold text-sm sm:text-base w-auto">
      <button
        className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-l-full text-black transition-colors duration-200 ${
          viewState === 0 ? "bg-[#e4d6f7]" : "hover:bg-[#e4d6f7]"
        }`}
        onClick={() => setViewState(0)}
      >
        {viewState === 0 && <Check className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />}
        <span className="whitespace-nowrap">Request Table</span>
      </button>
      <button
        className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-black transition-colors duration-200 ${
          viewState === 1 ? "bg-[#e4d6f7]" : "hover:bg-[#e4d6f7]"
        }`}
        onClick={() => setViewState(1)}
      >
        {viewState === 1 && <Check className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />}
        <span className="whitespace-nowrap">Compact View</span>
      </button>
      <button
        className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-r-full text-black transition-colors duration-200 ${
          viewState === 2 ? "bg-[#e4d6f7]" : "hover:bg-[#e4d6f7]"
        }`}
        onClick={() => setViewState(2)}
      >
        {viewState === 2 && <Check className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />}
        <span className="whitespace-nowrap">Gantt View</span>
      </button>
    </div>
  );
};

export default ViewSelector;