"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  House,
  CalendarCog,
  LogOut,
  CalendarCheck,
  Menu,
  X,
} from "lucide-react";
import Loader from "../custom/Loader";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useToast } from "../ui/use-toast";
import { getDataOptimised } from "../../app/actions/optimisetable";

export function AdminSidebarMenu() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sanctionTableVisible, setSanctionTableVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    console.log(localStorage["sanctionTableVisible"], "local");
    setSanctionTableVisible(
      localStorage.getItem("sanctionTableVisible") === "true"
    );
    async function fxn() {
      try {
        const res = await getDataOptimised();
        setFilteredRequests(res.result);
      } catch (e) {
        console.log(e);
      }
    }
    fxn();
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
        <div className="font-sans flex flex-col space-y-4 p-4 h-full">
          {/* Sidebar Header */}
          <div className="flex flex-col justify-between px-5">
            {/* Close Button */}
            <button
              className="py-3 focus:outline-none"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" /> {/* Close icon */}
            </button>
            <span className="font-medium">Admin Management</span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col space-y-4 px-4">
            <nav className="space-y-1 text-sm border-b-2 border-secondary-foreground">
              {/* Home Link */}
              <Link
                href="/ad/ad-home"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/ad/ad-home" && "bg-primary"
                }`}
              >
                <House className="w-4 h-4 mr-2" />
                <span>Home</span>
              </Link>

              {/* Request Table Link */}
              <Link
                href="/ad/ad-form"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/ad/ad-form" && "bg-primary"
                }`}
              >
                <CalendarCog className="w-4 h-4 mr-2" />
                <span>Request Table</span>
              </Link>

              {/* Optimised Table Link */}
              <Link
                href="/ad/ad-optimised"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/ad/ad-optimised" && "bg-primary"
                }`}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                <span>Optimised Table</span>
              </Link>

              {/* Sanction Table Link (Conditional) */}
              {sanctionTableVisible &&
                filteredRequests &&
                filteredRequests[0] &&
                filteredRequests[0].final &&
                filteredRequests[0].final === "set" && (
                  <Link
                    href="/ad/ad-sanction"
                    className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                      pathname === "/ad/ad-sanction" && "bg-primary"
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    <span>Sanction Table</span>
                  </Link>
                )}
                <Link
                href="/ad/ad-ftcb"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-2 font-semibold ease-in-out duration-300 w-full ${
                  pathname === "/ad/ad-ftcb" && "bg-primary"
                }`}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                <span>FTCB Request</span>
              </Link>
            </nav>
          </div>

          {/* System Section */}
          <div className="px-2 w-[90%] mx-auto py-4 border-t-2 border-secondary-foreground flex flex-col items-start space-y-2">
            <span className="px-2 font-medium">System</span>

            {/* Sign Out Button */}
            <button
              className="flex cursor-pointer items-center hover:bg-secondary-foreground hover:rounded-full p-2 font-semibold ease-in-out duration-300 w-full"
              onClick={() => {
                setLoading(true);
                signOut({ callbackUrl: "/signin" });

                toast({
                  title: "Signed out",
                  description: "You have been signed out successfully",
                });
                setLoading(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Loader (Conditional) */}
          {loading && <Loader />}
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