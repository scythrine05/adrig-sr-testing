"use client";

import React, { useEffect, useState } from "react";
import WeekSchedule from "./WeekSchedule";
import ToolBar from "./TollBar";
import useFetchByStation from "../../../lib/hooks/useFetchByStation";
import {
  CalendarCheck2,
  CalendarClock,
  Check,
  CircleAlert,
  Clock,
  Map,
  User,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import ViewSelector from "../../ui/viewselector";
import RequestTable from "./RequestTable";

function CompactView({ viewState, setViewState }) {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 bg-secondary rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        {/* View Selector */}
        <ViewSelector viewState={viewState} setViewState={setViewState} />
      </div>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        These are the requests that came for this week, review the details of the schedules.
      </p>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 w-full lg:w-1/3">
          <RadioGroup>
            {/* AAK - FSS */}
            <div className="flex items-start mb-4">
              <RadioGroupItem
                value="AAK - FSS"
                id="AAK - FSS"
                className="text-red-400 text-xl mr-3"
              />
              <div htmlFor="AAK - FSS">
                <h2 className="text-lg font-semibold">AAK - FSS</h2>
                <p className="text-sm text-gray-500">
                  4 Schedules and 2 Conflicts
                </p>
                <p className="text-sm text-gray-400">
                  Track correction, gravel correction, electrical maintenance
                </p>
              </div>
              <span className="ml-auto text-gray-400 text-sm whitespace-nowrap flex-grow">
                1st July
              </span>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* JIY - FSS */}
            <div className="flex items-start mb-4">
              <RadioGroupItem
                value="JIY - FSS"
                id="JIY - FSS"
                className="text-red-400 text-xl mr-3"
              />
              <div htmlFor="JIY - FSS">
                <h2 className="text-lg font-semibold">JIY - FSS</h2>
                <p className="text-sm text-gray-500">
                  7 Schedules and 2 Conflicts
                </p>
                <p className="text-sm text-gray-400">
                  Gravel correction, electrical maintenance
                </p>
              </div>
              <span className="ml-auto text-gray-400 text-sm whitespace-nowrap flex-grow">
                1st July
              </span>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* AHM - FSS */}
            <div className="flex items-start mb-4">
              <RadioGroupItem
                value="AHM - FSS"
                id="AHM - FSS"
                className="text-red-400 text-xl mr-3"
              />
              <div htmlFor="AHM - FSS">
                <h2 className="text-lg font-semibold">AHM - FSS</h2>
                <p className="text-sm text-gray-500">
                  8 Schedules and 1 Conflict
                </p>
                <p className="text-sm text-gray-400">
                  Track correction, gravel correction, electrical maintenance
                </p>
              </div>
              <span className="ml-auto text-gray-400 text-sm whitespace-nowrap flex-grow">
                1st July
              </span>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* RTT - FSS */}
            <div className="flex items-start mb-4">
              <RadioGroupItem
                value="option-one"
                id="option-one"
                className="text-purple-600 text-xl mr-3"
              />
              <div htmlFor="RTT - FSS">
                <h2 className="text-lg font-semibold">RTT - FSS</h2>
                <p className="text-sm text-gray-500">
                  4 Schedules and no Conflicts
                </p>
                <p className="text-sm text-gray-400">
                  Track correction, gravel correction, electrical
                </p>
              </div>
              <span className="ml-auto text-gray-400 text-sm whitespace-nowrap flex-grow">
                2nd July
              </span>
            </div>
          </RadioGroup>
        </div>

        {/* Right Column */}
        <div className="bg-pink-50 p-4 sm:p-6 rounded-xl flex-grow shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">AAK - FSS</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            1st July | 4 Schedules and 2 Conflicts
          </p>

          {/* Assigned By */}
          <div className="flex items-center mb-4">
            <User className="text-gray-500 text-base mr-3" />
            <span className="text-sm text-gray-600 font-semibold">Assigned By</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">Arun</span>
          </div>

          {/* Total Hours */}
          <div className="flex items-center mb-4">
            <Clock className="text-gray-500 text-base mr-3" />
            <span className="text-sm text-gray-600 font-semibold">Total Hours</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">8 Hours</span>
          </div>

          {/* Corridor */}
          <div className="flex items-center mb-4">
            <Map className="text-gray-500 text-base mr-3" />
            <span className="text-sm text-gray-600 font-semibold">Corridor</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">JPT - JJT</span>
          </div>

          {/* Priority Level */}
          <div className="flex items-center mb-6">
            <CircleAlert className="text-gray-500 text-base mr-3" />
            <span className="text-sm text-gray-600 font-semibold">Priority Level</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">Medium</span>
          </div>

          {/* Schedule Items */}
          <div className="bg-white p-4 rounded-lg mb-3 flex items-center">
            <div className="rounded-full bg-secondary p-3 mr-3">
              <CalendarCheck2 className="text-lg" />
            </div>
            <div>
              <span className="text-sm font-semibold">09:00 - 09:30</span>
              <p className="text-sm text-gray-500">Track correction</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg mb-3 flex items-center">
            <div className="rounded-full bg-secondary p-3 mr-3">
              <CircleAlert className="text-red-400 text-lg" />
            </div>
            <div>
              <span className="text-sm font-semibold">11:00 - 12:00</span>
              <p className="text-sm text-gray-500">Electrical Maintenance</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg mb-3 flex items-center">
            <div className="rounded-full bg-secondary p-3 mr-3">
              <CircleAlert className="text-red-400 text-lg" />
            </div>
            <div>
              <span className="text-sm font-semibold">11:30 - 12:00</span>
              <p className="text-sm text-gray-500">Electrical Maintenance</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg flex items-center">
            <div className="rounded-full bg-secondary p-3 mr-3">
              <CalendarCheck2 className="text-lg" />
            </div>
            <div>
              <span className="text-sm font-semibold">16:00 - 17:30</span>
              <p className="text-sm text-gray-500">Gravel Correction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ScheduleManager = () => {
  // const [isGanttView, setIsGanttView] = useState(true);

  const [viewState, setViewState] = useState(0);

  return (
    <div className="w-full  flex flex-col items-center space-y-6 mt-10">
      <h1 className="text-3xl md:text-4xl text-center font-bold text-gray-900 mt-8">Summary of my Upcoming Block Requisitions</h1>
      {viewState === 0 && (
        <RequestTable viewState={viewState} setViewState={setViewState} />
      )}

      {viewState === 1 && (
        <CompactView viewState={viewState} setViewState={setViewState} />
      )}

      {viewState === 2 && (
        <>
          <WeekSchedule viewState={viewState} setViewState={setViewState} />
        </>
      )}
    </div>
  );
};

export default ScheduleManager;
