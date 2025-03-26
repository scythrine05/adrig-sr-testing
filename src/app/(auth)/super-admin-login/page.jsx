"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SuperAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Super admin email and password will be checked on the server side
      const res = await signIn("credentials", {
        redirect: false,
        username: username,
        password: password,
      });

      if (res?.error) {
        setError("Invalid credentials");
        setLoading(false);
      } else {
        // Add a slight delay to ensure session is updated
        setTimeout(() => {
          router.push("/super-admin");
        }, 300);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="ml-24 flex items-center justify-center min-h-screen ">
      <div className="custom-w p-10 space-y-4 rounded-lg border border-gray-200 hover:bg-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Super Admin Login
        </h1>
        <p className="text-center text-gray-600 mb-6">System Control Panel</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="text"
              id="username"
              className="block w-full px-3 py-2 mt-1 text-sm border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="block w-full px-3 py-2 mt-1 text-sm border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p className="text-sm text-gray-600">
            Super admin login: super-admin@gmail.com / root
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Not A Super Admin?{" "}
            <a href="/signin" className="text-blue-600 hover:underline">
              Normal Login
            </a>{" "}
            |{" "}
            <a href="/admin" className="text-blue-600 hover:underline">
              Admin Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 