import React, { useEffect, useState } from "react";
import Dropdown from "./DropdownOld";

const MultipleSelectOld = (props) => {
  const [dropdown, setDropdown] = useState(false);
  const [selectedItems, setSelected] = useState({
    station: [],
    yard: [],
  });

  // Set selectedItems based on the initial value passed via props
  useEffect(() => {
    if (props.value) {
      const initialValue = props.value.split(", ").map((item) => {
        const [key, value] = item.split(":");
        return `${key}:${value}`;
      });

      setSelected({
        station: props.flag ? [] : initialValue,
        yard: props.flag ? initialValue : [],
      });
    } else {
      setSelected({
        station: [],
        yard: [],
      });
    }
  }, [props.value, props.flag]);

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  const addTag = (item) => {
    const key = `${props?.ele}:${item}`;

    if (props.flag) {
      setSelected((prevData) => ({
        ...prevData,
        yard: [...prevData.yard, key],
      }));
    } else {
      setSelected((prevData) => ({
        ...prevData,
        station: [...prevData.station, key],
      }));
    }

    setDropdown(false);
  };

  const removeTag = (item) => {
    const key = `${props?.ele}:${item}`;

    if (props.flag) {
      setSelected((prevData) => ({
        ...prevData,
        yard: prevData.yard.filter((entry) => entry !== key),
      }));
    } else {
      setSelected((prevData) => ({
        ...prevData,
        station: prevData.station.filter((entry) => entry !== key),
      }));
    }
  };

  return (
    <div className="autocomplete-wrapper">
      <div className="autocomplete">
        <div className="w-full flex flex-col items-center mx-auto">
          <div className="w-full">
            <div className="flex flex-col items-center relative">
              <div className="w-full">
                <div className="my-2 p-1 flex border border-gray-200 bg-white rounded">
                  <div className="flex flex-auto flex-wrap">
                    {props.flag &&
                      selectedItems.yard?.map((tag, index) => (
                        <div
                          key={index}
                          className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-teal-700 bg-teal-100 border border-teal-300"
                        >
                          <div className="text-xs font-normal leading-none max-w-full flex-initial">
                            {tag.split(":")[1]}
                          </div>
                          <div className="flex flex-auto flex-row-reverse">
                            <div onClick={() => removeTag(tag.split(":")[1])}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                height="100%"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    {!props.flag &&
                      selectedItems.station?.map((tag, index) => (
                        <div
                          key={index}
                          className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-teal-700 bg-teal-100 border border-teal-300"
                        >
                          <div className="text-xs font-normal leading-none max-w-full flex-initial">
                            {tag.split(":")[1]}
                          </div>
                          <div className="flex flex-auto flex-row-reverse">
                            <div onClick={() => removeTag(tag.split(":")[1])}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                height="100%"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    <div className="flex-1">
                      <input
                        readOnly
                        placeholder={
                          props.placeholder ? "Select Your Value" : ""
                        }
                        className="bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-slate-900"
                        onClick={toggleDropdown}
                      />
                    </div>
                  </div>
                  <div
                    className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200"
                    onClick={toggleDropdown}
                  >
                    <button className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-chevron-up w-4 h-4"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {props.items.length !== 0 && dropdown && (
              <Dropdown
                list={props.items}
                addItem={addTag}
                selectedItems={selectedItems}
                ele={props.ele}
                flag={props.flag}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectOld;
