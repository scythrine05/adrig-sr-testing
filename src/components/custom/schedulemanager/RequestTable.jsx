import ViewSelector from "../../ui/viewselector";

import UserRequests from "../../../components/custom/UserRequests";
import CalenderSlider from "../CalenderSlider";
import { useState } from "react";

const RequestTable = ({ viewState, setViewState }) => {
  const [date, setDate] = useState(null);
  return (
    <div className="bg-white md:bg-secondary m-auto md:m-10 rounded-sm pt-20 lg:pt-5 md:p-5 w-full md:w-[97%]">
      <div className="flex justify-between items-center mb-4 flex-col max-w-full">
        <ViewSelector viewState={viewState} setViewState={setViewState} />
      </div>
      <p className="text-gray-500 mb-6 text-sm text-center">
        These are the request that came for this week, review the details of the
        schedules
      </p>
      <div>
        <CalenderSlider month={10} year={2024} setDate={setDate} />
        <UserRequests date={date} />
      </div>
    </div>
  );
};
export default RequestTable;
