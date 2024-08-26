"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import getGeneratedOtp from "../../app/actions/generate";
import verifyHandler from "../../app/actions/verify";
import { useToast } from "../ui/use-toast";
export function Signin() {
  const { toast } = useToast();
  const router = useRouter();
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
  });
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = "/";

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

  const initialButtonClickHandler = async () => {
    console.log("hehe");
    const currentTimer = localStorage.getItem("timer_tag");
    if (currentTimer != null) {
      setTimer(+currentTimer);
    } else {
      if (formValues.username == null || formValues.username == undefined) {
        return;
      } else {
        console.log("after first click");
        const result = await getGeneratedOtp(formValues.username);
        if (result.message == "No User Exist") {
          toast({
            title: "Failed",
            description: "No User Exist",
            variant: "destructive",
          });

          return;
        }
        console.log(result);
        setView(true);
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
          router.push(callbackUrl);
        } else {
          setError("Invalid email or password");
        }
      } else {
        setOtpcheck(true);
      }
      // toast({
      //   title: "Success",
      //   description: "You have been logged in",
      // });
    } catch (error) {
      setLoading(false);
      setError("An error occurred");
    }
  };

  if (!view) {
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
      <div className="h-screen flex">
        {/* <div className="hidden lg:flex lg:w-1/2 bg-gray-100">
          <img
            src=""
            alt="Irctc Image"
            className="object-cover w-full h-full"
          />
        </div> */}

        <div className="flex flex-col justify-center items-center w-full  bg-white p-8">
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
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I am a Authorized Railway Employee
                  </span>
                </label>
              </div>
              {error && <p className="text-red-500 m-4 text-center">{error}</p>}
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
          {otpcheck && (
            <div className="text-center text-red-600 mb-3 border-2 border-red-600">
              There is Error in Otp or Secret Code
            </div>
          )}
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
