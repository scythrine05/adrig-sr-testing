import React from "react";

const Footer = () => {
  return (
    <div className="flex justify-center max-w-2xl mx-auto">
      <footer className=" p-4 bg-white rounded-lg  md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800">
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <p className="text-center">
          Copyright © 2024, Adrig AI Technologies | Usage rights reserverd for
          Southern Railways
          </p>
        </span>
      </footer>
    </div>
  );
};

export default Footer;
