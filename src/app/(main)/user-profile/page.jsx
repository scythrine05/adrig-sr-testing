"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  currentUserDetails,
  getUserId,
  updateName,
  deleteUserData,
} from "../../actions/user";
import { useToast } from "../../../components/ui/use-toast";
import { signOut } from "next-auth/react";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export default function UserProfile() {
  const { toast } = useToast();
  const [user, setUser] = useState("");
  const [navToggle, setNavToggle] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userdata, setUserData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassoword: "",
    deleteText: "",
  });
  const [userEdit, setUserEdit] = useState(false);
  const [passwordEdit, setPasswordEdit] = useState(false);
  const [deleteUser, setDeleteUser] = useState(false);
  const [checkPassword, setCheckPassword] = useState(false);
  const [passwordToggle, setPasswordToggle] = useState(false);

  useEffect(() => {
    async function fxxn() {
      try {
        const res = await currentUserDetails();
        if (res) {
          const res2 = await getUserId(res.user.email);
          if (res2) {
            setUser(res2.name);
            setUserEmail(res.user.email);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    fxxn();
  }, [userEdit]);

  const togglePasswordVisibility = () => {
    setPasswordToggle(!passwordToggle);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "newPassword") {
      if (value != "" && !passwordRegex.test(value)) {
        setCheckPassword(true);
      } else {
        setCheckPassword(false);
      }
    }
    setUserData({
      ...userdata,
      [name]: value,
    });
  };

  const handleUserSubmit = async () => {
    try {
      if (userdata.name.trim() === "") {
        throw Error("Fill The Details Correctly");
      } else {
        const res = await updateName(userdata.name, userEmail);
        setUserEdit(false);
      }
      toast({
        title: "Name Updated",
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Not Updated",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      userdata.name = "";
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      if (
        userdata.currentPassword.trim() === "" ||
        userdata.newPassword.trim() === "" ||
        userdata.confirmPassoword.trim() === ""
      ) {
        throw Error("Fill All The details");
      }
      const getData = await getUserId(userEmail);
      if (getData.password !== userdata.currentPassword.trim()) {
        throw Error("The Current Passowrd is Wrong");
      } else if (userdata.newPassword !== userdata.confirmPassoword) {
        throw Error("The New Passowrd and current Password Does Not Match");
      } else if (userdata.newPassword === getData.password) {
        throw Error("New Password Cannot Be Same As the Old Passowrd");
      } else {
        const res = await updateName(userdata.name, userEmail);
        setPasswordEdit(false);
      }
      toast({
        title: "Password Updated",
      });
    } catch (e) {
      toast({
        title: "Not Updated",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      userdata.currentPassword = "";
      userdata.newPassword = "";
      userdata.confirmPassoword = "";
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      if (userdata.deleteText !== "Delete account") {
        throw Error("Enter The Correct Text");
      } else {
        const res = await deleteUserData(userEmail);
        setDeleteUser(false);
      }
      toast({
        title: "User Deleted",
      });
      signOut({ callbackUrl: "/signin" });
      toast({
        title: "User Deleted Sucessfully",
        description: "Your Account Have been signed out successfully",
      });
    } catch (e) {
      toast({
        title: "Unable To Delete User",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      userdata.deleteText = "";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 border border-slate-300 ">
      <aside className="w-64 bg-slate-100 p-5 pt-10 border  border-slate-300">
        <h2 className="text-lg font-semibold mb-6">Account</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <button
                onClick={() => {
                  setNavToggle(true);
                }}
                className={`flex items-center text-left w-full px-4 py-2 text-gray-800 font-medium rounded-md ${
                  navToggle ? "bg-gray-200" : ""
                }`}
              >
                <span className="mr-2">👤</span> Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setNavToggle(false);
                }}
                className={`flex items-center text-left w-full px-4 py-2 text-gray-800 font-medium rounded-md ${
                  !navToggle ? "bg-gray-200" : ""
                }`}
              >
                <span className="mr-2">🛡️</span> Security
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {navToggle && (
        <main className="flex-1 bg-white p-8">
          <h2 className="text-2xl font-semibold mb-6 pt-8">Profile details</h2>

          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between border-b p-5 items-center mb-4">
              <div className="flex items-center">
                <Image
                  src="https://via.placeholder.com/40"
                  alt="Profile Avatar"
                  width={40}
                  height={40}
                  className="rounded-full w-10 h-10 mr-4"
                />
                <span className="font-medium">{user}</span>
              </div>
              <button
                className="text-blue-600 hover:bg-blue-300 p-2 rounded-lg"
                onClick={() => {
                  setUserEdit(true);
                }}
              >
                Update profile
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-semibold mb-2">Email addresses</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{userEmail}</span>
                <span className="px-2 py-1 text-xs bg-gray-200 rounded-lg font-semibold text-gray-600">
                  Primary
                </span>
              </div>
            </div>
          </div>
        </main>
      )}
      {!navToggle && (
        <main className="flex-1 bg-white p-8">
          <h2 className="text-2xl font-semibold mb-6 pt-8">Security</h2>

          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between border-b p-5 pb-10 items-center ">
              <h3 className="font-semibold mt-2">Password</h3>
              <h3 className="p-2">⚫⚫⚫⚫⚫⚫⚫</h3>
              <button
                className="text-blue-600 hover:bg-blue-300 p-2 rounded-lg"
                onClick={() => {
                  setPasswordEdit(true);
                }}
              >
                Update Password
              </button>
            </div>
            <div className="flex justify-between p-5 ">
              <h3 className="font-semibold mb-2">Active Devices</h3>
              <div>Device has its own </div>
            </div>
          </div>
          <div className="flex justify-between p-5 ">
            <h3 className="font-semibold mt-2 ">Delete Account</h3>
            <button
              className="font-normal  text-red-400 p-2 rounded-lg hover:bg-red-100 "
              onClick={() => {
                setDeleteUser(true);
              }}
            >
              Delete Account
            </button>
          </div>
        </main>
      )}
      {userEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <form>
              <div class="  pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Profile
                </h2>
                <p class="mt-1 text-sm leading-6 text-gray-600">
                  This information will be displayed publicly so be careful what
                  you share.
                </p>

                <div class=" pb-12">
                  <div class="mt-3">
                    <label
                      for="first-name"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Name
                    </label>
                    <div class="mt-2">
                      <input
                        type="text"
                        name="name"
                        value={userdata.name}
                        onChange={handleChange}
                        class="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <div class="col-span-full">
                  <label
                    for="photo"
                    class="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Photo
                  </label>
                  <div class="mt-2 flex items-center gap-x-3">
                    <svg
                      class="h-12 w-12 text-gray-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <button
                      type="button"
                      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex justify-end">
              <button
                className="text-sm font-semibold leading-6 text-gray-900 mr-4 border border-slate-900 py-2 px-4 rounded-lg hover:bg-slate-200"
                onClick={() => {
                  setUserEdit(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleUserSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {passwordEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <form>
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Update Password
                </h2>

                <div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Current Password
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="currentPassword"
                        value={userdata.currentPassword}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      New Password
                    </label>
                    <div className="mt-2 relative">
                      <input
                        type={passwordToggle ? "text" : "password"}
                        name="newPassword"
                        value={userdata.newPassword}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      <div>
                        {userdata.newPassword.length > 0 && (
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute customSetting pr-3 flex items-center text-sm leading-5"
                          >
                            {passwordToggle ? "Hide" : "Show"}
                          </button>
                        )}
                      </div>
                    </div>
                    {checkPassword && (
                      <span className="text-xs text-red-600">
                        Password should have Min 8 Length and contains at least
                        one number and one special character
                      </span>
                    )}
                  </div>
                </div>
                <div class=" pb-12">
                  <div class="mt-3">
                    <label class="block text-sm font-medium leading-6 text-gray-900">
                      Confirm New Password
                    </label>
                    <div class="mt-2">
                      <input
                        type="password"
                        value={userdata.confirmPassoword}
                        name="confirmPassoword"
                        onChange={handleChange}
                        class="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex justify-end">
              <button
                className="text-sm font-semibold leading-6 text-gray-900 mr-4 border border-slate-900 py-2 px-4 rounded-lg hover:bg-slate-200"
                onClick={() => {
                  setPasswordEdit(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handlePasswordSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <form>
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Delete Account
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Are you sure you want to delete your account?
                </p>
                <p className="mt-1 text-sm leading-6 text-red-600">
                  This action is permanent and irreversible.
                </p>
                <div className="pb-12">
                  <div className="mt-3">
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      {`Type "Delete account" below to continue.`}
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="deleteText"
                        value={userdata.deleteText}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex justify-end">
              <button
                className="text-sm font-semibold leading-6 text-gray-900 mr-4 border border-slate-900 py-2 px-4 rounded-lg hover:bg-slate-200"
                onClick={() => {
                  setDeleteUser(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                onClick={handleDeleteSubmit}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
