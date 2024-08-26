import ViewSelector from "../../ui/viewselector";

import UserRequests from "../../../components/custom/UserRequests";

const RequestTable = ({  viewState, setViewState }) => {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-6 bg-secondary rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Request Table</h1>
          <ViewSelector viewState={viewState} setViewState={setViewState} />
      </div>
      <p className="text-gray-500 mb-6">
        These are the request that came for this week, review the details of the
        schedules
      </p>
      <UserRequests />
    </div>
  );
}
export default RequestTable;
