import React, { useEffect, useState } from "react";
import Dropdown from "./Dropdown";

const MultipleSelect = (props) => {
  const [dropdown, setDropdown] = useState(false);
  const [selectedItems, setSelected] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (props.value) {
      setSelected(props.value.split(", "));
    }
    if (props.value === "") {
      setSelected([]);
    }
  }, [props.value]);

  const toggleDropdown = () => {
    setDropdown((prev) => !prev);
  };

  const changeHandler = (e) => {
    setSearchTag(e.target.value);
    setHighlightedIndex(0); // Reset highlight on input change
  };

  const addTag = (item) => {
    const newSelectedItems = [...selectedItems, item];
    setSelected(newSelectedItems);
    setSearchTag(""); // Clear search input

    if (props.limit) {
      props.setFormData((prevData) => ({
        ...prevData,
        missionBlock: newSelectedItems.join(", "),
      }));
    } else {
      props.setFormData((prevData) => ({
        ...prevData,
        otherLinesAffected: newSelectedItems.join(", "),
      }));
    }
    setDropdown(false);
  };

  const removeTag = (item) => {
    const filtered = selectedItems.filter((e) => e !== item);
    setSelected(filtered);

    if (props.limit) {
      props.setFormData((prevData) => ({
        ...prevData,
        missionBlock: filtered.join(", "),
      }));
    } else {
      props.setFormData((prevData) => ({
        ...prevData,
        otherLinesAffected: filtered.join(", "),
      }));
    }
  };

  const handleKeyDown = (e) => {
    if (!dropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % props.items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === 0 ? props.items.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (props.items[highlightedIndex]) {
        addTag(props.items[highlightedIndex]);
      }
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
                    {selectedItems.map((tag, index) => (
                      <div
                        key={index}
                        className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-teal-700 bg-teal-100 border border-teal-300"
                      >
                        <div className="text-xs font-normal leading-none max-w-full flex-initial">
                          {tag}
                        </div>
                        <div className="flex flex-auto flex-row-reverse">
                          <div onClick={() => removeTag(tag)}>
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
                        placeholder={
                          props.placeholder
                            ? "Select"
                            : ""
                        }
                        className="bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-slate-900"
                        onClick={toggleDropdown}
                        onChange={changeHandler}
                        onKeyDown={handleKeyDown}
                        value={searchTag}
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
                limit={props.limit}
                searchTag={searchTag}
                addItem={addTag}
                selectedItems={selectedItems}
                highlightedIndex={highlightedIndex} // Pass highlighted index for styling
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleSelect;