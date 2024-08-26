import React, { useState } from 'react';
import { Check } from "lucide-react";

const ViewSelector = ({ viewState, setViewState }) => {

  return (
    <div className="flex rounded-full border border-gray-300 bg-[#f5effc] font-semibold">
      <button
        className={`flex items-center px-4 py-2 rounded-l-full text-black ${viewState === 0 ? 'bg-[#e4d6f7]' : ''}`}
        onClick={() => setViewState(0)}
      >
        {viewState === 0 && <Check className="mr-2" />}
        Request Table
      </button>
      <button
        className={`flex items-center px-4 py-2 text-black ${viewState === 1 ? 'bg-[#e4d6f7]' : ''}`}
        onClick={() => setViewState(1)}
      >
        {viewState === 1 && <Check className="mr-2" />}
        Compact View
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-r-full text-black ${viewState === 2 ? 'bg-[#e4d6f7]' : ''}`}
        onClick={() => setViewState(2)}
      >
        {viewState === 2 && <Check className="mr-2" />}
        Gantt View
      </button>
    </div>
  );
};

export default ViewSelector;