"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Settings, LogOut } from "react-icons/fa";

const UserNavbar = ({ pathname, isAdmin, optimizedCheck }) => {
  return (
    <div className="flex justify-end">
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="p-2 bg-slate-900 text-white rounded-lg"
      >
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default UserNavbar;
