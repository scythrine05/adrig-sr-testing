"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import useFetchStationsList from "../../../lib/hooks/useFetchStationsList";
import useFetchByStation from "../../../lib/hooks/useFetchByStation";
import AddHoc from "./AddHoc";
import useOptimizedCheck from "../../../lib/hooks/useOptimizedCheck";
import { cn } from "../../../lib/utils";
import useIsAdmin from "../../../lib/hooks/useIsAdmin";
import { useRouter } from "next/navigation";
import Calender from "../../ui/Calender";

const ToolBar = ({ setScheduleDataByStation, setSection, setDate }) => {
  const { stationsListData } = useFetchStationsList();
  const [stationsList, setStationsList] = useState([]);

  const [selectedStation, setSelectedStation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const { stationData } = useFetchByStation(start, end);

  useEffect(() => {
    if (stationsListData && stationsListData.length > 0) {
      setStationsList(stationsListData);
      const firstStation = stationsListData[0];
      setSelectedStation(firstStation.id.toString());
      setStart(firstStation.from);
      setEnd(firstStation.to);
    }
  }, [stationsListData]);

  useEffect(() => {
    if (stationData) {
      setScheduleDataByStation(stationData);
      setSection(`${start}-${end}`);
    }
  }, [stationData, setScheduleDataByStation]);

  const handleSelectChange = (value) => {
    setSelectedStation(value);
    const selectedStationObj = stationsList.find(
      (station) => station.id.toString() === value
    );
    if (selectedStationObj) {
      setStart(selectedStationObj.from);
      setEnd(selectedStationObj.to);
    }
  };

  function dateChangeHandler(e) {
    setDate(e.target.value);
  }

  return (
    <section className="w-full flex items-center justify-center py-8 px-6 bg-secondary rounded-xl">
      <div className="w-full flex items-center space-x-8">
        {stationsList.length > 0 && (
          <Select value={selectedStation} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-96">
              <SelectValue>
                {
                  stationsList.find(
                    (station) => station.id.toString() === selectedStation
                  )?.from
                }{" "}
                -{" "}
                {
                  stationsList.find(
                    (station) => station.id.toString() === selectedStation
                  )?.to
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {stationsList.map((station) => (
                  <SelectItem key={station.id} value={station.id.toString()}>
                    {station.from} - {station.to}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <div className="relative max-w-sm">
          <input
            type="date"
            className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={dateChangeHandler}
          />
        </div>
      </div>
    </section>
  );
};

export default ToolBar;
