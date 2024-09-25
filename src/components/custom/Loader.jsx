import React from "react";

const Loader = () => {
  return (
    <div className="absolute">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 text-white text-2xl">
        Loading....
      </div>
    </div>
  );
};

export default Loader;
