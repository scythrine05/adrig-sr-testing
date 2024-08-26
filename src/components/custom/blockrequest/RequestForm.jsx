"use client";
import { ChangeEvent, useState } from "react";
import { postFormData } from "../../../app/actions/formdata";
import { getUserId } from "../../../app/actions/user";
import { sectionData, machine, work, data } from "../../../lib/store";
import MultipleSelect from "./MultipleSelect";

export default function RequestForm(props) {
  const [formData, setFormData] = useState({
    date: "",
    selectedDepartment: "",
    selectedSection: "",
    stationID: "",
    workType: "",
    workDescription: "",
    selectedLine: "",
    missionBlock: "",
    cautionRequired: "",
    cautionSpeed: "",
    cautionLocationFrom: "",
    cautionLocationTo: "",
    workLocationFrom: "",
    workLocationTo: "",
    demandTimeFrom: "",
    demandTimeTo: "",
    sigDisconnection: "",
    ohDisconnection: "",
    elementarySectionFrom: "",
    elementarySectionTo: "",
    otherLinesAffected: "",
  });

  const blockGenerator = () => {
    if (formData.stationID != "" && formData.selectedSection != "") {
      console.log(2);
      for (const section of data.sections) {
        console.log(section.name);
        if (formData.selectedSection === section.name) {
          console.log(4);
          if (formData.stationID === "section") {
            console.log(5);
            return section.section_blocks;
          } else if (formData.stationID === "station") {
            console.log(6);
            return section.station_blocks;
          } else {
            console.log(7);
            return [];
          }
        }
      }
    } else {
      return [];
    }
  };

  const getTheList = () => {
    const result = [];
    blockGenerator().map((element, ind) => {
      return element.lines.map((e) => {
        if (element.block === formData.missionBlock) {
          if (formData.selectedLine != "" && e != formData.selectedLine)
            result.push(e);
        }
      });
    });
    return result;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const formSubmitHandler = async () => {
    console.log(formData);
    if (props.user == undefined || props.user?.user == undefined) {
      return;
    } else {
      const UserData = await getUserId(props.user?.user);
      if (UserData == null || UserData == undefined || UserData.id == null) {
        return;
      } else {
        const res = await postFormData(formData, UserData?.id);
      }
    }
    setFormData({
      date: "",
      selectedDepartment: "",
      selectedSection: "",
      stationID: "",
      missionBlock: "",
      workType: "",
      workDescription: "",
      selectedLine: "",
      cautionRequired: "",
      cautionSpeed: "",
      cautionLocationFrom: "",
      cautionLocationTo: "",
      workLocationFrom: "",
      workLocationTo: "",
      demandTimeFrom: "",
      demandTimeTo: "",
      sigDisconnection: "",
      ohDisconnection: "",
      elementarySectionFrom: "",
      elementarySectionTo: "",
      otherLinesAffected: "",
    });
  };

  return (
    <div className="custom-main-w mx-auto p-4 mt-10 bg-blue-100 rounded-lg shadow-lg">
      <h1 className="text-center text-xl font-bold mb-4">Request Form</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            value={formData.date}
            type="date"
            name="date"
            className="mt-1 w-full p-2 border rounded"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Department</label>
          <select
            value={formData.selectedDepartment}
            name="selectedDepartment"
            className="mt-1 w-full p-2.5 border rounded"
            onChange={handleChange}
          >
            <option>Select department</option>
            <option>ENGG</option>
            <option>SIG</option>
            <option>TRD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Section</label>
          <select
            value={formData.selectedSection}
            name="selectedSection"
            className="mt-1 w-full p-2.5 border rounded"
            onChange={handleChange}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          name="stationID"
          value={formData.stationID}
          className="mt-1 p-2 rounded-md"
          onChange={handleChange}
        >
          <option className="block text-sm font-medium " value={""}>
            Select Block Section
          </option>
          <option className="block text-sm font-medium " value={"station"}>
            Station
          </option>
          <option className="block text-sm font-medium " value={"section"}>
            Section
          </option>
        </select>
        <select
          name="missionBlock"
          value={formData.missionBlock}
          className="mt-1 w-full p-2.5 border rounded"
          onChange={handleChange}
        >
          <option>Select The Block</option>
          {blockGenerator().map((element, ind) => {
            return (
              <option value={element.block} key={ind}>
                {element.block}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          value={formData.workType}
          name="workType"
          className="mt-1 p-2 rounded-md"
          onChange={handleChange}
        >
          <option className="block text-sm font-medium ">
            Select The Work Description
          </option>
          <option className="block text-sm font-medium " value="machine">
            Machine
          </option>
          <option className="block text-sm font-medium " value="work">
            Work
          </option>
        </select>
        <select
          name="workDescription"
          className="mt-1 w-full p-2.5 border rounded"
          onChange={handleChange}
        >
          <option>Select work description</option>
          {formData.workType != "" && formData.workType === "machine"
            ? machine.map((e, i) => {
                return (
                  <option key={i} value={e}>
                    {e}
                  </option>
                );
              })
            : work.map((e, i) => {
                return (
                  <option key={i} value={e}>
                    {e}
                  </option>
                );
              })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Line</label>
          <select
            name="selectedLine"
            value={formData.selectedLine}
            className="mt-1 w-full p-2 border rounded"
            onChange={handleChange}
          >
            <option value={""}>Select Line</option>
            {blockGenerator().map((element, ind) => {
              return element.lines.map((e) => {
                if (element.block === formData.missionBlock) {
                  return (
                    <option value={e} key={ind}>
                      {e}
                    </option>
                  );
                }
              });
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Work location</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.workLocationFrom}
              name="workLocationFrom"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="from"
              onChange={handleChange}
            />
            <input
              type="text"
              value={formData.workLocationTo}
              name="workLocationTo"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="to"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">
            Demanded time (Click On the Clock To Select)
          </label>
          <div className="flex space-x-2">
            <input
              type="time"
              value={formData.demandTimeFrom}
              name="demandTimeFrom"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="from"
              onChange={handleChange}
            />
            <input
              type="time"
              value={formData.demandTimeTo}
              name="demandTimeTo"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="to"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-200 p-4 rounded-lg mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium">Caution required</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="cautionRequired"
                value="yes"
                checked={formData.cautionRequired === "yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="cautionRequired"
                checked={formData.cautionRequired === "no"}
                value="no"
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>
        {formData.cautionRequired === "yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">
                Caution location
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.cautionLocationFrom}
                  name="cautionLocationFrom"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="from"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.cautionLocationTo}
                  name="cautionLocationTo"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="to"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Caution speed</label>
              <input
                type="text"
                value={formData.cautionSpeed}
                name="cautionSpeed"
                className="mt-1 w-full p-2 border rounded"
                placeholder="In format km/h"
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium">OHE Disconnection</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="ohDisconnection"
                value="yes"
                checked={formData.ohDisconnection === "yes"}
                onChange={handleChange}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="ohDisconnection"
                checked={formData.ohDisconnection === "no"}
                value="no"
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>
        {formData.ohDisconnection === "yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">
                Elementary section
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.elementarySectionFrom}
                  name="elementarySectionFrom"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="from"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.elementarySectionTo}
                  name="elementarySectionTo"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="to"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium">SIG Disconnection</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="sigDisconnection"
                value="yes"
                checked={formData.sigDisconnection === "yes"}
                onChange={handleChange}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="sigDisconnection"
                value="no"
                checked={formData.sigDisconnection === "no"}
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>
      </div>

      {/* Other Affected Lines */}
      <div className="mb-4">
        <label className="block text-sm font-medium">
          Other affected lines
        </label>
        {/* <select
          value={formData.otherLinesAffected}
          name="otherLinesAffected"
          className="mt-1 w-full p-2 border rounded"
          onChange={handleChange}
        ></select> */}
      </div>
      <MultipleSelect
  items={getTheList()}
  value={formData.otherLinesAffected} 
  setFormData={setFormData}  
  name="otherLinesAffected"  
/>

      {/* Submit Button */}
      <div className="text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={formSubmitHandler}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
