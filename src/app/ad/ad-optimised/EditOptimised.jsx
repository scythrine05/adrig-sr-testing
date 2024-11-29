"use client";
import { useEffect, useState } from "react";
import { updateOptimizedData } from "../../actions/optimisetable";
import { useToast } from "../../../components/ui/use-toast";

function EditOptimised({ request, setShowPopup }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: request.date,
    department: request.selectedDepartment,
    demandTimeFrom: request.demandTimeFrom,
    demandTimeTo: request.demandTimeTo,
    Optimisedtimefrom: request.Optimisedtimefrom,
    Optimisedtimeto: request.Optimisedtimeto,
    selectedSection: request.selectedSection,
    selectedLine: request.selectedLine,
    missionBlock: request.missionBlock,
    otherLinesAffected: request.otherLinesAffected,
    action: request.action,
    remarks: request.remarks,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (
      formData.date === "" ||
      formData.demandTimeFrom === "" ||
      formData.demandTimeTo === "" ||
      (formData.action !== "Accepted" && formData.remarks === "")
    ) {
      toast({
        title: "Fill All The Details Before Submitting",
        variant: "destructive",
      });
      return;
    } else {
      const res = await updateOptimizedData(formData, request.requestId);
      toast({
        title: "Data Updated",
      });
      setShowPopup(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg ml-24 p-8 w-1/2 overflow-y-scroll h-3/4">
        <h2 className="text-xl font-semibold mb-4">Edit Optimised Request </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Date <span style={{ color: "red" }}>*</span>
          </label>
          <input
            value={formData.date}
            type="date"
            name="date"
            className="mt-1 w-full p-2 border rounded"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Department</label>
          <input
            value={formData.department}
            type="text"
            name="department"
            className="mt-1 w-full p-2 border rounded"
            readOnly
          />
        </div>

        <div className="flex justify-between">
          <div>
            <label className="block text-sm font-medium">Section</label>
            <div>
              <input
                type="text"
                value={formData.selectedSection}
                name="demandTimeFrom"
                className="mt-1 w-full p-2 border rounded"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Mission Block</label>
            <div>
              <input
                type="text"
                value={formData.missionBlock}
                name="demandTimeFrom"
                className="mt-1 p-2 border rounded"
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Lines</label>
            <div>
              <input
                type="text"
                value={
                  formData.selectedLine + ", " + formData.otherLinesAffected
                }
                name="demandTimeFrom"
                className="mt-1 p-2 border rounded"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Demanded time</label>
          <div className="flex space-x-2">
            <input
              type="time"
              value={formData.demandTimeFrom}
              name="demandTimeFrom"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="from"
              readOnly
            />
            <input
              type="time"
              value={formData.demandTimeTo}
              name="demandTimeTo"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="to"
              readOnly
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Optimised time (Click On the Clock To Select){" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="time"
              value={formData.Optimisedtimefrom}
              name="demandTimeFrom"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="from"
              onChange={handleChange}
            />
            <input
              type="time"
              value={formData.Optimisedtimeto}
              name="demandTimeTo"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="to"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Action <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="action"
            value={formData.action}
            onChange={handleChange}
            className="mt-4 p-2 w-1/2 border border-gray-200"
          >
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {formData.action !== "Accepted" && (
          <label className="block mb-4">
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.remarks}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter your remarks here..."
            />
          </label>
        )}

        <div className="flex justify-end">
          <button
            className="bg-red-500 text-white py-2 px-4 mr-3 rounded-lg hover:bg-red-600 transition-colors"
            onClick={() => {
              setShowPopup(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditOptimised;
