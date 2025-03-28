"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Only check once the status is settled
    if (status === "loading") return;

    if (status === "unauthenticated") {
      window.location.href = "/super-admin-login";
      return;
    }

    // Temporarily bypass the role check - just check if authenticated
    // if (session?.user?.role !== 'super-admin') {
    //   console.log("Unauthorized access, role:", session?.user?.role);
    //   setError(true);
    //   // Wait a moment before redirecting
    //   setTimeout(() => {
    //     window.location.href = '/unauthorized';
    //   }, 1000);
    //   return;
    // }

    setLoading(false);
  }, [status, session]);

  // Simple loading screen
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error message for unauthorized access
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">Unauthorized Access</div>
          <p className="mb-4 text-gray-600">
            {"You don't have permission to access this page."}
          </p>
          <button
            onClick={() => (window.location.href = "/super-admin-login")}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-64 p-4 text-white bg-gray-800">
        <h1 className="mb-6 text-xl font-bold">Super Admin Panel</h1>
        <nav className="space-y-2">
          <Link
            href="/super-admin"
            className={`block p-2 rounded ${
              pathname === "/super-admin" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            Home
          </Link>
          {/* <Link
            href="/super-admin/staging-requests"
            className={`block p-2 rounded ${
              pathname === "/super-admin/staging-requests"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            Staging Requests
          </Link>
          <Link
            href="/super-admin/request-table"
            className={`block p-2 rounded ${
              pathname === "/super-admin/request-table"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            Request Table
          </Link>
          <Link
            href="/super-admin/sanctioned-requests"
            className={`block p-2 rounded ${
              pathname === "/super-admin/sanctioned-requests"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            Sanctioned Requests
          </Link> */}
          
          <Link
            href="/super-admin/mis-report"
            className={`block p-2 rounded ${
              pathname === "/super-admin/mis-report"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
           MIS Report
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/super-admin-login" })}
            className="block w-full p-2 mt-8 text-left text-red-400 rounded hover:bg-gray-700"
          >
            Logout
          </button>
        </nav>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
