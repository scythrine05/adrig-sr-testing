import React, { useState, useEffect } from "react";
import { getFormData, getFormDataAll } from "../../app/actions/formdata";

// Sample request array

const Crousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestRequests, setLatestRequests] = useState([]);
  const [click, setClick] = useState(true);

  function filterLastFiveHours(requests) {
    const currentTime = new Date();
    const fiveHoursAgo = new Date(currentTime.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago

    return requests.filter((request) => {
      const createdAt = new Date(request.createdAt);
      return createdAt >= fiveHoursAgo;
    });
  }

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getFormDataAll();
        const filteredRequests = filterLastFiveHours(res.requestData);
        setLatestRequests(filteredRequests);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, [click]);

  const itemsPerPage = 5;

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? latestRequests.length - 1 : prevIndex - 1
      );
    }
  };

  const nextSlide = () => {
    if (currentIndex + itemsPerPage < latestRequests.length) {
      setCurrentIndex((prevIndex) =>
        prevIndex === latestRequests.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  function tryAgainClickHandler() {
    setClick((prev) => !prev);
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4">
      {/* Carousel */}
      {latestRequests.length == 0 ? (
        <div className="bg-white flex flex-col justify-center items-center w-92  border rounded-lg ">
          <div className="p-2 flex flex-col items-center space-y-2 ">
            <h2 className="text-xl text-center font-semibold text-gray-700 mb-2">
              No Data Available
            </h2>

            <p className="text-gray-500 text-center">
              {
                " We couldn't find any data to display at the moment. Please check back later or try refreshing the page."
              }
            </p>

            <button
              onClick={tryAgainClickHandler}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden relative">
            <div
              className="flex transition-transform ease-in-out duration-500"
              style={{
                transform: `translateX(-${
                  (currentIndex / itemsPerPage) * 100
                }%)`,
                width: `${(latestRequests.length / itemsPerPage) * 100}%`,
              }}
            >
              {latestRequests.length != 0 &&
                latestRequests.map((request, index) => (
                  <div key={index} className="w-1/7 flex-shrink-0 p-4">
                    <div className="bg-gradient-to-br from-white via-gray-100 to-gray-200 p-6 shadow-lg rounded-xl border border-gray-300 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                      <h3 className="text-2xl font-bold mb-3 text-gray-800">
                        {request.date}
                      </h3>
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          Department:
                        </span>
                        <p className="ml-2 text-gray-700 font-semibold">
                          {request.selectedDepartment}
                        </p>
                      </div>
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          Section:
                        </span>
                        <p className="ml-2 text-gray-700 font-semibold">
                          {request.selectedSection}
                        </p>
                      </div>
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          From:
                        </span>
                        <p className="ml-2 text-gray-700 font-semibold">
                          {request.demandTimeFrom}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500">
                          To:
                        </span>
                        <p className="ml-2 text-gray-700 font-semibold">
                          {request.demandTimeTo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute top-1/2 right-[1010px] transform -translate-y-1/2 px-3 py-2 rounded-full hover:bg-gray-700 ${
              currentIndex === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white"
            }`}
          >
            Prev
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex + itemsPerPage >= latestRequests.length}
            className={`absolute top-1/2 left-[1010px] transform -translate-y-1/2 px-3 py-2 rounded-full hover:bg-gray-700 ${
              currentIndex + itemsPerPage >= latestRequests.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white"
            }`}
          >
            Next
          </button>
        </>
      )}
    </div>
  );
};

export default Crousel;
