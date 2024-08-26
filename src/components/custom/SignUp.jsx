"use client";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sendUserData } from "../../app/actions/signup";
import verifyHandler from "../../app/actions/verify";
import getGeneratedOtp from "../../app/actions/generate";

export function SignUp() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const [otpcheck, setOtpcheck] = useState(false);

  const [view, setView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [error, setError] = useState("");

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
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const checkBoxChange = (e) => {
    setFormValues({
      ...formValues,
      agreeTerms: e.target.checked,
    });
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

  const initialButtonClickHandler = async () => {
    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const currentTimer = localStorage.getItem("timer_tag");
    if (currentTimer != null) {
      setTimer(+currentTimer);
    } else {
      if (formValues.username == null || formValues.username == undefined) {
        return;
      } else {
        const result = await getGeneratedOtp(formValues.username);
        console.log(result);
        setView(true);
        startTimer(10);
        localStorage.setItem("timer_tag", "10");
      }
    }
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
        setLoading(true);
        const res = await sendUserData(
          formValues.name,
          formValues.username,
          formValues.password
        );
        setLoading(false);
        console.log(res);
        if (!res?.error) {
          router.push("/signin");
        } else {
          setError("Invalid email or password");
        }
      } else {
        setOtpcheck(true);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred");
    }
  };

  if (!view) {
    return (
      <div>
        <div className=" h-screen flex justify-center flex-col">
          <div className="flex justify-center">
            <div className="block custom-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
              <div>
                <div className="px-10">
                  <div className="text-3xl font-extrabold flex justify-center">
                    Sign Up
                  </div>
                </div>
                <div className="pt-2">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm text-black font-semibold">
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={formValues.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm text-black font-semibold">
                      Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      placeholder="xxxx@gmail.com"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={formValues.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm text-black font-semibold">
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
                    <label className="block mb-2 text-sm text-black font-semibold">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="********"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm text-black font-semibold">
                      Department
                    </label>
                    <select
                      name="department"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required
                    >
                      <option value="">Select a department</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <input
                      name="agreeTerms"
                      type="checkbox"
                      id="terms"
                      className="mr-2 leading-tight"
                      checked={formValues.agreeTerms}
                      onChange={checkBoxChange}
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-black font-semibold"
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>

                  {error && <p className="text-red-500">{error}</p>}
                  <button
                    type="submit"
                    onClick={initialButtonClickHandler}
                    className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </button>
                  <div className="text-md text-center mt-2">
                    <p>
                      Go To Login Page{" "}
                      <Link href="/login" className=" text-cyan-500 underline">
                        Login
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
