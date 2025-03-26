"use client";

import React, { useState, useEffect, useRef } from "react";
import { GanttChartModern } from "../GanttChartModern";
import ToolBar from "./TollBar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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
  const [scale, setScale] = useState(0.75);
  const chartContainerRef = useRef(null);
  const sliderRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Generate scale options
  const scaleOptions = [
    { value: 0.5, label: "50% (All Hours)" },
    { value: 0.75, label: "75%" },
    { value: 1, label: "100%" },
    { value: 1.25, label: "125%" },
    { value: 1.5, label: "150%" },
  ];

  let contentCarousel;
  let contentChart;

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
        scale={scale}
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

  // Handle slider change
  const handleSliderChange = (e) => {
    if (chartContainerRef.current) {
      // Look for any scrollable container in the chart component
      const scrollContainer = chartContainerRef.current.querySelector('div[style*="overflow-x: scroll"], div[style*="overflow-x:scroll"], div[style*="overflow: scroll"], div[style*="overflow:scroll"], .recharts-wrapper');
      if (scrollContainer) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const newPosition = (e.target.value / 100) * maxScroll;
        scrollContainer.scrollLeft = newPosition;
      }
    }
  };

  // Sync scroll position from chart to slider and check for overflow
  useEffect(() => {
    const syncScrollToSlider = () => {
      if (chartContainerRef.current && sliderRef.current) {
        const scrollContainer = chartContainerRef.current.querySelector('div[style*="overflow-x: scroll"], div[style*="overflow-x:scroll"], div[style*="overflow: scroll"], div[style*="overflow:scroll"], .recharts-wrapper');
        if (scrollContainer) {
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
          
          // Check if there's actual overflow
          setHasOverflow(maxScroll > 10); // Using threshold of 10px to account for small rounding errors
          
          if (maxScroll > 0) {
            const scrollPercentage = (scrollContainer.scrollLeft / maxScroll) * 100;
            sliderRef.current.value = scrollPercentage;
            
            // Update the slider's appearance
            const thumbPosition = scrollPercentage + '%';
            sliderRef.current.style.background = `linear-gradient(to right, #4F46E5 ${thumbPosition}, #D1D5DB ${thumbPosition})`;
          }
        }
      }
    };

    // Initialize the scrollbar after the chart is rendered
    setTimeout(() => {
      const scrollContainer = chartContainerRef.current?.querySelector('div[style*="overflow-x: scroll"], div[style*="overflow-x:scroll"], div[style*="overflow: scroll"], div[style*="overflow:scroll"], .recharts-wrapper');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', syncScrollToSlider);
        syncScrollToSlider(); // Initialize the slider position and check overflow
      }
    }, 500);

    return () => {
      const scrollContainer = chartContainerRef.current?.querySelector('div[style*="overflow-x: scroll"], div[style*="overflow-x:scroll"], div[style*="overflow: scroll"], div[style*="overflow:scroll"], .recharts-wrapper');
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', syncScrollToSlider);
      }
    };
  }, [data, scale, section, date]);

  // Additional effect to initialize and connect the scrollbar after component mount
  useEffect(() => {
    if (data && !isLoading && chartContainerRef.current) {
      // Give time for the chart to render
      const initScrollbar = setTimeout(() => {
        // Try to find scrollable elements
        const scrollableElements = [...chartContainerRef.current.querySelectorAll('*')]
          .filter(el => {
            const style = window.getComputedStyle(el);
            return (
              (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
              el.scrollWidth > el.clientWidth
            );
          });
        
        // If we found scrollable elements, connect the first one to our scrollbar
        if (scrollableElements.length > 0) {
          const scrollable = scrollableElements[0];
          console.log('Found scrollable element:', scrollable);
          
          // Check if there's actual overflow and update state
          const maxScroll = scrollable.scrollWidth - scrollable.clientWidth;
          setHasOverflow(maxScroll > 10);
          
          // Initialize the slider
          if (sliderRef.current) {
            const initialPercentage = (scrollable.scrollLeft / maxScroll) * 100 || 0;
            sliderRef.current.value = initialPercentage;
            
            // Update appearance
            const thumbPosition = initialPercentage + '%';
            sliderRef.current.style.background = `linear-gradient(to right, #4F46E5 ${thumbPosition}, #D1D5DB ${thumbPosition})`;
          }
        } else {
          setHasOverflow(false);
        }
      }, 1000);
      
      return () => clearTimeout(initScrollbar);
    }
  }, [data, isLoading, scale, section, date]);

  const handleItemClick = (index, day) => {
    setCurrent(index);
  };

  // Handle scale change
  const handleScaleChange = (e) => {
    console.log("Scale changed to:", parseFloat(e.target.value));
    setScale(parseFloat(e.target.value));
  };

  return (
    <div className="w-full max-w-[95%] mx-auto py-4 px-3 bg-secondary rounded-xl relative">
      {/* ViewSelector centered at the top */}
      <div className="flex justify-center mb-3">
        <ViewSelector viewState={viewState} setViewState={setViewState} />
      </div>
      
      {/* Combine ToolBar and scale in one container */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <ToolBar
          setScheduleDataByStation={setScheduleDataByStation}
          setSection={setSection}
          setDate={setDate}
        />
        
        <div className="flex items-center space-x-2 ml-2 h-9">
          <label className="text-sm font-medium whitespace-nowrap">Scale:</label>
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-9 p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={scale} 
            onChange={handleScaleChange}
          >
            {scaleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <section className="w-full mt-2">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full mb-2"
          setApi={setApi}
        >
          <CarouselContent className="ml-1">{contentCarousel}</CarouselContent>
        </Carousel>
      </section>

      <div ref={chartContainerRef} className="pb-10">
        {contentChart}
      </div>

      {/* Horizontal Scroll Slider - Fixed to bottom of viewport, only shown when there's overflow */}
      {hasOverflow && (
        <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto" style={{ maxWidth: "90%", width: "90%" }}>
          <div className="bg-gray-100 rounded-full p-1 shadow-md">
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer"
              onChange={handleSliderChange}
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'linear-gradient(to right, #4F46E5 0%, #D1D5DB 0%)',
                '::-webkit-slider-thumb': {
                  appearance: 'none',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#4F46E5',
                  borderRadius: '50%',
                  cursor: 'pointer',
                },
                '::-moz-range-thumb': {
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#4F46E5',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: 'none',
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekSchedule;
