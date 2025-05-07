import React from "react";
import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const TableComponent = ({ title, columns, data, onFilterClick }) => {
    return (
        <div className="mb-10">
            {/* Table Title */}
            <h2 className={`text-2xl font-bold ${title.color} my-5`}>{title.text}</h2>

            {/* Table */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    {/* First Row */}
                    <tr>
                        {columns.map((column) =>
                            column.split ? (
                                <th
                                    key={column.id}
                                    colSpan={column.children?.length || 0}
                                    className="border border-gray-300 bg-gray-50 text-center p-2"
                                >
                                    {column.label}
                                </th>
                            ) : (
                                <th
                                    key={column.id}
                                    rowSpan={2}
                                    className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer align-top"
                                >
                                    <div className="flex items-center gap-1 justify-between">
                                        <div
                                            className="flex-grow"

                                        >
                                            {column.label} {column.filterable && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => onFilterClick(e, column.id)}
                                                    className="p-1"
                                                >
                                                    <FilterListIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </div>

                                    </div>
                                </th>
                            )
                        )}
                    </tr>

                    {/* Second Row - only for split columns */}
                    <tr>
                        {columns
                            .filter((column) => column.split)
                            .flatMap((column) =>
                                column.children?.map((child) => (
                                    <th
                                        key={child.id}
                                        className="border border-gray-300 p-3 min-w-[150px] whitespace-nowrap bg-gray-50 cursor-pointer"
                                    >
                                        {child.label}
                                    </th>
                                ))
                            )}
                    </tr>
                </thead>

                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((column) =>
                                    column.split
                                        ? column.children?.map((child) => (
                                            <td
                                                key={child.id}
                                                className="border border-gray-300 p-3 whitespace-nowrap"
                                            >
                                                {row[child.id] || "-"}
                                            </td>
                                        ))
                                        : (
                                            <td
                                                key={column.id}
                                                className="border border-gray-300 p-3 whitespace-nowrap"
                                            >
                                                {row[column.id] || "-"}
                                            </td>
                                        )
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.reduce(
                                    (total, column) => total + (column.split ? column.children?.length || 0 : 1),
                                    0
                                )}
                                className="border border-gray-300 p-3"
                            >
                                No data found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableComponent;