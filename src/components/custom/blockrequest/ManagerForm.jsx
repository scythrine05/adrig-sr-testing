"use client";
import { useEffect, useState, useRef } from "react";
import { postStagingManagerFormData } from "../../../app/actions/stagingform";
import { getManager } from "../../../app/actions/user";
import { data, workData } from "../../../lib/store";
import MultipleSelect from "./MultipleSelect";
import MultipleSelectOld from "./MultipleSelectOld";
import { useToast } from "../../ui/use-toast";
import { useRouter } from "next/navigation";
import { yardData } from "../../../lib/yard";
import { useSession } from "next-auth/react";
import { useFormState, handleKeyDown, formValidation, revertCategoryFormat, handleChange } from "../../../lib/utils";
import FormLayout from "../FormLayout";
import ConfirmationDialog from "../ConfirmationDialog";

export default function ManagerForm({ id }) {
  const maxDate = "2030-12-31";
  const { toast } = useToast();
  const [otherData, setOtherData] = useState("");
  const [formData, setFormData] = useFormState();
  const { data: session, status } = useSession();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    const fxn = async () => {
      if (!session || !session.user) {
        console.log("Session is not available yet");
        return;
      }
  
      const mail = session.user.email;
      console.log("Manager email:", mail);
      console.log("Department ID from prop:", id);
  
      const res = await getManager(mail);
      if (!res) return;
  
      console.log("Manager data:", res);
      formData.selectedDepartment = id ? id.toUpperCase() : res.department.toUpperCase();
    };
  
    fxn();
  }, [session, formData, status, id]); // Ensure session and id are dependencies
  

  const blockGenerator = () => {
    if (formData.stationID != "" && formData.selectedSection != "") {
      for (let section of data.sections) {
        if (formData.selectedSection == section.name) {
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
      const arr = element?.block?.split("-").map((name) => name.trim());
      if (arr?.includes("YD")) {
        yardData.stations.map((e) => {
          if (e.station_code === arr[0]) {
            res.push(element.block);
          }
        });
      } else {
        res.push(element.block);
      }
    });
    return res;
  };

  const getMissionBlock = () => {
    if (formData.missionBlock === "") {
      return [];
    } else {
      const check = formData.missionBlock.split(",").map((name) => name.trim());
      return check;
    }
  };

  const getTheListFilter = (missionBlock) => {
    let result = [];
    const arr = missionBlock?.split("-").map((name) => name.trim());
    if (arr?.includes("YD")) {
      const found = formData.selectedLine.yard.find((item) =>
        item?.startsWith(`${missionBlock}:`)
      );
      const commondata = found ? found.split(":")[1] : null;
      yardData.stations.map((yard) => {
        if (yard.station_code === arr[0]) {
          result = yard.roads.filter(
            (item) =>
              formData.selectedStream === "Both" ||
              item?.direction === formData.selectedStream
          );
          result = result.map((item) => item.road_no);
          const indexToFilterOut = result.findIndex(
            (item) => item === commondata
          );
          result = result.filter((_, index) => index !== indexToFilterOut);
        }
      });
    } else {
      const found = formData.selectedLine.station.find((item) =>
        item?.startsWith(`${missionBlock}:`)
      );
      const commondata = found ? found.split(":")[1] : null;
      blockGenerator().map((element, ind) => {
        if (element.block === missionBlock) {
          result = element.lines;
        }
        const indexToFilterOut = result.findIndex(
          (item) => item === commondata
        );
        result = result.filter((_, index) => index !== indexToFilterOut);
      });
    }

    return result;
  };

  const getTheList = (missionBlock) => {
    let result = [];
    const arr = missionBlock?.split("-").map((name) => name.trim());
    if (arr?.includes("YD")) {
      yardData.stations.map((yard) => {
        if (yard.station_code === arr[0]) {
          result = yard.roads;
        }
      });
    } else {
      const found = formData.selectedLine.station.find((item) =>
        item?.startsWith(`${missionBlock}:`)
      );
      const commondata = found ? found.split(":")[1] : null;
      blockGenerator().map((element, ind) => {
        if (element.block === missionBlock) {
          result = element.lines;
        }
      });
    }

    return result;
  };

  const getRoadData = (missionBlock) => {
    let result = [];
    const arr = missionBlock?.split("-").map((name) => name.trim());
    if (!arr?.includes("YD")) {
      return [];
    }
    yardData.stations.map((yard) => {
      if (yard.station_code === arr[0]) {
        result = yard.roads;
      }
    });

    return result;
  };

  const getLineSectionValue = (ele, arr) => {
    if (arr?.includes("YD")) {
      const foundItem = formData.selectedLine.yard.find((item) =>
        item?.startsWith(`${ele}:`)
      );
      if (foundItem) {
        return foundItem;
      }
      return "";
    } else {
      const foundItem = formData.selectedLine.station.find((item) =>
        item?.startsWith(`${ele}:`)
      );
      if (foundItem) {
        return foundItem;
      }
      return "";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (
      formData.selectedDepartment === "ENGG" &&
      (name === "cautionLocationFrom" ||
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
    } else if (
      formData.selectedDepartment === "ENGG" &&
      (name === "workLocationFrom" || name === "workLocationTo")
    ) {
      let rawValue = value;

      rawValue = rawValue.replace(/[^0-9.]/g, "");

      const decimalIndex = rawValue.indexOf(".");

      if (decimalIndex !== -1) {
        const beforeDecimal = rawValue.slice(0, decimalIndex);
        const afterDecimal = rawValue.slice(decimalIndex + 1, decimalIndex + 4);
        rawValue = beforeDecimal + "." + afterDecimal;
      }

      setFormData({
        ...formData,
        [name]: rawValue,
      });
    } else if (name === "selectedDepartment") {
      formData.workType = "";
      formData.workDescription = "";
      setFormData({ ...formData, [name]: value });
    } else if (name === "selectedSection") {
      formData.stationID = "Section/Yard";
      formData.missionBlock = "";
      formData.otherLinesAffected = "";
      setFormData({ ...formData, [name]: value });
    } else if (name === "date") {
      if (value > maxDate) {
        event.target.value = maxDate;
        alert(`Date cannot be later than ${maxDate}`);
        return;
      }
      setFormData({ ...formData, [name]: value });
    } else if (name === "selectedLine") {
      if (value.includes("YD")) {
        const [newKey] = value.split(":");

        formData.selectedLine = {
          ...formData.selectedLine,
          yard: [
            ...formData.selectedLine.yard.filter(
              (item) => !item?.startsWith(`${newKey}:`)
            ),
            value,
          ],
        };
      } else {
        const [newKey] = value.split(":");
        formData.selectedLine = {
          ...formData.selectedLine,
          station: [
            ...formData.selectedLine.station.filter(
              (item) => !item?.startsWith(`${newKey}:`)
            ),
            ,
            value,
          ],
        };
      }
      formData.selectedLine = {
        yard: [
          ...formData.selectedLine.yard.filter(
            (item) => item != null || item != undefined
          ),
        ],
        station: [
          ...formData.selectedLine.station.filter(
            (item) => item != null || item != undefined
          ),
        ],
      };
      setFormData({ ...formData, [name]: formData.selectedLine });
      
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  

  const handleFormSubmit = () => {
    if (formValidation(formData)) {
      // Show confirmation dialog if validation passes
      setShowConfirmation(true);
    } else {
      toast({
        title: "Submission Failed",
        description: "Fill All The Details",
        variant: "destructive",
      });
    }
  };

  const formSubmitHandler = async () => {
    try {
      const UserData = await getManager(session?.user?.email);
      console.log("Manager data:", UserData);
      
      if (UserData == null || UserData == undefined || UserData.id == null) {
        toast({
          title: "Invalid User",
          description:
            "Request Cannot Be Made Because Of Insufficient User Details",
          variant: "destructive",
        });
        return;
      }
      
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
        
        // Ensure both field names are set for compatibility
        if (formData.ohDisconnection) {
          formData.oheDisconnection = formData.ohDisconnection;
        } else if (formData.oheDisconnection) {
          formData.ohDisconnection = formData.oheDisconnection;
        }
        
        console.log("Submitting form data:", formData);
        const res = await postStagingManagerFormData(formData, UserData?.id);
        console.log("Form submission result:", res);
        
        setFormData({
          date: "",
          selectedDepartment: "",
          selectedSection: "",
          stationID: "",
          workType: "",
          workDescription: "",
          selectedLine: {
            station: [],
            yard: [],
          },
          selectedStream: "",
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
          otherLinesAffected: {
            station: [],
            yard: [],
          },
          requestremarks: "",
          selectedDepo: "",
        });
        
        toast({
          title: "Success",
          description: "Request Submitted",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: "Fill All The Details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the form",
        variant: "destructive",
      });
    }
  };

  const handleInputRefsChange = (idx) => {
    (el) => (inputRefs.current[idx] = el)
  }

  const handleKeyDownChange = (idx) =>{
    (e) => handleKeyDown(e, idx)
  }

  const getFormDate = () => {
    return formData.date;
  }

  const getHandleChange = () => {
    return handleChange;
  }

  const formSelectedDepartment = () => {
    return formData.selectedDepartment;
  }

  const formSelectedSection = () => {
    return formData.selectedSection;
  }

  const handleGetTheListForYard = () => {
    return getTheListForYard();
  }

  const formMissionBlock = () => {
    return formData.missionBlock;
  }

  const handleSetFormData = () => {
    return setFormData;
  }
  
  const formWorkType = () => {
    return formData.workType;
  }
  const customOption1 = () => {
    return(
    formData.selectedDepartment != "" && Object.keys(workData[`${formData.selectedDepartment}`]).map((element) => {
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
    ))};

  const customOption2 = () => {
    return (
    formData.workType != "" && formData.workType === "others" ? (
    <input
      type="text"
      name="workDescription"
      className="mt-1 w-full p-2.5 border rounded z-1000"
      onChange={handleChange}
      value={formData.workDescription}
    />
  ) : (
    <select
      ref={(el) => (inputRefs.current[6] = el)}
      onKeyDown={(e) => handleKeyDownChange(e, 6)}
      name="workDescription"
      className="mt-1 w-full p-2.5 border rounded z-1000"
      onChange={handleChange}
      value={formData.workDescription}
    >
      <option>Activity</option>
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
  ))}

  const customOption3 = () => {
    return(
    formData.workDescription === "others" && (
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
  ))}

  const handleGetMissionBlock1 = () => {
    return(
    getMissionBlock().map((ele, index) => {
    const arr = ele?.split("-").map((name) => name.trim());
    const value = getLineSectionValue(ele, arr);
    const filteredData =
      formData.selectedStream === "Both"
        ? getRoadData(ele)
        : getRoadData(ele).filter(
            (e) => e.direction === formData.selectedStream
          );
    return (
      <div key={index}>
        {ele.split("-")[1] === "YD" && (
          <div>
            <label className="block text-sm font-medium">
              Stream for {ele}
              <span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="selectedStream"
              value={formData.selectedStream}
              className="mt-1 w-full p-2 border rounded"
              onChange={handleChange}
            >
              <option value={""}>Select Stream</option>
              <option value={"Upstream"}>Up Stream</option>
              <option value={"Downstream"}>Down Stream</option>
              <option value={"Both"}>Both</option>
            </select>
          </div>
        )}
        <label className="block mt-3 text-sm font-medium">
          {arr?.includes("YD") ? `Road ${ele}` : `Line ${ele}`}
          <span style={{ color: "red" }}>*</span>
        </label>
        <select
          name="selectedLine"
          ref={(el) => (inputRefs.current[5] = el)}
          onKeyDown={(e) => handleKeyDownChange(e, 5)}
          value={value}
          className="mt-1 w-full p-2 border rounded"
          onChange={handleChange}
          required
        >
          <option value="">Select {arr?.includes("YD") ? `Road` : `Line`}</option>
          {arr?.includes("YD") ? (
            filteredData.length > 0 ? (
              filteredData.map((e) => (
                <option value={`${ele}:${e.road_no}`} key={e.road_no}>
                  {e.road_no}
                </option>
              ))
            ) : (
              <option disabled>No data available for the selected stream</option>
            )
          ) : (
            getTheList(ele).map((e) => (
              <option value={`${ele}:${e}`} key={e}>
                {e}
              </option>
            ))
          )}
        </select>



      </div>
    );
  }))}

  const formConditionalRendering1 = () => {
    return(
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
              type="alphanumeric"
              value={formData.workLocationTo}
              name="workLocationTo"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="Work Location"
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
    )
  }

  const formDemandTimeFrom = () => {
    return(formData.demandTimeFrom);
  }

  const formDemandTimeTo = () => {
    return(formData.demandTimeTo);
  }

  const formConditionalRendering2 = () => {
    return(formData.selectedDepartment === "TRD" ? (
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
          Caution required <span style={{ color: "red" }}>*</span>
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
              Caution location <span style={{ color: "red" }}>*</span>
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
              Caution speed <span style={{ color: "red" }}>*</span>
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
          OHE Disconnection <span style={{ color: "red" }}>*</span>
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
              Elementary section <span style={{ color: "red" }}>*</span>
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
          <div>
            <label className="block text-sm font-medium">
              Disconnection Requirements <span style={{ color: "red" }}>*</span>
            </label>
            <div className="flex space-x-4 mt-1">
              <label>
                <input
                  type="radio"
                  name="trdDisconnectionRequirements"
                  value="Gear"
                  checked={formData.trdDisconnectionRequirements === "Gear"}
                  onChange={handleChange}
                />{" "}
                Gear
              </label>
              <label>
                <input
                  type="radio"
                  name="trdDisconnectionRequirements"
                  value="People"
                  checked={formData.trdDisconnectionRequirements === "People"}
                  onChange={handleChange}
                />{" "}
                People
              </label>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium">
          SIG Disconnection <span style={{ color: "red" }}>*</span>
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
              {formData.selectedDepartment === "SIG" ||
              formData.selectedDepartment === "ENGG"
                ? "Line"
                : "Elementary section"}{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            {formData.selectedDepartment === "SIG" ? (
              <input
                type="text"
                value={formData.sigElementarySectionFrom}
                name="sigElementarySectionFrom"
                className="mt-1 w-1/2 p-2 border border-slate-900 rounded"
                onChange={handleChange}
              />
            ) : (
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
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Disconnection Requirements <span style={{ color: "red" }}>*</span>
            </label>
            <div className="flex space-x-4 mt-1">
              <label>
                <input
                  type="radio"
                  name="sigDisconnectionRequirements"
                  value="Gear"
                  checked={formData.sigDisconnectionRequirements === "Gear"}
                  onChange={handleChange}
                />{" "}
                Gear
              </label>
              <label>
                <input
                  type="radio"
                  name="sigDisconnectionRequirements"
                  value="People"
                  checked={formData.sigDisconnectionRequirements === "People"}
                  onChange={handleChange}
                />{" "}
                People
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  ))};

  const formRequestRemarks = () => {
    return formData.requestremarks;
  }

  const getHandleMissionBlock2 = () =>           {
    return(getMissionBlock().map((ele, index) => {
    const arr = ele?.split("-").map((name) => name.trim());
    return (
      <div className="mb-4" key={index}>
        <label className="block text-sm font-medium">
          Other affected
          {arr?.includes("YD") ? ` Road for ${ele}` : ` Line for ${ele}`}
        </label>
        <MultipleSelectOld
          items={getTheListFilter(ele)}
          value={formData.otherLinesAffected}
          setFormData={setFormData}
          formData={formData}
          name="otherLinesAffected"
          ele={ele}
          flag={arr?.includes("YD") ? true : false}
        />
      </div>
    );
  }))}

  const getFormSubmitHandler = () => {
    return handleFormSubmit;
  }


  const depotOptions = {
    ENGG: {
      "MAS-GDR": ["TVT", "PON", "SPE", "GDR"],
      "MAS-AJJ": ["WSTA", "WSTB", "AVD", "TRLA", "TRLB", "TRT"],
      "AJJ-KPD": ["AJJ", "WJR"],
      "KPD-JTJ": ["KPD", "AB", "JTJ"],
      "AJJ-RU": ["PUT"],
      "AJJ-CGL": ["CJ"],
      "MSB-VM": ["MS", "TBM", "CGL", "ACK", "TMV"],
    },
    SIG: {
      "MAS-GDR": ["MAS", "BBQ", "TVT", "GPD", "SPE", "NYP"],
      "MAS-AJJ": ["BBQ", "TRL", "AJJE"],
      "AJJ-RU": ["TRT"],
      "AJJ-KPD": ["AJJW", "KPDE"],
      "KPD-JTJ": ["KPDW", "AB", "JTJ"],
      "MSB-VM": ["MSB", "MS", "TBM", "CGL", "TMV"],
      "CGL-AJJ": ["CGL"],
    },
    TRD: {
      "MAS Divn": ["SR DEE/TRD/MAS", "DEE/TRD/MAS", "CTPC/TRD/MAS"],
      "MAS-GDR": ["TRD/BBQ", "TRD/TVT", "TRD/PON", "TRD/SPE", "TRD/GDR", "ADEE/TRD/PON"],
      "MAS-AJJ": ["TRD/BBQ", "TRD/AVD", "TRD/TRL", "TRD/AJJ"],
      "AJJ-RU": ["TRD/AJJ", "TRD/PUT"],
      "AJJ-KPD": ["TRD/AJJ", "TRD/WJR", "TRD/KPD"],
      "KPD-JTJ": ["TRD/KPD", "TRD/AB", "TRD/JTJ"],
      "MSB-VM": ["TRD/MS", "TRD/TBM", "TRD/CGL", "TRD/ACK", "TRD/VM"],
      "AJJ-CGL": ["TRD/AJJ", "TRD/CGL"],
    },
  };
  
    
  const formSelectedDepo = () => {
    return formData.selectedDepo;
  }
  
  const formConditionalRenderingSelectedDepot = () => {
    const { selectedDepartment, selectedSection } = formData;
  
    if (!depotOptions[selectedDepartment] || !depotOptions[selectedDepartment][selectedSection]) {
      return null;
    }
  
    return (
      <div className="inline relative mb-4">
        <label className="block text-sm font-medium">
          Depot/SSE <span style={{ color: "red" }}>*</span>
        </label>
        <select
          ref={handleInputRefsChange(3)}
          onKeyDown={handleKeyDownChange(3)}
          value={formSelectedDepo()}
          name="selectedDepo"
          className="mt-1 w-full p-2.5 border rounded"
          onChange={getHandleChange()}
        >
          <option>Select Depot/SSE</option>
          {depotOptions[selectedDepartment][selectedSection].map((depot) => (
            <option key={depot} value={depot}>
              {depot}
            </option>
          ))}
        </select>
      </div>
    );
  };
  const formCorridorType = () => {
    return formData.corridorType || "";  // default to an empty string if undefined
  };

  return (
    <>
      <FormLayout
       handleInputRefsChange={handleInputRefsChange}
       handleKeyDownChange={handleKeyDownChange}
       getFormDate={getFormDate}
       getHandleChange={getHandleChange}
       maxDate={maxDate}
       formSelectedDepartment={formSelectedDepartment}
        formSelectedSection={formSelectedSection}
        handleGetTheListForYard={handleGetTheListForYard}
        formMissionBlock={formMissionBlock}
        handleSetFormData={handleSetFormData}
        formWorkType={formWorkType}
        customOption1={customOption1}
        customOption2={customOption2}
        customOption3={customOption3}
        handleGetMissionBlock1={handleGetMissionBlock1}
        formConditionalRendering1={formConditionalRendering1}
        formDemandTimeFrom={formDemandTimeFrom}
        formDemandTimeTo={formDemandTimeTo}
        formConditionalRendering2={formConditionalRendering2}
        handleGetMissionBlock2 = {getHandleMissionBlock2}
        formRequestRemarks={formRequestRemarks}
        formSubmitHandler={getFormSubmitHandler}
        formConditionalRenderingSelectedDepot={formConditionalRenderingSelectedDepot}
        disabled_option={true}
        formCorridorType={formCorridorType} 
      />
      
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false);
          formSubmitHandler();
        }}
        formData={formData}
      />
    </>
  );
}
