import React, { useEffect, useState } from "react";

const formatDate = (day, month, year) => {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CalenderSlider = ({ month, year, setDate }) => {
  // Get today's date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setSelectedDate(currentDay);
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateClick = (date) => {
    if (selectedDate === date) {
      setSelectedDate(currentDay);
      setDate(null);
    } else {
      setSelectedDate(date);
      setDate(
        `${currentYear}-${currentMonth}-${date < 10 ? `0${date}` : date}`
      );
    }
  };

  return (
    <div className="w-full flex justify-center items-center mt-4 mb-4">
      <div className="flex space-x-4 overflow-x-auto py-4 px-4 bg-gray-100 rounded-lg shadow-inner scrollbar-thin scrollbar-thumb-gray-400">
        {dates.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={`flex-shrink-0 w-auto min-w-[150px] h-12 flex items-center justify-center rounded-lg border-2 text-sm px-4 ${
              selectedDate === day
                ? "border-blue-500 bg-blue-100"
                : "border-gray-300"
            } hover:bg-blue-50 transition`}
          >
            {formatDate(day, currentMonth, year)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalenderSlider;
