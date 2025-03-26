"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("Checking authentication...");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    // If authenticated, redirect based on role
    if (session?.user?.role === "super-admin") {
      router.push("/super-admin");
    } else if (session?.user?.role === "admin") {
      router.push("/ad/ad-home");
    } else if (session?.user?.role === "user") {
      router.push("/");
    } else if (["engg", "sig", "trd"].includes(session?.user?.role)) {
      router.push(`/manager/${session.user.role}`);
    } else {
      setMessage("Unknown role. Please contact support.");
    }
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
} 