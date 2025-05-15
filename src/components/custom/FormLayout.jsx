import React from "react";
import MultipleSelect from "./blockrequest/MultipleSelect";
import MultipleSelectOld from "./blockrequest/MultipleSelectOld";

const FormLayout = ({
  handleInputRefsChange,
  handleKeyDownChange,
  getFormDate,
  getHandleChange,
  maxDate,
  minDate,
  formSelectedDepartment,
  formSelectedSection,
  handleGetTheListForYard,
  formMissionBlock,
  handleSetFormData,
  formWorkType,
  customOption1,
  customOption2,
  customOption3,
  handleGetMissionBlock1,
  formConditionalRendering1,
  formDemandTimeFrom,
  formDemandTimeTo,
  formConditionalRendering2,
  handleGetMissionBlock2,
  formRequestRemarks,
  formSubmitHandler,
  formConditionalRenderingSelectedDepot,
  disabled_option,
  formCorridorType,
}) => {

  const urgentStartDate = new Date();
  const urgentEndDate = new Date();
  const restrictedStartDate = new Date(2025, 5, 16); // 16th May 2025;
  const restrictedEndDate = new Date(2025, 5, 26); // 25th May 2025



  const getCorridorTypeOptions = (selectedDate) => {

    if (selectedDate >= urgentStartDate && selectedDate <= urgentEndDate) {
      // Only "Urgent Block" allowed
      return (
        <label className="inline-flex items-center text-2xl cursor-pointer">
          <input
            type="radio"
            name="corridorType"
            value="emergency"
            checked={formCorridorType() === "emergency"}
            onChange={getHandleChange()}
            className="mr-3 w-6 h-6 appearance-none border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: '#40E0D0',
              borderColor: '#40E0D0',
            }}
          />
          Urgent Block
        </label>
      );
    } else if (selectedDate >= restrictedStartDate && selectedDate <= restrictedEndDate) {
      // No options allowed
      return <p className="text-red-500 text-xl">Request is being restricted for the date</p>;
    } else {
      // Normal options
      return (
        <>
          <label className="inline-flex items-center text-2xl cursor-pointer">
            <input
              type="radio"
              name="corridorType"
              value="corridor"
              checked={formCorridorType() === "corridor"}
              onChange={getHandleChange()}
              className="mr-3 w-6 h-6 appearance-none border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: formCorridorType() === "corridor" ? '#40E0D0' : 'white',
                borderColor: '#40E0D0',
              }}
            />
            Corridor
          </label>
          <label className="inline-flex items-center text-2xl cursor-pointer">
            <input
              type="radio"
              name="corridorType"
              value="non-corridor"
              checked={formCorridorType() === "non-corridor"}
              onChange={getHandleChange()}
              className="mr-3 w-6 h-6 appearance-none border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: formCorridorType() === "non-corridor" ? '#40E0D0' : 'white',
                borderColor: '#40E0D0',
              }}
            />
            Outside Corridor
          </label>
          <label className="inline-flex items-center text-2xl cursor-pointer">
            <input
              type="radio"
              name="corridorType"
              value="emergency"
              checked={formCorridorType() === "emergency"}
              onChange={getHandleChange()}
              className="mr-3 w-6 h-6 appearance-none border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: formCorridorType() === "emergency" ? '#40E0D0' : 'white',
                borderColor: '#40E0D0',
              }}
            />
            Urgent Block
          </label>
        </>
      );
    }
  };

  const isRestrictedDate = (selectedDate) => {
    return selectedDate >= restrictedStartDate && selectedDate <= restrictedEndDate;
  };

  return (
    <div className="p-4 mt-10 rounded-lg shadow-lg min-w-full overflow-hidden" style={{ backgroundColor: '#39C3EA' }}>
      <h1 className="text-center text-2xl md:text-4xl font-bold my-10">
        Block Requestion Form
      </h1>

      {/* Grid for Date, Department, and Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ">
        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium">
            Date of Block<span style={{ color: "red" }}>*</span>
          </label>
          <input
            ref={handleInputRefsChange(0)}
            onKeyDown={handleKeyDownChange}
            value={getFormDate()}
            type="date"
            name="date"
            className="mt-1 w-full p-2 border rounded"
            style={{ borderColor: '#40E0D0' }}
            onChange={getHandleChange()}
            min={(() => {
              // Temporary solution to allow selection only from tomorrow
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              return tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            })()}
          // min={minDate}
          // max={maxDate}
          />
          <p className="text-xs mt-1 text-black">
            Temporarily, you can only select dates from tomorrow onwards.
          </p>
          {/* {minDate && (
            <p className="text-xs text-gray-600 mt-1">
              Select a date from {minDate} onwards
            </p>
          )} */}
        </div>

        {/* Department Dropdown */}
        <div>
          <label className="block text-sm font-medium">
            Department <span style={{ color: "red" }}>*</span>
          </label>
          <select
            ref={handleInputRefsChange(1)}
            onKeyDown={handleKeyDownChange(1)}
            value={formSelectedDepartment()}
            name="selectedDepartment"
            className="mt-1 w-full p-2.5 border rounded"
            style={{ borderColor: '#40E0D0' }}
            onChange={getHandleChange()}
            disabled={disabled_option}
          >
            <option value={""}>Select</option>
            <option value={"ENGG"}>ENGG</option>
            <option value={"SIG"}>S&T</option>
            <option value={"TRD"}>TRD</option>
          </select>
        </div>

        {/* Major Section Dropdown */}
        <div>
          <label className="block text-sm font-medium">
            Major Section <span style={{ color: "red" }}>*</span>
          </label>
          <select
            ref={handleInputRefsChange(2)}
            onKeyDown={handleKeyDownChange(2)}
            value={formSelectedSection()}
            name="selectedSection"
            className="mt-1 w-full p-2.5 border rounded"
            style={{ borderColor: '#40E0D0' }}
            onChange={getHandleChange()}
          >
            <option>Select</option>
            <option value={"AJJ-RU"}>AJJ-RU</option>
            <option value={"MAS-AJJ"}>MAS-AJJ</option>
            <option value={"MSB-VM"}>MSB-VM</option>
            <option value={"AJJ-KPD"}>AJJ-KPD</option>
            <option value={"KPD-JTJ"}>KPD-JTJ</option>
            <option value={"AJJ-CGL"}>AJJ-CGL</option>
            <option value={"MAS-GDR"}>MAS-GDR</option>
            <option value={"MSB-VLCY"}>MSB-VLCY</option>
          </select>
        </div>
      </div>

      {/* Conditional Rendering for Depot */}
      <div className="mb-4">{formConditionalRenderingSelectedDepot()}</div>

      {/* Corridor Type Radio Button Group */}
      <div className="mb-4 flex justify-center flex-col items-center">
        <div className="flex space-x-8 mt-1">
          {getCorridorTypeOptions(new Date(getFormDate()))}
        </div>
      </div>

      {/* Mission Block Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium">
          Block Section/Yard <span style={{ color: "red" }}>*</span>
        </label>
        <MultipleSelect
          items={handleGetTheListForYard()}
          value={formMissionBlock()}
          setFormData={handleSetFormData()}
          name="missionBlock"
          placeholder={true}
          limit={true}
        />
      </div>

      {/* Grid for Work Type and Custom Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Work Type */}
        <select
          ref={handleInputRefsChange(5)}
          onKeyDown={handleKeyDownChange(5)}
          value={formWorkType()}
          name="workType"
          className="mt-1 p-2 rounded-md w-full"
          style={{ borderColor: '#40E0D0' }}
          onChange={getHandleChange()}
        >
          <option className="block text-sm font-medium" value={""}>
            Type of Work
          </option>
          {customOption1()}
        </select>

        {/* Custom Options */}
        {customOption2()}
        {customOption3()}
      </div>

      {/* Conditional Rendering for Mission Block */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        {handleGetMissionBlock1()}
        {formConditionalRendering1()}
      </div>

      {/* Grid for Demanded Time */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">
            Preferred Time (Click On the Clock To Select){" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 my-2">
            <div className="font-semibold p-2">From (Hrs)</div>
            <input
              type="time"
              value={formDemandTimeFrom()}
              name="demandTimeFrom"
              className="mt-1 w-full md:w-1/3 p-2 border rounded"
              style={{ borderColor: '#40E0D0' }}
              placeholder="from"
              onChange={getHandleChange()}
            />
            <div className="font-semibold p-2">To (Hrs)</div>
            <input
              type="time"
              value={formDemandTimeTo()}
              name="demandTimeTo"
              className="mt-1 w-full md:w-1/3 p-2 border rounded"
              style={{ borderColor: '#40E0D0' }}
              placeholder="to"
              onChange={getHandleChange()}
            />
          </div>
        </div>
      </div>

      {/* Conditional Rendering for Other Fields */}
      {formConditionalRendering2()}

      {/* Other Affected Lines */}
      {handleGetMissionBlock2()}

      {/* Remarks Textarea */}
      <div className="mb-4 mt-2">
        <label className="block text-sm font-medium">Remarks</label>
        <textarea
          type="text"
          name="requestremarks"
          onChange={getHandleChange()}
          value={formRequestRemarks()}
          className="mt-2 p-2 w-full border rounded"
          style={{ borderColor: '#40E0D0' }}
        />
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          className="text-white px-4 py-2 rounded hover:opacity-90 transition duration-300"
          style={{ backgroundColor: '#8E1402' }}
          onClick={isRestrictedDate(new Date(getFormDate())) ? null : formSubmitHandler()}
          disabled={isRestrictedDate(new Date(getFormDate()))}
        >
          {!isRestrictedDate(new Date(getFormDate())) ? "Submit" : "Request Restricted"}
        </button>
      </div>
    </div>
  );
};

export default FormLayout;