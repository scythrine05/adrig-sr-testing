"use client";

import { v4 as uuid } from "uuid";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TooltipProvider } from "../ui/tooltip";

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

const StationBlockageChart = ({ stations, blockages, scale = 1 }) => {
  console.log("StationBlockageChart received scale:", scale);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // First, ensure stations are sorted alphabetically for consistent display
  const sortedStations = [...stations].sort();

  // Prepare data for the chart - one entry per station
  let data = sortedStations.map((station) => ({
    name: station,
  }));

  // Now add connecting rectangles for the blockages
  if (blockages.length > 0) {
    blockages.forEach((block, blockIndex) => {
      // Find the indices of the start and end stations in our sorted array
      const startStationIndex = sortedStations.indexOf(block.startStation);
      const endStationIndex = sortedStations.indexOf(block.endStation);

      // Skip if either station is not found
      if (startStationIndex === -1 || endStationIndex === -1) return;

      // Determine which stations are connected by this blockage
      const minIndex = Math.min(startStationIndex, endStationIndex);
      const maxIndex = Math.max(startStationIndex, endStationIndex);

      // Add connection data to all stations in this range
      for (let i = minIndex; i <= maxIndex; i++) {
        const stationName = sortedStations[i];

        // Add blockage info to this station's data
        const stationData = data.find((d) => d.name === stationName);
        if (stationData) {
          // If this is the first station in the range
          if (i === minIndex) {
            if (!stationData[`range_${blockIndex}`]) {
              stationData[`range_${blockIndex}`] = [];
            }
            stationData[`range_${blockIndex}`].push({
              timeRange: [block.startTime, block.endTime],
              isStart: true,
              isEnd: minIndex === maxIndex,
              blockage: block,
            });
          }
          // If this is the last station in the range and not the same as the first
          else if (i === maxIndex && minIndex !== maxIndex) {
            if (!stationData[`range_${blockIndex}`]) {
              stationData[`range_${blockIndex}`] = [];
            }
            stationData[`range_${blockIndex}`].push({
              timeRange: [block.startTime, block.endTime],
              isStart: false,
              isEnd: true,
              blockage: block,
            });
          }
          // For stations in the middle of the range
          else if (i > minIndex && i < maxIndex) {
            if (!stationData[`range_${blockIndex}`]) {
              stationData[`range_${blockIndex}`] = [];
            }
            stationData[`range_${blockIndex}`].push({
              timeRange: [block.startTime, block.endTime],
              isStart: false,
              isEnd: false,
              blockage: block,
            });
          }

          // Add the actual time data for the chart to render
          stationData[`block_${blockIndex}`] = [block.startTime, block.endTime];

          // Store metadata for the tooltip
          stationData[`block_${blockIndex}Info`] = {
            department: block.reason,
            startTime: block.startTime,
            endTime: block.endTime,
            startStation: block.startStation,
            endStation: block.endStation,
            isConnection: true,
          };
        }
      }
    });
  }

  // Custom tooltip component for more detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && activeTooltip) {
      const dataKey = payload[0].dataKey;
      // Only show tooltip if it matches our active tooltip
      if (dataKey !== `block_${activeTooltip}`) {
        return null;
      }

      const infoKey = dataKey.replace("block_", "block_") + "Info";
      const info = payload[0].payload[infoKey];

      if (info) {
        // Format time to show hours and minutes
        const formatTimeDisplay = (time) => {
          const hours = Math.floor(time);
          const minutes = Math.round((time - hours) * 60);
          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        };

        return (
          <div className="bg-white p-3 border rounded-md shadow-lg">
            <p className="font-bold text-lg">{`${info.startStation} → ${info.endStation}`}</p>
            <p>
              <strong>Time:</strong> {formatTimeDisplay(info.startTime)} -{" "}
              {formatTimeDisplay(info.endTime)}
            </p>
            {info.department && (
              <p>
                <strong>Department:</strong> {info.department}
              </p>
            )}
            <p className="text-xs mt-2 text-gray-500">
              Current station: {payload[0].payload.name}
            </p>
          </div>
        );
      }
    }
    return null;
  };

  // Handle mouse enter/leave for tooltip
  const handleMouseEnter = (blockIndex) => {
    setActiveTooltip(blockIndex);
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  // Custom bar shape to create vertical connections between stations
  const CustomBar = (props) => {
    const { x, y, width, height, fill, dataKey, payload, index } = props;
    const rangeKey = dataKey.replace("block_", "range_");
    const rangeData = payload[rangeKey]?.[0];

    if (!rangeData) {
      return null;
    }

    // Extract the blockIndex from the dataKey (format: "block_{index}")
    const blockIndex = dataKey.split("_")[1];

    // Calculate the actual dimensions based on whether this is a start, middle or end point
    let barHeight = height;
    let barY = y;
    let barRadius = [0, 0, 0, 0]; // top-left, top-right, bottom-right, bottom-left

    if (rangeData.isStart && !rangeData.isEnd) {
      // If this is the start of a range but not the end, extend down from the middle
      barY = y;
      barHeight = height;
      barRadius = [5, 5, 0, 0]; // Rounded top corners
    } else if (!rangeData.isStart && rangeData.isEnd) {
      // If this is the end of a range but not the start, extend up to the middle
      barY = y;
      barHeight = height;
      barRadius = [0, 0, 5, 5]; // Rounded bottom corners
    } else if (!rangeData.isStart && !rangeData.isEnd) {
      // If this is in the middle of a range, take the full height
      barHeight = height;
      barRadius = [0, 0, 0, 0]; // No rounded corners
    } else if (rangeData.isStart && rangeData.isEnd) {
      // If this is both start and end (single station request)
      barY = y;
      barHeight = height;
      barRadius = [5, 5, 5, 5]; // All corners rounded
    }

    // Create connecting lines to make it look more like a continuous path
    return (
      <g>
        {/* Main bar */}
        <rect
          x={x}
          y={barY}
          width={width}
          height={barHeight}
          fill={fill}
          rx={Math.max(...barRadius)}
          ry={Math.max(...barRadius)}
          className="opacity-70 hover:opacity-90 transition-opacity duration-200"
          cursor="pointer"
          style={{ pointerEvents: "all" }}
          onMouseEnter={() => handleMouseEnter(blockIndex)}
          onMouseLeave={handleMouseLeave}
        />

        {/* If this is the start of a section and not the end, add a bottom connector */}
        {rangeData.isStart && !rangeData.isEnd && (
          <rect
            x={x + width / 2 - 2}
            y={barY + barHeight}
            width={4}
            height={10}
            fill={fill}
            className="opacity-70"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* If this is the end of a section and not the start, add a top connector */}
        {!rangeData.isStart && rangeData.isEnd && (
          <rect
            x={x + width / 2 - 2}
            y={barY - 10}
            width={4}
            height={10}
            fill={fill}
            className="opacity-70"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* If this is in the middle of a range, add connectors on both ends */}
        {!rangeData.isStart && !rangeData.isEnd && (
          <>
            <rect
              x={x + width / 2 - 2}
              y={barY - 10}
              width={4}
              height={10}
              fill={fill}
              className="opacity-70"
              style={{ pointerEvents: "none" }}
            />
            <rect
              x={x + width / 2 - 2}
              y={barY + barHeight}
              width={4}
              height={10}
              fill={fill}
              className="opacity-70"
              style={{ pointerEvents: "none" }}
            />
          </>
        )}
      </g>
    );
  };

  return (
    <div style={{ overflowY: "scroll", overflowX: "scroll" }}>
      <BarChart
        width={2000 * scale}
        height={Math.max(400, 50 * data.length)} // Dynamic height based on number of stations
        data={data}
        layout="vertical"
        barGap={0}
        barCategoryGap={5}
        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          orientation="top"
          domain={[0, 24]}
          tickCount={Math.round(25 * scale)}
          tickFormatter={(tick) => `${tick}:00`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tick={({ x, y, payload }) => (
            <text
              x={x - 5}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-sm font-medium"
              fill="#333"
            >
              {payload.value}
            </text>
          )}
        />

        {/* Render a Bar for each potential blockage */}
        {Array.from({ length: blockages.length }).map((_, index) => (
          <Bar
            key={index}
            dataKey={`block_${index}`}
            fill={`hsl(${(index * 30) % 360}, 70%, 60%)`}
            shape={<CustomBar />}
            isAnimationActive={false} // Disable animation for better tooltip behavior
          />
        ))}

        <Tooltip
          content={<CustomTooltip />}
          cursor={false} // Hide the default cursor overlay
          isAnimationActive={false} // Disable animation for better tooltip behavior
        />
      </BarChart>
    </div>
  );
};

export default function GanttGraph({ data, scale = 1 }) {
  console.log("GanttGraph received scale:", scale);

  function formatTime(timeString) {
    let [hours, minutes] = timeString.split(":");
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10) || 0;

    // Ensure proper decimal representation
    let formattedTime = hours + minutes / 60;
    return parseFloat(formattedTime.toFixed(2));
  }

  // Find blockages that overlap with the given blockage
  function findOverlappingBlockages(blockage, blockages) {
    return blockages.filter(
      (b) =>
        b.startStation === blockage.startStation &&
        b.endStation === blockage.endStation &&
        !(
          (
            b.startTime >= blockage.endTime || // b starts after blockage ends
            b.endTime <= blockage.startTime
          ) // b ends before blockage starts
        )
    );
  }

  // Group overlapping blockages
  function groupOverlappingBlockages(blockages) {
    const groups = [];
    const processed = new Set();

    blockages.forEach((blockage, index) => {
      if (processed.has(index)) return;

      const group = [blockage];
      processed.add(index);

      blockages.forEach((b, i) => {
        if (processed.has(i)) return;

        if (
          b.startStation === blockage.startStation &&
          b.endStation === blockage.endStation &&
          !(b.startTime >= blockage.endTime || b.endTime <= blockage.startTime)
        ) {
          group.push(b);
          processed.add(i);
        }
      });

      groups.push(group);
    });

    return groups;
  }

  const stations = [];
  const blockages = [];

  // Process the data to extract stations and blockages
  data.forEach((element, ind) => {
    // Split station name into from-to sections
    const stationArray = element.stationName.split("-").map((e) => e.trim());
    const startStation = stationArray[0];
    const endStation = stationArray[1] || startStation; // If no end station, use start station

    // Add stations to the list if they don't exist and aren't 'YD'
    if (!stations.includes(startStation) && startStation !== "YD") {
      stations.push(startStation);
    }

    if (!stations.includes(endStation) && endStation !== "YD") {
      stations.push(endStation);
    }

    // Process requests for this section
    if (element.requests && element.requests.length > 0) {
      element.requests.forEach((request, requestIndex) => {
        const newBlockage = {
          id: `${ind}-${requestIndex}`,
          startStation: startStation,
          endStation: endStation,
          startTime: formatTime(request.demandTimeFrom),
          endTime: formatTime(request.demandTimeTo),
          reason: request.selectedDepartment || "",
          // Store the original request for reference
          originalRequest: request,
        };

        // Check for overlapping blockages
        const overlappingBlockages = findOverlappingBlockages(
          newBlockage,
          blockages
        );

        // If there are overlapping blockages, we might want to adjust our rendering strategy
        // For now, we'll just add the blockage as is
        blockages.push(newBlockage);
      });
    }
  });

  // Group overlapping blockages to prevent visual clutter
  const blockageGroups = groupOverlappingBlockages(blockages);
  const processedBlockages = blockageGroups.flat();

  return (
    <StationBlockageChart
      stations={stations}
      blockages={processedBlockages}
      scale={scale}
    />
  );
}
