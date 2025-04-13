import ViewSelector from "../../ui/viewselector";

import UserRequests from "../../../components/custom/UserRequests";
import CalenderSlider from "../CalenderSlider";
import { useState } from "react";

const RequestTable = ({ viewState, setViewState }) => {
  const [date, setDate] = useState(null);
  return (
    <div className="w-full max-w-10xl mx-auto py-8 px-6 bg-secondary rounded-xl">
      <div className="flex justify-between items-center mb-4 flex-col max-w-full">
        <ViewSelector viewState={viewState} setViewState={setViewState} />
      </div>
      <p className="text-gray-500 mb-6">
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
