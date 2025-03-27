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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
          <div className="text-red-500 text-xl mb-4">Unauthorized Access</div>
          <p className="text-gray-600 mb-4">
            {"You don't have permission to access this page."}
          </p>
          <button
            onClick={() => (window.location.href = "/super-admin-login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Super Admin Panel</h1>
        <nav className="space-y-2">
          <Link
            href="/super-admin"
            className={`block p-2 rounded ${
              pathname === "/super-admin" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
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
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/super-admin-login" })}
            className="block w-full text-left p-2 rounded mt-8 text-red-400 hover:bg-gray-700"
          >
            Logout
          </button>
        </nav>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
