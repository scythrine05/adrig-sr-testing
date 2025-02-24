"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  House,
  CalendarCog,
  LogOut,
  Settings,
  TrainTrack,
  CalendarCheck,
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

  useEffect(() => {
    console.log(localStorage["sanctionTableVisible"],"local")
    setSanctionTableVisible(localStorage.getItem("sanctionTableVisible") === "true");
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
    <div className="font-sans flex flex-col space-y-4 p-4 h-full bg-secondary text-textcolor rounded-xl col-span-2">
      <span className="px-7 mt-2 font-medium">Admin Management</span>
      <div className="flex-1 flex flex-col space-y-4 px-4">
        <nav className="space-y-1 text-sm border-b-2 border-secondary-foreground">
          <Link
            href="/ad/ad-home"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
              ${pathname === "/ad/ad-home" && "bg-primary"} `}
          >
            <House className="w-4 h-4 mr-2" />
            <span>Home</span>
          </Link>

          <Link
            href="/ad/ad-form"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full ${
              pathname === "/ad/ad-form" && "bg-primary"
            }`}
          >
            <CalendarCog className="w-4 h-4 mr-2" />
            <span>Request Table</span>
          </Link>

          <Link
            href="/ad/ad-optimised"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
              ${pathname === "/ad/ad-optimised" && "bg-primary"}              
              `}
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            <span>Optimised Table</span>
          </Link>
          {sanctionTableVisible &&
            filteredRequests &&
            filteredRequests[0] &&
            filteredRequests[0].final &&
            filteredRequests[0].final === "set" && (
              <Link
                href="/ad/ad-sanction"
                className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
            ${pathname === "/ad/ad-sanction" && "bg-primary"}              
            `}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                <span>Sanction Table</span>
              </Link>
            )}
        </nav>
      </div>
      <div className="px-2 w-[90%] mx-auto py-4 border-t-2 border-secondary-foreground flex flex-col items-start space-y-2">
        <span className="px-2 font-medium">System</span>

        <button
          className="flex cursor-pointer items-center hover:bg-secondary-foreground hover:rounded-full px-4 py-2 font-semibold ease-in-out duration-300 w-full"
          onClick={() => {
            setLoading(true);
            signOut({ callbackUrl: "/signin" });

            toast({
              title: "Signed out ",
              description: "You have been signed out successfully",
            });
            setLoading(false);
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </button>
      </div>
      {loading && <Loader />}
    </div>
  );
}
