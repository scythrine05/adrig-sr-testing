"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { checkSecretKey } from "../../actions/verify";
import { signIn } from "next-auth/react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const isvalid = await checkSecretKey(key);
      if (isvalid) {
        const res = await signIn("credentials", {
          redirect: true,
          username: username,
          password: password,
          callbackUrl: "/ad/ad-home",
        });
      } else {
        setError("Secret code Does Not Match ");
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full custom-w p-8 space-y-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
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
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Secret Key
            </label>
            <input
              type="password"
              id="key"
              className="block w-full px-3 py-2 mt-1 text-sm border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
