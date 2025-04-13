"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  House,
  CalendarCog,
  CirclePlus,
  LogOut,
  Settings,
  TrainTrack,
  CalendarCheck,
  Menu,
  SidebarClose,
  FileWarning,
} from "lucide-react";
import { usePathname } from "next/navigation";
import currentUser, { getUserId, getUserByEmail } from "../../app/actions/user";
import { currentOptimizedValue } from "../../app/actions/user";
import { signOut } from "next-auth/react";
import { useToast } from "../ui/use-toast";

export function SidebarMenu() {
  const { toast } = useToast();
  const [optimizedCheck, setOptimizedCheck] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await currentUser();
        const response = await currentOptimizedValue(user.user);
        setOptimizedCheck(response);
        const userData = await getUserByEmail(user.user);
        setUserDepartment(userData?.department);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserData();
  }, []);

  return (
    <>
      {/* Overlay Backdrop (Visible when Sidebar is Open) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)} // Close sidebar when clicking outside
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 w-64 bg-secondary text-textcolor rounded-xl h-full`}
      >
        <div className="font-sans flex flex-col space-y-4 p-4 h-full max-w-[20rem]">
          {/* Sidebar Header */}
          <div className="flex flex-col justify-between px-5">  
          {/* Close Button */}
            <button
              className="py-3 focus:outline-none"
              onClick={() => setIsSidebarOpen(false)}
            >
              <SidebarClose className="w-6 h-6" /> {/* Close icon */}
            </button>
            <span className="font-medium">Maintenance Management</span>

          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col space-y-4 px-4">
            <nav className="space-y-1 text-sm border-b-2 border-secondary-foreground">
              {/* Home Link */}
              <Link
                href="/"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/" && "bg-primary"
                }`}
              >
                <House className="w-4 h-4 mr-2" />
                <span>Home</span>
              </Link>

              {/* Create Block Request Link */}
              <Link
                href="/block-request"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/block-request" && "bg-primary"
                }`}
              >
                <CirclePlus className="w-4 h-4 mr-2" />
                <span>Create Block Request</span>
              </Link>

              {/* Request Table Link */}
              <Link
                href="/schedule-manager"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/schedule-manager" && "bg-primary"
                }`}
              >
                <CalendarCog className="w-4 h-4 mr-2" />
                <span>Request Table</span>
              </Link>

              {/* Other Requests Link */}
              <Link
                href="/other-requests"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/other-requests" && "bg-primary"
                }`}
              >
                <FileWarning className="w-4 h-4 mr-2" />
                <span>Other Requests</span>
              </Link>

              {/* Optimised Table Link (Conditional) */}
              {optimizedCheck !== "notset" && (
                <Link
                  href="/optimised-table"
                  className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                    pathname === "/optimised-table" && "bg-primary"
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  <span>Optimised Table</span>
                </Link>
              )}
            </nav>
          </div>

          {/* System Section */}
          <div className="px-2 w-[90%] mx-auto py-4 border-t-2 border-secondary-foreground flex flex-col items-start space-y-2">
            <span className="px-2 font-medium">System</span>

            {/* Settings Link */}
            <Link href="/user-profile">
              <div className="flex items-center hover:bg-secondary-foreground hover:rounded-full p-2 font-semibold ease-in-out duration-300 w-full">
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              className="flex cursor-pointer items-center hover:bg-secondary-foreground hover:rounded-full p-2 font-semibold ease-in-out duration-300 w-full"
              onClick={() => {
                signOut({ callbackUrl: "/signin" });
                toast({
                  title: "Signed out",
                  description: "You have been signed out successfully",
                });
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Menu Button (Hidden when Sidebar is Open) */}
      {!isSidebarOpen && (
        <button
          className="fixed top-4 left-4 p-2 bg-secondary rounded-full z-50 focus:outline-none"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" /> {/* Hamburger icon */}
        </button>
      )}
    </>
  );
}