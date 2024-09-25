"use client";

import { v4 as uuid } from "uuid";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const EnhancedReadabilityStationBlockageChart = ({
  stations,
  startTime,
  endTime,
  blockages,
}) => {
  const [hoveredBlockage, setHoveredBlockage] = useState(null);

  const chartWidth = 2000;
  const chartHeight = 1500;
  const marginLeft = 200;
  const marginTop = 100;
  const marginBottom = 60;
  const marginRight = 60;

  const timeRange = endTime - startTime;
  const xScale = (time) =>
    ((time - startTime) / timeRange) * (chartWidth - marginLeft - marginRight) +
    marginLeft;
  const yScale = (index) =>
    (index / (stations.length - 1)) * (chartHeight - marginTop - marginBottom) +
    marginTop;

  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleMouseEnter = (blockage) => {
    setHoveredBlockage(blockage);
  };

  const handleMouseLeave = () => {
    setHoveredBlockage(null);
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        {/* <CardTitle className="text-3xl font-bold">
          Station Blockage Chart
        </CardTitle> */}
      </CardHeader>
      <CardContent>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* X-axis (time) */}
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={chartWidth - marginRight}
            y2={marginTop}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="3"
          />
          {Array.from({ length: timeRange + 1 }, (_, i) => startTime + i).map(
            (time) => (
              <g key={time}>
                <line
                  x1={xScale(time)}
                  y1={marginTop}
                  x2={xScale(time)}
                  y2={marginTop - 15}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="3"
                />
                <text
                  x={xScale(time)}
                  y={marginTop - 25}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="bold"
                  fill="hsl(var(--muted-foreground))"
                >
                  {formatTime(time)}
                </text>
              </g>
            )
          )}

          {/* Y-axis (stations) */}
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={marginLeft}
            y2={chartHeight - marginBottom}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="3"
          />
          {stations.map((station, index) => (
            <g key={station}>
              <line
                x1={marginLeft - 15}
                y1={yScale(index)}
                x2={marginLeft}
                y2={yScale(index)}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="3"
              />
              <text
                x={marginLeft - 25}
                y={yScale(index)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="18"
                fontWeight="bold"
                fill="hsl(var(--foreground))"
              >
                {station}
              </text>
            </g>
          ))}

          {/* Blockages */}
          <TooltipProvider>
            {blockages.map((blockage) => {
              const startIndex = stations.indexOf(blockage.startStation);
              const endIndex = stations.indexOf(blockage.endStation);
              const y = (yScale(startIndex) + yScale(endIndex)) / 2;
              const height = Math.abs(yScale(endIndex) - yScale(startIndex));
              const x = xScale(blockage.startTime);
              const width =
                xScale(blockage.endTime) - xScale(blockage.startTime);

              return (
                <g key={uuid()}>
                  <rect
                    x={x}
                    y={y - height / 2}
                    width={width}
                    height={height}
                    fill="#3b82f6" // Blue color
                    opacity={hoveredBlockage === blockage ? 0.8 : 0.6}
                    onMouseEnter={() => handleMouseEnter(blockage)}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer transition-opacity duration-200"
                  />
                  {hoveredBlockage === blockage && (
                    <g>
                      <rect
                        x={x + width + 10}
                        y={y - 60}
                        width="250"
                        height="120"
                        fill="white"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        rx="5"
                        ry="5"
                      />
                      <text
                        x={x + width + 20}
                        y={y - 35}
                        fontSize="20"
                        fontWeight="bold"
                        fill="black"
                      >
                        {blockage.startStation} - {blockage.endStation}
                      </text>
                      <text
                        x={x + width + 20}
                        y={y - 5}
                        fontSize="18"
                        fill="black"
                      >
                        {formatTime(blockage.startTime)} -{" "}
                        {formatTime(blockage.endTime)}
                      </text>
                      <text
                        x={x + width + 20}
                        y={y + 25}
                        fontSize="18"
                        fill="black"
                      >
                        Reason: {blockage.reason}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </TooltipProvider>

          {/* Chart Title */}
          <text
            x={chartWidth / 2}
            y={30}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="hsl(var(--foreground))"
          >
            Time{" "}
          </text>

          {/* Axis Labels */}

          <text
            x={20}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="hsl(var(--foreground))"
            transform={`rotate(-90, 20, ${chartHeight / 2})`}
          >
            Stations
          </text>
        </svg>
      </CardContent>
    </Card>
  );
};

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Rectangle,
} from "recharts";

const StationBlockageChart = ({ stations, blockages }) => {
  let data = [];
  stations.forEach((element) => {
    if (blockages.length === 0) {
      data.push({
        name: element,
      });
    } else {
      blockages.forEach((block) => {
        if (element === block.startStation || element === block.endStation) {
          data.push({
            name: element,
            pv: [block.startTime, block.endTime],
          });
        } else {
          data.push({
            name: element,
          });
        }
      });
    }
  });

  // const data = [
  //   {
  //     name: "Station A",
  //     uv: [0, 4.2], // Start and end times (0 to 4)
  //     pv: [2, 6], // Another blockage time (2 to 6)
  //   },
  //   {
  //     name: "Station B",
  //     uv: [3, 8],
  //     pv: [5, 12],
  //   },
  //   {
  //     name: "Station C",
  //     uv: [7, 9],
  //     pv: [10, 14],
  //   },
  //   {
  //     name: "Station D",
  //     uv: [1, 3],
  //     pv: [6, 9],
  //   },
  //   // Add more stations and blockage data as needed
  // ];

  return (
    <div style={{ overflowY: "scroll", overflowX: "scroll" }}>
      <BarChart
        width={2000}
        height={800}
        data={data}
        layout="vertical"
        maxBarSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          orientation="top"
          domain={[0, 24]}
          tickCount={25}
          tickFormatter={(tick) => `${tick}:00`}
        />
        <YAxis type="category" dataKey="name" />
        <Bar dataKey="uv" fill="#000000" radius={20} />
        <Bar dataKey="pv" fill="#8884d8" radius={20} />
      </BarChart>
    </div>
  );
};

export default function GanttGraph({ data }) {
  function formatTime(timeString) {
    let [hours, minutes] = timeString.split(":");
    hours = parseInt(hours, 10);

    let formattedTime = `${hours}.${minutes}`;
    let convertedTime = parseFloat(formattedTime);
    return convertedTime;
  }

  function isExist(newBlockage, blockageArray) {
    const { startStation, endStation } = newBlockage;

    blockageArray = blockageArray.map((blockage) => {
      if (
        blockage.startStation === startStation &&
        blockage.endStation === endStation
      ) {
        return true;
      }
    });

    return false;
  }

  function getExist(newBlockage, blockageArray) {
    const { startStation, endStation } = newBlockage;

    blockageArray = blockageArray.map((blockage) => {
      if (
        blockage.startStation === startStation &&
        blockage.endStation === endStation
      ) {
        return blockage;
      }
    });

    return {};
  }

  const stations = [];
  const blockages = [];
  data.forEach((element, ind) => {
    const stationArray = element.stationName.split("-").map((e) => e.trim());

    if (!stations.includes(stationArray[0]) && stationArray[0] != "YD") {
      stations.push(stationArray[0]);
    }

    if (!stations.includes(stationArray[1]) && stationArray[1] != "YD") {
      stations.push(stationArray[1]);
    }

    if (element.requests.length != 0) {
      element.requests.forEach((e, i) => {
        const newObject = {
          id: ind,
          startStation: stationArray[0],
          endStation: stationArray[1],
          startTime: formatTime(e.demandTimeFrom),
          endTime: formatTime(e.demandTimeTo),
          reason: e.selectedDepartment,
        };

        if (isExist(newObject, blockages)) {
          const oldObject = getExist(newObject, blockages);

          const index = blockages.findIndex(
            (obj) =>
              obj.id === oldObject.id &&
              obj.startStation === oldObject.startStation &&
              obj.endStation === oldObject.endStation &&
              obj.startTime === oldObject.startTime &&
              obj.endTime === oldObject.endTime &&
              obj.reason === oldObject.reason
          );

          if (index !== -1) {
            blockages.splice(index, 1);
          }
          blockages.push({
            id: oldObject.id,
            startStation: oldObject.startStation,
            endStation: oldObject.endStation,
            startTime:
              newObject.demandTimeFrom >= oldObject.demandTimeFrom
                ? oldObject.demandTimeFrom
                : newObject.demandTimeFrom,
            endTime:
              newObject.demandTimeTo >= oldObject.demandTimeTo
                ? newObject.demandTimeTo
                : oldObject.demandTimeTo,
            reason: oldObject.selectedDepartment,
          });
        } else {
          blockages.push({ ...newObject });
        }
      });
    }
  });

  // return (
  //   <EnhancedReadabilityStationBlockageChart
  //     stations={stations}
  //     startTime={startTime}
  //     endTime={endTime}
  //     blockages={blockages}
  //   />
  // );
  return <StationBlockageChart stations={stations} blockages={blockages} />;
}
