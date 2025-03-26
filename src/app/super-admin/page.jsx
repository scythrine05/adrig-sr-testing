"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SuperAdminHome() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Welcome, {session?.user?.email || "Super Admin"}
        </h2>
        <p className="text-gray-600 mb-4">
          This is the super admin dashboard. Use the navigation menu on the left to access different sections.
        </p>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Session Information</h3>
          <div className="space-y-1">
            <p><span className="font-medium">Status:</span> {status}</p>
            <p><span className="font-medium">Role:</span> {session?.user?.role || "Not set"}</p>
            <p><span className="font-medium">ID:</span> {session?.user?.id || "Not set"}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/super-admin/staging-requests" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Staging Requests</h3>
          <p className="text-gray-600">View and manage staging requests</p>
        </Link>
        
        <Link href="/super-admin/request-table" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Request Table</h3>
          <p className="text-gray-600">View and manage requests</p>
        </Link>
        
        <Link href="/super-admin/sanctioned-requests" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Sanctioned Requests</h3>
          <p className="text-gray-600">View sanctioned requests</p>
        </Link>
      </div>
      
      <div className="mt-6">
        <Link href="/debug-session" className="text-blue-600 hover:underline">
          Debug Session
        </Link>
      </div>
    </div>
  );
} 