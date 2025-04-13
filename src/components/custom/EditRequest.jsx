"use client";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import {
  getStagingFormData,
  getStagingFormDataByRequestId,
  postStagingFormData,
  updateStagingFormData,
  deleteStagingFormData,
} from "../../app/actions/stagingform";
import { getUserId } from "../../app/actions/user";
import { sectionData, machine, work, data, workData } from "../../lib/store";
import MultipleSelect from "./blockrequest/MultipleSelect";
import MultipleSelectOld from "./blockrequest/MultipleSelectOld";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import validateForm from "./blockrequest/formValidation";
import { yardData } from "../../lib/yard";

import {
  getFormDataByRequestId,
  deleteFormData,
} from "../../app/actions/formdata";

export default function EditRequest(props) {
  const router = useRouter();
  const { toast } = useToast();
  const [otherData, setOtherData] = useState("");
  const [dateRange, setDateRange] = useState({ minDate: "", maxDate: "" });
  const [hasManagerResponse, setHasManagerResponse] = useState(false);
  const [managerResponseValue, setManagerResponseValue] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [formData, setFormData] = useState({
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

  const inputRefs = useRef([]);
  const dateref = useRef();
  const departmentRef = useRef();

  const handleKeyDown = (e, index) => {
    e.preventDefault();
    if (e.key === "ArrowRight") {
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        inputRefs.current[nextIndex].focus();
      }
      // departmentRef.current.focus();
    }
  };

  function removeAfterLastDash(input) {
    return input.includes("-") ? input.slice(0, input.lastIndexOf("-")) : input;
  }

  useEffect(() => {
    if (props.flag) {
      setFormData(props.request);
      // Check if the request has a manager response
      if (
        props.request.ManagerResponse === "yes" ||
        props.request.ManagerResponse === "no"
      ) {
        setHasManagerResponse(true);
        setManagerResponseValue(props.request.ManagerResponse);
      }
    } else {
      const res = removeAfterLastDash(props.request.requestId);
      const fxn = async () => {
        const data = await getStagingFormDataByRequestId(res);
        if (data.requestData.length == 0) {
          const oldRequestResult = await getFormDataByRequestId(res);
          const request = oldRequestResult.requestData[0];
          setFormData(request);
          // Check if the request has a manager response
          if (
            request.ManagerResponse === "yes" ||
            request.ManagerResponse === "no"
          ) {
            setHasManagerResponse(true);
            setManagerResponseValue(request.ManagerResponse);
          }
        } else {
          const request = data.requestData[0];
          setFormData(request);
          // Check if the request has a manager response
          if (
            request.ManagerResponse === "yes" ||
            request.ManagerResponse === "no"
          ) {
            setHasManagerResponse(true);
            setManagerResponseValue(request.ManagerResponse);
          }
        }
      };
      fxn();
    }
  }, [props.request.requestId]);

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
  }, [props.user]);

  useEffect(() => {
    // Calculate allowed date range based on current date and time
    const calculateDateRange = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 4 = Thursday
      const currentHour = now.getHours();

      // Get the current week's Monday (for reference)
      const currentWeekMonday = new Date(now);
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
      currentWeekMonday.setDate(now.getDate() - daysFromMonday);
      currentWeekMonday.setHours(0, 0, 0, 0);

      // Calculate next week's Monday (week 2)
      const nextWeekMonday = new Date(currentWeekMonday);
      nextWeekMonday.setDate(currentWeekMonday.getDate() + 7);

      // Calculate week 3's Monday
      const week3Monday = new Date(currentWeekMonday);
      week3Monday.setDate(currentWeekMonday.getDate() + 14);

      // Set minimum date based on cutoff
      let minDate;

      // Check if it's before Thursday 16:00 of the current week
      // For Sunday, we need to check if it's before Thursday 16:00 of the PREVIOUS week
      const isBeforeThursdayCutoff =
        currentDay !== 0
          ? currentDay < 4 || (currentDay === 4 && currentHour < 16)
          : false; // If it's Sunday, always consider it after Thursday 16:00

      if (isBeforeThursdayCutoff) {
        // If before Thursday 16:00, allow requests from week 2 onwards
        minDate = nextWeekMonday;
      } else {
        // If after Thursday 16:00, allow requests from week 3 onwards
        minDate = week3Monday;
      }

      // Format dates as YYYY-MM-DD for input[type="date"]
      const formatDate = (date) => {
        return date.toISOString().split("T")[0];
      };

      setDateRange({
        minDate: formatDate(minDate),
        maxDate: "", // No maximum date limit
      });
    };

    calculateDateRange();
  }, []);

  const formValidation = (value) => {
    let res = validateForm(value);
    if (
      res.date ||
      res.selectedDepartment ||
      res.stationID ||
      res.workType ||
      res.workDescription ||
      res.selectedLine ||
      res.missionBlock ||
      res.demandTimeFrom ||
      res.demandTimeTo ||
      res.selectedDepo ||
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
          // result = yard.roads;
          result = yard.roads.filter(
            (item) => item?.direction === formData.selectedStream
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
      // const found = formData.selectedLine.yard.find((item) =>
      //   item?.startsWith(`${missionBlock}:`)
      // );
      // const commondata = found ? found.split(":")[1] : null;
      yardData.stations.map((yard) => {
        if (yard.station_code === arr[0]) {
          result = yard.roads;
          // result = yard.roads.map((item) => item.road_no);
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

  const handleMoveToNext = (index) => (e) => {
    if (e.target.value.length > 0 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
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

      rawValue = rawValue.replace(/[^a-zA-Z0-9.]/g, "");

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
      if (value < dateRange.minDate) {
        event.target.value = dateRange.minDate;
        toast({
          title: "Invalid Date Selection",
          description: `Date cannot be earlier than ${dateRange.minDate}. You can only request for dates starting from ${dateRange.minDate} onwards.`,
          variant: "destructive",
        });
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

        // setLineData((prevData) => ({
        //   ...prevData,
        //   station: [
        //     ...prevData.station.filter(
        //       (item) => !item.startsWith(`${newKey}:`)
        //     ),
        //     value,
        //   ],
        // }));
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

  const formSubmitHandler = async () => {
    try {
      // Prevent submission if there's a manager response
      if (hasManagerResponse) {
        toast({
          title: "Editing not allowed",
          description: `This request cannot be edited because it has been ${
            managerResponseValue === "yes" ? "approved" : "rejected"
          } by a manager.`,
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
        const res = await updateStagingFormData(formData, formData.requestId);

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
        props.setShowPopup((prev) => !prev);
      } else {
        toast({
          title: "Submission Failed",
          description: "Fill All The Details",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteRequest = async (overrideDelete = false) => {
    try {
      if (hasManagerResponse && !overrideDelete) {
        toast({
          title: "Deletion not allowed",
          description: `This request cannot be deleted because it has been ${
            managerResponseValue === "yes" ? "approved" : "rejected"
          } by a manager.`,
          variant: "destructive",
        });
        return;
      }

      if (confirmDelete) {
        const res = overrideDelete
          ? await deleteFormData(formData.requestId) // Use deleteFormData when overrideDelete is true
          : await deleteStagingFormData(formData.requestId); // Default to deleteStagingFormData
        toast({
          title: "Success",
          description: "Request deleted successfully",
        });
        props.setShowPopup(false);
        // Refresh the page or navigate back to the request list
        router.refresh();
      } else {
        setConfirmDelete(true);
        toast({
          title: "Confirm deletion",
          description: "Click the delete button again to confirm deletion",
        });

        // Reset confirmation after 5 seconds
        setTimeout(() => {
          setConfirmDelete(false);
        }, 5000);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  // Add a manager response message if applicable
  if (hasManagerResponse) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This request cannot be edited because it has been{" "}
                {managerResponseValue === "yes" ? "approved" : "rejected"} by a
                manager.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Request Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-semibold">Request ID:</p>
            <p>{formData.requestId}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-semibold">Date:</p>
            <p>{formData.date}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-semibold">Department:</p>
            <p>{formData.selectedDepartment}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-semibold">Section:</p>
            <p>{formData.selectedSection}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-semibold">Work Type:</p>
            <p>{formData.workType}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-semibold">Status:</p>
            <p
              className={
                managerResponseValue === "yes"
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {managerResponseValue === "yes" ? "Approved" : "Rejected"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {/* Override Delete Button */}
          <button
            className="text-white px-4 py-2 rounded hover:opacity-90 transition duration-300 mr-6"
            style={{ backgroundColor: confirmDelete ? "#ff3333" : "#ff5555" }}
            onClick={() => deleteRequest(true)}
          >
            {confirmDelete ? "Confirm Delete" : "Delete"}
          </button>

          <button
            onClick={() => props.setShowPopup(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-main-w mx-auto p-4 mt-10 bg-blue-100 rounded-lg shadow-lg">
      <h1 className="text-center text-xl font-bold mb-4">Request Form</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">
            Date <span style={{ color: "red" }}>*</span>
          </label>
          <input
            ref={(el) => (inputRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            value={formData.date}
            type="date"
            name="date"
            className="mt-1 w-full p-2 border rounded"
            onChange={handleChange}
            min={dateRange.minDate}
            max={dateRange.maxDate}
          />
          {dateRange.minDate && (
            <p className="text-xs text-gray-600 mt-1">
              Select a date from {dateRange.minDate} onwards
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">
            Department <span style={{ color: "red" }}>*</span>
          </label>
          <select
            ref={(el) => (inputRefs.current[1] = el)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            value={formData.selectedDepartment}
            name="selectedDepartment"
            className="mt-1 w-full p-2.5 border rounded"
            onChange={handleChange}
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
            ref={(el) => (inputRefs.current[2] = el)}
            onKeyDown={(e) => handleKeyDown(e, 2)}
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
        <input
          ref={(el) => (inputRefs.current[3] = el)}
          onKeyDown={(e) => handleKeyDown(e, 3)}
          name="stationID"
          value={formData.stationID}
          className="mt-1 p-2 w-[535px] rounded-md"
          onChange={handleChange}
          placeholder="Select Block Section"
          // disabled={true}
          readOnly
        />
        {/* <option className="block text-sm font-medium " value={""}>
            Select Block Section
          </option>
          <option className="block text-sm font-medium " value={"Section/Yard"}>
            Section/Yard
          </option> */}
        {/* </select> */}

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
          ref={(el) => (inputRefs.current[5] = el)}
          onKeyDown={(e) => handleKeyDown(e, 5)}
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
            ref={(el) => (inputRefs.current[6] = el)}
            onKeyDown={(e) => handleKeyDown(e, 6)}
            name="workDescription"
            className="mt-1 w-full p-2.5 border rounded z-1000"
            onChange={handleChange}
            value={formData.workDescription}
          >
            <option>Select work description </option>
            {formData.workType != "" &&
              workData[`${formData.selectedDepartment}`] &&
              workData[`${formData.selectedDepartment}`][
                `${revertCategoryFormat(formData.workType)}`
              ] &&
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

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        {getMissionBlock().map((ele, index) => {
          const arr = ele?.split("-").map((name) => name.trim());
          const value = getLineSectionValue(ele, arr);

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
                onKeyDown={(e) => handleKeyDown(e, 5)}
                value={value}
                className="mt-1 w-full p-2 border rounded"
                onChange={handleChange}
              >
                <option value={""}>
                  Select {arr?.includes("YD") ? `Road ` : `Line `}
                </option>
                {getTheList(ele).map((e) => {
                  if (e.road_no) {
                    if (e.direction === formData.selectedStream) {
                      return (
                        <option value={`${ele}:${e.road_no}`} key={e.road_no}>
                          {e.road_no}
                        </option>
                      );
                    }
                  } else {
                    return (
                      <option value={`${ele}:${e}`} key={e}>
                        {e}
                      </option>
                    );
                  }
                })}
              </select>
            </div>
          );
        })}

        <div>
          {formData.selectedDepartment === "ENGG" && (
            <label className="block text-sm font-medium">
              Work location <span style={{ color: "red" }}>*</span>
            </label>
          )}
          {formData.selectedDepartment === "SIG" && (
            <label className="block text-sm font-medium">
              Route <span style={{ color: "red" }}>*</span>
            </label>
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
            Demanded time (Click On the Clock To Select){" "}
            <span style={{ color: "red" }}>*</span>
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
              Coaching repercussions <span style={{ color: "red" }}>*</span>
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
      )}
      {/* Other Affected Lines */}
      {getMissionBlock().map((ele, index) => {
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
      })}

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
      <div className="flex justify-center">
        <button
          className="text-black px-4 py-2 rounded border border-slate-900 mr-6"
          onClick={() => {
            props.setShowPopup(false);
          }}
        >
          Cancel
        </button>
        <button
          className="text-white px-4 py-2 rounded hover:opacity-90 transition duration-300 mr-6"
          style={{ backgroundColor: confirmDelete ? "#ff3333" : "#ff5555" }}
          onClick={deleteRequest}
        >
          {confirmDelete ? "Confirm Delete" : "Delete"}
        </button>
        <button
          className="text-white px-4 py-2 rounded hover:opacity-90 transition duration-300"
          style={{ backgroundColor: "#3b82f6" }}
          onClick={formSubmitHandler}
        >
          Update
        </button>
      </div>
    </div>
  );
}
