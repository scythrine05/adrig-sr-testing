'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUserByEmail } from "../../actions/user";
import OtherRequestsTable from "../../../components/custom/OtherRequestsTable";

export default function OtherRequestsPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        try {
          const userData = await getUserByEmail(session.user.email);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session?.user?.email) {
      fetchUser();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Other Requests</h1>
      {user && <OtherRequestsTable user={user} />}
    </div>
  );
} 