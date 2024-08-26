"use server";

import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";

export default async function verifyHandler(email, otp, secretcode) {
  if (!email) {
    return {
      message: "Email or phone number and OTP are required",
      success: false,
    };
  }

  if (secretcode !== process.env.SECRET_CODE) {
    return {
      message: "The secret code does not match",
      secretcodeCheck: false,
      success: false,
    };
  }
  const otpRecord = await prisma.otp.findFirst({ where: { email } });

  if (!otpRecord) {
    return { message: "OTP not found or expired", success: false };
  }

  const isMatch = bcrypt.compareSync(otp, otpRecord.code);

  if (!isMatch) {
    return { message: "Invalid OTP", success: false };
  }

  await prisma.otp.deleteMany({ where: { email } });

  return { message: "OTP verified successfully", success: true };
}

export async function checkSecretKey(key) {
  console.log(key + " " + process.env.SECRET_CODE);
  return key === process.env.SECRET_CODE;
}
