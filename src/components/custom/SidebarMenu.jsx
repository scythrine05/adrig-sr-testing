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
} from "lucide-react";
import { usePathname } from "next/navigation";
import currentUser, { getUserId } from "../../app/actions/user";
import { currentOptimizedValue } from "../../app/actions/user";
import { signOut } from "next-auth/react";
import { useToast } from "../ui/use-toast";

export function SidebarMenu() {
  const { toast } = useToast();
  const [optimizedCheck, setOptimizedCheck] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchOptimizedCheck = async () => {
      try {
        const user = await currentUser();
        console.log(user);

        const response = await currentOptimizedValue(user.user);
        setOptimizedCheck(response);
      } catch (err) {
        console.log(err);
      }
    };
    fetchOptimizedCheck();
  }, []);

  return (
    <div className="font-sans flex flex-col space-y-4 p-4 h-full bg-secondary text-textcolor rounded-xl col-span-2">
      <span className="px-5 font-medium">Maintenance Management</span>
      <div className="flex-1 flex flex-col space-y-4 px-4">
        <nav className="space-y-1 text-sm border-b-2 border-secondary-foreground">
          <Link
            href="/"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full ${
              pathname === "/" && "bg-primary"
            }`}
          >
            <House className="w-4 h-4 mr-2" />
            <span>Home</span>
          </Link>

          <Link
            href="/block-request"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full
            `}
          >
            <CirclePlus className="w-4 h-4 mr-2" />
            <span>Create Block Request</span>
          </Link>

          <Link
            href="/schedule-manager"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full ${
              pathname === "/schedule-manager" && "bg-primary"
            }`}
          >
            <CalendarCog className="w-4 h-4 mr-2" />
            <span>Request Table</span>
          </Link>

          {/* {optimizedCheck !== "notset" && (
            <Link
              href="/optimised-table"
              className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
              ${pathname === "/optimised-table" && "bg-primary"}
              `}
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              <span>Optimised Table</span>
            </Link>
          )} */}
        </nav>
      </div>
      <div className="px-2 w-[90%] mx-auto py-4 border-t-2 border-secondary-foreground flex flex-col items-start space-y-2">
        <span className="px-2 font-medium">System</span>
        <Link href="/user-profile">
          <div className="flex items-center hover:bg-secondary-foreground hover:rounded-full px-4 py-2 font-semibold ease-in-out duration-300 w-full">
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </div>
        </Link>
        {/* <SignOutButton /> */}
        <button
          className="flex cursor-pointer items-center hover:bg-secondary-foreground hover:rounded-full px-4 py-2 font-semibold ease-in-out duration-300 w-full"
          onClick={() => {
            signOut({ callbackUrl: "/signin" });
            toast({
              title: "Signed out ",
              description: "You have been signed out successfully",
            });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </button>
        {/* </SignOutButton> */}
      </div>
    </div>
  );
}
