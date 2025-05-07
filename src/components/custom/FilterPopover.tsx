import React from "react";
import { Popover, Checkbox, FormControlLabel } from "@mui/material";

const FilterPopover = ({
    isOpen,
    anchorEl,
    onClose,
    currentFilterColumn,
    filters,
    onClearFilters,
    onFilterChange,
    getUniqueValues,
    data,
}) => {
    const filterId = isOpen ? "filter-popover" : undefined;

    return (
        <Popover
            id={filterId}
            open={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
        >
            <div
                className="p-3 max-h-[300px] overflow-y-auto"
                style={{ minWidth: "200px" }}
            >
                {/* Header */}
                <div className="flex flex-col items-start mb-2">
                    <h3 className="font-medium">{'Filter'}</h3>
                    
                </div>
                {/* Filter Options */}
                {currentFilterColumn &&
                    getUniqueValues(data, currentFilterColumn).map((value) => (

                        <div key={value} className="my-1">

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={
                                            filters[currentFilterColumn]?.includes(value) || false
                                        }
                                        onChange={() => onFilterChange(value, currentFilterColumn)}
                                    />
                                }

                                label={<span className="text-sm">{value}</span>}
                            />
                        </div>
                    ))}

                <button
                    className="text-blue-700 text-xs font-semibold"
                    onClick={onClearFilters}
                >
                    Clear All Filters
                </button>
            </div>
        </Popover>
    );
};

export default FilterPopover;