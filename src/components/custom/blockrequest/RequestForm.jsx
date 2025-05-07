"use client";
import { useEffect, useState, useRef } from "react";
import {
  postStagingFormData,
  getRequestCount,
} from "../../../app/actions/stagingform";
import { getUserId } from "../../../app/actions/user";
import { data, workData } from "../../../lib/store";
import MultipleSelectOld from "./MultipleSelectOld";
import { useToast } from "../../ui/use-toast";
import { useRouter } from "next/navigation";
import { yardData } from "../../../lib/yard";
import {
  useFormState,
  handleKeyDown,
  formValidation,
  revertCategoryFormat,
  generateRequestId,
} from "../../../lib/utils";
import FormLayout from "../FormLayout";
import ConfirmationDialog from "../ConfirmationDialog";

//TODO: Suggestions Given Below
//1. Change useState to useReducer
//2. Divide the form into many input groups(and handle the group input as well) and form into a single component
//3. Rename variables to more meaningful names

export default function RequestForm2(props) {
  const router = useRouter();
  const { toast } = useToast();
  const [otherData, setOtherData] = useState("");
  const [formData, setFormData] = useFormState();
  const inputRefs = useRef([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dateRange, setDateRange] = useState({ minDate: "", maxDate: "" });

  // useEffect(() => {
  //   // Calculate allowed date range based on current date and time
  //   const calculateDateRange = () => {
  //     const now = new Date();
  //     const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday
  //     const currentHour = now.getHours();

  //     // Get the current week's Monday (for reference)
  //     const currentWeekMonday = new Date(now);
  //     const daysFromMonday = currentDay === 0 ? 6 : currentDay - 2;
  //     currentWeekMonday.setDate(now.getDate() - daysFromMonday);
  //     currentWeekMonday.setHours(0, 0, 0, 0);

  //     // Calculate next week's Monday (week 2)
  //     const nextWeekMonday = new Date(currentWeekMonday);
  //     nextWeekMonday.setDate(currentWeekMonday.getDate() + 7);

  //     // Calculate week 3's Monday
  //     const week3Monday = new Date(currentWeekMonday);
  //     week3Monday.setDate(currentWeekMonday.getDate() + 14);

  //     // Set minimum date based on cutoff
  //     let minDate;

  //     // Check if it's before Thursday 16:00 of the current week
  //     const isBeforeThursdayCutoff =
  //       (currentDay < 4) || // Monday, Tuesday, Wednesday
  //       (currentDay === 4 && currentHour < 16); // Thursday before 16:00

  //     if (isBeforeThursdayCutoff) {
  //       // If before Thursday 16:00, allow requests from next week's Monday onwards
  //       minDate = nextWeekMonday;
  //       console.log("Setting minimum date to next week's Monday:", nextWeekMonday);
  //     } else {
  //       // If after Thursday 16:00 (including Sunday), allow requests from week 3's Monday onwards
  //       minDate = week3Monday;
  //       console.log("Setting minimum date to week 3's Monday:", week3Monday);
  //     }

  //     // Format dates as YYYY-MM-DD for input[type="date"]
  //     const formatDate = (date) => {
  //       return date.toISOString().split('T')[0];
  //     };

  //     setDateRange({
  //       minDate: formatDate(minDate),
  //       maxDate: "" // No maximum date limit
  //     });
  //   };

  //   calculateDateRange();
  // }, []);

  useEffect(() => {
    const fxn = async () => {
      const UserData = await getUserId(props.user?.user);
      if (!UserData?.id) return;

      setFormData((prev) => ({
        ...prev,
        selectedDepartment: UserData.department,
      }));
    };

    fxn();
  }, [props.user]);

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
      // Check if the selected date is less than the minimum allowed date
      if (value < dateRange.minDate) {
        event.target.value = dateRange.minDate;
        toast({
          title: "Invalid Date Selection",
          description: `Date cannot be earlier than ${dateRange.minDate}. You can only request for dates starting from ${dateRange.minDate} onwards.`,
          variant: "destructive",
        });
        setFormData({ ...formData, [name]: dateRange.minDate });
        return;
      }

      // If we get here, the date is valid (not earlier than minDate)
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
        formData.otherLinesAffected = {
          station: [],
          yard: [],
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
        formData.otherLinesAffected = {
          station: [],
          yard: [],
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
    } else if (name === "selectedDepo") {
      setFormData({ ...formData, [name]: value });
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
                description: "Please specify the other work description",
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
          const currentDate = new Date()
            .toLocaleDateString("en-IN", {
              month: "2-digit",
              year: "2-digit",
            })
            .replace("/", "-");
          const requestCount = await getRequestCount();
          const sequence = requestCount + 1;

          const requestId = generateRequestId({
            date: currentDate,
            division: "1",
            department: formData.selectedDepartment,
            section: formData.selectedDepo,
            sequence,
          });
          formData.requestId = requestId;
          console.log("Submitting form data:", formData);
          const res = await postStagingFormData(formData, UserData?.id);
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
            corridorType: "",
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
    (el) => (inputRefs.current[idx] = el);
  };

  const handleKeyDownChange = (idx) => {
    (e) => handleKeyDown(e, idx);
  };

  const getFormDate = () => {
    return formData.date;
  };

  const getHandleChange = () => {
    return handleChange;
  };

  const formSelectedDepartment = () => {
    return formData.selectedDepartment;
  };

  const formSelectedSection = () => {
    return formData.selectedSection;
  };

  const handleGetTheListForYard = () => {
    return getTheListForYard();
  };

  const formMissionBlock = () => {
    return formData.missionBlock;
  };

  const handleSetFormData = () => {
    return setFormData;
  };

  const formWorkType = () => {
    return formData.workType;
  };
  const departmentSelect = () => {
    return (
      formData.selectedDepartment != "" &&
      Object.keys(workData[`${formData.selectedDepartment}`]).map((element) => {
        const formattedCategory = element
          .replace(/_/g, " ")
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
      })
    );
  };

  const workType = () => {
    return formData.workType != "" && formData.workType === "others" ? (
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
        <option>Activity</option>
        {formData.workType != "" &&
          workData[`${formData.selectedDepartment}`][
            `${revertCategoryFormat(formData.workType)}`
          ].map((e) => {
            return (
              <option className="block text-sm font-medium" value={e} key={e}>
                {e}
              </option>
            );
          })}
        <option className="block text-sm font-medium " value={"others"}>
          Others
        </option>
      </select>
    );
  };

  const workDescription = () => {
    return (
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
      )
    );
  };

  const selectStream = () => {
    return getMissionBlock().map((ele, index) => {
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
            <div key={index}>
              <label className="block text-sm font-medium">
              Direction of traffic affected for {ele}
                <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="selectedStream"
                value={formData.selectedStream}
                className="mt-1 w-full p-2 border rounded"
                onChange={handleChange}
              >
                <option value={"Upstream"}>Up direction</option>
                    <option value={"Downstream"}>Down direction</option>
                    <option value={"Both"}>Both directions affected</option>
                    <option value={"Both movement"}>Both directions movement affected</option>
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
    });
  };

  const formConditionalRenderingSelectedDepartment = () => {
    return (
      <div>
        {formData.selectedDepartment === "ENGG" && (
          <label className="block text-sm font-medium">Work location</label>
        )}
        {formData.selectedDepartment === "SIG" && (
          <label className="block text-sm font-medium">Route</label>
        )}
        {formData.selectedDepartment === "TRD" && (
          <div className="flex justify-evenly">
            <div className="flex-1 mr-2">
              <label className="block text-sm font-medium">
                Elementary Section
              </label>
              <input
                type="text"
                value={formData.elementarySectionTo}
                name="elementarySectionTo"
                className="mt-1 w-full p-2 border rounded"
                placeholder="Elementary Section To"
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 space-x-2">
              <label className="block text-sm font-medium">Work Location</label>
              <input
                type="text"
                value={formData.workLocationTo}
                name="workLocationTo"
                className="mt-1 w-full p-2 border rounded"
                placeholder="Work Location To"
                onChange={handleChange}
              />
            </div>
          </div>
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
      </div>
    );
  };

  const formDemandTimeFrom = () => {
    return formData.demandTimeFrom;
  };

  const formDemandTimeTo = () => {
    return formData.demandTimeTo;
  };

  const formConditionalRenderingTRD = () => {
    return formData.selectedDepartment === "TRD" ? (
      <div className="p-4 rounded-lg mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
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
      <div className="p-4 rounded-lg mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Whether Fresh Caution will be imposed after block
            <span style={{ color: "red" }}>*</span>
          </label>
          <div className="flex space-x-4">
            <label className="text-black">
              <input
                type="radio"
                name="cautionRequired"
                value="Yes"
                checked={formData.cautionRequired === "Yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label className="text-black">
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
              <label className="block text-sm font-medium text-black">
                Caution location <span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.cautionLocationFrom}
                  name="cautionLocationFrom"
                  className="mt-1 w-1/2 p-2 border rounded text-black"
                  placeholder="Approximately from"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.cautionLocationTo}
                  name="cautionLocationTo"
                  className="mt-1 w-1/2 p-2 border rounded text-black"
                  placeholder="Approximately to"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Caution speed <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.cautionSpeed}
                name="cautionSpeed"
                className="mt-1 w-full p-2 border rounded text-black"
                placeholder="In format km/h"
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Whether Power Block Needed <span style={{ color: "red" }}>*</span>
          </label>
          <div className="flex space-x-4">
            <label className="text-black">
              <input
                type="radio"
                name="ohDisconnection"
                value="Yes"
                checked={formData.ohDisconnection === "Yes"}
                onChange={handleChange}
              />{" "}
              Yes
            </label>
            <label className="text-black">
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
              <label className="block text-sm font-medium text-black">
                Elementary section <span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.elementarySectionFrom}
                  name="elementarySectionFrom"
                  className="mt-1 w-1/2 p-2 border rounded text-black"
                  placeholder="from"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.elementarySectionTo}
                  name="elementarySectionTo"
                  className="mt-1 w-1/2 p-2 border rounded text-black"
                  placeholder="to"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Power Block Requirements <span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex space-x-4 mt-1">
                <label className="text-black">
                  <input
                    type="checkbox"
                    name="trdDisconnectionRequirements"
                    value="Gear"
                    checked={formData.trdDisconnectionRequirements?.includes(
                      "Gear"
                    )}
                    onChange={(e) => {
                      const currentValue =
                        formData.trdDisconnectionRequirements || "";
                      const newValue = e.target.checked
                        ? currentValue + (currentValue ? ",Gear" : "Gear")
                        : currentValue.replace(/,?Gear/, "");
                      handleChange({
                        target: {
                          name: "trdDisconnectionRequirements",
                          value: newValue,
                        },
                      });
                    }}
                  />{" "}
                  Gears Required
                </label>
                <label className="text-black">
                  <input
                    type="checkbox"
                    name="trdDisconnectionRequirements"
                    value="People"
                    checked={formData.trdDisconnectionRequirements?.includes(
                      "People"
                    )}
                    onChange={(e) => {
                      const currentValue =
                        formData.trdDisconnectionRequirements || "";
                      const newValue = e.target.checked
                        ? currentValue + (currentValue ? ",People" : "People")
                        : currentValue.replace(/,?People/, "");
                      handleChange({
                        target: {
                          name: "trdDisconnectionRequirements",
                          value: newValue,
                        },
                      });
                    }}
                  />{" "}
                  Staff Required
                </label>
              </div>
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Whether S&T Disconnection Required{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div className="flex space-x-4">
            <label className="text-black">
              <input
                type="radio"
                name="sigDisconnection"
                value="Yes"
                checked={formData.sigDisconnection === "Yes"}
                onChange={handleChange}
              />{" "}
              Yes
            </label>
            <label className="text-black">
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
              <label className="block text-sm font-medium text-black">
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
                  className="mt-1 w-1/2 p-2 border border-slate-900 rounded text-black"
                  onChange={handleChange}
                />
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.sigElementarySectionFrom}
                    name="sigElementarySectionFrom"
                    className="mt-1 w-1/2 p-2 border rounded text-black"
                    placeholder="from"
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    value={formData.sigElementarySectionTo}
                    name="sigElementarySectionTo"
                    className="mt-1 w-1/2 p-2 border rounded text-black"
                    placeholder="to"
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Disconnection Requirements{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex space-x-4 mt-1">
                <label className="text-black">
                  <input
                    type="checkbox"
                    name="sigDisconnectionRequirements"
                    value="Gear"
                    checked={formData.sigDisconnectionRequirements?.includes(
                      "Gear"
                    )}
                    onChange={(e) => {
                      const currentValue =
                        formData.sigDisconnectionRequirements || "";
                      const newValue = e.target.checked
                        ? currentValue + (currentValue ? ",Gear" : "Gear")
                        : currentValue.replace(/,?Gear/, "");
                      handleChange({
                        target: {
                          name: "sigDisconnectionRequirements",
                          value: newValue,
                        },
                      });
                    }}
                  />{" "}
                  Gears Required
                </label>
                <label className="text-black">
                  <input
                    type="checkbox"
                    name="sigDisconnectionRequirements"
                    value="People"
                    checked={formData.sigDisconnectionRequirements?.includes(
                      "People"
                    )}
                    onChange={(e) => {
                      const currentValue =
                        formData.sigDisconnectionRequirements || "";
                      const newValue = e.target.checked
                        ? currentValue + (currentValue ? ",People" : "People")
                        : currentValue.replace(/,?People/, "");
                      handleChange({
                        target: {
                          name: "sigDisconnectionRequirements",
                          value: newValue,
                        },
                      });
                    }}
                  />{" "}
                  Staff Required
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formRequestRemarks = () => {
    return formData.requestremarks;
  };

  const getHandleMissionBlock2 = () => {
    return getMissionBlock().map((ele, index) => {
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
    });
  };

  const getFormSubmitHandler = () => {
    return handleFormSubmit;
  };

  const depotOptions = {
    ENGG: {
      "MAS-GDR": ["TVT", "PON", "SPE", "GDR"],
      "MAS-AJJ": ["WSTA", "WSTB", "AVD", "TRLA", "TRLB", "AJJ"],
      "AJJ-KPD": ["AJJ", "WJR", "KPD"],
      "KPD-JTJ": ["KPD", "AB", "JTJ"],
      "AJJ-RU": ["TRT", "AJJ", "PUT"],
      "AJJ-CGL": ["CJ"],
      "MSB-VM": ["MS", "TBM", "CGL", "ACK", "TMV"],
      "MSB-VLCY": ["MSB"],
    },
    SIG: {
      "MAS-GDR": ["MAS", "BBQ", "TVT", "GPD", "SPE", "NYP"],
      "MAS-AJJ": ["BBQ", "TRL", "AJJE"],
      "AJJ-RU": ["TRT", "AJJ", "PUT"],
      "AJJ-KPD": ["AJJ", "WJR", "KPD"],
      "KPD-JTJ": ["KPDW", "AB", "JTJ"],
      "MSB-VM": ["MSB", "MS", "TBM", "CGL", "TMV"],
      "CGL-AJJ": ["CGL"],
      "MSB-VLCY": ["MSB"],
    },
    TRD: {
      "MAS Divn": ["SR DEE/TRD/MAS", "DEE/TRD/MAS", "CTPC/TRD/MAS"],
      "MAS-GDR": [
        "TRD/BBQ",
        "TRD/TVT",
        "TRD/PON",
        "TRD/SPE",
        "TRD/GDR",
        "ADEE/TRD/PON",
      ],
      "MAS-AJJ": ["TRD/BBQ", "TRD/AVD", "TRD/TRL", "TRD/AJJ"],
      "AJJ-RU": ["TRD/AJJ", "TRD/PUT"],
      "AJJ-KPD": ["TRD/AJJ", "TRD/WJR", "TRD/KPD"],
      "KPD-JTJ": ["TRD/KPD", "TRD/AB", "TRD/JTJ"],
      "MSB-VM": ["TRD/MS", "TRD/TBM", "TRD/CGL", "TRD/ACK", "TRD/VM"],
      "AJJ-CGL": ["TRD/AJJ", "TRD/CGL"],
      "MSB-VLCY": ["MSB"],
    },
  };

  const formSelectedDepo = () => {
    return formData.selectedDepo;
  };

  const formConditionalRenderingSelectedDepot = () => {
    const { selectedDepartment, selectedSection } = formData;

    if (
      !depotOptions[selectedDepartment] ||
      !depotOptions[selectedDepartment][selectedSection]
    ) {
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
    return formData.corridorType || ""; // default to an empty string if undefined
  };

  return (
    <>
      <FormLayout
        handleInputRefsChange={handleInputRefsChange}
        handleKeyDownChange={handleKeyDownChange}
        getFormDate={getFormDate}
        getHandleChange={getHandleChange}
        maxDate={dateRange.maxDate}
        minDate={dateRange.minDate}
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
        handleGetMissionBlock2={getHandleMissionBlock2}
        formRequestRemarks={formRequestRemarks}
        formSubmitHandler={getFormSubmitHandler}
        formConditionalRenderingSelectedDepot={
          formConditionalRenderingSelectedDepot
        }
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
