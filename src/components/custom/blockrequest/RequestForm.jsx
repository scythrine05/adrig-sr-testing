"use client";
import { useEffect, useState, useRef } from "react";
import { postStagingFormData } from "../../../app/actions/stagingform";
import { getUserId } from "../../../app/actions/user";
import { data, workData } from "../../../lib/store";
import MultipleSelectOld from "./MultipleSelectOld";
import { useToast } from "../../ui/use-toast";
import { useRouter } from "next/navigation";
import { yardData } from "../../../lib/yard";
import { useFormState, handleKeyDown, formValidation, revertCategoryFormat } from "../../../lib/utils";
import FormLayout from "../FormLayout";


//TODO: Suggestions Given Below
//1. Change useState to useReducer
//2. Divide the form into many input groups(and handle the group input as well) and form into a single component
//3. Rename variables to more meaningful names

export default function RequestForm2(props) {
  const maxDate = "2030-12-31";
  const router = useRouter();
  const { toast } = useToast();
  const [otherData, setOtherData] = useState("");
  const [formData, setFormData] = useFormState();
  const inputRefs = useRef([]);

  useEffect(() => {
    const fxn = async () => {
      const UserData = await getUserId(props.user?.user);
      if (UserData == null || UserData == undefined || UserData.id == null) {
        return;
      } else {
        formData.selectedDepartment = UserData.department;
      }
    };
    fxn();
  }, [formData]); 

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
      name === "workLocation"
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
    } 
    else if (name === "selectedDepo") {
      setFormData({ ...formData, [name]: value });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const formSubmitHandler = async () => {
    if (props.user == undefined || props.user?.user == undefined) {
      return;
    } else {
      const UserData = await getUserId(props.user?.user);
      if (UserData == null || UserData == undefined || UserData.id == null) {
        toast({
          title: "Invalid User",
          description:
            "Request Cannot Be Made Because Of Insufficent User Details",
          variant: "destructive",
        });
        return;
      } else {
        console.log(formValidation(formData));
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
          console.log(formData);
          const res = await postStagingFormData(formData, UserData?.id);
          console.log(res);
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

  const handleGetDepoSSE = () => {
    return 
  }
  
  const formWorkType = () => {
    return formData.workType;
  }
  const departmentSelect = () => {
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

  const workType = () => {
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
      onKeyDown={(e) => handleKeyDown(e, 6)}
      name="workDescription"
      className="mt-1 w-full p-2.5 border rounded z-1000"
      onChange={handleChange}
      value={formData.workDescription}
    >
      <option>Select work description </option>
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

  const workDescription = () => {
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

  const selectStream = () => {
    return(
    getMissionBlock().map((ele) => {
    const arr = ele?.split("-").map((name) => name.trim());
    const value = getLineSectionValue(ele, arr);
    const filteredData =
      formData.selectedStream === "Both"
        ? getRoadData(ele)
        : getRoadData(ele).filter(
            (e) => e.direction === formData.selectedStream
          );
    return (
      <div>
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
          onKeyDown={(e) => handleKeyDown(e, 5)}
          value={value}
          className="mt-1 w-full p-2 border rounded"
          onChange={handleChange}
        >
          <option value={""}>
            Select {arr?.includes("YD") ? `Road ` : `Line `}
          </option>
          {arr?.includes("YD") ? (
            <>
              {filteredData.length > 0 ? (
                filteredData.map((e) => (
                  <option value={`${ele}:${e.road_no}`} key={e.road_no}>
                    {e.road_no}
                  </option>
                ))
              ) : (
                <option disabled>
                  No data available for the selected stream
                </option>
              )}
            </>
          ) : (
            <>
              {getTheList(ele).map((e) => {
                return (
                  <>
                    <option value={`${ele}:${e}`} key={e}>
                      {e}
                    </option>
                  </>
                );
              })}
            </>
          )}
        </select>
      </div>
    );
  }))}

  const formConditionalRenderingSelectedDepartment = () => {
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

  const formConditionalRenderingTRD = () => {
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
        </div>
      )}
    </div>
  ))};

  const formRequestRemarks = () => {
    return formData.requestremarks;
  }

  const getHandleMissionBlock2 = () =>           {
    return(getMissionBlock().map((ele) => {
    const arr = ele?.split("-").map((name) => name.trim());
    return (
      <div className="mb-4">
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
    return formSubmitHandler;
  }

  const formSelectedDepo = () => {
    return formData.depo;
  }

  const formConditionalRenderingSelectedDepot = () => {
    if (formData.selectedDepartment === "ENGG" && formData.selectedSection === "MAS-GDR") {
      return(
        <div className='inline relative mb-4'>
          <label className='block text-sm font-medium'>
            Depot/SSE <span style={{ color: "red"}}>*</span>
          </label>
          <select
          ref = {handleInputRefsChange(3)}
          onKeyDown={handleKeyDownChange(3)}
          value={formSelectedDepo()}
          name="selectedDepo"
          className="mt-1 w-full p-2.5 border rounded"
          onChange={getHandleChange()}>
        <option>Select Depot/SSE</option>
        <option value="TVT">TVT</option>
        <option value="PON">PON</option>
        <option value="SPE">SPE</option>
        <option value="GDR">GDR</option>
          </select>
        </div>
      )
    }
    else  if (formData.selectedDepartment === "TRD" && formData.selectedSection == "MAS-GDR"){
      return(
        <div className='inline relative mb-4'>
        <label className='block text-sm font-medium'>
          Depot/SSE <span style={{ color: "red"}}>*</span>
        </label>
        <select
        ref = {handleInputRefsChange(3)}
        onKeyDown={handleKeyDownChange(3)}
        value={formSelectedDepo()}
        name="selectedDepo"
        className="mt-1 w-full p-2.5 border rounded"
        onChange={handleChange}>
        <option>Select Depot/SSE</option>
        <option value="TRD/BBQ">TRD/BBQ</option>
        <option value="TRD/TVT">TRD/TVT</option>
        <option value="TRD/TVT">TRD/PON</option>
        <option value="TRD/SPE">TRD/SPE</option>
        <option value="TRD/GDR">TRD/GDR</option>
        </select>
      </div>
      )
    }
    else  if (formData.selectedDepartment === "SIG" && formData.selectedSection == "MAS-GDR"){
      return(
        <div className='inline relative mb-4'>
        <label className='block text-sm font-medium'>
          Depot/SSE <span style={{ color: "red"}}>*</span>
        </label>
        <select
        ref = {handleInputRefsChange(3)}
        onKeyDown={handleKeyDownChange(3)}
        value={formSelectedDepo()}
        name="selectedDepo"
        className="mt-1 w-full p-2.5 border rounded"
        onChange={handleChange}>
        <option>Select Depot/SSE</option>
        <option value="TRD/BBQ">NYP</option>
        <option value="TRD/TVT">SPE</option>
        <option value="TRD/SPE">GPD</option>
        <option value="TRD/GDR">TVT</option>
        <option value="TRD/GDR">BBQ</option>
        <option value="TRD/GDR">MAS</option>
        </select>
      </div>
      )
    }
  }
  return (
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
      customOption1={departmentSelect}
      customOption2={workType}
      customOption3={workDescription}
      handleGetMissionBlock1={selectStream}
      formConditionalRendering1={formConditionalRenderingSelectedDepartment}
      formDemandTimeFrom={formDemandTimeFrom}
      formDemandTimeTo={formDemandTimeTo}
      formConditionalRendering2={formConditionalRenderingTRD}
      handleGetMissionBlock2 = {getHandleMissionBlock2}
      formRequestRemarks={formRequestRemarks}
      formSubmitHandler={getFormSubmitHandler}
      formConditionalRenderingSelectedDepot={formConditionalRenderingSelectedDepot}
    />
  )



  
}
