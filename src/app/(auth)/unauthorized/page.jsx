"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Unauthorized = () => {
  const router = useRouter();

  const handleBackToSignIn = () => {
    router.push("/signin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 mb-8">
          You do not have the required permissions to view this page.
        </p>
        <button
          onClick={handleBackToSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
