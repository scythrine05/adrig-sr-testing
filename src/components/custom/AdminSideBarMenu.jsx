"use client";

import Link from "next/link";
import React, { useState } from "react";
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
import useOptimizedCheck from "../../lib/hooks/useOptimizedCheck";
import useIsAdmin from "../../lib/hooks/useIsAdmin";
import { signOut } from "next-auth/react";
import { useToast } from "../ui/use-toast";

export function AdminSidebarMenu() {
  const { toast } = useToast();
  const { optimizedCheck, isFetching, error } = useOptimizedCheck();

  const [blockDetailsOpen, setBlockDetailsOpen] = useState(false);
  const [blocksSummaryOpen, setBlocksSummaryOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin, isLoading } = useIsAdmin();

  const handleBlockDetailsClick = () => {
    setBlockDetailsOpen(!blockDetailsOpen);
  };

  const handleBlocksSummaryClick = () => {
    setBlocksSummaryOpen(!blocksSummaryOpen);
  };

  return (
    <div className="font-sans flex flex-col space-y-4 p-4 h-full bg-secondary text-textcolor rounded-xl col-span-2">
      <span className="px-7 mt-2 font-medium">Admin Management</span>
      <div className="flex-1 flex flex-col space-y-4 px-4">
        <nav className="space-y-1 text-sm border-b-2 border-secondary-foreground">
          <Link
            href="/ad-home"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
              ${pathname === "/admin-home" && "bg-primary"} `}
          >
            <House className="w-4 h-4 mr-2" />
            <span>Home</span>
          </Link>

          <Link
            href="/ad-form"
            className={`hidden flex  items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full
              ${pathname === "/block-request" && "bg-primary"}
            `}
          >
            <CirclePlus className="w-4 h-4 mr-2" />
            <span>See Block Requests</span>
          </Link>

          <Link
            href="/ad-form"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full ${
              pathname === "/ad-form" && "bg-primary"
            }`}
          >
            <CalendarCog className="w-4 h-4 mr-2" />
            <span>Request Table</span>
          </Link>
          <Link
            href="/corridor-table"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
              ${pathname === "/corridor-table" && "bg-primary"}
              ${!isAdmin && "hidden"}
              
              `}
          >
            <TrainTrack className="w-4 h-4 mr-2" />
            <span>Corridor</span>
          </Link>
          <Link
            href="/ad-optimised-table"
            className={`flex items-center hover:bg-secondary-foreground rounded-full p-4 font-semibold ease-in-out duration-300 w-full 
              ${pathname === "/optimised-table" && "bg-primary"}              
              `}
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            <span>Optimised Table</span>
          </Link>
        </nav>
      </div>
      <div className="px-2 w-[90%] mx-auto py-4 border-t-2 border-secondary-foreground flex flex-col items-start space-y-2">
        <span className="px-2 font-medium">System</span>
        <Link href="/user-profile">
          <div className="flex items-center hover:bg-secondary-foreground hover:rounded-full px-4 py-2 font-semibold ease-in-out duration-300 w-full">
            <Settings className="w-4 h-4 mr-2" />
            <span>Setting</span>
          </div>
        </Link>
        <button className="flex cursor-pointer items-center hover:bg-secondary-foreground hover:rounded-full px-4 py-2 font-semibold ease-in-out duration-300 w-full"
        onClick={() => 
           signOut({ callbackUrl: "/signin" })
        }>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
