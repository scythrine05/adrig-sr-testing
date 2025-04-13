"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DebugSession() {
  const { data: session, status } = useSession();
  const [authData, setAuthData] = useState(null);
  const [envVariables, setEnvVariables] = useState(null);

  useEffect(() => {
    // Fetch auth data from our API
    fetch('/api/auth/debug')
      .then(response => response.json())
      .then(data => setAuthData(data))
      .catch(error => console.error('Error fetching auth data:', error));
    
    // Fetch public env variables
    fetch('/api/env-debug')
      .then(response => response.json())
      .then(data => setEnvVariables(data))
      .catch(error => console.error('Error fetching env variables:', error));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Session Debug Page</h1>
      
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => signIn(null, { callbackUrl: '/debug-session' })}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign In
        </button>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/debug-session' })}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Sign Out
        </button>
        
        <a 
          href="/super-admin-login" 
          className="px-4 py-2 bg-purple-500 text-white rounded inline-block"
        >
          Super Admin Login
        </a>
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Session Status: {status}</h2>
        <pre className="bg-white p-4 rounded overflow-auto max-h-80">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      {authData && (
        <div className="mb-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Auth Data from API</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-80">
            {JSON.stringify(authData, null, 2)}
          </pre>
        </div>
      )}
      
      {envVariables && (
        <div className="mb-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Public Environment Variables</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-80">
            {JSON.stringify(envVariables, null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-2">
        <div>
          <span className="font-semibold">Authenticated:</span> {status === 'authenticated' ? 'Yes' : 'No'}
        </div>
        {session?.user && (
          <>
            <div>
              <span className="font-semibold">User Email:</span> {session.user.email}
            </div>
            <div>
              <span className="font-semibold">User Role:</span> {session.user.role || 'No role set'}
            </div>
            <div>
              <span className="font-semibold">User ID:</span> {session.user.id || 'No ID set'}
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-4">Login Credentials for Testing</h2>
        <div className="space-y-2">
          <div><strong>Super Admin:</strong> super-admin@gmail.com / root</div>
          <div><strong>Admin:</strong> admin@gmail.com / root</div>
        </div>
      </div>
    </div>
  );
} 