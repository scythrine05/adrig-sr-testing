import React from 'react'
import MultipleSelect from './blockrequest/MultipleSelect';
import MultipleSelectOld from './blockrequest/MultipleSelectOld';

const FormLayout = ({
  handleInputRefsChange,
  handleKeyDownChange,
  getFormDate,
  getHandleChange,
  maxDate,
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
  formConditionalRenderingSelectedDepot
}) => {
    return (
        <div className="custom-main-w mx-auto p-4 mt-10 bg-blue-100 rounded-lg shadow-lg">
          <h1 className="text-center text-xl font-bold mb-4">Request Form</h1>
    
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">
                Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                ref={handleInputRefsChange(0)}
                onKeyDown={handleKeyDownChange}
                value={getFormDate()}
                type="date"
                name="date"
                className="mt-1 w-full p-2 border rounded"
                onChange={getHandleChange()}
                max={maxDate}
              />
            </div>
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
                onChange={getHandleChange()}
                disabled
              >
                <option value={""}>Select department </option>
                <option value={"ENGG"}>ENGG</option>
                <option value={"SIG"}>SIG</option>
                <option value={"TRD"}>TRD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Section <span style={{ color: "red" }}>*</span>
              </label>
              <select
                ref={handleInputRefsChange(2)}
                onKeyDown={handleKeyDownChange(2)}
                value={formSelectedSection()}
                name="selectedSection"
                className="mt-1 w-full p-2.5 border rounded"
                onChange={getHandleChange()}
              >
                <option>Select section</option>
                <option value={"AJJ-RU"}>AJJ-RU</option>
                <option value={"MAS-AJJ"}>MAS-AJJ</option>
                <option value={"MSB-VM"}>MSB-VM</option>
                <option value={"AJJ-KPD"}>AJJ-KPD</option>
                <option value={"KPD-JTJ"}>KPD-JTJ</option>
                <option value={"AJJ-CGL"}>AJJ-CGL</option>
                <option value={"MAS-GDR"}>MAS-GDR</option>
              </select>
            </div>
          </div>
    
          <div className="inline relative mb-4 ">
            <div>
            {formConditionalRenderingSelectedDepot()}
            </div>
    
            <div className="inline relative mb-4">
            <label className="block text-sm font-medium mt-4">
                Mission Block <span style={{ color: "red" }}>*</span>
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
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
            <select
              ref={handleInputRefsChange(5)}
              onKeyDown={handleKeyDownChange(5)}
              value={formWorkType()}
              name="workType"
              className="mt-1 p-2 rounded-md"
              onChange={getHandleChange()}
            >
              <option className="block text-sm font-medium " value={""}>
                Select The Work Description
              </option>
              {customOption1()}
            </select>
            {customOption2()}
            {customOption3()}
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            {handleGetMissionBlock1()}
            {formConditionalRendering1()}
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">
                Demanded time (Click On the Clock To Select){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={formDemandTimeFrom()}
                  name="demandTimeFrom"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="from"
                  onChange={getHandleChange()}
                />
                <input
                  type="time"
                  value={formDemandTimeTo()}
                  name="demandTimeTo"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="to"
                  onChange={getHandleChange()}
                />
              </div>
            </div>
          </div>
          {formConditionalRendering2()}
          {/* Other Affected Lines */}
          {handleGetMissionBlock2()}
    
          <div className="mb-4 mt-2">
            <label className="block text-sm font-medium">Remarks</label>
            <textarea
              type="text"
              name="requestremarks"
              onChange={getHandleChange()}
              value={formRequestRemarks()}
              className="mt-2 p-2 w-full border border-slate-950 rounded"
            />
          </div>
    
          {/* Submit Button */}
          <div className="text-center">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={formSubmitHandler()}
            >
              Submit
            </button>
          </div>
        </div>
      );
}

export default FormLayout