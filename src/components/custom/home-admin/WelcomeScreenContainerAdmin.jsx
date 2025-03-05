"use client";
import React, { useEffect, useState } from "react";
import {
  getFormDataAll,
  getFormDataByDepartment,
} from "../../../app/actions/formdata";
import Crousel from "../../ui/Crousel";
import DataCard from "../DataCard";
import {
  Mic,
  CircleX,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { v4 as uuid } from "uuid";

const getFormattedDate = () => {
  const date = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayOfWeek = days[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const ordinalSuffix = getOrdinalSuffix(day);
  return (
    <>
      {dayOfWeek}, {month} {day}
      <sup>{ordinalSuffix}</sup>
    </>
  );
};

const QuickLinksCard = ({ title, description }) => (
  <div className="p-6 bg-white rounded-xl ">
    <h3 className="text-lg font-bold text-textcolor mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const QuickLinks = ({ links }) => {
  return (
    <div className="w-full mx-auto p-6 bg-[#f7c4d4] rounded-xl col-span-2">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textcolor">Quick links</h2>
        <p className="text-gray-600">There are requests to be optimised.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link, index) => (
          <QuickLinksCard
            key={index}
            title={link.title}
            description={link.description}
          />
        ))}
      </div>
    </div>
  );
};

const ScheduleCard = ({ requests }) => {
  const [selection, setSelection] = useState([]);
  const rightClickHandler = (key) => {
    setSelection((prevItems) => [...prevItems, key]);
  };

  const crossClickHandler = (key) => {
    setSelection((prevItems) => prevItems.filter((item) => item !== key));
  };

  return (
    <div className="w-full mx-auto p-6 bg-[#f7c4d4] rounded-xl col-span-2">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold text-textcolor">
          Station Schedules
        </span>
        {/* <a href="#" className="text-purple-700">
          View all
        </a> */}
      </div>
      <p className="text-gray-600 mb-6">There are requests to be optimised.</p>
      <div className="space-y-1">
        {Object.entries(requests).map(([key, value]) => (
          <>
            <div
              key={uuid()}
              className="flex items-center justify-between py-1 px-3 bg-white rounded-md"
            >
              <div className="flex items-center">
                <CalendarClock className="mr-3" />
                <div>
                  <p className="font-medium text-black">{key}</p>
                  <p className="text-gray-600">
                    {requests[key].length} Requests Maded
                  </p>
                </div>
              </div>
              {selection.includes(key) ? (
                <div
                  onClick={() => {
                    crossClickHandler(key);
                  }}
                >
                  <CircleX />
                </div>
              ) : (
                <div
                  onClick={() => {
                    rightClickHandler(key);
                  }}
                >
                  <ChevronRight />
                </div>
              )}
            </div>
            {selection.includes(key) && <DataCard requests={value} />}
          </>
        ))}
      </div>
    </div>
  );
};

const generateDummyData = () => {
  const data = [
    [
      "Month",
      "Requests Made",
      "Requests Accepted",
      "Requests Rejected",
      "Requests Pending",
    ],
    ["Jan", 30, 20, 5, 5],
    ["Feb", 42, 25, 10, 7],
    ["Mar", 50, 30, 15, 5],
    ["Apr", 65, 40, 20, 5],
    ["May", 80, 50, 25, 5],
    ["Jun", 55, 35, 15, 5],
    ["Jul", 72, 45, 20, 7],
    ["Aug", 90, 55, 30, 5],
    ["Sep", 85, 50, 25, 10],
    ["Oct", 60, 40, 15, 5],
    ["Nov", 45, 30, 10, 5],
    ["Dec", 35, 25, 5, 5],
  ];
  return data;
};

