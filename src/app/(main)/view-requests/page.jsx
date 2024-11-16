"use client";
import UserRequests from "../../../components/custom/UserRequests";
import CalenderSlider from "../../../components/custom/CalenderSlider";

export default function Table() {
  return (
    <div className="m-14 ">
      <CalenderSlider month={10} year={2024} />
      <UserRequests></UserRequests>
    </div>
  );
}
