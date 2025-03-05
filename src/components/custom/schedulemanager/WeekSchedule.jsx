"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { GanttChartModern } from "../GanttChartModern";
import ToolBar from "./TollBar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel";
import moment from "moment";
import useFetchRequests from "../../../lib/hooks/useFetchRequests";
import ViewSelector from "../../ui/viewselector";

const WeekSchedule = ({ isStationFetching, viewState, setViewState }) => {
  const { data, isLoading, error } = useFetchRequests();
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [scheduleDataByStation, setScheduleDataByStation] = useState(null);
  const [section, setSection] = useState(null);
  const [date, setDate] = useState(null);

  let contentCarousel;
  let contentChart;

  // if (isLoading) {
  //   contentCarousel = <div>Loading...</div>;
  // } else if (!data || !data.week || !data.week.length) {
  //   contentCarousel = <div>No data available</div>;
  // } else {
  //   contentCarousel = (
  //     <CarouselContent className="ml-1">
  //       {data.week[0].days.map((day, index) => (
  //         <CarouselItem
  //           key={index}
  //           className={`h-24 bg-cardbg basis-1/4 ml-5 text-textcolor bg-white font-semibold rounded-lg cursor-pointer ${
  //             current === index
  //               ? "bg-primary font-black"
  //               : "hover:bg-primary-foreground ease-in-out duration-200"
  //           }`}
  //           onClick={() => handleItemClick(index, day)}
  //         >
  //           <div className="flex flex-col items-start p-4">
  //             <span>{moment(day.date).format("DD/MM/YYYY")}</span>
  //             <div className="flex flex-col items-start space-y-2">
  //               <div className="flex items-center space-x-2">
  //                 <div className="w-4 aspect-square rounded-full bg-orange-400 animate-pulse"></div>
  //                 <span className="text-sm font-semibold">
  //                   <strong>
  //                     {day.stations.reduce((acc, curr) => {
  //                       return (
  //                         acc + curr.requests.filter((r) => r.clashed).length
  //                       );
  //                     }, 0)}
  //                   </strong>{" "}
  //                   no. of conflicts
  //                 </span>
  //               </div>
  //             </div>
  //           </div>
  //         </CarouselItem>
  //       ))}
  //     </CarouselContent>
  //   );
  // }

  if (isLoading) {
    contentChart = <div>Loading...</div>;
  } else if (!data) {
    contentChart = <div>No data available</div>;
  } else {
    contentChart = (
      <GanttChartModern
        data={data}
        stationData={scheduleDataByStation}
        section={section}
        date={date}
      />
    );
  }

  useEffect(() => {}, [isStationFetching]);

  useEffect(() => {
    if (!api) {
      return;
    }
    // Clean up event listener on component unmount
    return () => {
      api.off("select");
    };
  }, [api]);

  const handleItemClick = (index, day) => {
    setCurrent(index);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-6 bg-secondary rounded-xl">
      <div className="flex justify-between items-center mb-4 w-full flex-col">
        <h1 className="text-2xl font-semibold py-2">Gantt View</h1>
        <ViewSelector viewState={viewState} setViewState={setViewState} />
      </div>
      <ToolBar
        setScheduleDataByStation={setScheduleDataByStation}
        setSection={setSection}
        setDate={setDate}
      />
      <section className="w-full">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full mb-5"
          setApi={setApi}
        >
          <CarouselContent className="ml-1">{contentCarousel}</CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {contentChart}
    </div>
  );
};

export default WeekSchedule;