const WelcomeScreenContainerUser = () => {
  // const { requestCheck, isFetching, error, fetchRequestCheck } =
  // useRequestCheck();

  // const handleFileChange = async (event) => {
  //   const selectedFile = event.target.files[0];

  //   if (!selectedFile) {
  //     alert("Please select a file to upload");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     const result = await response.json();

  //     if (response.ok) {
  //       alert(result.message);
  //       //hit api again and check updated value of useFetchRequests
  //     } else {
  //       alert(result.error);
  //     }
  //     // await fetchRequestCheck()
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     alert("Error uploading file");
  //   }
  // };

  // const { isAdmin, isLoading } = useIsAdmin();

  const options = {
    title: "Requests Over Time",
    hAxis: { title: "Requests" },
    vAxis: { title: "Month" },
    legend: "bottom",
    colors: ["#1e3a8a", "#22c55e", "#ef233c", "#f97316"], // Use appropriate colors
  };

  const [engg, setEngg] = useState(0);
  const [sig, setSig] = useState(0);
  const [trd, setTrd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const filterData = (arr) => {
    const classifiedData = arr.reduce((result, item) => {
      if (!result[item.selectedSection]) {
        result[item.selectedSection] = [];
      }
      result[item.selectedSection].push(item);

      return result;
    }, {});
    return classifiedData;
  };

  useEffect(() => {
    async function fxn() {
      try {
        const res = await getFormDataAll();
        const res1 = await getFormDataByDepartment("ENGG");
        const res2 = await getFormDataByDepartment("SIG");
        const res3 = await getFormDataByDepartment("TRD");
        const data = filterData(res.requestData);
        setRequests(data);
        setEngg(res1.length);
        setSig(res2.length);
        setTrd(res3.length);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center py-4 md:py-16 space-y-4 md:space-y-6 p-4">
  <section className="bg-secondary w-full rounded-xl flex flex-col items-start space-y-4 p-4 md:p-6">
    <div className="w-full flex flex-col md:flex-row items-start justify-between">
      <div className="text-center flex flex-col items-start">
        <span className="text-sm md:text-md mb-2 md:mb-4 text-slate-500 font-sans font-medium">
          {getFormattedDate()}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-slate-950">
          Welcome, Admin 🎉
        </h1>
        <p className="text-sm md:text-md text-textcolor mb-2 md:mb-4">
          Manage your block requests efficiently and effectively.
        </p>
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-4 md:gap-x-4 w-full">
      <div className="w-full md:w-64 p-4 bg-primary rounded-xl text-textcolor shadow-md col-span-1 flex flex-col items-center justify-between space-y-2">
        <h2 className="text-lg md:text-xl font-bold w-full text-start">
          Engg Department
        </h2>
        <p className="text-xs text-left w-full">
          Total Requests Made
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-left w-full">{engg}</h2>
      </div>

      <div className="w-full md:w-64 p-4 rounded-xl text-textcolor shadow-md col-span-1 flex flex-col items-center justify-between space-y-2 bg-primary">
        <h2 className="text-lg md:text-xl font-bold w-full text-start">
          SIG Department
        </h2>
        <p className="text-xs text-left w-full">
          Total Requests Made
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-left w-full">{sig}</h2>
      </div>

      <div className="w-full md:w-64 p-4 bg-primary rounded-xl text-textcolor shadow-md col-span-1 flex flex-col items-center justify-between space-y-2">
        <h2 className="text-lg md:text-xl font-bold w-full text-start">
          TRD Department
        </h2>
        <p className="text-xs text-left w-full">
          Total Requests Made
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-left w-full">{trd}</h2>
      </div>
    </div>
  </section>

  <div className="bg-secondary p-4 md:p-6 w-full">
    <h2 className="text-lg md:text-xl text-textcolor mb-2 md:mb-4 w-full">
     Recent Activities & Schedule Overview
    </h2>
    <div className="w-full rounded-xl">
      <ScheduleCard requests={requests} />

      <div className="flex mt-6 md:mt-10 flex-col h-full col-span-2 justify-start space-y-4 md:space-y-8">
        <div className="p-4 bg-primary rounded-xl shadow-md">
          <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 font-sans text-textcolor">
            Recent Activities
          </h2>
          <div className="w-full flex flex-col items-center">
            {loading && <h1>Loading...</h1>}
            {!loading && <Crousel></Crousel>}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-md border-t">
          <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 font-sans text-textcolor">
            Announcements
          </h2>
          <div className="w-full flex flex-col items-center space-y-2 md:space-y-4 text-textcolor">
            <Mic className="w-8 h-8 md:w-10 md:h-10" />
            <p className="text-sm font-medium">
              No announcements at this time.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default WelcomeScreenContainerUser;
