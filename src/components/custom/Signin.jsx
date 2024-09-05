"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import getGeneratedOtp from "../../app/actions/generate";
import verifyHandler from "../../app/actions/verify";

import { useToast } from "../ui/use-toast";
import { getUserId, userCheck } from "../../app/actions/user";

export function Signin() {
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const [otpcheck, setOtpcheck] = useState(false);
  // for the diffrent form
  const [view, setView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    agreeTerms: false,
  });
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    localStorage.removeItem("timer_tag");
  }, []);

  const handleVerifyOtp = async () => {
    const res = await verifyHandler(formValues.username, otp, code);
    console.log(res);
    if (res.success != true) {
      return false;
    } else {
      return true;
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const checkBoxChange = (e) => {
    setFormValues({
      ...formValues,
      agreeTerms: e.target.checked,
    });
  };

  const initialButtonClickHandler = async () => {
    const currentTimer = localStorage.getItem("timer_tag");
    if (currentTimer != null) {
      setTimer(+currentTimer);
    } else {
      if (
        formValues.username == null ||
        formValues.username == undefined ||
        formValues.password == "" ||
        formValues.username == ""
      ) {
        toast({
          title: "Fill All The Form Details",
          variant: "destructive",
        });
        return;
      } else if (formValues.agreeTerms == false) {
        toast({
          title: "Accept The Terms And Conditions",
          variant: "destructive",
        });
        return;
      } else {
        const res = await userCheck(formValues.username, formValues.password);
        console.log(res);
        if (res.success == false) {
          if (res.error === "No User Exist") {
            toast({
              title: "No User Exist",
              description: "Please Enter The Correct Email",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Failed",
              description: "Incorrect Password",
              variant: "destructive",
            });
          }
          return;
        }
        setLoading(true);
        const result = await getGeneratedOtp(formValues.username);

        console.log(result);
        setView(true);
        setLoading(false);
        startTimer(10);
        localStorage.setItem("timer_tag", "10");
      }
    }
  };

  const startTimer = (initialTime) => {
    setTimer(initialTime);

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const newTime = prevTimer - 1;
        localStorage.setItem("timer_tag", newTime.toString());

        if (newTime <= 0) {
          clearInterval(interval);
          localStorage.removeItem("timer_tag");
          setCanResend(true);
        }

        return newTime;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (canResend && formValues.username != "") {
      await getGeneratedOtp(formValues.username);
      setTimer(300);
      setCanResend(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const clickHandler = async () => {
    try {
      setLoading(true);
      console.log(formValues);

      const valid = await handleVerifyOtp();
      if (valid) {
        const res = await signIn("credentials", {
          redirect: false,
          username: formValues.username,
          password: formValues.password,
          callbackUrl,
        });

        setLoading(false);
        console.log(res);
        if (!res?.error) {
          toast({
            title: "Signed in successfully",
            description: "You have been signed in successfully",
          });
          router.push(callbackUrl);
        } else {
          setError("Invalid email or password");
        }
      } else {
        setOtpcheck(true);
        toast({
          title: "Error",
          description: "You have Entered Wrong Otp or Secret Code ",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Some error Occured",
        variant: "destructive",
      });
      setError("An error occurred");
    }
  };

  if (loading) {
    return (
      <div class="relative items-center block w-96 p-6 h-60 bg-white border border-gray-100 rounded-lg  dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
        <h5 class="mb-2 text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white opacity-20">
          Adrig AI
        </h5>
        <div
          role="status"
          class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
        >
          <svg
            aria-hidden="true"
            class="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </div>
    );
  } else if (!view && !loading) {
    // return (
    //   <div>
    //     <div className="m-4 absolute top-4 right-4">
    //       <Link
    //         href="/signup"
    //         className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
    //       >
    //         Sign Up
    //       </Link>
    //       <Link
    //         href="/admin"
    //         className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
    //       >
    //         Admin
    //       </Link>
    //     </div>

    //     <div className="h-screen flex justify-center flex-col">
    //       <div className="flex justify-center">
    //         <div className="block w-80 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
    //           <div>
    //             <div className="px-10">
    //               <div className="text-3xl font-extrabold flex justify-center">
    //                 Login
    //               </div>
    //             </div>
    //             <div className="pt-2">
    //               <div className="mb-4">
    //                 <label className="block mb-2 text-sm text-black font-semibold">
    //                   Username
    //                 </label>
    //                 <input
    //                   name="username"
    //                   type="text"
    //                   placeholder="jhondoe@gmail.com"
    //                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    //                   value={formValues.username}
    //                   onChange={handleChange}
    //                   required
    //                 />
    //               </div>
    //               <div className="mb-4">
    //                 <label className="block mb-2 text-sm text-black font-semibold">
    //                   Password
    //                 </label>
    //                 <input
    //                   name="password"
    //                   type="password"
    //                   placeholder="123456"
    //                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    //                   value={formValues.password}
    //                   onChange={handleChange}
    //                   required
    //                 />
    //               </div>
    //               {error && <p className="text-red-500">{error}</p>}
    //               <button
    //                 type="submit"
    //                 onClick={initialButtonClickHandler}
    //                 className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
    //                 disabled={loading}
    //               >
    //                 {loading ? "Signing in..." : "Log in"}
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
    return (
      <div className="h-screen flex ml-16">
        <div className="flex flex-col justify-center mt-28    items-center w-full border h-2/3 rounded-lg border-gray-200 hover:bg-gray-100 bg-white p-8">
          <div className="max-w-md w-full">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Log In
            </h2>
            <p className="text-center text-gray-600 mb-6">Welcome to The App</p>
            <div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  E-mail
                </label>
                <input
                  name="username"
                  type="email"
                  placeholder="jhondoe@gmail.com"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={formValues.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="********"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={formValues.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={formValues.agreeTerms}
                    onChange={checkBoxChange}
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the terms and conditions
                  </span>
                </label>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                onClick={initialButtonClickHandler}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Login
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already a member?{" "}
                <a href="/signup" className="text-blue-600 hover:underline">
                  Sign Up
                </a>{" "}
                | Are You An Admin?{" "}
                <a href="/admin" className="text-blue-600 hover:underline">
                  Admin
                </a>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center min-h-scree">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            OTP Authentication
          </h1>
          <div>
            <div>
              <div>
                <h1 className="mb-2">
                  Please Enter The Otp You Recieved On Your Email
                </h1>
                <input
                  name="otpcode"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded mb-4"
                />
              </div>
              <div>
                <h1 className="mb-2">Please Enter The Railways secret Code</h1>
                <input
                  name="secretcode"
                  type="text"
                  placeholder="Enter Secret Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded mb-4"
                />
              </div>
              <button
                onClick={clickHandler}
                className="w-full bg-blue-500 text-white p-3 rounded"
              >
                Verify
              </button>
              <div className="mt-4 text-center">
                <p>
                  Resend OTP in: <span>{formatTime(timer)}</span>
                </p>
                <button
                  onClick={handleResendOtp}
                  className="mt-2 text-blue-500"
                  disabled={!canResend}
                >
                  {canResend ? "Resend OTP" : "Otp Resend Disabled"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
