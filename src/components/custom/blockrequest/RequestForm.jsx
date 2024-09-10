"use client";
import { ChangeEvent, useState } from "react";
import { postFormData } from "../../../app/actions/formdata";
import { getUserId } from "../../../app/actions/user";
import { sectionData, machine, work, data, workData } from "../../../lib/store";
import MultipleSelect from "./MultipleSelect";
import { useToast } from "../../ui/use-toast";
import { useRouter } from "next/navigation";
import validateForm from "./formValidation";

export default function RequestForm(props) {
  const router = useRouter();
  const { toast } = useToast();
  const [otherData, setOtherData] = useState("");
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
    sigElementarySectionFrom: "",
    sigElementarySectionTo: "",
    repercussions: "",
    otherLinesAffected: "",
    requestremarks: "",
  });

  const formValidation = (value) => {
    let res = validateForm(value);
    console.log(res);
    if (
      res.date ||
      res.selectedDepartment ||
      res.stationID ||
      res.workType ||
      res.workDescription ||
      res.selectedLine ||
      res.missionBlock ||
      res.workLocationFrom ||
      res.workLocationTo ||
      res.demandTimeFrom ||
      res.demandTimeTo ||
      (formData.selectedDepartment != "TRD" &&
        (res.sigDisconnection || res.ohDisconnection || res.cautionRequired))
    ) {
      return false;
    } else {
      return true;
    }
  };

  function revertCategoryFormat(formattedCategory) {
    if (formattedCategory === "Gear") {
      return formattedCategory;
    }
    return formattedCategory.split(" ").join("_");
  }

  const blockGenerator = () => {
    if (formData.stationID != "" && formData.selectedSection != "") {
      for (let section of data.sections) {
        if (formData.selectedSection == section.name) {
          // console.log(formData.selectedSection);
          // if (formData.stationID === "Section") {
          //   return section.section_blocks;
          // } else if (formData.stationID === "Station") {
          //   return section.station_blocks;
          // } else {
          //   return [];
          // }
          let res = section.section_blocks.concat(section.station_blocks);
          return res;
        }
      }
      return [];
    } else {
      return [];
    }
  };

  const getTheListForYard = () => {
    const res = [];
    blockGenerator().map((element, inf) => {
      res.push(element.block);
    });
    return res;
  };

  const getTheList = () => {
    const result = [];
    // blockGenerator().map((element, ind) => {
    //   return element.lines.map((e) => {
    //     if (element.block === formData.missionBlock) {
    //       if (formData.selectedLine != "" && e != formData.selectedLine)
    //         result.push(e);
    //     }
    //   });
    // });
    if (formData.stationID != "" && formData.selectedSection != "") {
      for (let section of data.sections) {
        if (formData.selectedSection == section.name) {
          // console.log(formData.selectedSection);
          // if (formData.stationID === "Section") {
          //   return section.section_blocks;
          // } else if (formData.stationID === "Station") {
          //   return section.station_blocks;
          // } else {
          //   return [];
          // }
          let res = section.lines;
          console.log(res);
          return res;
        }
      }
      return [];
    } else {
      return [];
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (
      formData.selectedDepartment === "ENGG" &&
      (name === "workLocationFrom" ||
        name === "workLocationTo" ||
        name === "cautionLocationFrom" ||
        name === "cautionLocationTo" ||
        name === "elementarySectionFrom" ||
        name === "elementarySectionTo" ||
        name === "sigElementarySectionFrom" ||
        name === "sigElementarySectionTo")
    ) {
      let rawValue = value.replace(/\//g, "");

      if (rawValue.length <= 3) {
        setFormData({
          ...formData,
          [name]: rawValue,
        });
      } else if (rawValue.length > 3 && rawValue.length <= 5) {
        const formattedValue = rawValue.slice(0, 3) + "/" + rawValue.slice(3);
        setFormData({
          ...formData,
          [name]: formattedValue,
        });
      } else if (rawValue.length > 5) {
        toast({
          title: "Invalid Format",
          description: "Fill the section in the format xxx/yy",
          variant: "destructive",
        });
      }
    } else if (name === "selectedDepartment") {
      formData.workType = "";
      formData.workDescription = "";
      setFormData({ ...formData, [name]: value });
    } else if (name === "selectedSection") {
      formData.stationID = "";
      formData.missionBlock = "";
      formData.otherLinesAffected = "";
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
        if (formValidation(formData) == true) {
          if (formData.workDescription === "others") {
            if (otherData === "") {
              toast({
                title: "Invalid Format",
                description: "Fill the section in the format xxx/yy",
                variant: "destructive",
              });
              return;
            }
            formData.workDescription = "Other Entry" + ":" + otherData;
          }
          const res = await postFormData(formData, UserData?.id);
          console.log(res);
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
            sigElementarySectionFrom: "",
            sigElementarySectionTo: "",
            repercussions: "",
            otherLinesAffected: "",
            requestremarks: "",
          });
          toast({
            title: "Success",
            description: "Request Submitted",
          });
          router.push("/schedule-manager");
        } else {
          toast({
            title: "Submission Failed",
            description: "Fill All The Details",
            variant: "destructive",
          });
        }
      }
    }
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
            <option value={""}>Select department</option>
            <option value={"ENGG"}>ENGG</option>
            <option value={"SIG"}>SIG</option>
            <option value={"TRD"}>TRD</option>
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

      <div className="inline relative mb-4 ">
        <select
          name="stationID"
          value={formData.stationID}
          className="mt-1 p-2 w-[535px] rounded-md"
          onChange={handleChange}
        >
          <option className="block text-sm font-medium " value={""}>
            Select Block Section
          </option>
          <option className="block text-sm font-medium " value={"Section/Yard"}>
            Section/Yard
          </option>
        </select>

        <div className="absolute w-[538px] top-[-20px] left-[552px] mb-4">
          <MultipleSelect
            items={getTheListForYard()}
            value={formData.missionBlock}
            setFormData={setFormData}
            name="missionBlock"
            placeholder={true}
            limit={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
        <select
          value={formData.workType}
          name="workType"
          className="mt-1 p-2 rounded-md"
          onChange={handleChange}
        >
          <option className="block text-sm font-medium " value={""}>
            Select The Work Description
          </option>

          {formData.selectedDepartment != "" &&
            Object.keys(workData[`${formData.selectedDepartment}`]).map(
              (element) => {
                const formattedCategory = element
                  .replace(/_/g, " ")
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ");
                return (
                  <option
                    className="block text-sm font-medium "
                    value={`${formattedCategory}`}
                    key={formattedCategory}
                  >
                    {formattedCategory}
                  </option>
                );
              }
            )}
        </select>
        {formData.workType != "" && formData.workType === "others" ? (
          <input
            type="text"
            name="workDescription"
            className="mt-1 w-full p-2.5 border rounded z-1000"
            onChange={handleChange}
            value={formData.workDescription}
          />
        ) : (
          <select
            name="workDescription"
            className="mt-1 w-full p-2.5 border rounded z-1000"
            onChange={handleChange}
            value={formData.workDescription}
          >
            <option>Select work description</option>
            {formData.workType != "" &&
              workData[`${formData.selectedDepartment}`][
                `${revertCategoryFormat(formData.workType)}`
              ].map((e) => {
                return (
                  <option
                    className="block text-sm font-medium"
                    value={e}
                    key={e}
                  >
                    {e}
                  </option>
                );
              })}
            <option className="block text-sm font-medium " value={"others"}>
              Others
            </option>
          </select>
        )}
        {formData.workDescription === "others" && (
          <div className="ml-[555px] ">
            <input
              type="text"
              name="otherData"
              placeholder="Enter The Other Task Here"
              className="border border-slate-900 rounded-lg p-2 w-[400px]"
              value={otherData}
              onChange={(e) => {
                setOtherData(e.target.value);
              }}
            />
          </div>
        )}
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
            {/* {blockGenerator().map((element, ind) => {
              return element.lines.map((e) => {
                if (element.block === formData.missionBlock) {
                  return (
                    <option value={e} key={ind}>
                      {e}
                    </option>
                  );
                }
              });
            })} */}
            {getTheList().map((e) => {
              return (
                <option value={e} key={e}>
                  {e}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          {formData.selectedDepartment === "ENGG" && (
            <label className="block text-sm font-medium">Work location</label>
          )}
          {formData.selectedDepartment === "SIG" && (
            <label className="block text-sm font-medium">Route</label>
          )}
          {formData.selectedDepartment === "TRD" && (
            <label className="block text-sm font-medium">
              Elementry Section
            </label>
          )}
          {formData.selectedDepartment === "" ||
            (formData.selectedDepartment === "ENGG" && (
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
            ))}
          {formData.selectedDepartment === "SIG" && (
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
          )}
          {formData.selectedDepartment === "TRD" && (
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
          )}
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

      {formData.selectedDepartment === "TRD" ? (
        <div className="bg-blue-200 p-4 rounded-lg mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Coaching repercussions
            </label>
            <textarea
              type="text"
              name="repercussions"
              onChange={handleChange}
              value={formData.repercussions}
              className="mt-2 p-2 w-1/2 border border-slate-950 rounded"
            />
          </div>
        </div>
      ) : (
        <div className="bg-blue-200 p-4 rounded-lg mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Caution required
            </label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="cautionRequired"
                  value="Yes"
                  checked={formData.cautionRequired === "Yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="cautionRequired"
                  checked={formData.cautionRequired === "No"}
                  value="No"
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          {formData.cautionRequired === "Yes" && (
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
                <label className="block text-sm font-medium">
                  Caution speed
                </label>
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
            <label className="block text-sm font-medium">
              OHE Disconnection
            </label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="ohDisconnection"
                  value="Yes"
                  checked={formData.ohDisconnection === "Yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="ohDisconnection"
                  checked={formData.ohDisconnection === "No"}
                  value="No"
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          {formData.ohDisconnection === "Yes" && (
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
            <label className="block text-sm font-medium">
              SIG Disconnection
            </label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="sigDisconnection"
                  value="Yes"
                  checked={formData.sigDisconnection === "Yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="sigDisconnection"
                  value="No"
                  checked={formData.sigDisconnection === "No"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          {formData.sigDisconnection === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">
                  Elementary section
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.sigElementarySectionFrom}
                    name="sigElementarySectionFrom"
                    className="mt-1 w-1/2 p-2 border rounded"
                    placeholder="from"
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    value={formData.sigElementarySectionTo}
                    name="sigElementarySectionTo"
                    className="mt-1 w-1/2 p-2 border rounded"
                    placeholder="to"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
        items={getTheList().filter((item) => item !== formData.selectedLine)}
        value={formData.otherLinesAffected}
        setFormData={setFormData}
        name="otherLinesAffected"
      />
      <div className="mb-4 mt-2">
        <label className="block text-sm font-medium">Remarks</label>
        <textarea
          type="text"
          name="requestremarks"
          onChange={handleChange}
          value={formData.requestremarks}
          className="mt-2 p-2 w-full border border-slate-950 rounded"
        />
      </div>

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
